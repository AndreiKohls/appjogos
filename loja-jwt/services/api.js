// fetch é nativo: não precisamos de Axios para conversar com a API REST.
import AsyncStorage from '@react-native-async-storage/async-storage';

// Em celular físico, troque pelo IP do computador na rede local.
// Exemplo: http://192.168.0.20:3000
export const API = 'http://localhost:3000';

let avisarSessaoExpirada = null;

export function configurarSessaoExpirada(callback) {
  avisarSessaoExpirada = callback;
  return function cancelarAviso() {
    avisarSessaoExpirada = null;
  };
}

export async function fetchAutenticado(caminho, opcoes = {}) {
  const token = await AsyncStorage.getItem('gamehub_token');
  const resposta = await fetch(API + caminho, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      ...opcoes.headers,
      Authorization: 'Bearer ' + (token || ''),
    },
  });

  if (resposta.status === 401) {
    await AsyncStorage.removeItem('gamehub_token');
    if (avisarSessaoExpirada) {
      avisarSessaoExpirada();
    }
  }

  return resposta;
}

export async function lerResposta(resposta) {
  let dados;
  try {
    dados = await resposta.json();
  } catch {
    const erro = Object.assign(new Error('Resposta inesperada da API. Confira o endereço em services/api.js.'), { status: resposta.status });
    throw erro;
  }

  if (!resposta.ok) {
    const erro = Object.assign(new Error(dados.mensagem || 'Não foi possível concluir a requisição.'), { status: resposta.status });
    throw erro;
  }

  return dados;
}
