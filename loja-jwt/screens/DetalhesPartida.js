import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Botao, Pagina, Cartao, Aviso, estilos } from '../components/gamehub-ui.js';
import { API, lerResposta } from '../services/api.js';

export default function DetalhesPartida({ route, navigation }) {
  const { partida } = route.params || {};
  const [detalhes, setDetalhes] = useState(partida || null);
  const [carregando, setCarregando] = useState(!partida);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (partida?.id) {
      void carregarDetalhes(partida.id);
    }
  }, [partida]);

  async function carregarDetalhes(id) {
    setCarregando(true);
    setErro('');

    try {
      const token = await AsyncStorage.getItem('gamehub_token');
      const resposta = await fetch(API + `/api/matches/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + (token || ''),
        },
      });

      const dados = await lerResposta(resposta);
      setDetalhes(dados);
    } catch (falha) {
      setErro(falha.message || 'Não foi possível carregar a partida.');
    } finally {
      setCarregando(false);
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

        <Aviso mensagem={erro} />

        <Text style={css.meta}>🎮 Jogo: {detalhes?.game_name || 'Não informado'}</Text>
        <Text style={css.meta}>⏰ Quando: {detalhes?.match_date ? new Date(detalhes.match_date).toLocaleString('pt-BR') : 'Data indisponível'}</Text>
        <Text style={css.meta}>👥 Participantes: {Number(detalhes?.current_players || 0)}/{Number(detalhes?.max_players || 0)}</Text>
        <Text style={css.meta}>👤 Criador: {detalhes?.creator_name || 'Anônimo'}</Text>
        <Text style={css.meta}>📌 Status: {detalhes?.status || 'aberta'}</Text>

        <Botao titulo="Voltar" variante="secundario" onPress={() => navigation.goBack()} />
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
  meta: {
    color: '#B7C0D8',
    fontSize: 15,
    marginBottom: 10,
  },
});
