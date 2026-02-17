/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { RecoilRoot } from 'recoil';
import * as ZIM from 'zego-zim-react-native';
import * as ZPNs from 'zego-zpns-react-native';
import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn'
import messaging from '@react-native-firebase/messaging';
import * as notificationHelper from "./src/services/pushNotification"


ZegoUIKitPrebuiltCallService?.useSystemCallingUI([ZIM, ZPNs]);

messaging().setBackgroundMessageHandler(async remoteMessage =>{
    console.log('Message handled in the background!', remoteMessage);
     notificationHelper.localNotificationHandler(remoteMessage);
})

notificationHelper.localNotificationClicked()
function HeadlessCheck({ isHeadless }) {
  if (isHeadless) {
    return null;
  }

  return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
