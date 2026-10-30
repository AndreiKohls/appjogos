import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Botao, Campo, Pagina, Cartao, Aviso, estilos } from '../components/gamehub-ui.js';
import { API, lerResposta } from '../services/api.js';

export default function CadastroUsuario({ navigation }) {
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [enviando, setEnviando] = useState(false);

  function validar() {
    if (!nome.trim() || !username.trim() || !email.trim() || !senha || !confirmacao) {
      setErro('Preencha todos os campos antes de continuar.');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErro('Informe um e-mail válido.');
      return false;
    }

    if (senha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres.');
      return false;
    }

    if (senha !== confirmacao) {
      setErro('As senhas não conferem.');
      return false;
    }

    return true;
  }

  async function cadastrarUsuario() {
    if (!validar()) return;

    setEnviando(true);
    setErro('');

    try {
      const resposta = await fetch(API + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nome.trim(),
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password: senha,
        }),
      });

      const dados = await lerResposta(resposta);
      setSucesso(dados.mensagem || 'Conta criada com sucesso!');
      setSenha('');
      setConfirmacao('');
    } catch (falha) {
      setErro(falha.message || 'Não foi possível criar a conta.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Pagina>
      <Cartao>
        <Text style={estilos.etiqueta}>Crie seu perfil</Text>
        <Text style={estilos.titulo}>Vamos começar</Text>
        <Text style={[estilos.subtitulo, css.subtitulo]}>Cadastre-se para encontrar partidas e montar sua equipe.</Text>

        <Aviso mensagem={erro} />
        <Aviso mensagem={sucesso} tipo="sucesso" />

        {!sucesso ? (
          <>
            <Campo label="Nome" value={nome} onChangeText={setNome} placeholder="Seu nome" autoCapitalize="words" />
            <Campo label="Nome de usuário" value={username} onChangeText={setUsername} placeholder="seu_username" autoCapitalize="none" />
            <Campo label="E-mail" value={email} onChangeText={setEmail} placeholder="seuemail@email.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            <Campo label="Senha" value={senha} onChangeText={setSenha} placeholder="Mínimo 8 caracteres" secureTextEntry />
            <Campo label="Confirmar senha" value={confirmacao} onChangeText={setConfirmacao} placeholder="Repita sua senha" secureTextEntry />
            <Botao titulo="Cadastrar" onPress={cadastrarUsuario} carregando={enviando} />
          </>
        ) : null}

        <Botao titulo="Voltar ao login" variante="secundario" onPress={() => navigation.goBack()} disabled={enviando} />
      </Cartao>
    </Pagina>
  );
}

const css = StyleSheet.create({
  subtitulo: {
    marginTop: 8,
    marginBottom: 14,
  },
});
