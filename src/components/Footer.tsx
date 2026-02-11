import React, {
    JSX,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
// import { Footer as StoryFooter } from 'react-native-story-view';
import { addCommentToStory } from '../services/api';
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import Colors from '../constant/colors';
// import { Colors } from '../customeLib/story/theme';
// import { Footer as StoryFooter } from 'react-native-story-view';
// import { Strings } from '../constants';
// import { FooterProps } from './types';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CustomText from './customText';
import { Image } from 'react-native';
import { commonStyle } from '../constant/commonStyle';

import { UserProfileData } from '../contexts/userDetailscontexts';

import Fonts from '../constant/fonts';
import styles from './customeLib/story/components/Footer/style';
import { formatDateStringWithTime } from '../constant/veriables';
import { Icons } from './customeLib/story/assets';
interface FooterProps {
  userStories: {
    username?: string;
  } | null;

  story?: any[];

  progressIndex?: number;
}

const height = Dimensions.get('window').height;

const Footercomp = ({
  setComments,
  storycomments,
  userStories,
  story,
  progressIndex,
  setStories,
  setPause,
  isPause,
}: any): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(false);
  // const [comments,setComments] = useState<any[]>([])
  // const snapPoints = useMemo(() => [`90%`], []);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const bottomSheetModalRefForView = useRef<BottomSheetModal>(null);
  const comments = storycomments?.[progressIndex] || [];
  const view = userStories?.stories[progressIndex]?.story?.view || [];
  // const views = userStories?.stories[progressIndex]?.views || []
  const [input, setInput] = useState<string>('');
  const inputRef = useRef<any>(null);
  const _sendIconStyle = StyleSheet.flatten([
    { ...styles.sendIcon, tintColor: Colors.black },
  ]);
  const _inputStyle = StyleSheet.flatten([{ ...styles.input, color: '#000' }]);
  const [keyBoardShow, setKeyBoardshow] = useState<boolean>(false);
  const {
    getProfile,
    userDetails: { profileImage, ...userDetails },
  } = useContext(UserProfileData);
  const snapPoints = useMemo(
    () =>
      Platform.OS == 'ios'
        ? [`${keyBoardShow ? 90 : 90}%`]
        : [`${keyBoardShow ? 90 : 90}%`],
    [keyBoardShow],
  );
  // useEffect(()=>{
  //     setComments(userStories?.stories[progressIndex]?.comments || [])
  // },[userStories?.stories[progressIndex]?.comments])

  // console.log('setPause==}}}}',setPause)
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        // Do something when the keyboard is shown
        // console.log('show');
        // setKeyBoardshow(true)
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        // Do something when the keyboard is shown
        // console.log('hide');
        setKeyBoardshow(false);
      },
    );

    // Return a clean-up function to remove the event listener
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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
  // console.log('first>>>>>>>>',inputRef?.current?.value)

  const comment = (value: string, story: any) => {
    if (value.trim() == '') {
      return;
    }
    setInput('');
    setLoading(true);
    const data = {
      story_id: story.storyId,
      user_name: 'TestUser',
      comment: value,
    };
    // ref.current
    addCommentToStory(data)
      .then(res => {
        // console.log(res.data)
        // const srories = [userStories?.stories]
        // setStories((state:any)=>{
        //   const newArr = [...state]
        //   newArr[progressIndex]?.comments?.push({
        //     id:Math.random(),
        //     comment_info:{comment:value},
        //     profile_picture:{mediaUrl:profileImage.mediaUrl},
        //     user_details:{first_name:userDetails.first_name,last_name:userDetails.last_name}
        //   })
        //   return newArr;
        // })

        // const data = {
        //     comment_info:{comment:value,_id:uuid.v4()},
        //     profile_picture:{mediaUrl:profileImage?.mediaUrl},
        //     user_details:{first_name:userDetails?.first_name,last_name:userDetails?.last_name}
        // }

        setComments((state: any) => {
          const newArr = [...state];
          newArr[progressIndex]?.push({
            id: Math.random(),
            comment_info: { comment: value, commented_at: new Date() },
            profile_picture: { mediaUrl: profileImage?.mediaUrl },
            user_details: {
              first_name: userDetails?.first_name,
              last_name: userDetails?.last_name,
            },
          });
          return newArr;
        });
        // console.log('profileImage>>>>>>>>>>',profileImage)
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  };
  // console.log(comments)

  return (
    <View>
      {/* <StoryFooter
        {...{
          loading,
          setLoading,
          comments,
          story: userStories?.stories[progressIndex].story,
        }}
        onIconPress={(value: string) => {
          // console.log('sent')
          comment(value, userStories.stories[progressIndex]);
          Keyboard.dismiss();
        }}
        onSendTextPress={() => {
          if (isPause) {
            return;
          }
          bottomSheetModalRef?.current?.present();
          setPause(true);
          // console.log('function ran ',bottomSheetModalRef.current)
        }}
        onOpenView={() => {
          if (isPause) {
            return;
          }
          bottomSheetModalRefForView?.current?.present();
          setPause(true);
        }}
      /> */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        onDismiss={() => {
          setPause(false);
        }}
        style={{}}
        backgroundStyle={{
          // borderWidth:1,
          backgroundColor: Colors.white,
          // backgroundColor:'transparent',
          // marginHorizontal: 10,
          overflow: 'hidden',
        }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS == 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={120}
        >
          <View
            style={{
              backgroundColor: Colors.white,
              flex: 1,
              paddingBottom: 23,
            }}
          >
            <View
              style={{
                paddingBottom: 15,
                paddingTop: 0,
                marginTop: -5,
                borderColor: Colors.grey,
                borderBottomWidth: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 10,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                {/* <FontAwesome size={20} color={Colors.primary} name='commenting-o'/> */}
                <CustomText
                  style={{ fontSize: 20 }}
                  text={`Comments (${comments.length})`}
                />
              </View>
              {Platform.OS == 'android' && (
                <MaterialIcons
                  name="close"
                  onPress={() => {
                    bottomSheetModalRef?.current?.close?.();
                  }}
                  size={35}
                  color={Colors.black}
                />
              )}
            </View>
            <ScrollView
              style={{
                paddingTop: 10,
                flex: 1,
              }}
            >
              {comments.map((comment: any, key: number) => {
                return (
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 10,
                      // borderWidth:1
                    }}
                    key={comment?.comment_info?._id}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        paddingVertical: 5,
                        // justifyContent:'center',
                        alignItems: 'center',
                        gap: 10,
                        // borderWidth:1
                      }}
                    >
                      <View
                        style={{
                          width: 50,
                          height: 50,
                          // borderWidth:1,
                          borderRadius: 999,
                          overflow: 'hidden',
                          alignSelf: 'flex-start',
                        }}
                      >
                        {/* {console.log('aaasddasd f df df',comment?.profile_picture?.mediaUrl)} */}
                        {comment?.profile_picture?.mediaUrl && (
                          <Image
                            style={{
                              width: 50,
                              height: 50,
                              // borderWidth:1,borderColor:'red'
                            }}
                            source={{ uri: comment?.profile_picture?.mediaUrl }}
                          />
                        )}
                      </View>
                      <View
                        style={{
                          flex: 1,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            // borderWidth:1
                          }}
                        >
                          <View>
                            <View style={{ flexDirection: 'row' }}>
                              <CustomText
                                style={[
                                  commonStyle.mediumtextBold,
                                  {
                                    fontSize: 18,
                                    color: Colors.black,
                                    fontFamily: Fonts.fontBold,
                                  },
                                ]}
                                text={
                                  comment?.user_details?.first_name +
                                  ' ' +
                                  comment?.user_details?.last_name
                                }
                              />
                              <CustomText
                                style={[
                                  commonStyle.smalltext,
                                  {
                                    fontSize: 12,
                                    color: Colors.black,
                                    alignSelf: 'flex-end',
                                    marginLeft: 5,
                                  },
                                ]}
                                text={formatDateStringWithTime(
                                  comment?.comment_info?.commented_at,
                                )}
                              />
                            </View>
                            <CustomText
                              style={{ fontSize: 15, color: Colors.black }}
                              text={comment?.comment_info?.comment}
                            />
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* <TouchableOpacity 
                        onPress={()=>{
                        handleSendTextPress?.()
                        }}
                    style={{
                        paddingLeft:10,
                        alignItems:'center',
                        justifyContent:'center'
                    }}>
                        <FontAwesome size={34} color={colors.white} name='commenting-o'/>
                    </TouchableOpacity> */}
                <View
                  style={[styles.sectionStyle, { borderColor: Colors.black }]}
                >
                  <>
                    <TextInput
                      // ref={inputRef}
                      style={[
                        _inputStyle,
                        { fontFamily: Fonts.fontBold, fontSize: 15 },
                      ]}
                      placeholder={'Add Comment'}
                      placeholderTextColor={Colors.black}
                      onChangeText={setInput}
                      value={input}
                    />
                  </>
                  {/* {isKeyboardVisible && shouldShowTextInputSend && (
                        <TouchableOpacity onPress={handleSendTextPress}>
                            <Text style={_sendTextStyle} {...sendTextProps}>
                            {sendText ?? Strings.send}
                            </Text>
                        </TouchableOpacity>
                        )} */}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    comment(input, userStories.stories[progressIndex]);
                    // ref?.current?.clear()
                  }}
                  // Keyboard.dismiss();; }}
                  testID="footerIcon"
                >
                  {loading ? (
                    <ActivityIndicator
                      animating
                      pointerEvents="none"
                      color={Colors.primary}
                      size={'large'}
                    />
                  ) : (
                    <Image
                      source={Icons.send}
                      style={_sendIconStyle}
                      // {...sendIconProps}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </>
          </View>
        </KeyboardAvoidingView>
      </BottomSheetModal>
      <BottomSheetModal
        ref={bottomSheetModalRefForView}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        onDismiss={() => setPause(false)}
        style={{}}
        backgroundStyle={{
          // borderWidth:1,
          backgroundColor: Colors.white,
          // backgroundColor:'transparent',
          // marginHorizontal: 10,
          overflow: 'hidden',
        }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS == 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={120}
        >
          <View
            style={{
              backgroundColor: Colors.white,
              flex: 1,
              paddingBottom: 23,
            }}
          >
            <View
              style={{
                paddingBottom: 15,
                paddingTop: 0,
                marginTop: -5,
                borderColor: Colors.grey,
                borderBottomWidth: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 10,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                {/* <FontAwesome size={20} color={Colors.primary} name='commenting-o'/> */}
                <CustomText
                  style={{ fontSize: 20 }}
                  text={`Views (${view.length})`}
                />
              </View>
              {Platform.OS == 'android' && (
                <MaterialIcons
                  name="close"
                  onPress={() => {
                    bottomSheetModalRefForView?.current?.close?.();
                  }}
                  size={35}
                  color={Colors.black}
                />
              )}
            </View>
            <ScrollView
              style={{
                paddingTop: 10,
                flex: 1,
              }}
            >
              {/* { console.log('aslkdmaklsmdkmasd',view)} */}
              {view.map((view: any, key: number) => {
                return (
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 10,
                      // borderWidth:1
                    }}
                    key={view?.view_info?._id}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        paddingVertical: 5,
                        // justifyContent:'center',
                        // alignItems:'center',
                        gap: 10,
                        // borderWidth:1
                      }}
                    >
                      <View
                        style={{
                          width: 50,
                          height: 50,
                          // borderWidth:1,
                          borderRadius: 999,
                          overflow: 'hidden',
                        }}
                      >
                        {/* {console.log('aaasddasd f df df',view?.profile_picture?.mediaUrl)} */}
                        {view?.profile_picture?.mediaUrl && (
                          <Image
                            style={{
                              width: 50,
                              height: 50,
                              // borderWidth:1,borderColor:'red'
                            }}
                            source={{ uri: view?.profile_picture?.mediaUrl }}
                          />
                        )}
                      </View>
                      <View
                        style={
                          {
                            // flex:1,
                            // borderWidth:1
                          }
                        }
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            // borderWidth:1,borderColor:'red'
                          }}
                        >
                          <View>
                            <View>
                              <CustomText
                                style={[
                                  commonStyle.mediumtextBold,
                                  { fontSize: 15, color: Colors.black },
                                ]}
                                text={
                                  view?.user_details?.first_name +
                                  ' ' +
                                  view?.user_details?.last_name
                                }
                              />
                              <CustomText
                                style={[
                                  commonStyle.smalltext,
                                  { fontSize: 12, color: Colors.black },
                                ]}
                                text={formatDateStringWithTime(
                                  view?.view_info?.viewed_at,
                                )}
                              />
                            </View>
                          </View>
                        </View>
                        {/* <CustomText style={{fontSize:15,color:Colors.black}} text={view.view} /> */}
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </BottomSheetModal>
    </View>
  );
};

export default Footercomp;
