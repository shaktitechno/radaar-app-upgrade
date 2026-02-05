import { View, Text } from 'react-native'
import React, { Dispatch, SetStateAction, createContext, useContext, useEffect, useRef, useState } from 'react'
import { SignupContextType } from './types';


export const onUserLogout = async () => {
    // return ZegoUIKitPrebuiltCallService.uninit()
}
const initialValue = {
    "conversation_id" :undefined,
    "responder_id" :undefined,
    "initiator_id" :undefined,
    "call_status":undefined,
    "call_type" :undefined,
    "logs_id":undefined
}
export const CallingContaxt = createContext<SignupContextType>({
    callingData:initialValue,
    setCallingData:()=>{}
}); 

const CallingContaxtProvider  = ({children}:any) => {
//     const [token,setToken] = useRecoilState(authToken)
//     const [callingData,setCallingData] = useState<callingdDataType>(initialValue)
//     const {userDetails,setUserDetails,getProfile} =useContext(UserProfileData)
//     const navigation = useNavigation()
//     const callingDataRef = useRef<any>()
//     const userDetailsRef = useRef<any>()
//     const durationRef = useRef<any>()
//     const [chatHistory,setChatHistory] = useRecoilState(callHistory)

//     const getCallHistory =()=>{
//         callLogHisorty({page:1})
//             .then((res:any)=>{
//                 console.log('resres',res)
//                 if(res?.data?.getAllLogs?.length > 0 ){
//                     setChatHistory(res?.data?.getAllLogs)
//                     console.log('firstgetCallHistory',res?.data?.getAllLogs)
//                 }
//             })
//             .catch((err:any)=>{
//                 console.log('err in block list ',err )
//             })
//     }
//     useEffect(() => {
//         Orientation.addOrientationListener((orientation) => {
//             var orientationValue = 0;
//             if (orientation === 'PORTRAIT') {
//               orientationValue = 0;
//             } else if (orientation === 'LANDSCAPE-LEFT') {
//               orientationValue = 1;
//             } else if (orientation === 'LANDSCAPE-RIGHT') {
//               orientationValue = 3;
//             }
//             // console.log('+++++++Orientation+++++++', orientation, orientationValue);
//             ZegoUIKit.setAppOrientation(orientationValue);
//         });
//         userDetailsRef.current = userDetails
//     },[userDetails,setUserDetails])

//     useEffect(()=>{
//         callingDataRef.current = callingData
//     },[callingData,setCallingData])

//     const updateTime =async (duration:any) =>{
//         // console.log('durationdurationduration',duration)
//         // if(userDetailsRef?.current?.subscription.video_audio_call.duration <= 0 ){
//         //     ZegoUIKitPrebuiltCallService.hangUp(); 
//         // }
//         if(callingDataRef?.current?.initiator_id == userDetails._id && (duration % 30 == 0 )){
//             setUserDetails((oldstate:any)=>{
//                 return {
//                     ...oldstate,
//                     subscription:{
//                         ...oldstate?.subscription,
//                         video_audio_call:{
//                             ...oldstate?.subscription?.video_audio_call,
//                             duration:oldstate?.subscription?.video_audio_call?.duration ? oldstate?.subscription?.video_audio_call?.duration -1 : 0 
//                         }
//                     }

//                 }
//             })
//             updateTimeApi({conversation_id:callingDataRef?.current?.conversation_id})
//             .then(res=>{
//                 if(!res.data.status){
//                     ZegoUIKitPrebuiltCallService.hangUp(); 
//                 }
//             })
//             .catch(()=>{
//                 ZegoUIKitPrebuiltCallService.hangUp(); 
//             })
//         }
//     }

    
    
//     const onUserLogin = async (userID:any, userName:any, props:any) => {
//       return ZegoUIKitPrebuiltCallService.init(
//           KeyCenter.appID,
//           KeyCenter.appSign,
//           userID,
//           userName,
//           [ZIM, ZPNs],
//           {
//               onIncomingCallDeclineButtonPressed:()=>{
//                   getCallHistory()
//               },
//               onOutgoingCallCancelButtonPressed:()=>{
//                   getCallHistory()
//               },
//               onIncomingCallCanceled:()=>{
//                   getCallHistory()
//               },
//               onIncomingCallTimeout:()=>{
//                   getCallHistory()
//               },
//               onOutgoingCallAccepted:() => {
//                   setCallingData((state:callingdDataType)=>{
//                       callLog({...state,id:state.logs_id,call_status:'Connected',duration:0})
//                       return {...state,call_status:'Connected',duration:0}
//                   })
//                   // getCallHistory()
              
//               },        
//               onIncomingCallReceived: (callID:any, inviter:any, type:any, invitees:any,customData:callingdDataType) => {
//                   setCallingData(customData)
//                   // getCallHistory()
//               },        
//               onOutgoingCallDeclined: (callID:any, invitee:any) => {
//                   // console.log('onOutgoingCallDeclined',callID,invitee)
//                   setCallingData((state:callingdDataType)=>{
//                       callLog({...state,id:state.logs_id,call_status:'Declined',duration:0})
//                       return initialValue
//                   })
//                   showErrorMessage('Call declined')
//                   getCallHistory()
//               },
//               onOutgoingCallRejectedCauseBusy: (callID:any, inviter:any,callIDw:any) => {
//                   showErrorMessage('User is busy on another call' )
//                   getCallHistory()
//               },
//               ringtoneConfig: {
//                   incomingCallFileName: 'zego_incoming.mp3',
//                   outgoingCallFileName: 'zego_outgoing.mp3',
//               },
//               notifyWhenAppRunningInBackgroundOrQuit: true,
//               isIOSSandboxEnvironment: false,
//               androidNotificationConfig: {
//                   channelID: "ZegoUIKit",
//                   channelName: "ZegoUIKit",
//               },
//               avatarBuilder:  ({userInfo}:any) => {
//                   const host = getHOST()
//                  // console.log('`${host}/${userInfo.userId}``${host}/${userInfo.userId}``${host}/${userInfo.userId}``${host}/${userInfo.userId}`',`${host}${userInfo.userID}`,userInfo)
//                   return (
//                       <View style={{width: '100%', height: '100%'}}>
//                           <Image 
//                           style={{ width: '100%', height: '100%' }}
//                           resizeMode="cover"
//                           source={{ uri:`${host}media/${userInfo.userID}` }}
//                           />
//                       </View>
//                   )
//               },
//               requireConfig: (data:any) => {
//                   return {
//                       onHangUp: (duration:any) => {
//                           setCallingData((state:callingdDataType)=>{
//                                   // if(callingDataRef?.current?.initiator_id == userDetails._id ){
//                                   callLog({...state,id:state.logs_id,call_status:'Connected',duration:duration})
//                                   // }
//                                   return initialValue
//                               })
                              
//                           getProfile()
//                           props.navigation.navigate("Chat")
//                           getCallHistory()
//                       },
                     
//                       // foregroundBuilder: () => <ZegoCountdownLabel  />,
//                       timingConfig: {
//                           isDurationVisible: true,
//                           onDurationUpdate: (duration:any) => {
//                               updateTime(duration)
//                           if (duration === 10 * 60) {
//                               // ZegoUIKitPrebuiltCallService.hangUp();
//                           }}
//                       },
//                       topMenuBarConfig: {
//                           buttons: [
//                           ZegoMenuBarButtonName.minimizingButton,
//                           ],
//                       },
//                       onWindowMinimized: () => {
//                           props.navigation.navigate('Chat');
//                       },
//                       onWindowMaximized: () => {
//                           props.navigation.navigate('ZegoUIKitPrebuiltCallInCallScreen');
//                       },
//                   }
//               }
//           }
//       );
//   }
//     useEffect(() => {
//         // console.log("token :",token)
//         // console.log("userDetails?._id  :", userDetails?._id)
//         // console.log("userDetails?.last_name  :", userDetails?.last_name)
        
//         if(token && userDetails?._id && userDetails?.first_name){
//             onUserLogin(userDetails?._id, userDetails?.first_name + " " + userDetails?.last_name,{navigation} );
//         }
//     },[token,userDetails?._id,userDetails?.last_name,getProfile])
    
    return (
        <CallingContaxt.Provider value={{}}>
            {children}
        </CallingContaxt.Provider>
    )
}

export default CallingContaxtProvider