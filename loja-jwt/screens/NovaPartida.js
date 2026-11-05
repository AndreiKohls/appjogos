import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Botao, Campo, Pagina, Cartao, Aviso, estilos } from '../components/gamehub-ui.js';
import { API, lerResposta } from '../services/api.js';

export default function NovaPartida({ navigation }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [jogoId, setJogoId] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [maxJogadores, setMaxJogadores] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [jogos, setJogos] = useState([]);

  const jogoSelecionado = useMemo(
    () => jogos.find((jogo) => String(jogo.id) === String(jogoId)) || null,
    [jogos, jogoId]
  );

  useEffect(() => {
    async function carregarJogos() {
      try {
        const token = await AsyncStorage.getItem('gamehub_token');
        const resposta = await fetch(API + '/games', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + (token || ''),
          },
        });

        if (!resposta.ok) {
          throw new Error('Não foi possível carregar os jogos.');
        }

        const dados = await resposta.json();
        setJogos(Array.isArray(dados) ? dados : []);

        if (Array.isArray(dados) && dados.length > 0 && !jogoId) {
          setJogoId(String(dados[0].id));
        }
      } catch {
        setErro('Não foi possível carregar a lista de jogos.');
      }
    }

    void carregarJogos();
  }, [jogoId]);

  function validar() {
    if (!titulo.trim() || titulo.trim().length < 3) {
      setErro('Dê um título com pelo menos 3 caracteres.');
      return false;
    }

    if (!jogoId || Number(jogoId) <= 0) {
      setErro('Selecione um jogo válido.');
      return false;
    }

    if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      setErro('Informe a data no formato AAAA-MM-DD.');
      return false;
    }

    if (!hora || !/^\d{2}:\d{2}$/.test(hora)) {
      setErro('Informe a hora no formato HH:MM.');
      return false;
    }

    const dataHora = new Date(`${data}T${hora}:00`);
    if (Number.isNaN(dataHora.getTime())) {
      setErro('Data e hora inválidas.');
      return false;
    }

    const max = Number(maxJogadores);
    if (!Number.isInteger(max) || max < 2 || max > 50) {
      setErro('O número de jogadores deve estar entre 2 e 50.');
      return false;
    }

    return true;
  }

  async function criarPartida() {
    if (!validar()) return;

    setEnviando(true);
    setErro('');
    setSucesso('');

    try {
      const token = await AsyncStorage.getItem('gamehub_token');
      const dataHoraISO = new Date(`${data}T${hora}:00`).toISOString();

      const resposta = await fetch(API + '/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + (token || ''),
        },
        body: JSON.stringify({
          title: titulo.trim(),
          description: descricao.trim(),
          game_id: Number(jogoId),
          match_date: dataHoraISO,
          max_players: Number(maxJogadores),
        }),
      });

      const dados = await lerResposta(resposta);
      setSucesso(dados.mensagem || 'Partida criada com sucesso!');
      setTitulo('');
      setDescricao('');
      setJogoId(jogos[0]?.id ? String(jogos[0].id) : '');
      setData('');
      setHora('');
      setMaxJogadores('');
      setTimeout(() => navigation.goBack(), 700);
    } catch (falha) {
      setErro(falha.message || 'Não foi possível criar a partida.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Pagina>
      <Cartao>
        <Text style={estilos.etiqueta}>Nova partida</Text>
        <Text style={estilos.titulo}>Abrir lobby</Text>
        <Text style={[estilos.subtitulo, css.subtitulo]}>Crie uma partida para reunir sua equipe e convidar outros jogadores.</Text>

        <Aviso mensagem={erro} />
        <Aviso mensagem={sucesso} tipo="sucesso" />

        <View style={css.jogosWrap}>
          <Text style={estilos.rotulo}>Jogo</Text>
          {jogos.length === 0 ? (
            <Text style={css.semJogo}>Carregando jogos...</Text>
          ) : (
            <View style={css.gridJogos}>
              {jogos.map((jogo) => {
                const ativo = String(jogo.id) === String(jogoId);
                return (
                  <Pressable
                    key={jogo.id}
                    onPress={() => setJogoId(String(jogo.id))}
                    style={[css.botaoJogo, ativo && css.botaoJogoAtivo]}
                  >
                    <Text style={[css.textoJogo, ativo && css.textoJogoAtivo]}>{jogo.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
          {jogoSelecionado ? (
            <Text style={css.jogoSelecionado}>Selecionado: {jogoSelecionado.name}</Text>
          ) : null}
        </View>

        <Campo label="Título da partida" value={titulo} onChangeText={setTitulo} placeholder="Ranque 5x5" />
        <Campo label="Descrição" value={descricao} onChangeText={setDescricao} placeholder="Opcional" multiline />
        <Campo label="Data (AAAA-MM-DD)" value={data} onChangeText={setData} placeholder="2026-11-05" keyboardType="numeric" />
        <Campo label="Hora (HH:MM)" value={hora} onChangeText={setHora} placeholder="20:00" keyboardType="numeric" />
        <Campo label="Máximo de jogadores" value={maxJogadores} onChangeText={setMaxJogadores} placeholder="5" keyboardType="numeric" />

        <Botao titulo="Criar partida" onPress={criarPartida} carregando={enviando} />
        <Botao titulo="Voltar" variante="secundario" onPress={() => navigation.goBack()} disabled={enviando} />
      </Cartao>
    </Pagina>
  );
}

const css = StyleSheet.create({
  subtitulo: {
    marginTop: 8,
    marginBottom: 12,
  },
  jogosWrap: {
    gap: 10,
    marginBottom: 8,
  },
  gridJogos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  botaoJogo: {
    backgroundColor: '#111A2F',
    borderWidth: 1,
    borderColor: '#2A3351',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  botaoJogoAtivo: {
    backgroundColor: '#1D2A46',
    borderColor: '#8B5CF6',
  },
  textoJogo: {
    color: '#F5F7FF',
    fontSize: 13,
    fontWeight: '700',
  },
  textoJogoAtivo: {
    color: '#A78BFA',
  },
  semJogo: {
    color: '#B7C0D8',
    fontSize: 14,
  },
  jogoSelecionado: {
    color: '#22D3EE',
    fontSize: 12,
    fontWeight: '700',
  },
});
