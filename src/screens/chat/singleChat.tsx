import React, { LegacyRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Keyboard,Image, ImageBackground, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, AppState, Animated } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Colors from '../../constant/colors';
import { commonStyle } from '../../constant/commonStyle';
import { ParamListBase, RouteProp, useFocusEffect } from '@react-navigation/native';
import BackButton from '../../components/backButton';
import CustomText from '../../components/customText';
import CustomInput from '../../components/customInput';
import Feather from "react-native-vector-icons/Feather";
import Entypo from "react-native-vector-icons/Entypo";
import Ionicons from "react-native-vector-icons/Ionicons";
// import EmojiPicker from 'rn-emoji-keyboard'
import Fonts from '../../constant/fonts';
import mime from 'mime'
import { StyleSheet } from 'react-native';
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetBackdrop
} from '@gorhom/bottom-sheet';
import { openCamera, openPicker } from 'react-native-image-crop-picker';
import { connect, io } from "socket.io-client";
import { getHOST, getToken, socket } from '../../services/apiConfig';
import {  unblockUser, checkOtherUserPlan, uploadMessagesMedia, callLog } from '../../services/api';
import { useRecoilState } from 'recoil';
import { ChatData, Message, chatData } from '../../recoil/atoms/types';
import uuid from 'react-native-uuid';
import { UserProfileData } from '../../contexts/userDetailscontexts';
import SimpleBtn from '../../components/simpleBtn';
import GradientBtn from '../../components/gradientBtn';
import PopupModal from '../../components/noPlane';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import ZegoUIKitPrebuiltCallService, {
    ZegoSendCallInvitationButton,
  } from '@zegocloud/zego-uikit-prebuilt-call-rn';
import { showErrorMessage, showSuccessMessage } from '../../services/alerts';

import { CallingContaxt } from '../../contexts/callingContaxt';
import { callingdDataType } from '../../contexts/types';
import { useChatState } from '../../recoil/atoms/chatData';
import MsgComponent from '../../components/msgComponent';
const SingleChat = (props: {
    route: any;
    navigation: any;
}) => {

    const [invitees, setInvitees] = useState([{
        userID: props?.route?.params?.otherUserId, 
        userName:props?.route?.params?.firstName + " " + props?.route?.params?.lastName,
        // mediaurl:props?.route?.params?.mediaUrl
    }]);

    const height = (Dimensions.get('window').height)

    const [value, onChangeText] = React.useState<string>('');
    // const [isOpen, setIsOpen] = React.useState<boolean>(false)
    const [handlePick, setHandlePick] = React.useState<boolean>(((props.route.params as any)?.oldChat))
    const [newReply, setNewReply] = React.useState<Message | null>(null)
    // const [newReplyIsImage, setNewReplyIsImage] = React.useState<string>('')
    // const [newReplyIsSender, setNewReplyIsSender] = React.useState<boolean>(false)
    const [images, setImages] = useState<Array<any>>([])
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => [`${(150 / height) * 100}%`], []);
    const [chatMessages, setChatMessages] = useState<Array<any>>(((props.route.params as any)?.allChat))
    const [userToken, setUserToken] = React.useState<string>('')
    // const [userId, setUserId] = useState('')
    const {userDetails:{_id:my_id,...rest},setUserDetails,getMessages} =useContext(UserProfileData)
    const [initiator,setInitiator] = useState( props?.route?.params?.initiator )
    // const scrollViewRef = useRef<any>();
    const globleMessages = useChatState(state => state.chatState);

const setMessagesGloabelState = useChatState.getState().setChatState;

    // const  [globleMessages,setMessagesGloabelState] = (useRecoilState(chatState))
    const [requestStatus,setRequestStatus] = useState< 'pending' | 'rejected' | 'accepted'>(props?.route?.params?.requestStatus || 'pending')
    const [loading,setLoading] =useState('')
    const typingTimeoutRef = useRef<any>(null);
    const [typing,setTyping] = useState(false)
    const conwocationidRef = useRef(null)
    const [visible,setVisible]=useState(false)
    const [visible2,setVisible2]=useState(false)
    const [conversationId, setConversationId]=useState<string>('')
    const [isOnline,setOnline] = useState(((props.route.params as any)?.isOnline) || false)
    const isNotification = ((props.route.params as any)?.isNotification) || false
    const [questions,setQuestion] =useState<any>(null)
    const slideUpAnim = useRef(new Animated.Value(300))?.current; 
    const [socketLoaded,setSocketrLoaded] =useState(!isNotification ? true : false) 
    const [isUserBlocked,setIsUserBlocked] =useState<any>((props.route.params as any)?.isUserBlocked || false)
    const [blockInfo,setBlockInfo] =useState<any>((props.route.params as any)?.blockInfo || null)
    const [blockDataResolved,setBlockDataResolved] =useState<any>(false)
    const requestStatusRef = useRef<'pending' | 'rejected' | 'accepted'>(null)
    const isSuggestionActive = useRef<boolean>((props.route.params as any)?.isSuggestionActive || false)
    const isFirstRender = useRef(true);
    const {callingData,setCallingData} =useContext(CallingContaxt)
    const [sendingmessage,setSendingMessage] = useState(false)
    const [conecting,setConnecting] = useState(false)
    const lastMsgId = useRef<any>();
    const [other_user_status,setOther_user_status] =useState()
    // useEffect(()=>{
    //     console.log('firstblockInfoblockInfo',blockInfo)
    // },[])
    const [videoAudioMins, setVideoAudioMins] = useState(null);
    useEffect(() => {
        // Check if the conditions are met to show the ScrollView
        if (requestStatus === 'accepted' &&( questions && questions?.loopArray?.length > 0 )&& isSuggestionActive.current) {
            Animated.timing(
                slideUpAnim,
                {
                    toValue: 0, // Slide up to final position
                    duration: 300, // Duration of the animation
                    useNativeDriver: true
                }
            ).start();
        }
    }, [requestStatus, questions,isSuggestionActive.current]);
    // console.log('initiatorinitiatorinitiatorinitiator',rest)
    const openGallery = () => {
        const option = {
            cropping:true,
            // compressImageQuality:1,
            freeStyleCropEnabled: true,
            width: 1000,
            height: 1000,
        }
        console.log('firstassad',)
        openPicker(option)
            .then(res => {
                saveImages(res)
            })
        // .catch(err => showErrorMessage('No image selected'))
    };

    

    const joinChat = async () => {
    
        const tokenRecieved = await getToken();
        if (tokenRecieved) {
            socket?.emit("joinChat",
            {   
                isNotification,
                token: tokenRecieved, 
                targetUserId: ((props.route.params as any)?.otherUserId)
            }); 
        }
    };

    const saveImages = (path: any) => {
        const msgUid = uuid.v4()
        const obj = {
            ...path,
            sender:my_id,
            uri: path.path,
            mediaUrl:path.path,
            message_type:'image',
            width: path.width,
            height: path.height,
            message_id:msgUid,
            _id:msgUid,
            message_state:'pending',
            timestamp:new Date()
        };
        setChatMessages((prevMessages) => [...prevMessages, obj]);
        // setImages(state => ([...state, obj]))
        uploadFile(obj)

        // console.log("chatMessages >> ", chatMessages)
        bottomSheetModalRef.current?.close();
        // setModalVisible(false) 
    }

    const uploadFile = (capturedImage:any) =>{
        // setLoading(true)
        let formData = new FormData();
        formData.append('chat_images', {
            uri: capturedImage.uri,
            type: mime.getType(capturedImage.uri),
            name: capturedImage.uri.split("/").pop(),
        })
        // console.log(formData)
        // console.log('uri :::--',mime.getType(capturedImage.uri),capturedImage.uri.split("/").pop())
        uploadMessagesMedia(formData)
            .then(res=>{
                console.log(res.data)
                console.log(res.data)
                if(res.data.status){
                    sendPrivateMessage('image',res?.data?.mediaUrl,capturedImage?.message_id)
                    // setChatMessages(state=>state.filter(elm =>elm._id != capturedImage._id))
                }
            })
            .catch(err=>{
                // setLoading(false)
                console.log(err?.message)
            })
    }

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={1}
                animatedIndex={{
                    value: 1,
                }}
            />
        ),
        []
    )

    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
        Keyboard.dismiss()
    }, []);

    const newToken = async () => {
        const tokenRecieved = await getToken();
        // console.log("JWT tokennn>>>> ", tokenRecieved)
        if (tokenRecieved) {
            // Use the token here or set it in the component's state
            setUserToken(tokenRecieved)
        }
    }

    useEffect(() => {
        newToken()
    }, []);

    useEffect(() => {
        if (isFirstRender.current) {
            // This code will run only on the first render
            isFirstRender.current = false; // Set it to false so it doesn't run again
        } else {
            // This code will run on subsequent renders, i.e., when `value` changes
            onChangeTextdebug();
        }
    }, [value]); 

    

    const responseRequest = async(type:string)=>{
        // console.log('first',conversationId,conwocationidRef)
        socket?.emit(type,{ conversation_id: conwocationidRef.current, token:userToken,targetUserId: ((props.route.params as any)?.otherUserId),responderName:`${rest?.first_name} ${rest?.last_name}`  })
    }
    
    useFocusEffect(
        useCallback(() => {
            // Code to run on focus
            // console.log('Screen is focused');
            if(socket && my_id){
                joinChat(); // Call the async function
            }
            
            return () => {
                // Code to run on blur (screen is no longer focused)
                if(socket && my_id){
                    socket?.emit("leaveChat",
                        { userId: my_id, chatId: conwocationidRef.current}
                    );
                }
            };
        }, [socket,my_id])
    );

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
              
                console.log('App has come to the foreground!');
                if(socket && my_id){
                    joinChat(); // Call the async function
                }
                
            } else if (nextAppState === 'background') {
                console.log('App has gone to the background!');
                if(socket){
                    // socket?.emit?.('leaveApp',{userId:userDetails?._id})
                }
            }
        });

        return () => {
            // console.log('inside of useEffect pp state ')
            subscription?.remove?.(); // Unsubscribe on cleanup
            // setBlockDataResolved(false)
        };
    }, [socket,my_id]);
    // console.log('arslan sdasd',blockDataResolved)

   
    useEffect(()=>{
        if(socket && my_id){
            socket.on("chatJoined", (response: any) => {
            //    console.log('chatJoinedresponseresponse',response)
                // if(response?.conversationId != conwocationidRef.current)return 
                // if(!blockDataResolved){
                    setOther_user_status(!response?.other_user_status)
                    setBlockInfo(response?.blockInfo)
                    setIsUserBlocked(response?.isUserBlocked)
                    setBlockDataResolved(true)
                // }
                if((props.route.params as any)?.otherUserId != response.target_user_id){return}
                setConversationId(response.conversation_id)
                if(response.requestStatus == 'accepted'){
                    setHandlePick(true)
                }
                setRequestStatus(response.requestStatus)
                requestStatusRef.current = response.requestStatus
                isSuggestionActive.current = response?.isSuggestionActive
                conwocationidRef.current = response?.conversation_id
                if(isNotification){
                    setTimeout(()=>{
                        getMessages()
                    },100)
                }else{
                    setMessagesGloabelState((oldState: chatData) => {
                        const newarrv=  oldState.data.map((elm:any)=>
                            elm?._id == response.conversation_id 
                            ? {...elm,deliveredMessagesCount:0}
                            : elm 
                        )
                        return {data :newarrv ,loading:false }
                    })
                }

            });
            socket.on("GetPrivateMessage",(response)=>{
                // console.log('GetPrivateMessageGetPrivateMessage',response,isSuggestionActive)
                // console.log('GetPrivateMessageGetPrivateMessage',conwocationidRef)
                if(response?.conversationId != conwocationidRef.current)return 
                if(response?.changeSuggessionStatus){
                    isSuggestionActive.current = false
                }
                if(response?.sender == my_id){
                    setChatMessages((state:any)=>{
                        return state.map((item:any)=>
                            item?.message_id == response?.message_id
                            ? {...item,...response}
                            :item
                        )
                    })
                }else{
                    setChatMessages((prevMessages) => [...prevMessages, {...response,message_state:'delivered'}]);
                }
                if(!initiator){
                    setInitiator(response.sender)
                    setHandlePick(true)
                }
            } );
            socket.on("all_meesage_see", (response: any) => {

                setChatMessages((state:any)=>{
                    return state.map((elm:any)=>
                        elm?.sender == response?.other_user_id 
                        ? {...elm,message_state:'seen'}
                        : {...elm}
                    )
                })
                
            });
            socket.on("all_meesage_delivered", (response: any) => {
                setChatMessages((state:any)=>{
                    // console.log(state)
                    return state.map((elm:any)=>
                    ( elm?.sender == response?.other_user_id && elm?.message_state == 'sent' )
                        ? {...elm,message_state:'delivered'}
                        : {...elm}
                    )
                })
                
            });
            socket.on('chatRequestAccepted',(response)=>{
                if(response?.conversation_id != conwocationidRef.current)return 
                setRequestStatus('accepted')
                requestStatusRef.current = 'accepted'
                isSuggestionActive.current = true
                setHandlePick(true)
            })
            socket.on('chatRequestRejected',(response)=>{
                if(response?.conversation_id != conwocationidRef.current)return 
                setRequestStatus('rejected')
                requestStatusRef.current = 'rejected'
                setHandlePick(true)
            })
            socket.on("sendReactOnPrivateMessage", (response: any) => {
                setChatMessages((prevMessages:any) => 
                    prevMessages.map((elm:any)=>(
                        elm._id == response.message_id ?
                        {...elm,reaction:elm.reaction.map((res:any)=>res.user_id == response.sender ? {...res,reaction:response.message}:res )} : 
                        elm
                    )
                ));
            
            });
            socket.on("typing", (response: any) => {
                if(response?.conversation_id != conwocationidRef.current)return 
                if(response.userId != my_id){
                    setTyping(true)
                }
            });
            socket.on("typingstop", (response: any) => {
                if(response?.conversation_id != conwocationidRef.current)return 
                if(response.userId != my_id){
                    setTyping(false)
                }
        
            });
            socket.on('userOffline',(response:any)=>{
                if(conwocationidRef?.current == response.chatId){
                    setOnline(false)
                }
            })
            socket.on('userOnline',(response:any)=>{
                if(conwocationidRef?.current == response.chatId){
                    setOnline(true)
                }
            })
            socket.on('receiveQuestion',(response:any)=>{
                                if(conwocationidRef?.current == response.conversation_id){
                    if(requestStatusRef.current == 'accepted'){
                        slideUpAnim?.setValue?.(300)
                    }
                    setQuestion({...response?.question?.question_data,loopArray:[...response?.question?.options] || []})
                }
            })
            socket.on('nextQuestion',(response:any)=>{
                                if(conwocationidRef?.current == response.conversation_id){
                    if(requestStatusRef.current == 'accepted'){
                        slideUpAnim?.setValue?.(300)
                    }
                    setQuestion({...response?.question?.question_data,loopArray:[...response?.question?.options] || []})
                }
            })
            socket.on('previous20',(response:any)=>{
                // setTimeout(()=>{
                    setSocketrLoaded(true)
                // },100)
                console.log('previous20previous20previous20;skmdkna',response)
                setChatMessages(response?.messages?.slice()?.reverse() || [])
            })
            socket.on('GotBlocked',(response:any)=>{
                // console.log('GotBlockedGotBlocked',response)
                if(conwocationidRef?.current == response.conversation_id){
                    setBlockInfo((state:any)=>[...state,{blockedUserId:my_id,blockerUserId:response.user_id}])
                    setIsUserBlocked(true)
                }
            })
            socket.on('GotUnBlocked',(response:any)=>{
                // console.log('UnblockOtherUserUnblockOtherUserUnblockOtherUser',response)
                if(conwocationidRef?.current == response.conversation_id){
                    let tempData; 
                    setBlockInfo((state:any) =>{
                        tempData = state?.filter((item:any)=>(item?.blockedUserId != my_id)) 
                        return tempData
                    })
                    setIsUserBlocked(tempData?.length > 0 )
                }
            })
            socket.on('recievePreviousMessages',(response:any)=>{
                // console.log('getPreviousMessagesgetPreviousMessagesgetPreviousMessagesgetPreviousMessages',response,lastMsgId)
                if(conwocationidRef?.current == response.conversation_id){
                    setChatMessages(state=>([...response?.messages?.reverse(),...state]))
                  
                }
                
            })
        }
        return () => {
            // if (socket) {
            //     socket.off("chatJoined");
            // }
        };
    },[socket,my_id,])
  
    const UnblockUser = ()=>{
        const [obj] = blockInfo.filter((item:any)=>item.blockerUserId == my_id)
        unblockUser({id:obj?._id})
            .then(res=>{
                const data =  blockInfo?.filter((item:any)=>(item?.blockerUserId != my_id))
               
                socket?.emit?.('UnblockOtherUser',{
                    otherUserId:obj?.blockedUserId,
                    conversation_id:conwocationidRef?.current,
                    user_id:my_id
                })
                showSuccessMessage('User has been unblocked.')
                getMessages()
                setBlockInfo(data)
                setIsUserBlocked(data?.length > 0 ? true : false)
            })
            .catch(err=>{
                console.log('errerrerr',err)
            })
    }
    const sendPrivateMessage  = (message_type:string,mediaUrl?:string,message_id?:string,isSuggesion?:boolean,suggesionValue?:string)=>{
        if(sendingmessage){return}
        setSendingMessage(true)
        if(!rest?.subscription?.chat){
            console.log('send')
            // setVisible2(true)
            return null
        }
       
        const id = uuid.v4()
    
        let data:any
        if(message_type == 'text'){
            
            if(!isSuggesion && value.trim() =='') return 
            data = {
                token: userToken,
                message:isSuggesion ? suggesionValue : value.trim(),
                conversation_id: conwocationidRef?.current,
                message_type,
                message_id:id,
                user_name:rest?.first_name + ' '+rest?.last_name,
                receiver_id:(props?.route?.params as any)?.otherUserId,
                sender_id:my_id,
                // user_name:
            }
        }else{
            data = {  
                token: userToken,
                message: '',
                message_type,
                conversation_id: conwocationidRef?.current,
                isFirstMsg:message_type == 'emoji' ? true : false,
                mediaUrl,
                user_name:rest?.first_name + ' '+rest?.last_name,
                receiver_id:(props?.route?.params as any)?.otherUserId,
                sender_id:my_id,
                message_id:id
            }
        }
        if(newReply){
            data.toWhichReplied = {
                message_type:newReply.message_type,
                message:newReply.mediaUrl || newReply.message,
                messageOwner:newReply.sender,
                message_id:id
            }
            data.isReply= true
        }
        if(isSuggesion){
            data.isQuestion = true
            data.nextQuestion = questions.nextQuestion
            data.currentQuestionId = questions?._id
        }
        // console.log('isSuggestionActive send ',isSuggestionActive)
        if(isSuggestionActive?.current && !isSuggesion && message_type != 'emoji'){
            data.changeSuggessionStatus = true
        }
        if(!message_id){
            setChatMessages(state=>([...state,{...data,message_id:id,message_state:'pending',timestamp:new Date(),sender:my_id,_id:id}]))
            setQuestion((state:any)=>({...state,loopArray:[]}))
        }else{
            data.message_id = message_id
        }

        // console.log(data,value/.trim())
       
        setNewReply(null)
        console.log('adkhsxjsxjqbxjwx w192802',data)
        // setTimeout(()=>{
            socket?.emit("sendPrivateMessage", data,(props?.route?.params as any)?.otherUserId,);
        // },10)
        onChangeText('')
        setSendingMessage(false)
    }

    const handelTyping = (action:'start' | 'stop') => {
        // console.log('User started typing');
        const data= {
            token:userToken,
            conversation_id:conversationId
        }
        if(action == 'start'){
            // console.log('starttyping')
            socket.emit("startTyping", data);
        }else{
            // console.log('stoptyping')
            socket.emit("stopTyping", data);
        }
        // Add additional logic for when user starts typing
    };

 
    const onChangeTextdebug = (text?:string) => {
      
        
        if (!typingTimeoutRef.current) {
            handelTyping('start')
        }
    
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            handelTyping('stop')
            typingTimeoutRef.current = null;
        }, 1000); // 2 seconds delay
    };

    const checkAuth =(type:number,url?:string)=>{
        // console.log('sassrestrestrest',rest)
        if(type == 1){
           
        }else{
            if( !rest?.subscription?.connects ||( rest?.subscription?.connects?.type == 'no_connects' || (rest?.subscription?.connects?.type == 'custom_connects' && rest?.subscription?.connects?.count <=0))){
                setVisible(true)
                return
            }else if(!rest?.subscription?.chat){
                setVisible2(true)
                return
            }
            else{
                setHandlePick(true)
                setInitiator(my_id)
                sendPrivateMessage('emoji',url)
                setUserDetails((oldstate:any)=>{
                    return {
                        ...oldstate,
                        subscription:{
                            ...oldstate?.subscription,
                            connects:{
                                ...oldstate?.subscription?.connects,
                                count:oldstate?.subscription?.connects?.count ? oldstate?.subscription?.connects?.count -1 : 0 
                            }
                        }

                    }
                })
            }
        }
    }   
    
      
    //   console.log(value)

    useEffect(() => {
        checkOtherUserPlan({user_id: props?.route?.params?.otherUserId}).then(res => {
            setVideoAudioMins(res.data?.video_audio_call?.duration);
        }).catch(() => {})
    }, [])


    const insitateCall = (video: boolean) => {
        
        console.log("----callingData.call_status----", callingData.call_status)
        
        if(!blockDataResolved){return}
        if(other_user_status){
            return showErrorMessage('Unable to call')
        }
        // if(callingData.call_status == 'Connected'){
        //     return 
        // }
        if(!rest.subscription?.video_audio_call ||( !rest.subscription?.video_audio_call?.isAvailable ||  rest.subscription?.video_audio_call?.duration == 0)){
            setVisible(true)
            return
        }
        if( isUserBlocked){
            if(blockInfo?.some((elm:any)=>elm.blockerUserId == my_id)){
                return showErrorMessage(`Unblock ${(props.route.params as any)?.firstName} ${(props.route.params as any)?.lastName} to make a call`)
            }else{
                return showErrorMessage('Unable to make a call')
            }
        }
        
        if( requestStatus != 'accepted' ){
            return showErrorMessage('Request is pending, cannot place a call')
        }
        // if(videoAudioMins &&  videoAudioMins  <= 0 || rest?.subscription?.video_audio_call?.duration <= 0){
        //     return setVisible(true)
        // }
        if (conecting) { return }
        
        setConnecting(true)
        checkOtherUserPlan({user_id: props?.route?.params?.otherUserId})
        .then(res => {
            console.log("res:", res)
            setVideoAudioMins(res.data?.video_audio_call?.duration);
            if(res.data?.benift_available?.video_audio_call?.duration > 0 ){
                const data:callingdDataType ={
                    "conversation_id" : conversationId, 
                    "responder_id" : props?.route?.params?.otherUserId,
                    "initiator_id" : my_id,
                    "call_status": "Missed",
                    "call_type" : video ?  "Video" : 'Audio',
                }
                console.log("----------callLog Data---------",data)
                callLog(data)
                .then(((res:any)=>{
                    if(res.status){
                        console.log("res::", res)
                        console.log('***********************************response of logger',props?.route?.params?.otherUserId)
                        setCallingData({...data,logs_id:`${res.data.logs_id}` })
                        ZegoUIKitPrebuiltCallService
                        .sendCallInvitation(
                            [{
                                userID: props?.route?.params?.otherUserId, 
                                userName:props?.route?.params?.firstName + " " + props?.route?.params?.lastName,
                                // mediaurl:props?.route?.params?.mediaUrl
                            }], 
                            video, 
                            props.navigation, 
                            { 
                                resourceID:"zego_radar_call",
                                timeout: 40,
                                notificationTitle: rest?.first_name + " " +rest?.last_name,
                                notificationMessage: 'Is calling',
                                customData: {...data,logs_id:`${res.data.logs_id}` },
                            }
                        )
                        return
                    }
                    showErrorMessage('Unable to connect at the moment. Please try again later')
                }))
                .catch((err )=>{
                    if(!rest.subscription?.video_audio_call || ( !rest.subscription?.video_audio_call?.isAvailable ||  rest.subscription?.video_audio_call?.duration == 0)){
                        setVisible(true)
                        return
                    }
                    showErrorMessage('Unable to connect at the moment. Please try again later')
                })
               
                
                setTimeout(()=>{
                    setConnecting(false)
                },1000)
            }else{
                setConnecting(false)
                showErrorMessage('Other user does not have any active plan ')
            }
        }).catch((err) => {
            console.log("error in catch:", err)

        })
       
    }

    const getOldMessages = (id:any) => {
        if(lastMsgId.current == id){
            return 
        }
        lastMsgId.current = id
        if(socket){
            socket?.emit('getPreviousMessages',{conversation_id:conwocationidRef.current,last_message_id:id})
        }
    }

    return (
        <>
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: Colors.cardBg,
                }}
            >
                <BottomSheetModalProvider>

                    <KeyboardAvoidingView
                        style={{ flex: 1,borderWidth:0 }}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 15,
                                paddingVertical: 5,
                                backgroundColor: Colors.cardBg,
                                // borderBottomWidth: 1,
                                // borderBottomColor: Colors.borderColor,
                                zIndex:2,
                              
                            }}
                        >
                            <BackButton navigation={props.navigation} />
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    flex: 1,
                                }}
                            >
                                <View style={{
                                    marginLeft: 15,
                                }}>
                                   
                                    <TouchableOpacity 
                                        onPress={()=>{
                                            if(isUserBlocked || other_user_status){
                                                return 
                                            }
                                            props?.navigation.navigate('OtherUserProfile',{user_id:((props.route.params as any)?.otherUserId)})
                                            return;
                                        }}
                                        style={{flexDirection:'row',alignItems:'center'}}
                                    >
                                        <CustomText style={{ color: Colors.title, lineHeight: 20, marginBottom: 2, fontSize: 18, fontFamily:Fonts.fontBold }}>
                                            {((props.route.params as any)?.firstName)} {((props.route.params as any)?.lastName)}
                                        </CustomText> 
                                        {!isUserBlocked && isOnline && (
                                            <View
                                            style={{
                                                height: 10,
                                                width: 10,
                                                borderRadius: 9,
                                                backgroundColor: Colors.success,
                                                borderWidth: 2,
                                                borderColor: Colors.cardBg,
                                            }}
                                            />
                                        )}
                                    </TouchableOpacity>
                                    {typing && <CustomText style={{ color: Colors.textLight }}>Typing...</CustomText>}
                                </View>
                            </View>
                            {handlePick == true &&

                                <View style={{ flexDirection: 'row' }}>
                                        {requestStatus == 'accepted' && 
                                            <View className='space-x-1 flex-row'>
                                                <TouchableOpacity 
                                                    className=' px-[20] py-[10]' 
                                                    disabled={conecting}
                                                    onPress={()=>insitateCall(false)}
                                                >
                                                    <Image 
                                                        source={require("../../assets/png/voice_call.png")}
                                                    />
                                                </TouchableOpacity>

                                                <TouchableOpacity 
                                                    className=' px-[20]  py-[10]'
                                                    disabled={conecting}
                                                    onPress={()=>insitateCall(true)}
                                                >
                                                    <Image
                                                        source={require("../../assets/png/video_call.png")}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        }
                                    
                                    
                                    
                                </View>}
                        </View>
                        <View style={{flex:1,}}>
                        <ImageBackground source={require('../../assets/png/chatbg.png')} blurRadius={0} style={[StyleSheet.absoluteFill,{opacity:.13}]}></ImageBackground>
                        {
                            handlePick == true ?
                                <View
                                    style={{ flex: 1,}}
                                >
                                    <FlatList
                                        data={chatMessages?.slice()?.reverse() || []}
                                        keyExtractor={(item)=>item._id}
                                        inverted={true}
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={[
                                            commonStyle.container,
                                            // { paddingTop:newReply ? 65 :30 }
                                        ]}
                                        onEndReached={()=>{
                                            const last = chatMessages?.[0]
                                      
                                            if(last?._id){
                                                getOldMessages(last?._id)
                                            }
                                        }}
                                        onEndReachedThreshold={.8}
                                        renderItem={({item,index})=>{
                                            return(
                                            <View   key={item._id}>
                                                <MsgComponent
                                                    sender={item.sender}
                                                    item={item}
                                                    reply={setNewReply}
                                                    otherUser={(props.route.params as any)?.otherUserId}
                                                    other_user_name={`${props.route.params?.firstName} ${props.route.params?.lastName} `}
                                                    my_id= {my_id}
                                                    token={userToken}
                                                    conversationId={conversationId}
                                                    requestStatus={requestStatus}
                                                    isUserBlocked={isUserBlocked}
                                                />
                                                {(!other_user_status && !isUserBlocked) && (requestStatus =='accepted' && questions) && index  == 0 && isSuggestionActive.current &&
                                                    <Animated.View style={slideUpAnim && { transform: [{ translateY: slideUpAnim }] }}>
                                                        <ScrollView showsHorizontalScrollIndicator={false} horizontal contentContainerStyle={styles.suggesionScroll}>
                                                            <View style={styles.suggesionWrp} >
                                                            {questions?.loopArray?.map((string:any,key:any)=>{
                                                                return(
                                                                    <TouchableOpacity 
                                                                        onPress={()=>{
                                                                        
                                                                            sendPrivateMessage('text',undefined,undefined,true,string)
                                                                        }} 
                                                                        style={styles.suggesion_text_cont} 
                                                                        key={key}
                                                                    >
                                                                        <CustomText style={[commonStyle.mediumtext,{color:Colors.primary}]}>
                                                                            {string} 
                                                                        </CustomText>
                                                                    </TouchableOpacity>
                                                                )
                                                            })}
                                                            </View>
                                                        </ScrollView>
                                                    </Animated.View>
                                                }
                                            </View>
                                            )
                                        }}
                                    />
                                  
                                </View> :
                                <View
                                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}
                                >
                                    <View style={{marginTop:0,justifyContent: 'center', alignItems: 'center'}}>
                                   
                                    {(props.route.params as any)?.userImage != null ?
                                        <Image
                                            style={{
                                                height: 92,
                                                width: 92,
                                                borderRadius: 200,
                                            }}
                                            source={
                                                { uri: (props.route.params as any)?.userImage }
                                            }
                                        /> :
                                        <Image
                                            style={{
                                                height: 92,
                                                width: 92,
                                                borderRadius: 200,
                                            }}
                                            source={
                                                // require('../../assets/jpg/modal1.jpg')
                                                {uri:(props?.route?.params as any)?.mediaUrl}
                                            }
                                        />
                                    }
                                    <CustomText style={{ marginTop:20,color: Colors.black, fontSize: 30, fontFamily: Fonts.fontBold, width: 250, textAlign: 'center' }} >
                                        Do you want to 
                                        <CustomText style={{ color: Colors.black, fontSize: 30, fontFamily: Fonts.fontBold, width: 250, textAlign: 'center' }} > connect with {((props?.route?.params as any)?.firstName)} ?</CustomText>
                                    </CustomText>
                                    </View>
                                </View>
                        }
                 
                        {(isUserBlocked  || other_user_status) ? 
                            <>
                            {other_user_status &&
                                <>
                                <View className='items-center mb-4 px-[20]'>
                                    <View  style={{backgroundColor:Colors.inputColor,padding:8,borderRadius:6}} >
                                        <CustomText  
                                            style={styles.fontStyle}
                                            text={`User account is deactivated`}
                                        />
                                    </View>
                                </View>
                                </>
                            }
                            {isUserBlocked && ( blockInfo?.some((elm:any)=>elm.blockerUserId == my_id) ?
                                <>
                                    <View className='items-center mb-4 px-[20]'>
                                        <View  style={{backgroundColor:Colors.inputColor,padding:8,borderRadius:6}} >
                                            <CustomText  
                                                style={styles.fontStyle}
                                                text={`You have blocked ${props.route.params?.firstName} ${props.route.params?.lastName}.`}
                                            />
                                        </View>
                                    </View>
                                    <View className='px-[20]' style={Platform.OS == 'android' && {marginBottom:20} }>
                                        <GradientBtn
                                            title='Unblock'
                                            onPress={() => UnblockUser()}
                                            isLoading={false}
                                            disable={false} // disable
                                        />
                                    </View>
                                </>
                                :
                                <>
                                    <View className='items-center mb-4 px-[20]'>
                                    <View  style={{backgroundColor:Colors.inputColor,padding:8,borderRadius:6}} >
                                        <CustomText  
                                            style={styles.fontStyle}
                                            text={`You have been blocked, cannot connect with ${props.route.params?.firstName} ${props.route.params?.lastName} anymore.`}
                                        />
                                    </View>
                                    </View>
                                </>
                            ) }
                            </>
                        :
                            (handlePick == true ?
                                <>
                                    {requestStatus == 'pending' ?
                                    <>
                                        { initiator == my_id ?
                                        <View className='items-center mb-4 px-[20]'>
                                            <View  style={{backgroundColor:Colors.inputColor,padding:8,borderRadius:6}} >
                                                <CustomText  
                                                    style={[styles.fontStyle, {fontSize:14}]}
                                                    text={`${props.route.params?.firstName} ${props.route.params?.lastName} is not in your match. You will able to send messages once they accept your request.`}
                                                />
                                            </View>
                                        </View>
                                        :
                                        <View className='items-center mb-4 px-[20]'>
                                             <View  style={{backgroundColor:Colors.inputColor,padding:8,borderRadius:6}} >
                                            <CustomText  
                                                style={[styles.fontStyle, {fontSize:14}]}
                                                text={`${props.route.params?.firstName} ${props.route.params?.lastName} is not in your match. They won't be able to send you messages until you accept their request.`}
                                            />
                                            </View>
                                            <View className='flex-row mt-5 justify-between  w-full '>
                                                <View className='flex-1'>
                                                    <GradientBtn
                                                        title='Accept'
                                                        onPress={() => responseRequest('acceptChat')}
                                                        isLoading={loading == 'acceptChat'}
                                                        disable={loading != ''} // disable
                                                        textStyle={undefined} containerStyle={undefined}                                                    />
                                                </View>
                                                <View className='w-[10]'></View>
                                                <View  className='flex-1'>
                                                    <SimpleBtn 
                                                        title='Reject' 
                                                        onPress={() => responseRequest('rejectChat')}
                                                        isLoading={loading == 'rejectChat'} 
                                                        disable={loading != ''}   
                                                    />
                                                </View>
                                            </View>
                                        </View>}
                                    </>
                                     :requestStatus =='rejected' ?
                                     <>
                                     { initiator == my_id ?
                                        <View className='items-center mb-4 px-[20]'>
                                            <View  style={{backgroundColor:Colors.inputColor,padding:8,borderRadius:6}} >
                                                <CustomText  
                                                    style={styles.fontStyle}
                                                    text={`${props.route.params?.firstName} ${props.route.params?.lastName} has not accepted your request. `}
                                                />
                                            </View>
                                        </View>
                                        :
                                        <View className='items-center mb-4 px-[20]'>
                                             <View  style={{backgroundColor:Colors.inputColor,padding:8,borderRadius:6}} >
                                                <CustomText  
                                                    style={styles.fontStyle}
                                                    text={`You rejected ${props.route.params?.firstName} ${props.route.params?.lastName}'s request. `}
                                                />
                                            </View>
                                        </View>
                                        }

                                     </>
                                    :
                                        <View style={{
                                            borderTopColor: Colors.black,
                                            // borderWidth:2
                                        }}>
                                            {newReply &&
                                                <View
                                                    style={{
                                                        // minHeight: 80,
                                                        paddingHorizontal: 20,
                                                        // marginHorizontal: 10,
                                                        backgroundColor: Colors.inputColor,
                                                        // borderRadius: 10,
                                                        // borderLeftWidth: 8,
                                                        borderTopWidth:1,
                                                        borderColor:Colors.light,
                                                        flexDirection: 'row',
                                                        justifyContent: 'space-between',
                                                        // borderWidth:1,
                                                        // position:'absolute',
                                                        // right:0,
                                                        // left:0,
                                                        // bottom:75,
                                                        // paddingBottom:10,
                                                        paddingVertical:5
                                                    }}>
                                                    {/* Render the reply message */}
                                                    {/* {console.log('>>>>>>>????<<<<',newReply)} */}
                                                    <View>
                                                        {newReply.sender == my_id ?
                                                            <CustomText style={{ fontFamily: Fonts.fontRegular, color: Colors.black, fontSize: 18 }}>You</CustomText> :
                                                            <CustomText style={{ fontFamily: Fonts.fontRegular, color: Colors.black, fontSize: 18 }}>{((props.route.params as any)?.firstName)} {((props.route.params as any)?.lastName)}</CustomText>
                                                        }

                                                        {newReply.message_type == 'text' ?
                                                            <CustomText numberOfLines={2} style={{ fontFamily: Fonts.fontRegular, color: Colors.grey, fontSize: 16 }}>{(newReply.message)}</CustomText> :
                                                            <Image source={{ uri: newReply.mediaUrl }} style={styles.imageStyl} resizeMode="cover" />
                                                        }
                                                        {/* 65715aee7b2e757af1e4ba21 */}

                                                    </View>
                                                    <TouchableOpacity onPress={() => { setNewReply(null)}} style={{position:'absolute',right:10,top:5}} >
                                                        <Entypo style={{ opacity: 1, zIndex: 10 }} name={'cross'} size={20} color={Colors.themeBlack} />
                                                    </TouchableOpacity>
                                                    {/* Render the chat bubble */}
                                                </View>}
                                            <View style={{
                                                flexDirection: 'row',  justifyContent: 'space-around', alignItems: 'center',
                                                borderTopColor: Colors.black,
                                                paddingVertical:10,
                                                backgroundColor:Colors.inputColor
                                                // borderWidth:1
                                            }}>
                                                <View style={{ flexDirection: 'row', backgroundColor: Colors.white, width: '80%', height: 50, justifyContent: 'space-around', alignItems: 'center', borderRadius: 20, paddingHorizontal: 20 }}>
                                                    {/* <TouchableOpacity style={{ width: 45 }} onPress={() => { setIsOpen(true) }}>
                                                    <FontAwesome6 style={{ opacity: 1, zIndex: 10 }} name={'face-grin-hearts'} size={25} color={Colors.themeBlack} />
                                                </TouchableOpacity> */}
                                                    <CustomInput
                                                        style={{ width: 270, borderColor: Colors.inputColor, borderRadius: 0, margin: 0,backgroundColor:Colors.white,borderWidth:0}}
                                                        // icon={<MaterialIcon style={{ opacity: 1, zIndex: 10 }} name={'email'} size={20} color={Colors.themeBlack} />}
                                                        value={value}
                                                        placeholder={'Send Messages'}
                                                        multiline={true}
                                                        onChangeText={onChangeText}
                                                    />
                                                    {/* <EmojiPicker onEmojiSelected={(emo) => { console.log(emo) }} open={isOpen} onClose={() => setIsOpen(false)} /> */}
                                                    <TouchableOpacity onPress={() => { handlePresentModalPress() }}>
                                                        <Entypo style={{ opacity: 1, zIndex: 10 }} name={'attachment'} size={20} color={Colors.themeBlack} />
                                                    </TouchableOpacity>
                                                </View>
                                                {!sendingmessage && 
                                                    <TouchableOpacity
                                                    style={{
                                                        height: 45,
                                                        width: 45,
                                                        borderRadius: 40,
                                                        backgroundColor: Colors.primary,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                    disabled={sendingmessage}
                                                    onPress={() => {
                                                        if(value.trim() =='') return 
                                                        sendPrivateMessage('text')
                                                    }}
                                                    // disabled={}
                                                >
                                                    <Ionicons color={Colors.white} size={22} name='send' />
                                                </TouchableOpacity>}
                                            </View>
                                        </View>
                                    }
                                </>
                                :
                                <View
                                
                                >
                                    <View className='items-center mb-4 px-[20]'>
                                            <View  style={{backgroundColor:Colors.inputColor,padding:8,borderRadius:6}} >
                                                <CustomText  
                                                    style={styles.fontStyle}
                                                    text={`Tap on any emoji to send a connection request`}
                                                />
                                            </View>
                                    </View>
                                <View style={{
                                    justifyContent: 'space-around', flexDirection: 'row', alignItems: 'center',
                                    borderTopColor: Colors.black, 
                                    // shadowColor: 'rgba(0,0,0)', // IOS
                                    // shadowOffset: { height: 1, width: 1 }, // IOS
                                    // shadowOpacity: .5, // IOS
                                    // // shadowRadius: 1, //IOS
                                    // backgroundColor: '#FFF',
                                    // elevation: 10, // Android
                                    paddingHorizontal: 20,
                                    // borderWidth:1,
                                    // height:0,
                                    paddingBottom:20
                                }}>
                                        
                                    <TouchableOpacity 
                                        style={styles.emojiStyle} 
                                        onPress={() => {
                                            checkAuth(2,'https://hotspotmeet.s3.us-east-1.amazonaws.com/ring1.gif')
                                        }}
                                    >
                                        <Image
                                            source={{uri:'https://hotspotmeet.s3.us-east-1.amazonaws.com/ring1.gif'}}
                                            resizeMode="cover"
                                            style={{ width: 50, height:50 }} />
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={styles.emojiStyle} 
                                        onPress={() => {
                                            checkAuth(2,'https://hotspotmeet.s3.us-east-1.amazonaws.com/rose.gif')
                                        }}
                                    >
                                        <Image
                                            source={{uri:'https://hotspotmeet.s3.us-east-1.amazonaws.com/rose.gif'}}
                                            resizeMode="cover"
                                            style={{ width: 70, height:70 }} />
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={styles.emojiStyle} 
                                        onPress={() => {
                                            checkAuth(2,'https://hotspotmeet.s3.us-east-1.amazonaws.com/wink.gif')
                                        }}
                                    >
                                        <Image
                                            source={{uri:'https://hotspotmeet.s3.us-east-1.amazonaws.com/wink.gif'}}
                                            resizeMode="cover"
                                            style={{ width: 50, height:50 }} />
                                    </TouchableOpacity>
                                </View>
                                </View>
                                )
                    
                        }
                        {(!socketLoaded || !blockDataResolved) && 
                            <View style={[StyleSheet.absoluteFill,{flex:1,overflow:'hidden',backgroundColor:Colors.white}]}>
                                <SkeletonPlaceholder borderRadius={4}   >
                                    <SkeletonPlaceholder.Item style={{paddingTop:20}}   >
                                        {Array(25).fill('').map((_,index)=>{
                                            return(
                                                <SkeletonPlaceholder.Item key={index} paddingHorizontal={20} alignItems={index % 2 == 0 ? 'flex-start':'flex-end' } >
                                                    <SkeletonPlaceholder.Item width={120} height={20} />
                                                    <SkeletonPlaceholder.Item marginTop={6} width={80} height={20} />
                                                </SkeletonPlaceholder.Item>
                                            )
                                        })}
                                    </SkeletonPlaceholder.Item>
                                </SkeletonPlaceholder>
                            </View>
                        }
                     
                        </View>
                    </KeyboardAvoidingView>
                    <BottomSheetModal
                        ref={bottomSheetModalRef}
                        index={0}
                        snapPoints={snapPoints}
                        backdropComponent={renderBackdrop}
                        backgroundStyle={{
                            backgroundColor: 'transparent',
                            marginHorizontal: 10,
                            overflow: 'hidden',
                        }}
                    >
                        <View className='flex-1 px-2  mx-[10]  rounded '>
                            <View className='bg-white mb-2  rounded-[12px]'>


                                <TouchableOpacity onPress={openGallery} className='  rounded p-3 flex-row items-center space-x-3'>
                                    <FontAwesome size={30} color={Colors.gradient1} name='photo' />
                                    <CustomText text={'Gallery'} />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity activeOpacity={.9} onPress={() => bottomSheetModalRef?.current?.close?.()} className='bg-white mb-2  rounded-[12px] justify-center items-center py-3'>
                                <CustomText text='Cancel' />
                            </TouchableOpacity>
                        </View>
                    </BottomSheetModal>
                </BottomSheetModalProvider>
                <PopupModal 
                    navigation={props.navigation} 
                    isVisible={visible} 
                    imgKey={handlePick ? 'Call'  : 'Hotspot'}
                    title={handlePick ? 'Calling is not available!' :'HotSpot connects are not available!' }
                    subTitle={handlePick ? 'Explore plans to get access to audio/video call' :'Explore plans to get more connects' }
                    onClose={()=>setVisible(false)} 
                />
                <PopupModal 
                    navigation={props.navigation} 
                    isVisible={visible2} 
                    imgKey='Chat' 
                    title={'Message First! \n Up your dating game'}
                    subTitle={"Don't keep them waiting, messaging first can increase your chances 💬"}
                    onClose={()=>setVisible2(false)} 
                />
                {conecting &&
                <View style={[StyleSheet.absoluteFill,{justifyContent:'center',alignItems:'center'}]} >
                    <View style={{
                        shadowColor: 'rgba(0,0,0)', // IOS
                        shadowOffset: { height: 1, width: 1 }, // IOS
                        shadowOpacity: .5, // IOS
                        shadowRadius: 1, //IOS
                        backgroundColor: '#FFF',
                        elevation: 10, // Android
                        height: 70,
                        width: 120,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius:10
                    }}>
                    <ActivityIndicator
                        color={'red'}
                        size={'small'}
                        // Optional: color can be: 'red', 'green',... or '#ddd', '#ffffff',...
                    />
                    <CustomText style={commonStyle.smalltextBold}>
                        Connecting
                    </CustomText>
                    </View>
                </View>}
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    emojiStyle: {
        // height: 68,
        // width: 68,
        // borderRadius: 500,
        // elevation: 5
        shadowColor: 'rgba(0,0,0)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: .5, // IOS
        shadowRadius: 1, //IOS
        backgroundColor: '#FFF',
        elevation: 10, // Android
        height: 70,
        width: 70,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius: 200,
        // bottom: 50,
        // position:"absolute"
        // borderWidth:2
    },
    imageStyl: {
        height: 50,
        width: 50,
        marginTop:5
    },
    suggesion_text_cont:{
        paddingHorizontal:30,
        paddingVertical:5,
        borderWidth:1,
        borderColor:Colors.primary,
        borderRadius:99
    },
    suggesionWrp:{
        flexDirection:'row',
        paddingLeft:10,
        gap:10,
        // paddingBottom:10,
        // borderWidth:1
    },
    suggesionScroll:{
        // justifyContent:'center',
        alignItems:'center',
        // borderWidth:1,borderColor:'red',
        // flex:1
        minWidth:'100%'
    },
    fontStyle:{
        color:Colors.title,
        textAlign:'center'
    }
});

export default SingleChat;