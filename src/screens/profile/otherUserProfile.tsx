import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Colors from '../../constant/colors';
import { commonStyle } from '../../constant/commonStyle';
import CustomText from '../../components/customText';
import Fonts from '../../constant/fonts';
import GradientBtn from '../../components/gradientBtn';
import { calculateAge } from '../../constant/veriables';
import * as Animatable from 'react-native-animatable';
import { TouchableWithoutFeedback } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RBSheet from 'react-native-raw-bottom-sheet';
import CustomInput from '../../components/customInput';
import { getUserById, reportBlockuser } from '../../services/api';
import BackButton from '../../components/backButton';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { useRecoilState } from 'recoil';

import { showErrorMessage, showSuccessMessage } from '../../services/alerts';
import PopupModal from '../../components/noPlane';
import { UserProfileData } from '../../contexts/userDetailscontexts';
import { socket } from '../../services/apiConfig';
import { fonts } from '@rneui/base';
import { useChatState } from '../../recoil/atoms/chatData';

const height = Dimensions.get('window').height;
const ProfilePage = (props: any) => {
  const [userDetails, setUserDetails] = useState<any>();
  const reportPopup = useRef<any>();
  const [reportType, setreportType] = useState(null);
  const [reportText, setReportText] = useState('');
  const [err, seterr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyBoardShow, setKeyBoardshow] = useState<boolean>(false);

  const [dataLoading, setDataLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const {
    userDetails: { subscription, profileImage, _id: userId },
    getMessages,
  } = useContext(UserProfileData);
  const messages = useChatState(state => state.chatState);

  useEffect(() => {
    if (props?.route?.params?.user) {
      setUserDetails(props?.route?.params?.user);
      setDataLoading(false);
    } else {
      getUserById({ id: props?.route?.params?.user_id })
        .then(res => {
          setDataLoading(false);

          setUserDetails(res.data.getUserDetails);
        })
        .catch(err => {
          showErrorMessage('Something went wrong . Please try again later');
          props.navigation.goBack();
          setDataLoading(false);
        });
    }
  }, []);

  const tags11 = [
    { isSelected: false, name: 'Smooker' },
    { isSelected: false, name: 'Book Reading' },
    { isSelected: false, name: 'Swiming' },
    { isSelected: false, name: 'Music' },
  ];
  const [tags, settags] = useState<any>(tags11);

  const setValueSet = async (name: string) => {
    console.log('name ==== >>>>', name);
    let newTag = tags.map((item: any, index: number) => {
      if (name == item.name) {
        item.isSelected = !item.isSelected;
      }
      return item;
    });
    settags(newTag);
  };
  const ChatBtn = () => {};
  // console.log(userDetails);
  const [isOpen, setIsOpen] = useState(false);
  const snapPoints = useMemo(
    () =>
      Platform.OS == 'ios'
        ? [
            `${
              (reportType == 1
                ? (keyBoardShow ? 850 : 600) / height
                : 550 / height) * 100
            }%`,
          ]
        : [
            `${
              (reportType == 1
                ? (keyBoardShow ? 850 : 610) / height
                : 540 / height) * 100
            }%`,
          ],
    [reportType, keyBoardShow],
  );

  const handlePress = () => {
    setIsOpen(!isOpen);
  };
  const dropdownRef = useRef<any>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        console.log('show');
        setKeyBoardshow(true);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        console.log('hide');
        setKeyBoardshow(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {}, []);

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
  const handelNavigate = () => {
    // console.log('messages.data',messages.data)
    const index = messages.data.findIndex(
      (elm: any) => elm?.user?._id == userDetails?._id,
    );
    // console.error(index)
    if (index == -1) {
      props?.navigation.navigate('SingleChat', {
        firstName: userDetails?.first_name,
        lastName: userDetails?.last_name,
        otherUserId: userDetails._id,
        allChat: [],
        oldChat: false,
        mediaUrl: userDetails.media[0].mediaUrl,
      });
    } else {
      if (!subscription?.chat) {
        return setVisible(true);
      }
      const data: any = messages?.data?.[index];
      props.navigation.navigate('SingleChat', {
        firstName: data?.user?.first_name,
        lastName: data?.user?.last_name,
        allChat: data?.messages.slice().reverse(),
        oldChat: true,
        otherUserId: data?.user?._id,
        requestStatus: data?.requestStatus,
        initiator: data?.initiator,
        isOnline: data?.user?.isOnline,
        isUserBlocked: data?.isUserBlocked,
        blockInfo: data?.blockInfo,
        blockDataResolved: true,
        mediaUrl: userDetails.media[0].mediaUrl,
      });
    }
  };

  const heightStyle =
    userDetails?.media?.length > 1 ? styles.height500 : styles.height410;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.cardBg,
      }}
    >
      {dataLoading ? (
        <>
          <View style={commonStyle.center}>
            <View className="justify-center items-center">
              <Image
                className="w-[250] h-[250]"
                source={require('../../assets/gif/like.gif')}
              />
            </View>
          </View>
        </>
      ) : (
        <BottomSheetModalProvider>
          <View style={{ flex: 1 }}>
            <BottomSheetModal
              ref={reportPopup}
              index={0}
              snapPoints={snapPoints}
              backdropComponent={renderBackdrop}
              style={{
                height: 'auto',
              }}
              backgroundStyle={{
                backgroundColor: 'transparent',
                marginHorizontal: 10,
                overflow: 'hidden',
              }}
            >
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : ''}
                keyboardVerticalOffset={20}
                style={{ flex: 1 }}
              >
                <ScrollView className="flex-1 rounded pb-10 bg-white ">
                  <View className="bg-white flex-1  pb-10 rounded-[12px] pt-[15] ">
                    <View
                      className=""
                      style={{
                        paddingHorizontal: 10,
                        borderBottomWidth: 1,
                        borderColor: Colors.borderColor,
                        paddingVertical: 10,
                      }}
                    >
                      <View style={styles.blockImage}>
                        <Image
                          source={
                            userDetails?.media?.length > 0
                              ? {
                                  uri: userDetails.media[0].mediaUrl,
                                }
                              : ''
                          }
                          className="w-24 h-24 mb-5 rounded-full  "
                        />
                      </View>
                      <CustomText
                        style={[
                          {
                            color: Colors.title,
                            fontFamily: Fonts.fontSemiBold,
                          },
                          styles.alignAllCenetr,
                          commonStyle.headingtextBold,
                        ]}
                        className="pb-[10] "
                      >
                        {(reportType == 1 ? 'Report and Block ' : 'Block ') +
                          userDetails?.first_name +
                          '?'}
                      </CustomText>
                      <View
                        style={{
                          marginHorizontal: 0,
                          marginTop: 10,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            marginBottom: 8,
                          }}
                        >
                          <MaterialIcon
                            style={{
                              opacity: 1,
                              zIndex: 10,
                            }}
                            name={'block'}
                            size={23}
                          />
                          <CustomText
                            style={[
                              {
                                fontFamily: Fonts.fontSemiBold,
                                lineHeight: 20,

                                alignItems: 'flex-start',
                                flex: 1,
                              },
                            ]}
                            className="pb-[10] pl-[10]  "
                          >
                            {reportType == 1
                              ? 'Reported and blocked '
                              : 'Block '}
                            users cannot send you messages or like your profile.
                            Your profile will also not be visible in searching,
                            Swipe mode, and Hotspot RADAR mode.
                          </CustomText>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            marginBottom: 8,
                          }}
                        >
                          <Ionicons
                            style={{
                              opacity: 1,
                              zIndex: 10,
                            }}
                            name={'notifications-off-outline'}
                            size={23}
                          />
                          <CustomText
                            style={[
                              {
                                fontFamily: Fonts.fontSemiBold,
                                alignItems: 'flex-start',
                                flex: 1,
                              },
                            ]}
                            className="pb-[10] pl-[10]"
                          >
                            They won't be notified that you blocked them.
                          </CustomText>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            marginBottom: 8,
                          }}
                        >
                          <Ionicons
                            style={{ opacity: 1, zIndex: 10 }}
                            name={'settings-outline'}
                            size={23}
                          />
                          <CustomText
                            style={[
                              {
                                fontFamily: Fonts.fontSemiBold,
                                alignItems: 'flex-start',
                                flex: 1,
                              },
                            ]}
                            className="pb-[10] pl-[10]"
                          >
                            You can unblock them at anytime in Settings.
                          </CustomText>
                        </View>
                      </View>

                      {reportType == 1 && (
                        <>
                          <CustomInput
                            onChangeText={(text: string) => setReportText(text)}
                            placeholder="Enter reason "
                          />
                          {/* s<TextInput /> */}
                          {err && reportText == '' && (
                            <CustomText style={commonStyle.errorText}>
                              Please enter reason
                            </CustomText>
                          )}
                        </>
                      )}
                    </View>
                    <View
                      style={{
                        paddingHorizontal: 15,
                        flexDirection: 'row',
                        width: '100%',
                        // height: 110,
                        // gap: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 15,
                      }}
                    >
                      <View className="flex-1">
                        <GradientBtn
                          isLoading={loading}
                          onPress={() => {
                            setLoading(true);
                            if (reportType == 1 && reportText == '') {
                              seterr(true);
                              setLoading(false);
                              return;
                            }
                            const data = {
                              is_user_report: reportType == 1,
                              report_message: reportType == 1 ? reportText : '',
                              reported_user_id: userDetails._id,
                            };
                            reportBlockuser(data)
                              .then((res: any) => {
                                // console.log(res);
                                setLoading(false);
                                reportPopup.current.close();
                                props.navigation.goBack();
                                const index = messages.data.findIndex(
                                  (elm: any) =>
                                    elm?.user?._id == userDetails?._id,
                                );
                                const data: any = messages?.data?.[index];
                                socket?.emit?.('blockOtherUser', {
                                  otherUserId: userDetails._id,
                                  conversation_id: data?._id,
                                  user_id: userId,
                                });
                                showSuccessMessage(
                                  `User ${
                                    reportType == 1 ? 'reported ' : 'blocked '
                                  }successfully`,
                                );
                                getMessages();
                              })
                              .catch((err: any) => {
                                console.log(err);
                              });
                          }}
                          title={reportType == 1 ? 'Report ' : 'Block '}
                        />
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            </BottomSheetModal>

            <View style={styles.container}>
              <View style={styles.header}>
                <ImageBackground
                  source={
                    userDetails?.media?.length > 0
                      ? {
                          uri: userDetails.media[0].mediaUrl,
                        }
                      : ''
                  }
                  resizeMode="cover"
                  className="flex-1 flex-row justify-between pt-5 pl-5 pr-5"
                ></ImageBackground>
              </View>
              <ScrollView
                style={styles.bgRelative}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.circle}>
                  <View
                    style={[
                      commonStyle.container,

                      {
                        borderTopLeftRadius: 30,
                        borderTopRightRadius: 30,
                        backgroundColor: Colors.bgLight,
                        elevation: 20,
                      },
                    ]}
                  >
                    <View className="items-center flex-row justify-between mr-[10]  ">
                      <View className=" flex-row  justify-center h-[75] mt-[10]">
                        <Image
                          source={{
                            uri: userDetails?.media?.filter?.(
                              (elm: any) => elm?.mediaType == 'profile',
                            )?.[0]?.mediaUrl,
                          }}
                          className="w-16 h-16 mb-5 rounded-full  "
                        />
                        <View className=" self-start ml-[10]">
                          <CustomText
                            text={
                              userDetails?.first_name +
                              ' ' +
                              userDetails?.last_name +
                              ', ' +
                              calculateAge(userDetails?.dob)
                            }
                            style={[
                              commonStyle.mediumtextBold,
                              {
                                color: Colors.dark,
                                fontSize: 25,
                                fontFamily: Fonts.fontBold,
                              },
                            ]}
                            className="text-left mb-[]"
                          />

                          <CustomText
                            text={userDetails?.work || ''}
                            style={[
                              commonStyle.smalltext,
                              { color: Colors.dark },
                            ]}
                            className="text-left mb-[10]"
                          />
                        </View>
                      </View>
                    </View>

                    {userDetails?.bio?.length > 0 && (
                      <>
                        <CustomText
                          text="About"
                          style={[
                            commonStyle.headingtextBold,
                            {
                              color: Colors.dark,
                            },
                          ]}
                          className="mx-2 mb-[10]"
                        />
                        <View className="flex-row mb-3">
                          <CustomText
                            text={userDetails?.bio && userDetails.bio?.trim?.()}
                            readmore={userDetails?.bio?.length > 180}
                            style={[
                              commonStyle.smalltext,
                              {
                                color: Colors.dark,
                                fontSize: 18,
                                fontFamily: Fonts.fontSemiBold,
                              },
                            ]}
                            className="mx-2 "
                          />
                        </View>
                      </>
                    )}
                    <CustomText
                      text="Hobbies"
                      style={[
                        commonStyle.headingtextBold,
                        {
                          color: Colors.dark,
                        },
                      ]}
                      className="mx-2 mb-[10]"
                    />
                    <View
                      style={[
                        styles.flexRow,
                        styles.flexWrap,
                        styles.spaceX2,
                        styles.spaceY2,
                      ]}
                    >
                      {userDetails?.interest?.length > 0 &&
                        userDetails?.interest?.map(
                          (data: any, index: number) => {
                            // console.log('data======', data)
                            return (
                              <View
                                key={index}
                                className={` px-[10] py-[6]  mx-[4] mb-4 rounded-[30px] border border-grey`}
                              >
                                <CustomText
                                  className={'text-titl'}
                                  style={[
                                    commonStyle.smalltext,
                                    {
                                      fontSize: 15,
                                      fontFamily: Fonts.fontBold,
                                    },
                                  ]}
                                >
                                  {data}
                                </CustomText>
                              </View>
                            );
                          },
                        )}
                    </View>

                    {userDetails?.sports && (
                      <CustomText
                        text="Sports"
                        style={[
                          commonStyle.headingtextBold,
                          {
                            color: Colors.dark,
                          },
                        ]}
                        className="mx-2 mt-1 mb-[10]"
                      />
                    )}
                    <View
                      style={[
                        styles.flexRow,
                        styles.flexWrap,
                        styles.spaceX2,
                        styles.spaceY2,
                      ]}
                    >
                      {userDetails?.sports && (
                        <View
                          className={` px-[10] py-[6]  mx-[4] mb-4  rounded-[30px] border border-grey`}
                        >
                          <CustomText
                            className={'text-titl'}
                            style={[
                              commonStyle.smalltext,
                              { fontSize: 15, fontFamily: Fonts.fontBold },
                            ]}
                          >
                            {userDetails?.sports}
                          </CustomText>
                        </View>
                      )}
                    </View>

                    <View className={!userDetails?.religion ? ' mb-[180]' : ''}>
                      {userDetails?.media?.length > 0 &&
                        userDetails?.media?.map((prop, key) => {
                          return (
                            <>
                              <TouchableOpacity
                                style={{ marginTop: 20 }}
                                key={key}
                                activeOpacity={0.7}
                                className="w-full  p-1 h-max"
                              >
                                <Image
                                  source={{ uri: prop.mediaUrl }}
                                  className="w-full h-[500] items-center self-center  rounded-[12px]"
                                />
                              </TouchableOpacity>

                              {key == 0 &&
                                userDetails?.traitsAttractedTo?.length > 0 && (
                                  <>
                                    <CustomText
                                      text="Traits Attracted To"
                                      style={[
                                        commonStyle.headingtextBold,
                                        {
                                          color: Colors.dark,
                                        },
                                      ]}
                                      className="mx-2 mb-[10] mt-[10]"
                                    />
                                    <View
                                      style={[
                                        styles.flexRow,
                                        styles.flexWrap,
                                        styles.spaceX2,
                                        styles.spaceY2,
                                      ]}
                                    >
                                      {userDetails?.traitsAttractedTo?.map(
                                        item => (
                                          <View
                                            className={` px-[10] py-[6]  mx-[4] mb-4 rounded-[30px] border border-grey`}
                                          >
                                            <CustomText
                                              className={'text-titl'}
                                              style={{
                                                fontFamily: Fonts.fontBold,
                                                fontSize: 15,
                                              }}
                                            >
                                              {item}
                                            </CustomText>
                                          </View>
                                        ),
                                      )}
                                    </View>
                                  </>
                                )}
                              {key == 0 &&
                                userDetails?.religion?.length > 0 && (
                                  <>
                                    <CustomText
                                      text="Religion"
                                      style={[
                                        commonStyle.headingtextBold,
                                        {
                                          color: Colors.dark,
                                        },
                                      ]}
                                      className="mx-2 mb-[10] mt-[10]"
                                    />
                                    <View
                                      style={[
                                        styles.flexRow,
                                        styles.flexWrap,
                                        styles.spaceX2,
                                        styles.spaceY2,
                                      ]}
                                    >
                                      <View
                                        className={` px-[10] py-[6]  mx-[4] mb-4 rounded-[30px] border border-grey`}
                                      >
                                        <CustomText
                                          className={'text-titl'}
                                          style={{
                                            fontFamily: Fonts.fontBold,
                                            fontSize: 15,
                                          }}
                                        >
                                          {userDetails?.religion}
                                        </CustomText>
                                      </View>
                                    </View>
                                  </>
                                )}

                              {key == 1 &&
                                userDetails?.drinkingSmokingFrequency?.length >
                                  0 && (
                                  <>
                                    <CustomText
                                      text="Smoking Frequency"
                                      style={[
                                        commonStyle.headingtextBold,
                                        {
                                          color: Colors.dark,
                                        },
                                      ]}
                                      className="mx-2 mb-[10] mt-[10]"
                                    />
                                    <View
                                      style={[
                                        styles.flexRow,
                                        styles.flexWrap,
                                        styles.spaceX2,
                                        styles.spaceY2,
                                      ]}
                                    >
                                      <View
                                        className={` px-[10] py-[6]  mx-[4] mb-4 rounded-[30px] border border-grey`}
                                      >
                                        <CustomText
                                          className={'text-titl'}
                                          style={{
                                            fontFamily: Fonts.fontBold,
                                            fontSize: 15,
                                          }}
                                        >
                                          {
                                            userDetails?.drinkingSmokingFrequency
                                          }
                                        </CustomText>
                                      </View>
                                    </View>
                                  </>
                                )}

                              {key == 1 && userDetails?.drink && (
                                <>
                                  <CustomText
                                    text="Drinking Frequency"
                                    style={[
                                      commonStyle.headingtextBold,
                                      { color: Colors.dark },
                                    ]}
                                    className="mx-2 mb-[10] mt-[10]"
                                  />
                                  <View
                                    style={[
                                      styles.flexRow,
                                      styles.flexWrap,
                                      styles.spaceX2,
                                      styles.spaceY2,
                                    ]}
                                  >
                                    <View
                                      className={` px-[10] py-[6]  mx-[4] mb-4 rounded-[30px] border border-grey`}
                                    >
                                      <CustomText
                                        className={'text-titl'}
                                        style={{
                                          fontFamily: Fonts.fontBold,
                                          fontSize: 15,
                                        }}
                                      >
                                        {userDetails?.drink}
                                      </CustomText>
                                    </View>
                                  </View>
                                </>
                              )}

                              {key == 2 &&
                                userDetails?.preferredPet?.length > 0 && (
                                  <>
                                    <CustomText
                                      text="Preferred Pet"
                                      style={[
                                        commonStyle.headingtextBold,
                                        { color: Colors.dark },
                                      ]}
                                      className="mx-2 mb-[10] mt-[10]"
                                    />
                                    <View
                                      style={[
                                        styles.flexRow,
                                        styles.flexWrap,
                                        styles.spaceX2,
                                        styles.spaceY2,
                                      ]}
                                    >
                                      <View
                                        className={` px-[10] py-[6]  mx-[4] mb-4 rounded-[30px] border border-grey`}
                                      >
                                        <CustomText
                                          className={'text-titl'}
                                          style={{
                                            fontFamily: Fonts.fontBold,
                                            fontSize: 15,
                                          }}
                                        >
                                          {userDetails?.preferredPet}
                                        </CustomText>
                                      </View>
                                    </View>
                                  </>
                                )}

                              {key == 2 &&
                                userDetails?.relationshipType?.length > 0 && (
                                  <>
                                    <CustomText
                                      text="Relationship Type"
                                      style={[
                                        commonStyle.headingtextBold,
                                        {
                                          color: Colors.dark,
                                        },
                                      ]}
                                      className="mx-2 mb-[10] mt-[10]"
                                    />
                                    <View
                                      style={[
                                        styles.flexRow,
                                        styles.flexWrap,
                                        styles.spaceX2,
                                        styles.spaceY2,
                                      ]}
                                    >
                                      <View
                                        className={` px-[10] py-[6]  mx-[4] mb-4 rounded-[30px] border border-grey`}
                                      >
                                        <CustomText
                                          className={'text-titl'}
                                          style={{
                                            fontFamily: Fonts.fontBold,
                                            fontSize: 15,
                                          }}
                                        >
                                          {userDetails?.relationshipType}
                                        </CustomText>
                                      </View>
                                    </View>
                                  </>
                                )}

                              {key == 3 &&
                                userDetails?.starSign?.length > 0 && (
                                  <>
                                    <CustomText
                                      text="Star Sign"
                                      style={[
                                        commonStyle.headingtextBold,
                                        {
                                          color: Colors.dark,
                                        },
                                      ]}
                                      className="mx-2 mb-[10] mt-[10]"
                                    />
                                    <View
                                      style={[
                                        styles.flexRow,
                                        styles.flexWrap,
                                        styles.spaceX2,
                                        styles.spaceY2,
                                      ]}
                                    >
                                      <View
                                        className={` px-[10] py-[6]  mx-[4] mb-4 rounded-[30px] border border-grey`}
                                      >
                                        <CustomText
                                          className={'text-titl'}
                                          style={{
                                            fontFamily: Fonts.fontBold,
                                            fontSize: 15,
                                          }}
                                        >
                                          {userDetails?.starSign}
                                        </CustomText>
                                      </View>
                                    </View>
                                  </>
                                )}

                              {key == 3 &&
                                userDetails?.enjoyableActivity?.length > 0 && (
                                  <>
                                    <CustomText
                                      text="Enjoyable Activity"
                                      style={[
                                        commonStyle.headingtextBold,
                                        {
                                          color: Colors.dark,
                                        },
                                      ]}
                                      className="mx-2 mb-[10] mt-[10]"
                                    />
                                    <View
                                      style={[
                                        styles.flexRow,
                                        styles.flexWrap,
                                        styles.spaceX2,
                                        styles.spaceY2,
                                      ]}
                                    >
                                      {userDetails?.enjoyableActivity?.map(
                                        item => (
                                          <View
                                            className={` px-[10] py-[6]  mx-[4] mb-4 rounded-[30px] border border-grey`}
                                          >
                                            <CustomText
                                              className={'text-titl'}
                                              style={{
                                                fontFamily: Fonts.fontBold,
                                                fontSize: 15,
                                              }}
                                            >
                                              {item}
                                            </CustomText>
                                          </View>
                                        ),
                                      )}
                                    </View>
                                  </>
                                )}

                              {key == 4 &&
                                userDetails?.relationshipType?.length > 0 && (
                                  <>
                                    <CustomText
                                      text="Partner Qualities"
                                      style={[
                                        commonStyle.headingtextBold,
                                        {
                                          color: Colors.dark,
                                        },
                                      ]}
                                      className="mx-2 mb-[10] mt-[10]"
                                    />
                                    <View
                                      style={[
                                        styles.flexRow,
                                        styles.flexWrap,
                                        styles.spaceX2,
                                        styles.spaceY2,
                                      ]}
                                    >
                                      {userDetails?.partnerQualities?.map(
                                        item => (
                                          <View
                                            className={` px-[10] py-[6]  mx-[4] mb-4 rounded-[30px] border border-grey`}
                                          >
                                            <CustomText
                                              className={'text-titl'}
                                              style={{
                                                fontFamily: Fonts.fontBold,
                                                fontSize: 15,
                                              }}
                                            >
                                              {item}
                                            </CustomText>
                                          </View>
                                        ),
                                      )}
                                    </View>
                                  </>
                                )}

                              {key == 4 && userDetails?.eyeColor && (
                                <>
                                  <CustomText
                                    text="Eye Color"
                                    style={[
                                      commonStyle.headingtextBold,
                                      { color: Colors.dark },
                                    ]}
                                    className="mx-2 mb-[10] mt-[10]"
                                  />
                                  <View
                                    style={[
                                      styles.flexRow,
                                      styles.flexWrap,
                                      styles.spaceX2,
                                      styles.spaceY2,
                                    ]}
                                  >
                                    <View
                                      className={` px-[10] py-[6]  mx-[4] mb-4 rounded-[30px] border border-grey`}
                                    >
                                      <CustomText
                                        className={'text-titl'}
                                        style={{
                                          fontFamily: Fonts.fontBold,
                                          fontSize: 15,
                                        }}
                                      >
                                        {userDetails?.eyeColor}
                                      </CustomText>
                                    </View>
                                  </View>
                                </>
                              )}

                              {key == 5 && userDetails?.height?.length > 0 && (
                                <>
                                  <CustomText
                                    text="Height"
                                    style={[
                                      commonStyle.headingtextBold,
                                      { color: Colors.dark },
                                    ]}
                                    className="mx-2 mb-[10] mt-[10]"
                                  />
                                  <View
                                    style={[
                                      styles.flexRow,
                                      styles.flexWrap,
                                      styles.spaceX2,
                                      styles.spaceY2,
                                    ]}
                                  >
                                    <View
                                      className={` px-[10] py-[6]  mx-[4] mb-4 rounded-[30px] border border-grey`}
                                    >
                                      <CustomText
                                        className={'text-titl'}
                                        style={{
                                          fontFamily: Fonts.fontBold,
                                          fontSize: 15,
                                        }}
                                      >
                                        {userDetails?.height} CM
                                      </CustomText>
                                    </View>
                                  </View>
                                </>
                              )}
                              {key == 5 && userDetails?.weight?.value && (
                                <>
                                  <CustomText
                                    text="Weight"
                                    style={[
                                      commonStyle.headingtextBold,
                                      { color: Colors.dark },
                                    ]}
                                    className="mx-2 mb-[10] mt-[10]"
                                  />
                                  <View
                                    style={[
                                      styles.flexRow,
                                      styles.flexWrap,
                                      styles.spaceX2,
                                      styles.spaceY2,
                                      userDetails?.media?.length === 6
                                        ? styles.marginBottom190
                                        : null,
                                    ]}
                                  >
                                    <View
                                      className={` px-[10] py-[6]  mx-[4] mb-4 rounded-[30px] border border-grey`}
                                    >
                                      <CustomText
                                        className={'text-titl'}
                                        style={[
                                          commonStyle.smalltext,
                                          {
                                            fontSize: 15,
                                            fontFamily: Fonts.fontBold,
                                          },
                                        ]}
                                      >
                                        {userDetails?.weight?.value +
                                          ' ' +
                                          userDetails?.weight?.unit}
                                      </CustomText>
                                    </View>
                                  </View>
                                </>
                              )}
                            </>
                          );
                        })}
                    </View>
                    {userDetails?.religion?.length > 0 &&
                      userDetails?.media?.length < 0 && (
                        <>
                          <CustomText
                            text="Religion"
                            style={[
                              commonStyle.headingtextBold,
                              { color: Colors.dark },
                            ]}
                            className="mx-2 mb-[10] mt-[10]"
                          />
                          <View
                            style={[
                              styles.flexRow,
                              styles.flexWrap,
                              styles.spaceX2,
                              styles.spaceY2,
                            ]}
                          >
                            <View
                              className={` px-[10] py-[6]  mx-[4] mb-4 rounded-[30px] border border-grey`}
                            >
                              <CustomText
                                className={'text-titl'}
                                style={{
                                  fontFamily: Fonts.fontBold,
                                  fontSize: 15,
                                }}
                              >
                                {userDetails?.religion}
                              </CustomText>
                            </View>
                          </View>
                        </>
                      )}
                    {userDetails?.starSign?.length > 0 &&
                      userDetails?.media?.length < 3 && (
                        <>
                          <CustomText
                            text="Star Sign"
                            style={[
                              commonStyle.headingtextBold,
                              { color: Colors.dark },
                            ]}
                            className="mx-2 mb-[10] mt-[10]"
                          />
                          <View
                            style={[
                              styles.flexRow,
                              styles.flexWrap,
                              styles.spaceX2,
                              styles.spaceY2,
                            ]}
                          >
                            <View
                              className={` px-[10] py-[6]  mx-[4] mb-4 rounded-[30px] border border-grey`}
                            >
                              <CustomText
                                className={'text-titl'}
                                style={{
                                  fontFamily: Fonts.fontBold,
                                  fontSize: 15,
                                }}
                              >
                                {userDetails?.starSign}
                              </CustomText>
                            </View>
                          </View>
                        </>
                      )}

                    {userDetails?.drinkingSmokingFrequency?.length > 0 &&
                      userDetails?.media?.length < 2 && (
                        <>
                          <CustomText
                            text="Smoking Frequency"
                            style={[
                              commonStyle.headingtextBold,
                              { color: Colors.dark },
                            ]}
                            className="mx-2 mb-[10] mt-[10]"
                          />
                          <View
                            style={[
                              styles.flexRow,
                              styles.flexWrap,
                              styles.spaceX2,
                              styles.spaceY2,
                            ]}
                          >
                            <View
                              className={` px-[10] py-[6]  mx-[4] mb-4 rounded-[30px] border border-grey`}
                            >
                              <CustomText
                                className={'text-titl'}
                                style={{
                                  fontFamily: Fonts.fontBold,
                                  fontSize: 15,
                                }}
                              >
                                {userDetails?.drinkingSmokingFrequency}
                              </CustomText>
                            </View>
                          </View>
                        </>
                      )}

                    {userDetails?.drink && userDetails?.media?.length < 2 && (
                      <>
                        <CustomText
                          text="Drinking Frequency"
                          style={[
                            commonStyle.headingtextBold,
                            { color: Colors.dark },
                          ]}
                          className="mx-2 mb-[10] mt-[10]"
                        />
                        <View
                          style={[
                            styles.flexRow,
                            styles.flexWrap,
                            styles.spaceX2,
                            styles.spaceY2,
                          ]}
                        >
                          <View
                            className={` px-[10] py-[6]  mx-[4] mb-4 rounded-[30px] border border-grey`}
                          >
                            <CustomText
                              className={'text-titl'}
                              style={{
                                fontFamily: Fonts.fontBold,
                                fontSize: 15,
                              }}
                            >
                              {userDetails?.drink}
                            </CustomText>
                          </View>
                        </View>
                      </>
                    )}

                    {userDetails?.preferredPet?.length > 0 &&
                      userDetails?.media?.length < 2 && (
                        <>
                          <CustomText
                            text="Preferred Pet"
                            style={[
                              commonStyle.headingtextBold,
                              { color: Colors.dark },
                            ]}
                            className="mx-2 mb-[10] mt-[10]"
                          />
                          <View
                            style={[
                              styles.flexRow,
                              styles.flexWrap,
                              styles.spaceX2,
                              styles.spaceY2,
                            ]}
                          >
                            <View
                              className={` px-[10] py-[6]  mx-[4] mb-4 rounded-[30px] border border-grey`}
                            >
                              <CustomText
                                className={'text-titl'}
                                style={{
                                  fontFamily: Fonts.fontBold,
                                  fontSize: 15,
                                }}
                              >
                                {userDetails?.preferredPet}
                              </CustomText>
                            </View>
                          </View>
                        </>
                      )}

                    {userDetails?.relationshipType?.length > 0 &&
                      userDetails?.media?.length < 2 && (
                        <>
                          <CustomText
                            text="Relationship Type"
                            style={[
                              commonStyle.headingtextBold,
                              { color: Colors.dark },
                            ]}
                            className="mx-2 mb-[10] mt-[10]"
                          />
                          <View
                            style={[
                              styles.flexRow,
                              styles.flexWrap,
                              styles.spaceX2,
                              styles.spaceY2,
                            ]}
                          >
                            <View
                              className={` px-[10] py-[6]  mx-[4] mb-4 rounded-[30px] border border-grey`}
                            >
                              <CustomText
                                className={'text-titl'}
                                style={{
                                  fontFamily: Fonts.fontBold,
                                  fontSize: 15,
                                }}
                              >
                                {userDetails?.relationshipType}
                              </CustomText>
                            </View>
                          </View>
                        </>
                      )}

                    {userDetails?.media?.length < 4 &&
                      userDetails?.enjoyableActivity?.length > 0 && (
                        <>
                          <CustomText
                            text="Enjoyable Activity"
                            style={[
                              commonStyle.headingtextBold,
                              {
                                color: Colors.dark,
                              },
                            ]}
                            className="mx-2 mb-[10] mt-[10]"
                          />
                          <View
                            style={[
                              styles.flexRow,
                              styles.flexWrap,
                              styles.spaceX2,
                              styles.spaceY2,
                            ]}
                          >
                            {userDetails?.enjoyableActivity?.map(item => (
                              <View
                                className={` px-[10] py-[6]  mx-[4] mb-4 rounded-[30px] border border-grey`}
                              >
                                <CustomText
                                  className={'text-titl'}
                                  style={{
                                    fontFamily: Fonts.fontBold,
                                    fontSize: 15,
                                  }}
                                >
                                  {item}
                                </CustomText>
                              </View>
                            ))}
                          </View>
                        </>
                      )}
                    {userDetails?.partnerQualities?.length > 0 &&
                      userDetails?.media?.length < 6 && (
                        <>
                          <CustomText
                            text="Partner Qualities"
                            style={[
                              commonStyle.headingtextBold,
                              { color: Colors.dark },
                            ]}
                            className="mx-2 mb-[10] mt-[10]"
                          />
                          <View
                            style={[
                              styles.flexRow,
                              styles.flexWrap,
                              styles.spaceX2,
                              styles.spaceY2,
                            ]}
                          >
                            {userDetails?.partnerQualities?.map(item => (
                              <View
                                className={` px-[10] py-[6]  mx-[4] mb-4 rounded-[30px] border border-grey`}
                              >
                                <CustomText
                                  className={'text-titl'}
                                  style={{
                                    fontFamily: Fonts.fontBold,
                                    fontSize: 15,
                                  }}
                                >
                                  {item}
                                </CustomText>
                              </View>
                            ))}
                          </View>
                        </>
                      )}

                    {userDetails?.eyeColor &&
                      userDetails?.media?.length < 4 && (
                        <>
                          <CustomText
                            text="Eye Color"
                            style={[
                              commonStyle.headingtextBold,
                              { color: Colors.dark },
                            ]}
                            className="mx-2 mb-[10] mt-[10]"
                          />
                          <View
                            style={[
                              styles.flexRow,
                              styles.flexWrap,
                              styles.spaceX2,
                              styles.spaceY2,
                            ]}
                          >
                            <View
                              className={` px-[10] py-[6]  mx-[4] mb-4 rounded-[30px] border border-grey`}
                            >
                              <CustomText
                                className={'text-titl'}
                                style={{
                                  fontFamily: Fonts.fontBold,
                                  fontSize: 15,
                                }}
                              >
                                {userDetails?.eyeColor}
                              </CustomText>
                            </View>
                          </View>
                        </>
                      )}

                    {userDetails?.height?.length > 0 &&
                      userDetails?.media?.length < 5 && (
                        <>
                          <CustomText
                            text="Height"
                            style={[
                              commonStyle.headingtextBold,
                              { color: Colors.dark },
                            ]}
                            className="mx-2 mb-[10] mt-[10]"
                          />
                          <View
                            style={[
                              styles.flexRow,
                              styles.flexWrap,
                              styles.spaceX2,
                              styles.spaceY2,
                            ]}
                          >
                            <View
                              className={` px-[10] py-[6]  mx-[4] mb-4 rounded-[30px] border border-grey`}
                            >
                              <CustomText
                                className={'text-titl'}
                                style={{
                                  fontFamily: Fonts.fontBold,
                                  fontSize: 15,
                                }}
                              >
                                {userDetails?.height} CM
                              </CustomText>
                            </View>
                          </View>
                        </>
                      )}
                    {userDetails?.weight?.value &&
                      userDetails?.media?.length < 5 && (
                        <>
                          <CustomText
                            text="Weight"
                            style={[
                              commonStyle.headingtextBold,
                              { color: Colors.dark },
                            ]}
                            className="mx-2 mb-[10] mt-[10]"
                          />
                          <View
                            style={[
                              styles.flexRow,
                              styles.flexWrap,
                              styles.spaceX2,
                              styles.spaceY2,
                              userDetails?.media?.length < 6
                                ? styles.marginBottom190
                                : null,
                            ]}
                          >
                            <View
                              className={` px-[10] py-[6]  mx-[4] mb-4 rounded-[30px] border border-grey`}
                            >
                              <CustomText
                                className={'text-titl'}
                                style={[
                                  commonStyle.smalltext,
                                  { fontSize: 15, fontFamily: Fonts.fontBold },
                                ]}
                              >
                                {userDetails?.weight?.value +
                                  ' ' +
                                  userDetails?.weight?.unit}
                              </CustomText>
                            </View>
                          </View>
                        </>
                      )}

                    <View className=" "></View>
                  </View>
                </View>
              </ScrollView>
              <View
                style={{
                  width: '100% ',
                  position: 'absolute',
                  top: 40,
                  left: 15,
                  right: 15,
                  alignItems: 'center',
                }}
                className="flex-row justify-between w-full "
              >
                <BackButton navigation={props.navigation} />

                <View style={styles.containerDropdown}>
                  <TouchableOpacity
                    onPress={handlePress}
                    style={commonStyle.shadowButton}
                    className="w-[50] h-[50] rounded-full bg-grey items-center justify-center"
                  >
                    <ImageBackground
                      source={require('../../assets/png/blackMore.png')}
                      resizeMode="cover"
                      style={{
                        width: 20,
                        height: 20,
                      }}
                    ></ImageBackground>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View className="px-[20] mb-[10] absolute bottom-0 w-full flex-row">
              <View className="flex-1">
                <GradientBtn
                  onPress={() => {
                    handelNavigate();
                  }}
                  title={'Chat with me'}
                  icon={'chat'}
                />
              </View>
            </View>
          </View>
        </BottomSheetModalProvider>
      )}
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setIsOpen(false)}
        >
          <Animatable.View
            ref={dropdownRef}
            animation="bounceIn"
            duration={600}
            style={[styles.dropdownContent]}
          >
            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                reportPopup.current.present();
                setLoading(false);
                setIsOpen(false);
                setreportType(1);
              }}
            >
              <View style={{ flexDirection: 'row' }}>
                <AntDesign name="warning" size={19} />
                <CustomText
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 6,
                    fontFamily: Fonts.fontSemiBold,
                  }}
                >
                  Report
                </CustomText>
              </View>
            </TouchableOpacity>
            <View style={styles.separator}></View>
            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                reportPopup?.current?.present?.();
                setLoading(false);
                setIsOpen(false);
                setreportType(2);
              }}
            >
              <View style={{ flexDirection: 'row' }}>
                <MaterialIcon
                  style={{ opacity: 1, zIndex: 10 }}
                  name={'block'}
                  size={20}
                />
                <CustomText
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 6,
                    fontFamily: Fonts.fontSemiBold,
                  }}
                >
                  Block
                </CustomText>
              </View>
            </TouchableOpacity>
          </Animatable.View>
        </TouchableOpacity>
      </Modal>
      <PopupModal
        navigation={props.navigation}
        isVisible={visible}
        imgKey="Chat"
        title={'Messaging is not available!'}
        subTitle={'Explore plans to get access to chats'}
        onClose={() => setVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    //   borderWidth:2
  },
  header: {
    position: 'absolute',
    width: '100%',
    height: 540,
    //   position: 'relative',
    // flexDirection:'row',
    top: 0,
    left: 0,
    backgroundColor: 'indigo',
  },
  bgRelative: {
    position: 'relative',
  },
  circle: {
    // borderWidth:1,
    width: '100%',
    paddingTop: 500,
    borderRadius: 20,
    //   elevation: 10,

    top: -20,
    // borderWidth:2,
    // flex: 1,
    marginBottom: -30,
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
    top: Platform.OS == 'ios' ? 120 : 75, // Adjust this value based on your layout
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
  marginBottom190: {
    marginBottom: 190,
  },
  height410: {
    height: 410,
  },
  height500: {
    height: 790,
  },
});

export default ProfilePage;
