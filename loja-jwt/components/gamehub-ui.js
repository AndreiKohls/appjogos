import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const Cores = {
  fundo: '#0B1020',
  fundoSecundario: '#121A2B',
  painel: '#141C2F',
  painelAlt: '#1A2540',
  roxo: '#8B5CF6',
  azul: '#3B82F6',
  ciano: '#22D3EE',
  texto: '#F5F7FF',
  textoSecundario: '#B7C0D8',
  textoMutado: '#7E8AA7',
  sucesso: '#34D399',
  alerta: '#F59E0B',
  erro: '#F87171',
  borda: '#2A3351',
};

export function Pagina({ children, incluirTopo = true }) {
  return (
    <SafeAreaView style={estilos.tela} edges={incluirTopo ? ['top', 'bottom', 'left', 'right'] : ['bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Cartao({ children, style = undefined }) {
  return <View style={[estilos.cartao, style]}>{children}</View>;
}

export function Botao({ titulo, onPress = () => undefined, variante = 'primario', disabled = false, carregando = false }) {
  const estilo = variante === 'primario'
    ? estilos.botaoPrimario
    : variante === 'secundario'
      ? estilos.botaoSecundario
      : estilos.botaoPerigo;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || carregando}
      style={({ pressed }) => [estilo, (pressed || disabled) && estilos.botaoOpcao]}
    >
      {carregando ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={estilos.textoBotao}>{titulo}</Text>}
    </Pressable>
  );
}

export function Campo({ label, ...props }) {
  return (
    <View style={estilos.campoWrap}>
      <Text style={estilos.rotulo}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={Cores.textoMutado}
        style={estilos.input}
      />
    </View>
  );
}

export function Aviso({ mensagem, tipo = 'erro' }) {
  if (!mensagem) return null;

  const cor = tipo === 'sucesso' ? Cores.sucesso : tipo === 'alerta' ? Cores.alerta : Cores.erro;

  return (
    <View style={[estilos.aviso, { borderColor: cor }]}>
      <Text style={[estilos.textoAviso, { color: cor }]}>{mensagem}</Text>
    </View>
  );
}

export const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: Cores.fundo,
  },
  conteudo: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
    gap: 18,
  },
  cartao: {
    backgroundColor: Cores.painel,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Cores.borda,
    padding: 18,
    shadowColor: '#020817',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  botaoPrimario: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  botaoSecundario: {
    backgroundColor: '#16233D',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Cores.borda,
  },
  botaoPerigo: {
    backgroundColor: '#2D1B2C',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#5B2A4A',
  },
  botaoOpcao: {
    opacity: 0.7,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  campoWrap: {
    gap: 8,
  },
  rotulo: {
    color: Cores.textoSecundario,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#111A2F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Cores.borda,
    color: Cores.texto,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  aviso: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  textoAviso: {
    fontSize: 14,
    lineHeight: 20,
  },
  titulo: {
    color: Cores.texto,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitulo: {
    color: Cores.textoSecundario,
    fontSize: 15,
    lineHeight: 22,
  },
  etiqueta: {
    color: Cores.ciano,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
});
