import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  NativeModules,
  Animated,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {
  type MultiStoryRef,
  Indicator,
  MultiStory,
  TransitionMode,
} from 'react-native-story-view';
// import { SvgXml } from 'react-native-svg';
import { commonStyle } from '../../constant/commonStyle';
import Colors from '../../constant/colors';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Fonts from '../../constant/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import CustomText from '../../components/customText';
import { deletChat, getALLChatUsers, getMyProfile } from '../../services/api';
import {
  useFocusEffect,
  ParamListBase,
  RouteProp,
  useIsFocused,
} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRecoilState, useRecoilValue } from 'recoil';

import { UserProfileData } from '../../contexts/userDetailscontexts';
import { ChatData } from '../../recoil/atoms/types';
import { FlatList } from 'react-native-gesture-handler';
import PopupModal from '../../components/noPlane';
import { formatDateStringmsg } from '../../constant/veriables';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';

import GradientBtn from '../../components/gradientBtn';
import { showSuccessMessage } from '../../services/alerts';
import { useChatState } from '../../recoil/atoms/chatData';
import RBSheet from 'react-native-raw-bottom-sheet';

const initAnimatedValues = (messages: Array<{ _id: string }>) => {
  const animatedValues: Record<string, Animated.Value> = {};
  messages?.forEach(message => {
    animatedValues[message._id] = new Animated.Value(0);
  });
  return animatedValues;
};
const height = Dimensions.get('window').height;
const Chat = (props: {
  route: RouteProp<ParamListBase, string>;
  navigation: any;
}) => {
  const [users, setUsers] = useState<Array<any>>([]);
  const { chatState } = useChatState();
  // const [loading, setLoading] = useState<boolean>(true)
  // const [userId, setUserId] = useState('')
  const { data: chatList, loading } = chatState;
  const [visible, setVisible] = useState(false);
  const {
    userDetails: { subscription, profileImage, _id: userId, ...userDetails },
    getMessages,
  } = useContext(UserProfileData);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState<{
    [key: string]: boolean;
  }>({});
  const [animatedValues, setAnimatedValues] = useState({});
  const isFocused = useIsFocused();
  const bottomSheetModalRef = useRef<any>();
  const [delLoading, setDelLoading] = useState(false);
  const snapPoints = useMemo(() => [`${(200 / height) * 100}%`], []);

  useEffect(() => {
    setAnimatedValues(
      initAnimatedValues(chatList?.filter(elm => elm?.messages?.length > 0)),
    );
  }, [chatList?.filter(elm => elm?.messages?.length > 0)?.length]);

  const onChatLongPress = (chatId: string) => {
    setIsSelectionMode(true);
    setSelectedChats({ ...selectedChats, [chatId]: true });
    animateCircle(chatId, true);
  };

  useEffect(() => {
    if (!isFocused) {
      setIsSelectionMode(false);
      setSelectedChats({});
      bottomSheetModalRef.current.close();
    }
  }, [isFocused]);

  const onChatPressInSelectionMode = (chatId: string) => {
    const isSelected = !selectedChats[chatId];
    const newSelectedList = { ...selectedChats };
    if (newSelectedList?.[chatId]) {
      delete newSelectedList[chatId];
    } else {
      newSelectedList[chatId] = true;
    }
    setSelectedChats(newSelectedList);
    if (Object.keys(newSelectedList)?.length == 0) {
      setIsSelectionMode(false);
    }
    animateCircle(chatId, isSelected);
  };

  const selectAllChats = () => {
    const allChats = chatList.reduce((acc, chat) => {
      acc[chat._id] = true;
      return acc;
    }, {});
    setSelectedChats(allChats);
    Object.keys(allChats)?.map((chatId: string) => animateCircle(chatId, true));
  };

  const cancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedChats({});

    Object.keys(animatedValues).forEach(chatId => {
      animateCircle(chatId, false);
    });
  };

  const animateCircle = (chatId: any, isSelected: any) => {
    if (animatedValues?.[chatId]) {
      Animated.timing(animatedValues[chatId], {
        toValue: isSelected ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const deleteChats = async () => {
    bottomSheetModalRef?.current?.open();
    const response = await new Promise((resolve, reject) => {
      (window as any).closeModal = (value: boolean) => {
        resolve(value);
      };
    });

    if (response) {
      setDelLoading(true);
      deletChat({ chatIds: Object.keys(selectedChats) })
        .then(res => {
          if (res.data.status) {
            showSuccessMessage('Chat deleted successfully');
            getMessages();
          }
        })
        .catch(err => {
          console.log('firstresss', err);
        })
        .finally(() => {
          cancelSelection();
          setDelLoading(false);
          bottomSheetModalRef?.current?.close();
        });
    }
  };

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
    [],
  );

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bgLight }}>
        <BottomSheetModalProvider>
          {loading == true ? (
            <View style={commonStyle.center}>
              <View className="justify-center items-center">
                <Image
                  className="w-[250] h-[250]"
                  source={require('../../assets/gif/like.gif')}
                />
              </View>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <View style={commonStyle.container}>
                <View className="flex-row justify-between items-center px-1">
                  <View
                    className="flex-row justify-start items-start -mb-5"
                    style={{ width: 200 }}
                  >
                    <Image
                      style={{ width: '100%' }}
                      source={require('../../assets/png/iconImage.png')}
                      className="mb-5"
                    />
                  </View>
                  {isSelectionMode ? (
                    <>
                      <View style={styles.selectionModeBar}>
                        <TouchableOpacity
                          style={{ paddingHorizontal: 3 }}
                          onPress={deleteChats}
                        >
                          <MaterialCommunityIcons
                            name="delete-outline"
                            size={25}
                            color={Colors.red}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{ paddingHorizontal: 3 }}
                          onPress={cancelSelection}
                        >
                          {/* <Text>Cancel</Text> */}
                          <Entypo name="cross" size={30} color={Colors.red} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{ paddingHorizontal: 3 }}
                          onPress={selectAllChats}
                        >
                          {/* <Text>Select All</Text> */}
                          <Ionicons
                            name="checkmark-done-sharp"
                            size={25}
                            color={Colors.red}
                          />
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={commonStyle.backshadowButton}>
                        <TouchableOpacity
                          style={{ paddingHorizontal: 3 }}
                          onPress={() =>
                            props.navigation.navigate('CallHistory')
                          }
                        >
                          {/* <MaterialCommunityIcons name='phone-log' size={25}  color={Colors.red}  /> */}
                          <Image
                            source={require('../../assets/png/callLog.png')}
                            tintColor={Colors.red}
                            className="w-[28] h-[28] "
                          />
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <FlatList
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ flexGrow: 1 }}
                  // contentContainerStyle={
                  //   chatList?.filter(elm => elm?.messages?.length > 0)
                  //     ?.length == 0 && { flex: 1 }
                  // }
                  data={chatList
                    ?.filter(elm => elm?.messages?.length > 0)
                    .slice()
                    .reverse()}
                  renderItem={({ item: data, index }: any) => {
                    let scale;
                    if (animatedValues?.[data?._id]) {
                      scale = animatedValues?.[data?._id]?.interpolate?.({
                        inputRange: [0, 1],
                        outputRange: [0, 1], // Adjust scale range as needed
                      });
                    }
                    const isSelected = selectedChats[data._id];
                    const formattedTime: any = formatDateStringmsg(
                      data?.messages[0]?.timestamp,
                      true,
                    );
                    // if(data?.messages?.length == 0 ){return }
                    return (
                      <TouchableOpacity
                        onLongPress={() => onChatLongPress(data._id)}
                        delayLongPress={Platform.OS == 'ios' ? 500 : 700}
                        onPress={() => {
                          if (isSelectionMode) {
                            onChatPressInSelectionMode(data._id);
                            return;
                          }
                          if (!subscription?.chat) {
                            return setVisible(true);
                          }
                          props.navigation.navigate('SingleChat', {
                            firstName: data?.user?.first_name,
                            lastName: data?.user?.last_name,
                            allChat: data?.messages.slice().reverse(),
                            oldChat: true,
                            otherUserId: data?.user?._id,
                            requestStatus: data?.requestStatus,
                            initiator: data?.initiator,
                            _id: data?._id,
                            isOnline: data?.user?.isOnline,
                            isUserBlocked: data?.isUserBlocked,
                            blockInfo: data?.blockInfo,
                            blockDataResolved: true,
                            isSuggestionActive: data?.isSuggestionActive,
                            mediaUrl: data?.media[0]?.mediaUrl,
                          });
                        }}
                        key={data._id}
                        style={[
                          isSelected && styles.selectedChatItem,
                          {
                            flexDirection: 'row',
                            paddingHorizontal: 15,
                            alignItems: 'center',
                            //   borderWidth: 2
                          },
                        ]}
                      >
                        <View
                          style={{
                            marginRight: 12,
                          }}
                        >
                          {!data?.isUserBlocked && data?.user?.isOnline && (
                            <View
                              style={{
                                height: 16,
                                width: 16,
                                borderRadius: 9,
                                backgroundColor: Colors.success,
                                position: 'absolute',
                                zIndex: 1,
                                bottom: -2,
                                left: 1,
                                borderWidth: 2,
                                borderColor: Colors.cardBg,
                              }}
                            />
                          )}
                          {data?.media[0] && (
                            <>
                              <Image
                                style={{
                                  height: 44,
                                  width: 44,
                                  borderRadius: 60,
                                  // borderWidth:1
                                }}
                                source={{
                                  uri: data?.media[0]?.mediaUrl,
                                }}
                              />
                              {isSelected && animatedValues?.[data?._id] && (
                                <Animated.View
                                  style={[
                                    styles.animatedCircle,
                                    { transform: [{ scale }] },
                                  ]}
                                >
                                  <Entypo name="check" color={Colors.white} />
                                </Animated.View>
                              )}
                            </>
                          )}
                        </View>
                        <View
                          style={{
                            paddingVertical: 16,
                            // borderBottomWidth:1,
                            borderColor: Colors.borderColor,
                            flex: 1,
                            paddingRight: 15,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                          >
                            <CustomText
                              style={[
                                commonStyle.headingtextBold,
                                { fontSize: 20 },
                              ]}
                            >
                              {data?.user?.first_name} {data?.user?.last_name}
                            </CustomText>
                          </View>
                          {data?.messages?.length > 0 &&
                          (data?.messages?.[0]?.message_type == 'emoji' ||
                            data?.messages?.[0].message_type == 'image') ? (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                // justifyContent:'center'
                                gap: 5,
                                // borderWidth:1,
                              }}
                            >
                              {data?.messages?.[0]?.sender == userId && (
                                <View style={{ marginRight: 3 }}>
                                  {data?.messages?.[0]?.message_state ==
                                    'pending' && (
                                    <Ionicons
                                      color={Colors.black}
                                      size={10}
                                      name={'time-outline'}
                                    />
                                  )}
                                  {data?.messages?.[0]?.message_state ==
                                    'sent' && (
                                    <Ionicons
                                      color={Colors.black}
                                      size={13}
                                      name={'checkmark-outline'}
                                    />
                                  )}
                                  {data?.messages?.[0]?.message_state ==
                                    'delivered' && (
                                    <Ionicons
                                      color={Colors.black}
                                      size={13}
                                      name={'checkmark-done-sharp'}
                                    />
                                  )}
                                  {data?.messages?.[0]?.message_state ==
                                    'seen' && (
                                    <Ionicons
                                      color={Colors.primary}
                                      size={13}
                                      name={'checkmark-done-sharp'}
                                    />
                                  )}
                                </View>
                              )}
                              <Ionicons
                                size={15}
                                name="image-outline"
                                color={Colors.black}
                              />
                              <CustomText
                                numberOfLines={1}
                                style={commonStyle.smalltext}
                              >
                                Photo
                              </CustomText>
                            </View>
                          ) : (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            >
                              {data?.messages?.[0]?.sender == userId && (
                                <View style={{ marginRight: 3 }}>
                                  {data?.messages?.[0]?.message_state ==
                                    'pending' && (
                                    <Ionicons
                                      color={Colors.black}
                                      size={10}
                                      name={'time-outline'}
                                    />
                                  )}
                                  {data?.messages?.[0]?.message_state ==
                                    'sent' && (
                                    <Ionicons
                                      color={Colors.black}
                                      size={13}
                                      name={'checkmark-outline'}
                                    />
                                  )}
                                  {data?.messages?.[0]?.message_state ==
                                    'delivered' && (
                                    <Ionicons
                                      color={Colors.black}
                                      size={13}
                                      name={'checkmark-done-sharp'}
                                    />
                                  )}
                                  {data?.messages?.[0]?.message_state ==
                                    'seen' && (
                                    <Ionicons
                                      color={Colors.primary}
                                      size={13}
                                      name={'checkmark-done-sharp'}
                                    />
                                  )}
                                </View>
                              )}
                              <CustomText
                                numberOfLines={1}
                                style={commonStyle.smalltext}
                              >
                                {data?.messages[0]?.message}
                              </CustomText>
                            </View>
                          )}
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <View style={{ alignItems: 'center' }}>
                            {data?.messages[0] && (
                              <CustomText
                                style={styles.textTime}
                                className="text-red"
                              >
                                {formattedTime}
                              </CustomText>
                            )}
                            {/* {console.log('firstdata?.deliveredMessagesCountdata?.deliveredMessagesCount',data)} */}
                            {data?.deliveredMessagesCount > 0 && (
                              <View
                                style={{
                                  backgroundColor: Colors.primary,
                                  borderRadius: 99,
                                  width: 22,
                                  height: 22,
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                              >
                                <CustomText
                                  style={[styles?.textTime, { fontSize: 12 }]}
                                  className="text-white "
                                >
                                  {data?.deliveredMessagesCount}
                                </CustomText>
                              </View>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                  keyExtractor={(item, key) => item?._id}
                  ListEmptyComponent={
                    <View
                      style={{
                        width: '100%',
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Image
                        style={{ height: 200, width: 200, marginBottom: 20 }}
                        resizeMode="contain"
                        source={require('../../assets/png/noMsg.png')}
                      />
                      <CustomText
                        text="Make Connections and Start Chatting"
                        style={[
                          commonStyle.smalltextBold,
                          { textAlign: 'center', marginBottom: 25 },
                        ]}
                      />
                    </View>
                  }
                />
              </View>
            </View>
          )}

          <RBSheet
            ref={bottomSheetModalRef}
            height={180}
            openDuration={100}
            closeOnDragDown={true}
            customStyles={{
              wrapper: {},
              container: {
                backgroundColor: Colors.cardBg,
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
              },

              draggableIcon: {
                marginTop: 5,
                marginBottom: 0,
                height: 5,
                width: 90,
                backgroundColor: Colors.borderColor,
              },
            }}
          >
            <View
              className="padd"
              style={{
                paddingHorizontal: 15,
                borderBottomWidth: 1,
                borderColor: Colors.borderColor,
                paddingVertical: 12,
              }}
            >
              <CustomText style={[commonStyle.mediumtextBold]}>
                {`Are you sure you want to delete ${
                  Object.keys(selectedChats)?.length > 1
                    ? 'selected chats'
                    : 'selected chat'
                } ?`}{' '}
              </CustomText>
            </View>
            <View
              style={{
                paddingHorizontal: 15,
                flexDirection: 'row',
                width: '100%',
                gap: 10,
                justifyContent: 'center',
                marginTop: 21,
              }}
            >
              <View className="flex-1">
                <GradientBtn
                  isLoading={delLoading}
                  onPress={() => {
                    (window as any).closeModal(true);
                  }}
                  title={'Delete'}
                />
              </View>
              <View className="flex-1">
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    bottomSheetModalRef.current.close();
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.fontRegular,
                      fontSize: 20,
                      color: Colors.primary,
                      top: 1,
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                {/* <GradientBtn onPress={()=>{bottomSheetModalRef.current.close()}} title={'Cancel'}/> */}
              </View>
            </View>
          </RBSheet>
          <PopupModal
            navigation={props.navigation}
            isVisible={visible}
            imgKey="Chat"
            title={'Messaging is not available!'}
            subTitle={'Explore plans to get access to chats'}
            onClose={() => setVisible(false)}
          />
        </BottomSheetModalProvider>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  textHeading: {
    color: Colors.title,
    fontFamily: Fonts.fontSemiBold,
    fontSize: 18,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#fffff',
    padding: 10,
    borderRadius: 30,
    borderWidth: 1,
    height: 50,
    borderColor: Colors.primary,
  },
  textSubHeading: {
    color: Colors.grey,
    fontFamily: Fonts.fontRegular,
    fontSize: 16,
  },
  textTime: {
    // color: Colors.red,
    fontFamily: Fonts.fontRegular,
    fontSize: 12,
    // marginBottom: 8
  },
  selectionModeBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    // Add other styles as needed
  },
  selectedChatItem: {
    backgroundColor: Colors.inputColor, // or any other indication
  },
  animatedCircle: {
    position: 'absolute',
    width: 22, // Adjust size as needed
    height: 22, // Adjust size as needed
    borderRadius: 20, // Half of width/height to make it a circle
    backgroundColor: Colors.red, // Adjust color as needed
    borderWidth: 1,
    borderColor: Colors.white,
    bottom: 0,
    right: -10,
    justifyContent: 'center',
    alignItems: 'center',
    // opacity: 0.5, // Adjust opacity as needed
  },
});

export default Chat;
