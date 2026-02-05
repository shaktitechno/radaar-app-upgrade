import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { Socket, io } from 'socket.io-client';

// const HOST : string = "https://staging-api.hotspotmeet.com.au/";  // Sagar PC
//const HOST : string = "http://192.168.1.130:3000/";
//  const HOST : string = "https://staging-api.hotspotmeet.com.au/";  // Sagar PC
const HOST : string = "http://192.168.1.117:3000/";
// const HOST: string = 'https://backend-hostspot-meet.technohorizons.com/';

// const HOST : string = "http://192.168.1.168:3001/";
// const HOST : string = "http://localhost:3000";
// const HOST : string = "https://api.hotspotmeet.com.au/";
// const HOST : string = "http://192.168.1.129:5000/";
// const HOST : string = "http://192.168.1.146:3000/";
const USERNAME: string = '';

const PASSWORD: string = '';

export const removeStorage = async () => {
  return await AsyncStorage.multiRemove([
    'userID',
    'userName',
    'Token',
    'user_details',
  ]);
};

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('Token');
    if (token) {
      return token;
    }
    return null;
  } catch (e) {}
};

var socket: Socket<DefaultEventsMap, DefaultEventsMap>;

export const initializeSocket = (token: string) => {
  try {
    if (token) {
      socket = io(HOST, { query: { token } });
    } else {
      console.error('Token not found. Socket not initialized.');
    }
  } catch (error) {
    console.error('Error initializing socket:', error);
  }
};

export const getProfile = async () => {
  try {
    const token = await AsyncStorage.getItem('user_details');
    if (token) {
      return token;
    }
    return null;
  } catch (e) {}
};

export const getHOST = () => {
  return HOST;
};

export const getHeaders = (url: string) => {
  let headers = {
    'Content-Type': 'application/json',
    'Accept-Language': 'en',
    crossDomain: 'true',
  };
  return headers;
};

export { socket };
