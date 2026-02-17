import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, TouchableWithoutFeedback, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constant/colors';
import Fonts from '../constant/fonts';
import CustomText from './customText';
import Ionicons from "react-native-vector-icons/Ionicons";
import {
    FlingGestureHandler,
    Directions,
    State,
} from 'react-native-gesture-handler';
import Animated, {
    withSpring,
    useAnimatedStyle,
    
    useSharedValue,
    runOnJS,
    Easing
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { Image } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo'
import { socket } from '../services/apiConfig';

import { formatDateStringmsg } from '../constant/veriables';
import FullScreenImageModal from './fullScreenImage';


interface MsgComponentProps {
    item: any
    sender: any;
    reply: any
    textOrImage?: any
    // reply: (arg: any) => void; 
    // textOrImage: (arg: any) => void; 
    // replyIsSender: any;
    otherUser: string;
    my_id?:string;
    other_user_name:string;
    token:string;
    conversationId:string;
    requestStatus:'pending' | 'rejected' | 'accepted',
    isUserBlocked?:boolean
}
const emojies = ['😂','👍','❤️','🥲','😯','🙏']

const MsgComponent: React.FC<MsgComponentProps> = ({ item, sender, reply, otherUser,my_id,other_user_name,token,conversationId,requestStatus,isUserBlocked}) => {

    const theme = useTheme();
    const startingPosition = 0;
    const x = useSharedValue(startingPosition);
    const [imageUrl,setImageUrl]=useState('')
    const [isVisible,setIsvisible] = useState(false)
    const [currentIcon, setCurrentIcon] = useState(null);
    const [newModal, setNewModal] = useState(false);
    const [location, setLocation] = useState<any>({ locationX: 0, locationY: 0, sender })
    const [reactions, setReactions] = useState<any>(item.reaction || [])
    // const timestamp = item.timestamp;
    // const timestampDate = new Date(timestamp);

    // Extract hours and minutes and format them as HH:mm
    // const formattedTime = timestampDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedTime :any = formatDateStringmsg(item.timestamp)
    // longpresshandler
    useEffect(()=>{
        // console.log('senderSide ')
        setReactions(item.reaction ||[])
    },[item.reaction])
    const sentReaction = (reaction:string)=>{
        if(requestStatus != 'accepted'){return }
        const data = {
            token,
            message: reaction,
            message_id: item._id,
            conversation_id: conversationId,
        }
        // console.log('ahkvsxxjla',data,item)
        socket.emit('reactOnPrivateMessage',data)
        // setReactions((state:any)=>state.map((item:any)=> item.user_id == my_id ? {...item,reaction}:{...item}) )
        setNewModal(false)
    }
    

    const EmojiPicker = ({ }) => {
        // Placeholder for the emoji picker component
        return (
            <Modal
                visible={newModal}
                onRequestClose={() => setNewModal(false)}
                transparent={true}
            >
                {/* {console.log('???????????>> ', location,my_id)} */}
                <TouchableOpacity activeOpacity={1} onPress={closeModal} style={{ flex: 1, }}>
                    <View style={[styles.modalOverlay,
                    { position: 'absolute', },
                    location?.locationY ? { top: location?.locationY - 69 } : {},
                    location?.sender == my_id ?  { right: 10 }:{ left: 10 } 

                    ]}>
                        <TouchableWithoutFeedback onPress={handleModalPress}>
                            <View style={styles.emojiPickerContainer}>
                                {emojies.map((item,index)=>
                                <TouchableOpacity key={index} onPress={() => {
                                    sentReaction(item)
                                }}>
                                    <CustomText style={{ fontSize: 25 }}>{item}</CustomText>
                                </TouchableOpacity>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableOpacity>

            </Modal>
        );
    };

    const closeModal = () => {
        setNewModal(false);
        console.log("object", item.message)
    };

    const handleModalPress = (event: any) => {
        // Prevent the event from propagating to the underlying components
        event.stopPropagation();
    };

    const showEmojiPicker = useSharedValue(false);

    const onLongPressGestureEvent = (event: any, sender: boolean) => {
        // const { x, y, width, height } = event.nativeEvent.layout
        //
        // console.log("Worked!!jhg > ", sender)
        if((requestStatus != 'accepted' || isUserBlocked)){return }
        if (touchableOpacityRef.current) {
            // touchableOpacityRef?.current?.measure?.((pageX: any, pageY: any) => {
            //     console.log('TouchableOpacity position:', pageX, pageY);
            //     setLocation({ locationX: pageX, locationY: pageY, sender })
            //     // Do something with the position, e.g., store it in state
            // });
            setLocation({ locationX: event.nativeEvent.pageX, locationY: event.nativeEvent.pageY, sender })
        }
        // console.log("Worked!! > ", event.nativeEvent)
        setNewModal(true)
        {
            event.nativeEvent ?
                showEmojiPicker.value = true : null
        }
    };

    const onPressGestureEvent = () => {

        showEmojiPicker.value = false
    };

    // Emoji reaction animation style
    const emojiPickerStyle = useAnimatedStyle(() => {
        return {
            opacity: withSpring(showEmojiPicker.value ? 1 : 0, { damping: 10, stiffness: 100, easing: Easing.inOut(Easing.ease) }),
        };
    });

    // Emoji reaction function
    // const handleEmojiReaction = emoji => {
    //     // Implement your logic to handle the selected emoji
    //     // For example, you might send it to a server or update the UI
    //     // ...

    //     // Hide the emoji picker
    //     showEmojiPicker.value = false;
    // };

    // longpresshandler


    // useEffect(() => {
    //     // console.log("item >>> ???<<<>> ", item)
    //     // Use setTimeout to change the currentIcon with a delay
    //     const timeout1 = setTimeout(() => setCurrentIcon({ name: 'checkmark-outline', color: Colors.white }), 0); // You can adjust the delay if needed
    //     const timeout2 = setTimeout(() => setCurrentIcon({ name: 'checkmark-done-outline', color: Colors.white }), 1000); // 1000 milliseconds delay
    //     const timeout3 = setTimeout(() => setCurrentIcon({ name: 'checkmark-done-outline', color: Colors.black }), 2000); // 2000 milliseconds delay

    //     // Clean up timeouts on component unmount to avoid memory leaks
    //     return () => {
    //         clearTimeout(timeout1);
    //         clearTimeout(timeout2);
    //         clearTimeout(timeout3);
    //     };
    // }, []);


    const eventHandler = Gesture.Pan()
  .onStart((event) => {
    // same as before
  })
  .onUpdate((event) => {
    // same as onActive
    x.value = false ? -50 : 50;
  })
  .onEnd((event) => {
    x.value = withSpring(startingPosition);

    if (item.message_type === 'image' || item.message_type === 'emoji') {
      runOnJS(reply)(item);
    } else {
      runOnJS(reply)(item);
    }
  });


    const uas = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: x.value }],
        };
    });

    const containerRef = useRef(null);

    const handlePressOutside = (e) => {
        // Check if the press event occurred outside the TouchableOpacity
        if (containerRef.current && !containerRef.current.contains(e.target)) {
            onPressGestureEvent();
        }
    };
    const touchableOpacityRef = useRef(null);
    useEffect(() => {
        // console.log("otherUser", otherUser)
        // console.log("otherUser", sender)


    }, [])

    const openModal =(url:string)=>{
        setIsvisible(true)
        setImageUrl(url)
    }

    const closeImageModal =()=>{
        setIsvisible(false)
        setImageUrl('')
    }

    return (
        <View
            // style={{borderWidth:1}}
        >
            <View ref={containerRef} collapsable={false}>
                <FlingGestureHandler
                    direction={Directions.RIGHT}
                    onGestureEvent={eventHandler}
                    onHandlerStateChange={({ nativeEvent }) => {
                        if (nativeEvent.state === State.ACTIVE) {
                            // onSwipe(message);
                        }
                    }}>
                    <Animated.View style={[styles.container, uas]}>
                        <View>
                            <View style={[
                                {
                                    alignItems: 'flex-start',
                                    marginRight: '25%',
                                    // marginBottom: 15,
                                },

                                otherUser != sender && {
                                    alignItems: 'flex-end',
                                    marginLeft: '25%',
                                    marginRight: 0,
                                },
                            ]}>
                                <View style={[
                                    {
                                        alignItems: 'flex-start',
                                        marginRight: '25%',
                                        marginBottom: 15,
                                    },
                                    otherUser != sender && {
                                        alignItems: 'flex-end',
                                        marginLeft: '25%',
                                        marginRight: 0,
                                    }
                                ]}>
                                    {item.isReply &&
                                        <LinearGradient
                                        colors={otherUser != sender ? ["#ea3d85", "#ff864e"] : ["#eee", "#eee"]}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                        style={[
                                            {
                                                borderRadius: 8,
                                                // borderWidth:1
                                                opacity:0.6,
                                                paddingHorizontal:(item?.toWhichReplied?.message_type == 'emoji' || item?.toWhichReplied?.message_type == 'image')?  5  :10,
                                                paddingVertical: 5,
                                                // borderWidth:1,
                                                
                                            }
                                        ]}
                                        >

                                            <CustomText 
                                            style={{
                                                marginBottom:(item?.toWhichReplied?.message_type == 'emoji' || item?.toWhichReplied?.message_type == 'image') ? 5: 0,
                                                // textAlign:otherUser == sender ?  'right':'left',
                                                paddingHorizontal:5
                                            }}
                                            >
                                                {/* <Entypo name='reply' size={16}/> */}
                                                {item?.toWhichReplied?.messageOwner == my_id ? 'You' :`${other_user_name}` }
                                            </CustomText>
                                             {/* {console.log('dsjckbsdbnc,dcwd',item,my_id)} */}
                                            {(item?.toWhichReplied?.message_type == 'emoji' || item?.toWhichReplied?.message_type == 'image')  ? (
                                                // If there is an image, render it
                                                <>
                                                <Image source={{ uri:item?.toWhichReplied?.message }} style={styles.imageStyl} resizeMode="cover" />
                                                </>

                                            ) : (
                                                // If there is no image, render the message text
                                                <CustomText style={[{
                                                    fontFamily: Fonts.fontRegular,
                                                    color: Colors.grey,
                                                    paddingVertical:2
                                                    // fontSize: 20
                                                }, otherUser != sender && {
                                                    color: Colors.white,
                                                }]}>{item?.toWhichReplied?.message}</CustomText>
                                            )}
                                        </LinearGradient>
                                    }
                                    <LinearGradient
                                        colors={otherUser != sender ? ["#ea3d85", "#ff864e"] : ["#eee", "#eee"]}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                        style={[
                                            {
                                                borderRadius: 8,
                                                // borderWidth:1
                                                marginTop:item.isReply ? -6 :0
                                            }
                                        ]}
                                    >
                                        <TouchableOpacity
                                            onLongPress={(e) => { onLongPressGestureEvent(e, sender) }}
                                            delayLongPress={Platform.OS =='ios' ? 500: 700}
                                            onPress={()=>{
                                                if(item.message_type == 'emoji' || item.message_type == 'image'){
                                                    openModal(item.mediaUrl)
                                                }
                                            }}
                                            activeOpacity={0.9}
                                            style={{
                                                // borderWidth: 1,
                                                paddingHorizontal:(item.message_type == 'emoji' || item.message_type == 'image') ? 5:10,
                                                paddingVertical: 5,
                                            }}
                                            ref={touchableOpacityRef}
                                        >
                                            {(item.message_type == 'emoji' || item.message_type == 'image')  ? (
                                                // If there is an image, render it
                                                <>
                                                <Image source={{ uri: item.mediaUrl }} style={styles.imageStyl} resizeMode="cover" />
                                                </>

                                            ) : (
                                                // If there is no image, render the message text
                                                <CustomText style={[{
                                                    fontFamily: Fonts.fontRegular,
                                                    color: Colors.title,
                                                    
                                                    paddingVertical:2
                                                    // fontSize: 20
                                                }, otherUser != sender && {
                                                    color: Colors.white,
                                                }]}> { item.message}</CustomText>
                                            )}
                                            <View style={{ flexDirection: 'row', justifyContent: item.sender == my_id ? 'flex-end':'flex-start', alignItems:'flex-end'}}>

                                                <CustomText style={{ fontFamily: Fonts.fontRegular, color: Colors.textLight, marginTop: 0, fontSize: 10, }}>{formattedTime}  </CustomText>
                                                {/* {currentIcon && <Ionicons color={currentIcon.color} size={13} name={currentIcon.name} />} */}
                                                {/* const timeout1 = setTimeout(() => setCurrentIcon({ name: 'checkmark-outline', color: Colors.white }), 0); // You can adjust the delay if needed
                                                const timeout2 = setTimeout(() => setCurrentIcon({ name: 'checkmark-done-outline', color: Colors.white }), 1000); // 1000 milliseconds delay
                                                const timeout3 = setTimeout(() => setCurrentIcon({ name: 'checkmark-done-outline', color: Colors.black }), 2000); */}
                                                {/* {console.log('>>>>>><><><<',item)} */}
                                                {/* {console.log('aasd><?????',item)} */}
                                                {item.sender == my_id &&
                                                    <>
                                                        {item.message_state == 'pending' && <Ionicons color={ Colors.black} size={10} name={'time-outline'} />}
                                                        {item.message_state == 'sent' && <Ionicons color={ Colors.black} size={13} name={'checkmark-outline'} />}
                                                        {item.message_state == 'delivered' && <Ionicons color={ Colors.black} size={13} name={'checkmark-done-sharp'} />}
                                                        {item.message_state == 'seen' && <Ionicons color={ Colors.white} size={13} name={'checkmark-done-sharp'} />}
                                                    </>
                                                }           
                                            </View>
                                        </TouchableOpacity>

                                    </LinearGradient>
                                    
                                    {/* <CustomText style={[{
                                        fontFamily: Fonts.fontRegular,
                                        color: Colors.title,
                                    }, otherUser != sender && {
                                        color: Colors.white,
                                    }]}>
                                        {reactions}
                                    </CustomText> */}
                                    <View style={{flexDirection:'row'}}>
                                        {reactions?.map?.((reaction:any,index:number)=>{
                                            if(reaction?.reaction){
                                            return(
                                            <CustomText
                                                key={reaction?._id}
                                                style={[{
                                                    fontFamily: Fonts.fontRegular,
                                                    color: Colors.title,
                                                }, otherUser != sender && {
                                                    color: Colors.white,
                                            }]}>
                                                {reaction.reaction}
                                            </CustomText>
                                        )}})}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                </FlingGestureHandler>
                <Animated.View style={[{ position: 'relative' }, emojiPickerStyle]}>
                    {location?.locationY ? <EmojiPicker /> : null}
                </Animated.View>
            </View>
            <FullScreenImageModal isVisible={isVisible} imageUrl={imageUrl} onClose={closeImageModal}/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // paddingVertical: 10,
        // marginVertical: 5,
        // backgroundColor: 'red',
        // margin: 20,
    },
    emojiPickerContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        elevation: 5, // Adjust the elevation as needed
    },
    imageStyl: {
        height: 100,
        width: 100,

    },
    modalOverlay: {
        flex: 1,
    },
});

export default MsgComponent;