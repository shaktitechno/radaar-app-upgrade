import { View, SafeAreaView, TouchableOpacity, Platform, Dimensions, KeyboardAvoidingView, StyleSheet, ActivityIndicator } from 'react-native'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import Colors from '../../constant/colors'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import { commonStyle } from '../../constant/commonStyle'
import CustomText from '../../components/customText'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Ionicons from 'react-native-vector-icons/Ionicons' 
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetBackdrop
  } from '@gorhom/bottom-sheet';
import BackButton from '../../components/backButton'
import { cacelSub, callLog, callLogHisorty, checkBlockedUser, checkOtherUserPlan, getBlockuserList, unblockUser } from '../../services/api'
import { Image } from 'react-native'
import GradientBtn from '../../components/gradientBtn'
import { formatDateString, formatDateStringWithTime, formatDateStringmsg, formatTime } from '../../constant/veriables'
import Fonts from '../../constant/fonts'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { showErrorMessage, showSuccessMessage } from '../../services/alerts'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import { UserProfileData } from '../../contexts/userDetailscontexts'
import { callingdDataType } from '../../contexts/types'
import { CallingContaxt } from '../../contexts/callingContaxt'
import PopupModal from '../../components/noPlane'
import ZegoUIKitPrebuiltCallService, {
    ZegoSendCallInvitationButton,
  } from '@zegocloud/zego-uikit-prebuilt-call-rn';
import { useRecoilState } from 'recoil'

import { useIsFocused } from '@react-navigation/native'
import { useCallHistory } from '../../recoil/atoms/callHistory'
const maxDate = new Date();
maxDate.setFullYear(maxDate.getFullYear() - 18);

const height = (Dimensions.get('window').height)



const CallHistory = (props:any) => {
    const snapPoints = useMemo(() => [`${((Platform.OS == 'ios'? 480: 485)/height) * 100}%`], []);
    const [loading, setLoading] = useState<boolean>(true)
    const { callHistory: chatHistory, setCallHistory: setChatHistory } = useCallHistory();

    const {userDetails:{_id:my_id,...rest},setUserDetails,getMessages} =useContext(UserProfileData)
    const [page,setPage] =useState(1)
    const [totalCount,setTotalcount ] =useState(0)
    const [conecting,setConnecting] = useState(false)
    const {callingData,setCallingData} =useContext(CallingContaxt)
    const [visible,setVisible]=useState(false)
    const focused = useIsFocused()

    useEffect(()=>{
        console.log('focusedfocusedfocused',focused)
    },[focused])

    const getCallHistory =(page:any)=>{
        setLoading(true)
        callLogHisorty({page})
            .then((res:any)=>{
    
                setTotalcount(Math.ceil(res?.data?.totalCount/10))
                if(res?.data?.getAllLogs?.length > 0 ){
                    if(page == 1){
                        setChatHistory(res?.data?.getAllLogs)
                    }else{
                        setChatHistory((state:any)=>([...state,...res?.data?.getAllLogs]))
                    }
                }
            })
            .catch((err:any)=>{
                console.log('err in block list ',err )
            })
            .finally(()=>{
                setTimeout(()=>{
                    setLoading(false)
                },100)
            })
    }

    useEffect(()=>{

        
    },[])

    useEffect(()=>{
        // if((totalCount) < page ){
            getCallHistory(page)
        // }
    },[page,totalCount])

    // console.log('calll sdf,sdfdwfadfdwfadf',chatHistory)
   
    const insitateCall =async (oldData:any)=>{
        console.log(callingData,rest.subscription?.video_audio_call)
        if(callingData.call_status == 'Connected'){
            return 
        }
        if(!rest.subscription?.video_audio_call ||( !rest.subscription?.video_audio_call?.isAvailable ||  rest.subscription?.video_audio_call?.duration == 0)){
            setVisible(true)
            return
        }
        checkBlockedUser({conversation_id:oldData.conversation_id})
        .then((res:any)=>{
            if( res?.data?.isUserBlocked){
                if(res?.data?.blockInfo?.some((elm:any)=>elm.blockerUserId == my_id)){
                    return showErrorMessage(`Unblock ${(props.route.params as any)?.firstName} ${(props.route.params as any)?.lastName} to make a call`)
                }else{
                    return showErrorMessage('Unable to make a call')
                }
            }
          
            if (conecting){return }
            setConnecting(true)
            checkOtherUserPlan({user_id: oldData.responder_id })
            .then(res => {
                if(res.data?.benift_available?.video_audio_call?.duration > 0 ){
                    const data:callingdDataType ={
                        "conversation_id" : oldData.conversation_id, 
                        "responder_id" :  oldData?.otherUser?._id, 
                        "initiator_id" : my_id,
                        "call_status": "Missed",
                        "call_type" : oldData.call_type,
                    }
                    callLog(data)
                    .then(((res:any)=>{
                        console.log('***********************************response of logger',res.data)
                        if(res.status){
                            setCallingData({...data,logs_id:`${res.data.logs_id}` })
                            ZegoUIKitPrebuiltCallService
                            .sendCallInvitation(
                                [{
                                    userID: oldData?.otherUser?._id, 
                                    userName:`${oldData?.otherUser?.first_name} ${oldData?.otherUser?.last_name}`,
                                }], 
                                oldData.call_type == "Video", 
                                props.navigation, 
                                { 
                                    resourceID:"zego_radar_call",
                                    timeout: 40,
                                    notificationTitle:`${oldData?.otherUser?.first_name} ${oldData?.otherUser?.last_name}`,
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
                    console.log('ressjhunilkns',res.data)
                    setConnecting(false)
                    showErrorMessage('Other user does not have any active plan ')
                }
            }).catch(() => {})
        })
    }

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: Colors.cardBg,
            }}
        >
            <KeyboardAvoidingView 
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
        >
                <View className='flex-1' >
                    <View style={[commonStyle.container,{flex:1}]}>
                        <BackButton navigation={props.navigation}/>
                        <CustomText customeStyle={commonStyle.headingtextBold} text={'Call History'} />
                        <View className='flex-1'>
                            <FlatList
                                style={{flex:1}}
                                contentContainerStyle={chatHistory?.length == 0 && {flex:1}}
                                data={chatHistory}
                                keyExtractor={(item:any,key)=>`${key}_${item?._id}`}
                                onEndReached={()=>{
                                    if(totalCount == page){
                                        return 
                                    }
                                    setPage(state=>state + 1)

                                }}
                                onEndReachedThreshold={0.9}
                                showsVerticalScrollIndicator={false}
                                renderItem={({item:data,index})=>{
                                    return(
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                console.log('askhaszuobjk')
                                                insitateCall(data)
                                            }}
                                            className="border-b-borderColor  bordewqr border-b  py-3 mt-[10]">
                                            <View
                                                className={` items-center  border-borderColor bg-white w-full  rounded-full flex-row `}
                                            >
                                                <View className=" items-center justify-center " >
                                                    <Image
                                                        style={{
                                                            height: 57,
                                                            width: 57,
                                                            borderRadius: 999,
                                                        }}
                                                        source={ data?.otherUser?.media?.length > 0 &&{uri: data.otherUser.media?.[0]?.mediaUrl}}
                                                    />
                                                </View>
                                                    
                                                    <View className="flex-row items-center   ml-[12]   justify-between flex-1 pr-1.5">
                                                        <View className=' flex-1  justify-center pr-3'>
                                                            <CustomText
                                                                text={`${data?.otherUser?.first_name} ${data?.otherUser?.last_name}`}
                                                                className=""
                                                                style={commonStyle.regulartextBold}
                                                                ellipsizeMode={true}
                                                                numberOfLines={1}
                                                            />
                                                            <View>
                                                                <View
                                                                className='flex-row items-center  my-[2] space-x-1'
                                                                >   
                                                                {data.call_type == 'Video' 
                                                                ?
                                                                    <View 
                                                                        style={{
                                                                            justifyContent: 'center',
                                                                            alignItems:"center"
                                                                        }}
                                                                    >
                                                                        <Ionicons
                                                                            name='videocam-outline' 
                                                                            size={19}
                                                                            color={
                                                                                data.responder_id == my_id && data.call_status == 'Missed' 
                                                                                ? Colors.danger
                                                                                :data.initiator_id == my_id && data.call_status == 'Missed' 
                                                                                ? Colors.danger
                                                                                :data.responder_id == my_id && data.call_status == 'Connected'
                                                                                ?Colors.success
                                                                                :data.initiator_id == my_id && data.call_status == 'Connected'
                                                                                ?Colors.success
                                                                                :data.responder_id == my_id && data.call_status == 'Declined' 
                                                                                ?  Colors.danger
                                                                                :data.initiator_id == my_id && data.call_status == 'Declined' 
                                                                                ? Colors.danger
                                                                                :""
                                                                            }
                                                                        />
                                                                        <View 
                                                                            style={{position: 'absolute',left:1.5}}
                                                                        >
                                                                            <MaterialCommunityIcons
                                                                                name={data.initiator_id ==my_id? 'call-made' :'call-received'} 
                                                                                color={
                                                                                    data.responder_id == my_id && data.call_status == 'Missed' 
                                                                                    ? Colors.danger
                                                                                    :data.initiator_id == my_id && data.call_status == 'Missed' 
                                                                                    ? Colors.danger
                                                                                    :data.responder_id == my_id && data.call_status == 'Connected'
                                                                                    ?Colors.success
                                                                                    :data.initiator_id == my_id && data.call_status == 'Connected'
                                                                                    ?Colors.success
                                                                                    :data.responder_id == my_id && data.call_status == 'Declined' 
                                                                                    ?  Colors.danger
                                                                                    :data.initiator_id == my_id && data.call_status == 'Declined' 
                                                                                    ? Colors.danger
                                                                                    :""
                                                                                }
                                                                                size={10}
                                                                            />
                                                                        </View>

                                                                    </View>
                                                                :
                                                                    <SimpleLineIcons 
                                                                        style={{marginBottom:-3}} 
                                                                        name={data.initiator_id ==my_id? "call-out" :'call-in'} 
                                                                        color={
                                                                            data.responder_id == my_id && data.call_status == 'Missed' 
                                                                            ? Colors.danger
                                                                            :data.initiator_id == my_id && data.call_status == 'Missed' 
                                                                            ? Colors.danger
                                                                            :data.responder_id == my_id && data.call_status == 'Connected'
                                                                            ?Colors.success
                                                                            :data.initiator_id == my_id && data.call_status == 'Connected'
                                                                            ?Colors.success
                                                                            :data.responder_id == my_id && data.call_status == 'Declined' 
                                                                            ?  Colors.danger
                                                                            :data.initiator_id == my_id && data.call_status == 'Declined' 
                                                                            ? Colors.danger
                                                                            :""
                                                                        }
                                                                    />
                                                                }
                                                                    <CustomText style={commonStyle.smalltext}>
                                                                        {data.responder_id == my_id && data.call_status == 'Missed' 
                                                                        ? 'Missed'
                                                                        :data.initiator_id == my_id && data.call_status == 'Missed' 
                                                                        ?"Not answered"
                                                                        :data.responder_id == my_id && data.call_status == 'Connected'
                                                                        ?'Incoming'
                                                                        :data.initiator_id == my_id && data.call_status == 'Connected'
                                                                        ?'Outgoing'
                                                                        :data.responder_id == my_id && data.call_status == 'Declined' 
                                                                        ? 'Missed'
                                                                        :data.initiator_id == my_id && data.call_status == 'Declined' 
                                                                        ? 'Declined'
                                                                        :""
                                                                        }
                                                                    </CustomText>
                                                                </View>
                                                            </View>
                                                            {data?.duration > 0 &&
                                                                <CustomText
                                                                    text={`${formatTime(data?.duration || 0)}`}
                                                                    className=""
                                                                    style={commonStyle.smalltext}
                                                                    ellipsizeMode={true}
                                                                    numberOfLines={1}
                                                                />
                                                            }
                                                        </View>
                                                        <View className="flex-row   h-[25]">
                                                        {/* <CustomText
                                                            text={formatDateStringmsg(data?.timestamp)}
                                                            className=""
                                                            style={[commonStyle.smalltext,{color:Colors.grey}]}
                                                        /> */}
                                                         <CustomText
                                                            style={{
                                                                fontFamily: Fonts.fontRegular,
                                                                fontSize:12
                                                            }}
                                                            className="text-red">
                                                            {formatDateStringmsg(data?.timestamp)}
                                                        </CustomText>
                                                        </View>
                                                    </View>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                }}
                                ListEmptyComponent={()=>{
                                    return(
                                        <View style={{width:'100%',flex:1,justifyContent:'center',alignItems:'center',}}>
                                            <Image style={{ height:200,width:200,marginBottom:20,}} resizeMode='contain' source={require('../../assets/png/noBlock.png')} />
                                            <CustomText text='No call logs' style={[commonStyle.smalltextBold,{textAlign:'center',marginBottom:25}]} />
                                        </View>
                                    )
                                }}
                            />
                            {loading && 
                            <View style={[StyleSheet.absoluteFill,{flex:1,overflow:'hidden',backgroundColor:Colors.white}]}>
                                <SkeletonPlaceholder borderRadius={4}   >
                                    <SkeletonPlaceholder.Item style={{paddingTop:20}}   >
                                        {Array(25).fill('').map((_,index)=>{
                                            return(
                                                <SkeletonPlaceholder.Item key={index} flexDirection="row" marginVertical={10} alignItems="center">
                                                    <SkeletonPlaceholder.Item width={60} height={60} borderRadius={50} />
                                                    <SkeletonPlaceholder.Item marginLeft={20}>
                                                    <SkeletonPlaceholder.Item width={220} height={20} />
                                                    <SkeletonPlaceholder.Item marginTop={6} width={80} height={20} />
                                                    </SkeletonPlaceholder.Item>
                                                </SkeletonPlaceholder.Item>
                                            )
                                        })}
                                    </SkeletonPlaceholder.Item>
                                </SkeletonPlaceholder>
                            </View>
                            }
                        </View>

                    </View>
                </View>
        </KeyboardAvoidingView>
        <PopupModal
            navigation={props.navigation} 
            isVisible={visible} 
            imgKey={ 'Call'}
            title={'Calling is not available!'}
            subTitle={'Explore plans to get access to audio/video call' }
            onClose={()=>setVisible(false)} 
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

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        //   borderWidth:2
    },
    header: {
        position: 'absolute',
        width: '100%',
        height: 250,
        //   position: 'relative',
        // flexDirection:'row',
        top: 0,
        left: 0,
        backgroundColor: 'indigo',
    },
    circle: {
        // borderWidth:1,
        width: '100%',
        paddingTop: 250,
        borderRadius: 20,
        //   elevation: 10,
        position: 'relative',
        top: -40,
        // borderWidth:2,
        flex: 1,
        marginBottom: -40,
    },
    flexRow: {
        flexDirection: 'row',
    },
    flexWrap: {
        flexWrap: 'wrap',
    },
    spaceX2: {
        marginLeft: 2,
        marginRight: 2,
    },
    spaceY2: {
        marginBottom: 2,
    },
    galleryContainer: {
        width: 105,
        height: 78,
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 5,
        borderRadius: 12,
    },
    containerDropdown: {
        position: 'relative',
        alignItems: 'center',
    },
    dropdownBtn: {
        height: 30,
        width: 30,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownText: {
        fontSize: 16,
    },
    dropdownContent: {
        position: 'absolute',
        top:Platform.OS == 'ios'? 120 : 75, // Adjust this value based on your layout
        right: 50,
        width: 128,
        height: 'auto',
        borderRadius: 30,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    option: {
        padding: 10,
        marginVertical: 6,
        alignItems: 'center',
    },
    separator: {
        width: 110,
        height: 1,
        backgroundColor: '#ccc',
        alignSelf: 'center',
    },
    blockImage: {
        alignSelf: 'center',
    },
    alignAllCenetr: {
        alignSelf: 'center',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'rgba(0,0,0,0.5)',
    },
    });

export default CallHistory