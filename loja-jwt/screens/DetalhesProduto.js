import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Aviso, Botao, Carregamento, Pagina, Painel, cores, estilos, moeda } from '../components/ui';
import { fetchAutenticado, lerResposta } from '../services/api';

export default function DetalhesProduto({ route, navigation, usuario }) {
  const id = route.params?.id;
  const [produto, setProduto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function carregarProduto(signal) {
    setCarregando(true);
    setErro('');

    try {
      if (!id) throw new Error('Produto não informado. Volte ao catálogo.');
      const resposta = await fetchAutenticado('/produtos/' + id, { signal });
      const dados = await lerResposta(resposta);
      if (!signal?.aborted) setProduto(dados);
    } catch (falha) {
      if (!signal?.aborted) {
        setProduto(null);
        setErro(falha.message);
      }
    } finally {
      if (!signal?.aborted) setCarregando(false);
    }
  }

  // Ao voltar da edição, a tela recebe foco e consulta os dados atualizados.
  useFocusEffect(useCallback(function () {
    const controle = new AbortController();
    carregarProduto(controle.signal);
    return function () { controle.abort(); };
  }, [id]));

  return (
    <Pagina>
      <Text style={estilos.etiqueta}>CATÁLOGO / DETALHES</Text>
      <Aviso mensagem={erro} />
      {carregando ? <Carregamento mensagem="Carregando produto..." /> : produto ? (
        <Painel>
          <Text style={estilos.titulo}>{produto.nome}</Text>
          <Text style={estilos.subtitulo}>{produto.categoria || 'Sem categoria'}</Text>
          <Text style={locais.preco}>{moeda(produto.preco)}</Text>
          <Text style={locais.estoque}>{produto.estoque} unidade(s) em estoque</Text>
          <View style={estilos.separador} />
          <Text style={estilos.etiqueta}>SOBRE O PRODUTO</Text>
          <Text style={estilos.texto}>{produto.descricao || 'Nenhuma descrição cadastrada.'}</Text>
          {/* Os botões por nível melhoram a interface. A API autoriza cada PUT. */}
          {usuario.nivel === 'admin' && (
            <View style={{ marginTop: 24 }}>
              <Botao titulo="Editar produto" onPress={function () { navigation.navigate('EditarProduto', { id: produto.id }); }} />
            </View>
          )}
        </Painel>
      ) : (
        <Botao titulo="Tentar novamente" onPress={function () { carregarProduto(); }} />
      )}
      <View style={{ marginTop: 16 }}>
        <Botao titulo="Voltar" variante="secundario" onPress={function () { navigation.goBack(); }} />
      </View>
    </Pagina>
  );
}

const locais = StyleSheet.create({
  preco: { color: cores.verde, fontSize: 36, fontWeight: '700', marginVertical: 16 },
  estoque: { color: cores.muted, fontSize: 15, marginBottom: 12 },
});
