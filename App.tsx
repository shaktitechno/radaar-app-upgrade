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
import { StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import StackNavigation from './src/navigation/stackNavigation';
// import { useRecoilState } from 'recoil';
import {  useAuthToken } from './src/recoil/atoms/authToken';
import { useState } from 'react';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
 const token = useAuthToken(state => state.authToken);
   const [intro,setIntro] = useState<boolean | null>(null)

  return (
       <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar
              translucent
              backgroundColor="#fff"
              barStyle="dark-content"
            />
            <StackNavigation token={token} intro={intro} />
          </NavigationContainer>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;
