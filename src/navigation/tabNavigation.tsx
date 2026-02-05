import { Image, View } from 'react-native';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import Colors from '../constant/colors';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import AntDesign from 'react-native-vector-icons/AntDesign';
import { useChatState } from '../recoil/atoms/chatData';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from '../screens/map/map';
import Chat from '../screens/chat/chatScreen';
import Swipe from '../screens/swipe/swipe';
import TabViewScreen from '../screens/likes/TabViewScreen';
import ProfilePage from '../screens/profile/profile';

const TabNavigation = () => {
  const messages = useChatState(state => state.chatState);

  const Tab = createBottomTabNavigator();
  const defaultOptions = () => {
    return {
      headerShown: false,
    };
  };

  const [istab, setIstab] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIstab(true);
    }, 1000);
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.danger,
      }}
      initialRouteName="Swipe"
    >
      <Tab.Screen
        name="MapScreen"
        options={{
          tabBarIcon: ({ color }) => (
            <Image
              tintColor={color}
              source={require('../assets/png/location.png')}
              style={{ width: 20, height: 20 }}
            />
          ),
        }}
        component={MapScreen}
      />
      <Tab.Screen
        name="Chat"
        component={Chat}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <>
              <Image
                tintColor={color}
                source={require('../assets/png/chat.png')}
                style={{ width: 20, height: 20 }}
              />
              {messages.unreadMesage && (
                <View
                  className={`border-[2px] bottom-[7]  w-[1] h-[1] rounded-full absolute`}
                  style={{ borderColor: Colors.danger }}
                ></View>
              )}
            </>
          ),
        }}
      />

      <Tab.Screen
        name="Swipe"
        component={Swipe}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              color={color}
              name={'cards-playing-heart-multiple-outline'}
              size={24}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Likes"
        component={TabViewScreen}
        options={{
          tabBarIcon: ({ color }) => (
            // <View className='' style={{ width: 20, height: 20,borderWidth:0 }}>
            //     <Image tintColor={color} source={require('../assets/png/heart.png')} style={{ width: 20, height: 20 }} />
            // </View>
            <AntDesign name="hearto" color={color} size={22} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfilePage"
        component={ProfilePage}
        options={{
          tabBarIcon: ({ color }) => (
            <Image
              tintColor={color}
              source={require('../assets/png/profile.png')}
              style={{ width: 20, height: 20 }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigation;
