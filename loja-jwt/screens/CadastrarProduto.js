import React, { useState } from 'react';
import { Text, View } from 'react-native';
import FormularioProduto, { prepararProduto } from '../components/FormularioProduto';
import { Aviso, Botao, Pagina, Painel, estilos } from '../components/ui';
import { fetchAutenticado, lerResposta } from '../services/api';

export default function CadastrarProduto({ navigation, usuario }) {
  // Um State guarda os cinco valores do formulário.
  const [campos, setCampos] = useState({ nome: '', descricao: '', categoria: '', preco: '', estoque: '0' });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  function alterarCampo(campo, texto) {
    setCampos(function (anteriores) { return { ...anteriores, [campo]: texto }; });
    setErro('');
    setSucesso('');
  }

  async function cadastrarProduto() {
    if (salvando) return;
    setErro('');
    setSucesso('');

    try {
      const produto = prepararProduto(campos);
      setSalvando(true);

      // fetchAutenticado busca o token e envia Authorization: Bearer TOKEN.
      // Quem decide se o cadastro é permitido são os middlewares da API.
      const resposta = await fetchAutenticado('/produtos', {
        method: 'POST',
        body: JSON.stringify(produto),
      });
      const dados = await lerResposta(resposta);
      setSucesso(dados.mensagem || 'Produto cadastrado com sucesso.');
      setCampos({ nome: '', descricao: '', categoria: '', preco: '', estoque: '0' });
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setSalvando(false);
    }
  }

  // Esta condição melhora a interface. A segurança real está no back-end.
  if (usuario?.nivel !== 'admin') {
    return <Pagina><Aviso mensagem="Acesso permitido apenas para administradores." /></Pagina>;
  }

  return (
    <Pagina>
      <Text style={estilos.etiqueta}>ADMINISTRAÇÃO</Text>
      <Text style={estilos.titulo}>Novo produto</Text>
      <Text style={estilos.subtitulo}>Preencha os dados para adicionar um item ao catálogo.</Text>
      <Aviso mensagem={erro} />
      <Aviso mensagem={sucesso} tipo="sucesso" />
      <Painel>
        <FormularioProduto
          campos={campos}
          onAlterar={alterarCampo}
          onSalvar={cadastrarProduto}
          salvando={salvando}
          tituloBotao="Cadastrar produto"
        />
      </Painel>
      <View style={{ marginTop: 16 }}>
        <Botao
          titulo="Ver catálogo"
          variante="secundario"
          disabled={salvando}
          onPress={function () { navigation.navigate('Produtos'); }}
        />
      </View>
    </Pagina>
  );
}
