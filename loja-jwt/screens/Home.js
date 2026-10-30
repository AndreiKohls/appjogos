import { StyleSheet, Text, View } from 'react-native';
import { Botao, Cores, Pagina, Cartao, estilos } from '../components/gamehub-ui.js';

const jogosPopulares = [
  { nome: 'Valorant', tags: 'FPS • Tático' },
  { nome: 'League of Legends', tags: 'MOBA • Estratégia' },
  { nome: 'Minecraft', tags: 'Construção • Criativo' },
  { nome: 'Fortnite', tags: 'Battle Royale • Casual' },
];

const partidas = [
  { titulo: 'Noite de ranque', horario: '20:00', players: '4/5', jogo: 'Valorant' },
  { titulo: 'Duelo casual', horario: '21:30', players: '2/4', jogo: 'League' },
  { titulo: 'Craft + PvP', horario: '19:15', players: '3/5', jogo: 'Minecraft' },
];

export default function Home({ navigation, usuario, sair }) {
  return (
    <Pagina>
      <Cartao>
        <Text style={estilos.etiqueta}>Dashboard</Text>
        <Text style={estilos.titulo}>Olá, {usuario?.nome || 'Gamer'}!</Text>
        <Text style={[estilos.subtitulo, css.subtitulo]}>Você está pronto para encontrar partidas e formar equipes.</Text>
      </Cartao>

      <Cartao>
        <Text style={css.secaoTitulo}>Jogos populares</Text>
        <View style={css.grid}>
          {jogosPopulares.map((jogo) => (
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
          {partidas.map((partida) => (
            <View key={partida.titulo} style={css.partidaItem}>
              <View>
                <Text style={css.partidaJogo}>{partida.jogo}</Text>
                <Text style={css.partidaTitulo}>{partida.titulo}</Text>
              </View>
              <View style={css.meta}>
                <Text style={css.metaTexto}>{partida.horario}</Text>
                <Text style={css.metaTexto}>{partida.players}</Text>
              </View>
            </View>
          ))}
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
  acoes: {
    gap: 12,
  },
});
