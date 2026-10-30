import { StyleSheet, Text, View } from 'react-native';
import { Botao, Pagina, Cartao, estilos } from '../components/gamehub-ui.js';

const partidas = [
  { id: 1, titulo: 'Ranque 5x5', jogo: 'Valorant', horario: '20:00', players: '4/5', criador: 'NightWolf' },
  { id: 2, titulo: 'Casual 3v3', jogo: 'League', horario: '21:30', players: '2/4', criador: 'Rafax' },
  { id: 3, titulo: 'Build Squad', jogo: 'Minecraft', horario: '19:15', players: '3/5', criador: 'Pixie' },
];

export default function Partidas() {
  return (
    <Pagina>
      <Cartao style={css.cardTopo}>
        <Text style={estilos.etiqueta}>Partidas</Text>
        <Text style={estilos.titulo}>Disponíveis agora</Text>
        <Text style={[estilos.subtitulo, css.subtitulo]}>Veja partidas em andamento e participe da sua próxima sessão.</Text>
      </Cartao>

      {partidas.map((partida) => (
        <Cartao key={partida.id} style={css.cardPartida}>
          <Text style={css.jogo}>{partida.jogo}</Text>
          <Text style={css.tituloPartida}>{partida.titulo}</Text>
          <Text style={css.meta}>⏰ {partida.horario}</Text>
          <Text style={css.meta}>👥 {partida.players}</Text>
          <Text style={css.meta}>👤 Criador: {partida.criador}</Text>
          <View style={css.acoes}>
            <Botao titulo="Detalhes" variante="secundario" onPress={() => undefined} />
            <Botao titulo="Participar" onPress={() => undefined} />
          </View>
        </Cartao>
      ))}
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
