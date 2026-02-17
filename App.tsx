/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { NewAppScreen } from '@react-native/new-app-screen';
import { NavigationContainer } from '@react-navigation/native';
import {
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import StackNavigation from './src/navigation/stackNavigation';
import { useAuthToken } from './src/recoil/atoms/authToken';
import { useCallback, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  getProfile,
  getToken,
  initializeSocket,
  socket,
} from './src/services/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RootNavigation from './src/services/navigationServices';
import SplashScreen from 'react-native-splash-screen';
import { ZegoCallInvitationDialog } from '@zegocloud/zego-uikit-prebuilt-call-rn';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const token = useAuthToken(state => state.authToken);
  const setToken = useAuthToken(state => state.setAuthToken);
  console.log("token:", token);

  const [intro, setIntro] = useState<boolean | null>(null);
  const [solved, setSolved] = useState(false);
  const startApp = useCallback(async () => {
    const token = await getToken();
    const profile = await getProfile();
    const intro = await AsyncStorage.getItem('intro');
    console.log("token:", token, "profile:", profile, "intro:", intro);

    Promise.all([token, profile, intro]).then(res => {
      if (intro) {
        setIntro(JSON.parse(intro));
      } else {
        setIntro(null);
      }
      if (token && profile) {
        setToken(token);
        setSolved(true);
        RootNavigation?.onReady?.();
        SplashScreen.hide();
        initializeSocket(token);
        try {
          socket.on('connected', (response: any) => {});
        } catch (error) {
          console.error('An error occurred in the socket connection:', error);
        }
      } else {
        RootNavigation?.onReady?.();
        setSolved(true);
        SplashScreen.hide();
      }
    });
  }, [getToken, getProfile]);

  useEffect(() => {
    startApp()
  }, []);

console.log("solved:", solved);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
          <NavigationContainer  ref={RootNavigation.NavigationRef}>
                <ZegoCallInvitationDialog  />
            <StatusBar
              translucent
              backgroundColor="#fff"
              barStyle="dark-content"
              />
              <SafeAreaProvider style={{marginTop:20}}>
           {solved && <StackNavigation token={token} intro={intro} />}
        </SafeAreaProvider>
          </NavigationContainer>
      </Provider>
    </GestureHandlerRootView>
  );
}

export default App;
