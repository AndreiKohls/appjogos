import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Botao, Pagina, Cartao, Aviso, estilos } from '../components/gamehub-ui.js';
import { API, lerResposta } from '../services/api.js';

export default function Partidas({ navigation }) {
  const [partidas, setPartidas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [participando, setParticipando] = useState({});

  const carregarPartidas = useCallback(async () => {
    setCarregando(true);
    setErro('');

    try {
      const token = await AsyncStorage.getItem('gamehub_token');
      const resposta = await fetch(API + '/api/matches', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + (token || ''),
        },
      });

      const dados = await lerResposta(resposta);
      setPartidas(Array.isArray(dados) ? dados : []);
    } catch (falha) {
      setErro(falha.message || 'Não foi possível carregar as partidas.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarPartidas();
  }, [carregarPartidas]);

  async function participar(partidaId) {
    try {
      const token = await AsyncStorage.getItem('gamehub_token');
      const resposta = await fetch(API + `/api/matches/${partidaId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + (token || ''),
        },
      });

      const dados = await lerResposta(resposta);
      setParticipando((estado) => ({ ...estado, [partidaId]: true }));
      setErro('');
      alert(dados.mensagem || 'Você entrou na partida!');
      await carregarPartidas();
    } catch (falha) {
      setErro(falha.message || 'Não foi possível participar da partida.');
    }
  }

  function abrirDetalhes(partida) {
    navigation.navigate('DetalhesPartida', { partida });
  }

  return (
    <Pagina>
      <Cartao style={css.cardTopo}>
        <Text style={estilos.etiqueta}>Partidas</Text>
        <Text style={estilos.titulo}>Disponíveis agora</Text>
        <Text style={[estilos.subtitulo, css.subtitulo]}>Veja partidas em andamento e participe da sua próxima sessão.</Text>
        <Botao titulo="Nova partida" onPress={() => navigation.navigate('NovaPartida')} />
      </Cartao>

      <Aviso mensagem={erro} />

      {carregando ? (
        <Cartao style={css.loading}><ActivityIndicator color="#8B5CF6" size="small" /></Cartao>
      ) : partidas.length === 0 ? (
        <Cartao>
          <Text style={css.vazio}>Nenhuma partida aberta no momento.</Text>
          <Text style={css.vazioSub}>Crie a sua primeira lobby para reunir o grupo.</Text>
        </Cartao>
      ) : (
        partidas.map((partida) => {
          const participantes = Number(partida.current_players || 0);
          const max = Number(partida.max_players || 0);
          const jaParticipa = !!participando[partida.id];

          return (
            <Cartao key={partida.id} style={css.cardPartida}>
              <Text style={css.jogo}>{partida.game_name || 'Game'}</Text>
              <Text style={css.tituloPartida}>{partida.title}</Text>
              <Text style={css.meta}>⏰ {new Date(partida.match_date).toLocaleString('pt-BR')}</Text>
              <Text style={css.meta}>👥 {participantes}/{max}</Text>
              <Text style={css.meta}>👤 Criador: {partida.creator_name || 'Anônimo'}</Text>
              <View style={css.acoes}>
                <Botao titulo="Detalhes" variante="secundario" onPress={() => abrirDetalhes(partida)} />
                <Botao titulo={jaParticipa ? 'Participando' : 'Participar'} onPress={() => participar(partida.id)} disabled={jaParticipa} />
              </View>
            </Cartao>
          );
        })
      )}
    </Pagina>
  );
}

const css = StyleSheet.create({
  cardTopo: {
    gap: 8,
  },
  subtitulo: {
    marginTop: 8,
    marginBottom: 8,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  vazio: {
    color: '#F5F7FF',
    fontSize: 18,
    fontWeight: '700',
  },
  vazioSub: {
    color: '#B7C0D8',
    fontSize: 14,
    marginTop: 8,
  },
  cardPartida: {
    gap: 8,
  },
  jogo: {
    color: '#22D3EE',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  tituloPartida: {
    color: '#F5F7FF',
    fontSize: 20,
    fontWeight: '700',
  },
  meta: {
    color: '#B7C0D8',
    fontSize: 14,
  },
  acoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
});
