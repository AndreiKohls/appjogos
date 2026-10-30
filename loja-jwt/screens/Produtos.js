import React, { useCallback, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Aviso, Botao, Carregamento, Painel, cores, estilos, moeda } from '../components/ui';
import { fetchAutenticado, lerResposta } from '../services/api';

export default function Produtos({ navigation, usuario }) {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [produtoExcluir, setProdutoExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState('');
  const administrador = usuario.nivel === 'admin';

  async function carregarProdutos(signal) {
    setCarregando(true);
    setErro('');

    try {
      // Mesmo a consulta exige JWT: fetchAutenticado acrescenta o Bearer token.
      const resposta = await fetchAutenticado('/produtos', { signal });
      const dados = await lerResposta(resposta);
      if (!signal?.aborted) setProdutos(dados);
    } catch (falha) {
      if (!signal?.aborted) setErro(falha.message);
    } finally {
      if (!signal?.aborted) setCarregando(false);
    }
  }

  // Recarregar ao ganhar foco mostra as mudanças feitas em outros screens.
  // O efeito não é async: ele inicia a consulta e devolve a função de limpeza.
  useFocusEffect(useCallback(function () {
    const controle = new AbortController();
    carregarProdutos(controle.signal);
    return function () { controle.abort(); };
  }, []));

  function solicitarExclusao(produto) {
    setErroExclusao('');
    setSucesso('');
    setProdutoExcluir(produto);
  }

  function cancelarExclusao() {
    if (!excluindo) setProdutoExcluir(null);
  }

  async function excluirProduto() {
    if (!produtoExcluir || excluindo) return;
    setExcluindo(true);
    setErroExclusao('');

    try {
      const resposta = await fetchAutenticado('/produtos/' + produtoExcluir.id, { method: 'DELETE' });
      const dados = await lerResposta(resposta);
      // Removemos também do State; se a próxima consulta falhar, o item
      // que a API já excluiu não continua aparecendo na lista antiga.
      setProdutos(function (atuais) {
        return atuais.filter(function (produto) { return produto.id !== produtoExcluir.id; });
      });
      setProdutoExcluir(null);
      setSucesso(dados.mensagem || 'Produto excluído com sucesso.');
      await carregarProdutos();
    } catch (falha) {
      setErroExclusao(falha.message);
    } finally {
      setExcluindo(false);
    }
  }

  function renderizarProduto({ item }) {
    return (
      <Painel style={locais.cartao}>
        <Text style={locais.categoria}>{item.categoria || 'Sem categoria'}</Text>
        <Text style={locais.nome}>{item.nome}</Text>
        <Text style={locais.preco}>{moeda(item.preco)}</Text>
        <Text style={locais.estoque}>{item.estoque} unidade(s) em estoque</Text>
        <View style={locais.acoes}>
          <Botao titulo="Ver detalhes" onPress={function () { navigation.navigate('DetalhesProduto', { id: item.id }); }} />
          {/* Esconder botões ajuda na interface, mas não protege as rotas.
              A API também exige autenticarToken + somenteAdmin para editar/excluir. */}
          {administrador && (
            <View style={locais.acoes}>
              <Botao titulo="Editar" variante="secundario" onPress={function () { navigation.navigate('EditarProduto', { id: item.id }); }} />
              <Botao titulo="Excluir" variante="perigo" disabled={excluindo} onPress={function () { solicitarExclusao(item); }} />
            </View>
          )}
        </View>
      </Painel>
    );
  }

  return (
    <SafeAreaView style={locais.tela} edges={['left', 'right', 'bottom']}>
      {/* FlatList é a única área de rolagem desta tela. Não a colocamos em ScrollView. */}
      <FlatList
        data={produtos}
        keyExtractor={function (item) { return String(item.id); }}
        renderItem={renderizarProduto}
        contentContainerStyle={locais.conteudo}
        refreshing={carregando}
        onRefresh={function () { carregarProdutos(); }}
        ListHeaderComponent={
          <View style={locais.cabecalho}>
            <Text style={estilos.etiqueta}>LOJA JWT / CATÁLOGO</Text>
            <Text style={estilos.titulo}>Produtos</Text>
            <Text style={estilos.subtitulo}>Tecnologia para o seu dia a dia. Explore os detalhes de cada item.</Text>
            <View style={locais.acoes}>
              {administrador && <Botao titulo="Cadastrar produto" onPress={function () { navigation.navigate('CadastrarProduto'); }} />}
              <Botao titulo="Atualizar lista" variante="secundario" disabled={carregando || excluindo} onPress={function () { carregarProdutos(); }} />
            </View>
            <Text style={locais.contagem}>{produtos.length} produto(s) no catálogo</Text>
            <Aviso mensagem={erro} />
            <Aviso mensagem={sucesso} tipo="sucesso" />
          </View>
        }
        ListEmptyComponent={carregando ? <Carregamento mensagem="Carregando produtos..." /> : (
          <Painel><Text style={estilos.texto}>{erro ? 'Não foi possível carregar o catálogo. Tente atualizar a lista.' : 'Nenhum produto cadastrado no momento.'}</Text></Painel>
        )}
      />

      {/* Modal funciona na Web, Android e iOS, permitindo confirmar antes do DELETE. */}
      <Modal visible={produtoExcluir !== null} transparent animationType="fade" onRequestClose={cancelarExclusao}>
        <View style={locais.fundoModal}>
          <View style={locais.modal} accessibilityViewIsModal>
            <Text style={estilos.titulo} accessibilityRole="header">Excluir produto?</Text>
            <Text style={estilos.texto}>O produto “{produtoExcluir?.nome}” será removido do catálogo.</Text>
            <Aviso mensagem={erroExclusao} />
            <View style={locais.acoes}>
              <Botao titulo="Confirmar exclusão" variante="perigo" carregando={excluindo} onPress={excluirProduto} />
              <Botao titulo="Cancelar" variante="secundario" disabled={excluindo} onPress={cancelarExclusao} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const locais = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { width: '100%', maxWidth: 960, alignSelf: 'center', padding: 22, paddingBottom: 48, flexGrow: 1 },
  cabecalho: { marginBottom: 18 },
  cartao: { marginBottom: 16 },
  categoria: { color: cores.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  nome: { color: cores.texto, fontSize: 23, fontWeight: '700' },
  preco: { color: cores.verde, fontSize: 27, fontWeight: '700', marginVertical: 10 },
  estoque: { color: cores.muted, fontSize: 14, marginBottom: 18 },
  acoes: { gap: 10 },
  contagem: { color: cores.muted, fontSize: 13, marginTop: 20 },
  fundoModal: { flex: 1, backgroundColor: 'rgba(15, 35, 27, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modal: { width: '100%', maxWidth: 460, backgroundColor: cores.papel, borderRadius: 18, padding: 24, gap: 18 },
});
