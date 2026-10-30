import { StyleSheet, Text, View } from 'react-native';
import { Botao, Cores, Pagina, Cartao, estilos } from '../components/gamehub-ui.js';

export default function Inicio({ navigation }) {
  return (
    <Pagina incluirTopo={true}>
      <View style={css.marca}>
        <View style={css.logo}>
          <Text style={css.logoTexto}>G</Text>
        </View>
        <View>
          <Text style={css.nome}>GameHub</Text>
          <Text style={css.subnome}>Encontre sua partida perfeita</Text>
        </View>
      </View>

      <Cartao style={css.banner}>
        <Text style={estilos.etiqueta}>Plataforma para gamers</Text>
        <Text style={[estilos.titulo, css.tituloPrincipal]}>Conecte-se com jogadores que pensam como você.</Text>
        <Text style={[estilos.subtitulo, css.descricao]}>
          Organize partidas, monte equipes e descubra comunidades com interesses parecidos em jogos favoritos.
        </Text>
      </Cartao>

      <Cartao>
        <Text style={css.secaoTitulo}>O que você vai encontrar</Text>
        <View style={css.lista}>
          <Text style={css.item}>• Partidas ativas e eventos do dia</Text>
          <Text style={css.item}>• Equipes para competir e colaborar</Text>
          <Text style={css.item}>• Jogos populares em destaque</Text>
        </View>
      </Cartao>

      <View style={css.acoes}>
        <Botao titulo="Entrar" onPress={() => navigation.navigate('Login')} />
        <Botao titulo="Criar conta" variante="secundario" onPress={() => navigation.navigate('CadastroUsuario')} />
      </View>
    </Pagina>
  );
}

const css = StyleSheet.create({
  marca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 6,
  },
  logo: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  logoTexto: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  nome: {
    color: Cores.texto,
    fontSize: 22,
    fontWeight: '800',
  },
  subnome: {
    color: Cores.textoSecundario,
    fontSize: 12,
  },
  tituloPrincipal: {
    marginTop: 10,
    marginBottom: 12,
  },
  banner: {
    backgroundColor: '#141C2F',
    borderColor: '#2D3B5E',
  },
  descricao: {
    color: Cores.textoSecundario,
  },
  secaoTitulo: {
    color: Cores.texto,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  lista: {
    gap: 10,
  },
  item: {
    color: Cores.textoSecundario,
    fontSize: 15,
    lineHeight: 24,
  },
  acoes: {
    gap: 12,
    marginTop: 6,
  },
});
