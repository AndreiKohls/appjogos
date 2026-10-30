import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import FormularioProduto, { prepararProduto } from '../components/FormularioProduto';
import { Aviso, Botao, Carregamento, Pagina, Painel, estilos } from '../components/ui';
import { fetchAutenticado, lerResposta } from '../services/api';

export default function EditarProduto({ route, navigation, usuario }) {
  // O identificador é enviado por navigation.navigate('EditarProduto', { id }).
  const id = route.params?.id;
  const [campos, setCampos] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function carregarProduto(signal) {
    setCarregando(true);
    setErro('');
    setSucesso('');

    try {
      if (!id) throw new Error('Produto não informado. Volte ao catálogo.');
      const resposta = await fetchAutenticado('/produtos/' + id, { signal });
      const produto = await lerResposta(resposta);
      if (signal?.aborted) return;

      // TextInput trabalha com texto, por isso convertemos preço e estoque.
      setCampos({
        nome: produto.nome,
        descricao: produto.descricao || '',
        categoria: produto.categoria || '',
        preco: String(produto.preco).replace('.', ','),
        estoque: String(produto.estoque),
      });
    } catch (falha) {
      if (!signal?.aborted) {
        setCampos(null);
        setErro(falha.message);
      }
    } finally {
      if (!signal?.aborted) setCarregando(false);
    }
  }

  // O callback do efeito é síncrono. A função interna faz o trabalho async.
  useFocusEffect(useCallback(function () {
    if (usuario?.nivel !== 'admin') return undefined;
    const controle = new AbortController();
    carregarProduto(controle.signal);
    return function () { controle.abort(); };
  }, [id, usuario?.nivel]));

  function alterarCampo(campo, texto) {
    setCampos(function (anteriores) { return { ...anteriores, [campo]: texto }; });
    setErro('');
    setSucesso('');
  }

  async function atualizarProduto() {
    if (salvando) return;
    setErro('');
    setSucesso('');

    try {
      const produto = prepararProduto(campos);
      setSalvando(true);
      // O PUT atualiza o registro cujo id está na URL; o JWT vai no header.
      const resposta = await fetchAutenticado('/produtos/' + id, {
        method: 'PUT',
        body: JSON.stringify(produto),
      });
      const dados = await lerResposta(resposta);
      setSucesso(dados.mensagem || 'Produto atualizado com sucesso.');
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setSalvando(false);
    }
  }

  if (usuario?.nivel !== 'admin') {
    return <Pagina><Aviso mensagem="Acesso permitido apenas para administradores." /></Pagina>;
  }

  return (
    <Pagina>
      <Text style={estilos.etiqueta}>ADMINISTRAÇÃO</Text>
      <Text style={estilos.titulo}>Editar produto</Text>
      <Text style={estilos.subtitulo}>Altere os campos e salve para atualizar o catálogo.</Text>
      <Aviso mensagem={erro} />
      <Aviso mensagem={sucesso} tipo="sucesso" />
      {carregando ? <Carregamento mensagem="Carregando produto..." /> : campos ? (
        <Painel>
          <FormularioProduto
            campos={campos}
            onAlterar={alterarCampo}
            onSalvar={atualizarProduto}
            salvando={salvando}
            tituloBotao="Salvar alterações"
          />
        </Painel>
      ) : (
        <Botao titulo="Tentar novamente" onPress={function () { carregarProduto(); }} />
      )}
      <View style={{ marginTop: 16 }}>
        <Botao titulo="Voltar" variante="secundario" disabled={salvando} onPress={function () { navigation.goBack(); }} />
      </View>
    </Pagina>
  );
}
