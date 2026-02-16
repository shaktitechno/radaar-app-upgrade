import messaging from '@react-native-firebase/messaging';
import * as RootNavigation from './navigationServices';
import DeviceInfo from 'react-native-device-info';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { getToken } from './apiConfig';
import { pushNotification } from './api';



export const requestUserPermission = async () => {  
  createChannel();
  // console.log('inside notificationsss')
  const authStatus = await messaging().requestPermission();

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
   
  if(enabled) {
    getFCMToken();
  }
}

export const getFCMToken = async() =>{

    // let fcmToken=await AsyncStorage.getItem('fcmtoken');
    // console.log('authStatus',fcmToken)
    // if(!fcmToken){
        try{
            let fcm_token=await messaging().getToken();
            console.log('fcm_token::',fcm_token)
            if(fcm_token){
                // AsyncStorage.setItem('fcmtoken',fcm_token);
                pushMessage(fcm_token) 
                return  
            }
        } catch (err) {
            console.log(err)
        }
      return
    // }
    // pushMessage(fcmToken) 
}

export const notificationListener = () =>{
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
        // console.log('clicked inside notificationListener')
    }).catch(error=>{
      console.log(error)
    });
}

export const pushMessage = async (fcm_token) =>{
    const token = await getToken();
    if(!token){
      return
    }
    const uniqueId =await DeviceInfo.getUniqueId();
    // const model = DeviceInfo.getModel();
    // const brand = DeviceInfo.getBrand();
    // const deviceInfoEmitter = NativeModules.RNDeviceInfo; 
    // console.log('ajsba==--------------------------------',uniqueId,model,brand,deviceInfoEmitter)
    const data = {
      fcm:fcm_token,
      device_id:uniqueId
    }
    // console.log('firstasdsas',data)
    pushNotification(data)
    try {
      // await menuActions.pushMessage(data);
    } catch(e) {
      console.log(e)
    }
}

export const createChannel = () =>{
  PushNotification.createChannel(
    {
      channelId: "radar-app",
      channelName: "HotspotMeet", // (required)
    }
  );
}


export const localNotificationHandler = (data) =>{
  // console.log('notification ,',data )
  if(Platform.OS == "ios"){
    PushNotificationIOS.addNotificationRequest({
      id:data.messageId,
      body: data.notification.body,
      title: data.notification.title,
      sound:"default",
      userInfo: data?.data,
      badge:0
    });
    return
  }
  PushNotification.localNotification({
    channelId:"radar-app",
    messageId:data.messageId,
    message: data.notification.body,
    title: data.notification.title,
    largeIcon: "ic_launcher",
    bigLargeIcon: "ic_launcher",
    smallIcon: "ic_launcher",
    largeIconUrl: data?.data?.image,
    bigPictureUrl: data?.data?.image,
    playSound:true,
    soundName:"default",
    vibrate:true,
    data: data?.data
  });
}

export const liveMessaging = () => {
  return messaging().onMessage(async remoteMessage => {
    localNotificationHandler(remoteMessage)
  });
}

export const localNotificationClicked = () =>{
	PushNotification.configure({
		
		
		onNotification: function (notification) {
		const clicked = notification.userInteraction;
		if(clicked){
			console.log('notification',notification)
			if(notification?.data?.type == 'match'){
				RootNavigation.navigate('MyTabs', {
					screen: 'Likes',
					params: {match:true},
				})
			}else if(notification?.data?.type == 'likes'){
				RootNavigation.navigate('MyTabs', {
					screen: 'Likes',
					params: {},
				})
			}else if(notification?.data?.type == 'chat'){
        const messageData = JSON.parse(notification?.data?.message_details)
				RootNavigation.navigate('SingleChat',  {
          firstName: messageData?.user_name,
          lastName: '',
          allChat: [],
          oldChat: true,
          otherUserId: messageData?.sender_id,
          requestStatus:messageData?.requestStatus,
          initiator:messageData?.initiator,
          _id:messageData?._id,
          isOnline:true,
          isNotification:true
        }, )
				// console.log(messageData)
			}

			// RootNavigation.dispatch(
			// 	CommonActions.reset({
			// 		index: 0,
			// 		routes: [
			// 		{ name: 'MyTabs', 
			// 			state: {
			// 			routes: [
			// 				{ name: 'Swipe' }
			// 			]
			// 			}
			// 		},
			// 		],
			// 	})
			// );
		}
		notification.finish(PushNotificationIOS.FetchResult.NoData);
		},  

		permissions: {
		alert: true,
		badge: true,
		sound: true,
		},

		popInitialNotification: true,

		
		requestPermissions: Platform.OS === "ios",
	});
}
// export const backGroundClicked =()=>{
//   messaging().onNotificationOpenedApp(remoteMessage=>{
//     console.log('notification clicked ',remoteMessage)
//     // return  navigate('OrderDetails',{order_id:remoteMessage?.data?.ovid})
//   })
// }




