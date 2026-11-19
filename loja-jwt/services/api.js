import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const URL_API_PADRAO = 'http://localhost:3000';
const URL_API_ANDROID = 'http://10.0.2.2:3000';
const URL_API_AMBIENTE = typeof process !== 'undefined' && process.env
  ? (process.env.EXPO_PUBLIC_API_URL || process.env.REACT_APP_API_URL || '')
  : '';

export const API = (URL_API_AMBIENTE || (Platform.OS === 'android' ? URL_API_ANDROID : URL_API_PADRAO)).replace(/\/$/, '');

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
