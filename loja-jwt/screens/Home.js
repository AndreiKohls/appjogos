import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Botao, Cores, Pagina, Cartao, estilos } from '../components/gamehub-ui.js';
import { API, lerResposta } from '../services/api.js';

const jogosPopularesFallback = [
  { nome: 'Valorant', tags: 'FPS • Tático' },
  { nome: 'League of Legends', tags: 'MOBA • Estratégia' },
  { nome: 'Minecraft', tags: 'Construção • Criativo' },
  { nome: 'Fortnite', tags: 'Battle Royale • Casual' },
];

export default function Home({ navigation, usuario, sair }) {
  const [jogos, setJogos] = useState(jogosPopularesFallback);
  const [partidasRecentes, setPartidasRecentes] = useState([]);

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        const token = await AsyncStorage.getItem('gamehub_token');

        const [jogosResposta, partidasResposta] = await Promise.all([
          fetch(API + '/games', {
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + (token || ''),
            },
          }),
          fetch(API + '/api/matches', {
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + (token || ''),
            },
          }),
        ]);

        const jogosDados = await lerResposta(jogosResposta);
        const partidasDados = await lerResposta(partidasResposta);

        if (!ativo) return;

        if (Array.isArray(jogosDados) && jogosDados.length > 0) {
          setJogos(jogosDados.slice(0, 4).map((jogo) => ({
            nome: jogo.name,
            tags: jogo.description ? jogo.description.slice(0, 24) + (jogo.description.length > 24 ? '...' : '') : 'GameHub',
          })));
        }

        if (Array.isArray(partidasDados)) {
          setPartidasRecentes(partidasDados.slice(0, 3));
        }
      } catch {
        if (ativo) {
          setJogos(jogosPopularesFallback);
          setPartidasRecentes([]);
        }
      }
    }

    void carregarDados();

    return () => {
      ativo = false;
    };
  }, []);

  const nomeUsuario = usuario?.name || usuario?.username || 'Gamer';

  return (
    <Pagina>
      <Cartao>
        <Text style={estilos.etiqueta}>Dashboard</Text>
        <Text style={estilos.titulo}>Olá, {nomeUsuario}!</Text>
        <Text style={[estilos.subtitulo, css.subtitulo]}>Você está pronto para encontrar partidas e formar equipes.</Text>
      </Cartao>

      <Cartao>
        <Text style={css.secaoTitulo}>Jogos populares</Text>
        <View style={css.grid}>
          {jogos.map((jogo) => (
            <View key={jogo.nome} style={css.itemJogo}>
              <Text style={css.itemTitulo}>{jogo.nome}</Text>
              <Text style={css.itemTags}>{jogo.tags}</Text>
            </View>
          ))}
        </View>
      </Cartao>

      <Cartao>
        <Text style={css.secaoTitulo}>Partidas disponíveis</Text>
        <View style={css.listaPartidas}>
          {partidasRecentes.length === 0 ? (
            <Text style={css.partidaVazia}>Nenhuma partida aberta no momento.</Text>
          ) : (
            partidasRecentes.map((partida) => (
              <View key={partida.id} style={css.partidaItem}>
                <View>
                  <Text style={css.partidaJogo}>{partida.game_name || 'Game'}</Text>
                  <Text style={css.partidaTitulo}>{partida.title}</Text>
                </View>
                <View style={css.meta}>
                  <Text style={css.metaTexto}>{partida.match_date ? new Date(partida.match_date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Agendar'}</Text>
                  <Text style={css.metaTexto}>{Number(partida.current_players || 0)}/{Number(partida.max_players || 0)}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </Cartao>

      <View style={css.acoes}>
        <Botao titulo="Ver partidas" onPress={() => navigation.navigate('Partidas')} />
        <Botao titulo="Sair" variante="secundario" onPress={sair} />
      </View>
    </Pagina>
  );
}

const css = StyleSheet.create({
  subtitulo: {
    marginTop: 8,
  },
  secaoTitulo: {
    color: Cores.texto,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  grid: {
    gap: 12,
  },
  itemJogo: {
    backgroundColor: '#121A2B',
    borderColor: '#2A3351',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  itemTitulo: {
    color: Cores.texto,
    fontWeight: '700',
    fontSize: 16,
  },
  itemTags: {
    color: Cores.textoSecundario,
    fontSize: 12,
    marginTop: 6,
  },
  listaPartidas: {
    gap: 12,
  },
  partidaItem: {
    backgroundColor: '#111A2F',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2A3351',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partidaJogo: {
    color: Cores.ciano,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  partidaTitulo: {
    marginTop: 6,
    color: Cores.texto,
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  metaTexto: {
    color: Cores.textoSecundario,
    fontSize: 12,
  },
  partidaVazia: {
    color: Cores.textoSecundario,
    fontSize: 14,
  },
  acoes: {
    gap: 12,
  },
});
