import { useEffect, useState } from 'react';
// App controla a sessão; as telas recebem os dados por Props, sem Redux ou Context.
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Inicio from './screens/Inicio.js';
import Login from './screens/Login.js';
import CadastroUsuario from './screens/CadastroUsuario.js';
import Home from './screens/Home.js';
import Partidas from './screens/Partidas.js';
import { fetchAutenticado, lerResposta, configurarSessaoExpirada } from './services/api.js';

const Stack = createNativeStackNavigator();

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    const cancelar = configurarSessaoExpirada(() => {
      setUsuario(null);
      void AsyncStorage.removeItem('gamehub_token');
    });

    void (async function restaurarSessao() {
      try {
        setCarregando(true);
        const token = await AsyncStorage.getItem('gamehub_token');

        if (!ativo) return;
        if (!token) {
          setUsuario(null);
          return;
        }

        const resposta = await fetchAutenticado('/api/auth/me');
        const dados = await lerResposta(resposta);

        if (ativo) {
          setUsuario(dados);
        }
      } catch {
        if (ativo) {
          setUsuario(null);
        }
        await AsyncStorage.removeItem('gamehub_token');
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    })();

    return () => {
      ativo = false;
      cancelar();
    };
  }, []);

  async function entrar(dadosUsuario) {
    setUsuario(dadosUsuario);
  }

  async function sair() {
    await AsyncStorage.removeItem('gamehub_token');
    setUsuario(null);
  }

  function renderizarConteudo() {
    if (carregando) {
      return null;
    }

    return (
      <NavigationContainer>
        <Stack.Navigator
          id="GameHub"
          initialRouteName="Inicio"
          screenOptions={{
            headerStyle: { backgroundColor: '#0B1020' },
            headerTintColor: '#F5F7FF',
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: '#0B1020' },
            headerShadowVisible: false,
          }}
        >
          {!usuario ? (
            <>
              <Stack.Screen name="Inicio" component={Inicio} options={{ headerShown: false }} />
              <Stack.Screen name="Login" options={{ title: 'Entrar no GameHub' }}>
                {(props) => <Login {...props} aoEntrar={entrar} />}
              </Stack.Screen>
              <Stack.Screen name="CadastroUsuario" options={{ title: 'Criar conta' }} component={CadastroUsuario} />
            </>
          ) : (
            <>
              <Stack.Screen name="Home" options={{ title: 'GameHub' }}>
                {(props) => <Home {...props} usuario={usuario} sair={sair} />}
              </Stack.Screen>
              <Stack.Screen name="Partidas" options={{ title: 'Partidas' }} component={Partidas} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {renderizarConteudo()}
    </SafeAreaProvider>
  );
}
