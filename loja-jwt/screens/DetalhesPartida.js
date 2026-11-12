import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Botao, Pagina, Cartao, Aviso, estilos } from '../components/gamehub-ui.js';
import { API, fetchAutenticado, lerResposta } from '../services/api.js';

function formatarData(data) {
  if (!data) return 'Data indisponível';

  const valor = new Date(data);
  if (Number.isNaN(valor.getTime())) return 'Data indisponível';

  return valor.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DetalhesPartida({ route, navigation }) {
  const { partida } = route.params || {};
  const [detalhes, setDetalhes] = useState(partida || null);
  const [carregando, setCarregando] = useState(!partida);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [usuarioId, setUsuarioId] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const statusTexto = useMemo(() => {
    const status = (detalhes?.status || 'aberta').toLowerCase();
    const mapa = {
      aberta: 'Aberta',
      em_andamento: 'Em andamento',
      encerrada: 'Encerrada',
    };
    return mapa[status] || 'Aberta';
  }, [detalhes?.status]);

  const ehCriador = Number(detalhes?.creator_id) === Number(usuarioId);
  const jaParticipa = Number(detalhes?.is_participant) === 1;

  useEffect(() => {
    if (partida?.id) {
      void carregarDetalhes(partida.id);
    }
  }, [partida]);

  useEffect(() => {
    let ativo = true;

    async function carregarUsuario() {
      try {
        const token = await AsyncStorage.getItem('gamehub_token');
        if (!token) return;

        const resposta = await fetch(API + '/api/auth/me', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        });

        const dados = await lerResposta(resposta);
        if (ativo) {
          setUsuarioId(Number(dados.id));
        }
      } catch {
        // ignora falha ao carregar o perfil, a tela continua funcionando.
      }
    }

    void carregarUsuario();

    return () => {
      ativo = false;
    };
  }, []);

  async function carregarDetalhes(id) {
    setCarregando(true);
    setErro('');
    setSucesso('');

    try {
      const resposta = await fetchAutenticado(`/api/matches/${id}`);
      const dados = await lerResposta(resposta);
      setDetalhes(dados);
    } catch (falha) {
      setErro(falha.message || 'Não foi possível carregar a partida.');
    } finally {
      setCarregando(false);
    }
  }

  async function participar() {
    if (!detalhes?.id || enviando) return;

    setEnviando(true);
    setErro('');
    setSucesso('');

    try {
      const resposta = await fetchAutenticado(`/api/matches/${detalhes.id}/join`, {
        method: 'POST',
      });

      const dados = await lerResposta(resposta);
      setSucesso(dados.mensagem || 'Você entrou na partida!');
      await carregarDetalhes(detalhes.id);
    } catch (falha) {
      setErro(falha.message || 'Não foi possível participar da partida.');
    } finally {
      setEnviando(false);
    }
  }

  async function sairDaPartida() {
    if (!detalhes?.id || enviando) return;

    setEnviando(true);
    setErro('');
    setSucesso('');

    try {
      const resposta = await fetchAutenticado(`/api/matches/${detalhes.id}/leave`, {
        method: 'DELETE',
      });

      const dados = await lerResposta(resposta);
      setSucesso(dados.mensagem || 'Você saiu da partida.');
      await carregarDetalhes(detalhes.id);
    } catch (falha) {
      setErro(falha.message || 'Não foi possível sair da partida.');
    } finally {
      setEnviando(false);
    }
  }

  async function excluirPartida() {
    if (!detalhes?.id || enviando) return;

    setEnviando(true);
    setErro('');
    setSucesso('');

    try {
      const resposta = await fetchAutenticado(`/api/matches/${detalhes.id}`, {
        method: 'DELETE',
      });

      const dados = await lerResposta(resposta);
      setSucesso(dados.mensagem || 'Partida removida com sucesso.');
      setTimeout(() => navigation.goBack(), 800);
    } catch (falha) {
      setErro(falha.message || 'Não foi possível excluir a partida.');
    } finally {
      setEnviando(false);
    }
  }

  if (!detalhes && carregando) {
    return (
      <Pagina>
        <Cartao style={css.loading}><ActivityIndicator color="#8B5CF6" size="small" /></Cartao>
      </Pagina>
    );
  }

  return (
    <Pagina>
      <Cartao>
        <Text style={estilos.etiqueta}>Detalhes da partida</Text>
        <Text style={estilos.titulo}>{detalhes?.title || 'Partida'}</Text>
        <Text style={[estilos.subtitulo, css.subtitulo]}>{detalhes?.description || 'Nenhuma descrição informada.'}</Text>

        <View style={css.chipLinha}>
          <Text style={css.chip}>{statusTexto}</Text>
          <Text style={css.chipSecundario}>{detalhes?.game_name || 'Jogo'}</Text>
        </View>

        <Aviso mensagem={erro} />
        <Aviso mensagem={sucesso} tipo="sucesso" />

        <View style={css.infoGrupo}>
          <Text style={css.meta}>🎮 Jogo: {detalhes?.game_name || 'Não informado'}</Text>
          <Text style={css.meta}>⏰ Quando: {formatarData(detalhes?.match_date)}</Text>
          <Text style={css.meta}>👥 Participantes: {Number(detalhes?.current_players || 0)}/{Number(detalhes?.max_players || 0)}</Text>
          <Text style={css.meta}>👤 Criador: {detalhes?.creator_name || 'Anônimo'}</Text>
          <Text style={css.meta}>📌 Status: {statusTexto}</Text>
        </View>

        <View style={css.acoes}>
          {!ehCriador && !jaParticipa && (
            <Botao titulo="Participar" onPress={participar} carregando={enviando} />
          )}

          {!ehCriador && jaParticipa && (
            <Botao titulo="Sair da partida" variante="secundario" onPress={sairDaPartida} carregando={enviando} />
          )}

          {ehCriador && (
            <Botao titulo="Excluir partida" variante="perigo" onPress={excluirPartida} carregando={enviando} />
          )}

          <Botao titulo="Voltar" variante="secundario" onPress={() => navigation.goBack()} disabled={enviando} />
        </View>
      </Cartao>
    </Pagina>
  );
}

const css = StyleSheet.create({
  subtitulo: {
    marginTop: 8,
    marginBottom: 12,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  chipLinha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    color: '#F5F7FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  chipSecundario: {
    backgroundColor: '#12213D',
    borderColor: '#2A3351',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    color: '#B7C0D8',
    fontSize: 11,
    fontWeight: '700',
  },
  infoGrupo: {
    marginTop: 8,
    marginBottom: 14,
    gap: 10,
  },
  meta: {
    color: '#B7C0D8',
    fontSize: 15,
  },
  acoes: {
    gap: 10,
  },
});
