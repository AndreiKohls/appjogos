import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Botao, Campo, Pagina, Cartao, Aviso, estilos } from '../components/gamehub-ui.js';
import { API, lerResposta } from '../services/api.js';

export default function Login({ navigation, aoEntrar }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  function validar() {
    if (!email.trim() || !senha.trim()) {
      setErro('Preencha e-mail e senha para continuar.');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErro('Informe um e-mail válido.');
      return false;
    }

    return true;
  }

  async function realizarLogin() {
    if (!validar()) return;

    setEnviando(true);
    setErro('');

    try {
      const resposta = await fetch(API + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: senha,
        }),
      });

      const dados = await lerResposta(resposta);
      await AsyncStorage.setItem('gamehub_token', dados.token);
      aoEntrar(dados.usuario);
    } catch (falha) {
      setErro(falha.message || 'Não foi possível entrar no GameHub.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Pagina>
      <Cartao>
        <Text style={estilos.etiqueta}>Bem-vindo de volta</Text>
        <Text style={estilos.titulo}>Entre na sua conta</Text>
        <Text style={[estilos.subtitulo, css.subtitulo]}>Acesse suas partidas, equipes e jogos favoritos.</Text>

        <Aviso mensagem={erro} />

        <Campo label="E-mail" value={email} onChangeText={setEmail} placeholder="seuemail@email.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        <Campo label="Senha" value={senha} onChangeText={setSenha} placeholder="Sua senha" secureTextEntry autoCapitalize="none" />

        <Botao titulo="Entrar" onPress={realizarLogin} carregando={enviando} />
        <Botao titulo="Criar conta" variante="secundario" onPress={() => navigation.navigate('CadastroUsuario')} disabled={enviando} />
      </Cartao>
    </Pagina>
  );
}

const css = StyleSheet.create({
  subtitulo: {
    marginTop: 8,
    marginBottom: 12,
  },
});
