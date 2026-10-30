import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Botao, Campo, cores } from './ui';

// A validação do aplicativo ajuda o usuário a preencher os campos.
// A API faz as mesmas verificações: o servidor nunca confia só no formulário.
export function prepararProduto(campos) {
  const nome = campos.nome.trim();
  const descricao = campos.descricao.trim();
  const categoria = campos.categoria.trim();
  const textoPreco = campos.preco.trim();
  const textoEstoque = campos.estoque.trim();

  if (!nome || nome.length > 120) {
    throw new Error('Informe um nome com até 120 caracteres.');
  }

  if (descricao.length > 500 || categoria.length > 100) {
    throw new Error('A descrição aceita até 500 caracteres e a categoria até 100.');
  }

  // Aceitamos vírgula ou ponto, com no máximo duas casas decimais.
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(textoPreco)) {
    throw new Error('Informe um preço válido. Exemplos: 59,90 ou 59.90.');
  }

  const preco = Number(textoPreco.replace(',', '.'));
  const estoque = Number(textoEstoque);

  if (!Number.isFinite(preco) || preco < 0 || preco > 99999999.99) {
    throw new Error('O preço deve ficar entre 0 e 99.999.999,99.');
  }

  // 2.147.483.647 é o maior inteiro aceito pela coluna INT do MySQL.
  if (!/^\d+$/.test(textoEstoque) || !Number.isInteger(estoque) || estoque > 2147483647) {
    throw new Error('O estoque deve ser um inteiro entre 0 e 2.147.483.647.');
  }

  return { nome, descricao, categoria, preco, estoque };
}

// Os States ficam nos screens. Este componente apenas apresenta os campos,
// recebe seus valores por props e avisa o screen quando o texto muda.
export default function FormularioProduto({ campos, onAlterar, onSalvar, salvando, tituloBotao }) {
  return (
    <View style={estilos.formulario}>
      <Campo
        rotulo="Nome *"
        value={campos.nome}
        onChangeText={function (texto) { onAlterar('nome', texto); }}
        maxLength={120}
        placeholder="Ex.: Teclado sem fio"
        editable={!salvando}
      />
      <Campo
        rotulo="Descrição"
        value={campos.descricao}
        onChangeText={function (texto) { onAlterar('descricao', texto); }}
        maxLength={500}
        multiline
        numberOfLines={4}
        placeholder="Conte um pouco sobre o produto"
        editable={!salvando}
        style={estilos.descricao}
      />
      <Campo
        rotulo="Categoria"
        value={campos.categoria}
        onChangeText={function (texto) { onAlterar('categoria', texto); }}
        maxLength={100}
        placeholder="Ex.: Periféricos"
        editable={!salvando}
      />
      <Campo
        rotulo="Preço (R$) *"
        value={campos.preco}
        onChangeText={function (texto) { onAlterar('preco', texto); }}
        keyboardType="decimal-pad"
        inputMode="decimal"
        maxLength={16}
        placeholder="0,00"
        editable={!salvando}
      />
      <Campo
        rotulo="Estoque *"
        value={campos.estoque}
        onChangeText={function (texto) { onAlterar('estoque', texto); }}
        keyboardType="number-pad"
        inputMode="numeric"
        maxLength={10}
        placeholder="0"
        editable={!salvando}
      />
      <Text style={estilos.ajuda}>* Campos obrigatórios. O preço e o estoque podem ser zero.</Text>
      <Botao titulo={tituloBotao} onPress={onSalvar} carregando={salvando} />
    </View>
  );
}

const estilos = StyleSheet.create({
  formulario: { gap: 12 },
  descricao: { minHeight: 100, textAlignVertical: 'top' },
  ajuda: { color: cores.muted, fontSize: 13, lineHeight: 20 },
});
