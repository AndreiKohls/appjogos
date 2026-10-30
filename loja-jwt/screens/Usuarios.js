import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Aviso, Botao, Carregamento, Pagina, Painel, cores, estilos } from '../components/ui';
import { fetchAutenticado, lerResposta } from '../services/api';

export default function Usuarios({ usuario }) {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [alterandoId, setAlterandoId] = useState(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function carregarUsuarios(signal) {
    setCarregando(true);
    setErro('');

    try {
      // Esta rota administrativa devolve somente dados básicos, nunca senha/hash.
      const resposta = await fetchAutenticado('/usuarios', { signal });
      const dados = await lerResposta(resposta);
      if (!signal?.aborted) setUsuarios(dados);
    } catch (falha) {
      if (!signal?.aborted) setErro(falha.message);
    } finally {
      if (!signal?.aborted) setCarregando(false);
    }
  }

  useFocusEffect(useCallback(function () {
    if (usuario?.nivel !== 'admin') return undefined;
    const controle = new AbortController();
    carregarUsuarios(controle.signal);
    return function () { controle.abort(); };
  }, [usuario?.nivel]));

  async function alterarNivel(pessoa) {
    if (alterandoId !== null) return;
    setErro('');
    setSucesso('');

    if (Number(pessoa.id) === Number(usuario.id)) {
      setErro('Não é possível alterar o próprio nível.');
      return;
    }

    const novoNivel = pessoa.nivel === 'admin' ? 'usuario' : 'admin';
    setAlterandoId(pessoa.id);

    try {
      // O único dado enviado no body é o novo nível. A API verifica novamente
      // quem está autenticado, sua permissão e a proibição de alterar a si mesmo.
      const resposta = await fetchAutenticado('/usuarios/' + pessoa.id + '/nivel', {
        method: 'PUT',
        body: JSON.stringify({ nivel: novoNivel }),
      });
      const dados = await lerResposta(resposta);
      setUsuarios(function (atuais) {
        return atuais.map(function (item) {
          return item.id === pessoa.id ? { ...item, nivel: novoNivel } : item;
        });
      });
      setSucesso(dados.mensagem || 'Nível atualizado com sucesso.');
      await carregarUsuarios();
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setAlterandoId(null);
    }
  }

  function renderizarUsuario({ item }) {
    const proprioUsuario = Number(item.id) === Number(usuario.id);

    return (
      <Painel style={locais.cartao}>
        <Text style={locais.nome}>{item.nome}{proprioUsuario ? ' (você)' : ''}</Text>
        <Text style={locais.email}>{item.email}</Text>
        <Text style={locais.nivel}>Nível: {item.nivel}</Text>
        {proprioUsuario ? (
          <Text style={locais.observacao}>Seu próprio nível não pode ser alterado.</Text>
        ) : (
          <Botao
            titulo={item.nivel === 'admin' ? 'Tornar usuário' : 'Tornar administrador'}
            variante="secundario"
            disabled={alterandoId !== null}
            carregando={alterandoId === item.id}
            onPress={function () { alterarNivel(item); }}
          />
        )}
      </Painel>
    );
  }

  // Ocultar a tela não substitui somenteAdmin, que protege GET e PUT na API.
  if (usuario?.nivel !== 'admin') {
    return <Pagina><Aviso mensagem="Acesso permitido apenas para administradores." /></Pagina>;
  }

  return (
    <SafeAreaView style={locais.tela} edges={['left', 'right', 'bottom']}>
      <FlatList
        data={usuarios}
        extraData={alterandoId}
        keyExtractor={function (item) { return String(item.id); }}
        renderItem={renderizarUsuario}
        contentContainerStyle={locais.conteudo}
        refreshing={carregando}
        onRefresh={function () { carregarUsuarios(); }}
        ListHeaderComponent={
          <View style={locais.cabecalho}>
            <Text style={estilos.etiqueta}>ADMINISTRAÇÃO / ACESSOS</Text>
            <Text style={estilos.titulo}>Usuários</Text>
            <Text style={estilos.subtitulo}>Gerencie quem pode administrar os produtos e os níveis de acesso.</Text>
            <Aviso mensagem={erro} />
            <Aviso mensagem={sucesso} tipo="sucesso" />
            <Botao titulo="Atualizar lista" variante="secundario" disabled={carregando || alterandoId !== null} onPress={function () { carregarUsuarios(); }} />
            <Text style={locais.contagem}>{usuarios.length} usuário(s) cadastrado(s)</Text>
          </View>
        }
        ListEmptyComponent={carregando ? <Carregamento mensagem="Carregando usuários..." /> : (
          <Painel><Text style={estilos.texto}>{erro ? 'Não foi possível carregar os usuários. Tente atualizar a lista.' : 'Nenhum usuário encontrado.'}</Text></Painel>
        )}
      />
    </SafeAreaView>
  );
}

const locais = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { width: '100%', maxWidth: 960, alignSelf: 'center', padding: 22, paddingBottom: 48, flexGrow: 1 },
  cabecalho: { marginBottom: 18 },
  cartao: { marginBottom: 16 },
  nome: { color: cores.texto, fontSize: 21, fontWeight: '700', marginBottom: 8 },
  email: { color: cores.muted, fontSize: 15, marginBottom: 10 },
  nivel: { color: cores.verde, fontSize: 15, fontWeight: '600', marginBottom: 18 },
  observacao: { color: cores.muted, fontSize: 13, lineHeight: 20 },
  contagem: { color: cores.muted, fontSize: 13, marginTop: 20 },
});
