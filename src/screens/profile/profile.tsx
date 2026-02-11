import React, {
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
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from '../../constant/colors';
import { commonStyle } from '../../constant/commonStyle';
import CustomText from '../../components/customText';
import Fonts from '../../constant/fonts';
import { io } from 'socket.io-client';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { ScreenHeight, ScreenWidth } from '@rneui/base';
import Modal from 'react-native-modal';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import {
  ParamListBase,
  RouteProp,
  useFocusEffect,
  useIsFocused,
} from '@react-navigation/native';
import {
  deleteFiles,
  getMyProfile,
  uploadFile,
  uploadStory,
} from '../../services/api';
import { calculateAge } from '../../constant/veriables';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { Dimensions } from 'react-native';
import { openCamera, openPicker } from 'react-native-image-crop-picker';
import { showErrorMessage, showSuccessMessage } from '../../services/alerts';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
const { height, width } = Dimensions.get('window');
import { Snackbar } from 'react-native-paper';
import * as Progress from 'react-native-progress';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { checkCamerapermissions } from '../../services/permissions';
import CameraComponent from '../../components/CameraComponent';

import { useIAP } from 'react-native-iap';

import FloatingBtn from '../../components/floatingBtn';
import { UserProfileData } from '../../contexts/userDetailscontexts';
import GradientBtn from '../../components/gradientBtn';
import RBSheet from 'react-native-raw-bottom-sheet';
// import { Footer } from '../../customeLib/story';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

import { Circle } from 'react-native-svg';

import SimpleBtn from '../../components/simpleBtn';
import LinearGradient from 'react-native-linear-gradient';
import SubCard from '../../components/SubCard';

const ProfilePage = (props: {
  route: RouteProp<ParamListBase, string>;
  navigation: any;
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const deleteBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const tags11 = [
    { isSelected: false, name: 'Smooker' },
    { isSelected: true, name: 'Book Reading' },
    { isSelected: true, name: 'Swiming' },
    { isSelected: false, name: 'Music' },
    { isSelected: false, name: 'Gaming' },
    { isSelected: true, name: 'Cycling' },
    { isSelected: false, name: 'Athletics' },
    { isSelected: false, name: 'Badminton' },
  ];
  const [tags, settags] = useState<any>(tags11);
  const [usersLocations, setUsersLocations] = useState<Array<number>>();
  const [uploadtype, setUploadType] = useState<number | null>(null);
  // const [userDetails,setUserDetails] =useState<any>({})
  const { userDetails, setUserDetails, getProfile } =
    useContext(UserProfileData);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedindex, setSelectedindex] = useState(0);
  const snapPoints = useMemo(() => [`${(210 / height) * 100}%`], []);
  const [image, setImage] = useState<any>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const [visibleStory, setVisibleStory] = useState<boolean>(false);
  const [uploaded, setUploded] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const [profileImage, setprofileImage] = useState<any>(null);
  const [story, setStory] = useState<any>([]);
  const multiStoryRef = useRef();
  const [comments, setComments] = useState<any>([]);
  const [deleteFile, setDeleteFile] = useState<any>(null);
  const [delLoading, setDelLoading] = useState(false);
  const [completeProfile, setCompleteProfile] = useState(0);
  const isFocused = useIsFocused();
  const {
    connected,
    getAvailablePurchases,
    finishTransaction,
    currentPurchase,
  } = useIAP();
  const [restorePurchasesisLoading, setrestorePurchasesisLoading] =
    useState<any>(false);
  // const [showCamera,setShowCamera] = useState<boolean>(false)
  // console.log('userDetailsuserDetailsuserDetailsuserDetailss',userDetails)
  useFocusEffect(
    useCallback(() => {
      getMyProfile().then(res => {
        // console.log('chatttttttttttt',res)
        setTimeout(() => {
          setLoading(false);
        }, 1000);
        const [profileImage] = res.data.user_images.filter(
          (elm: any) => elm?.mediaType == 'profile',
        );
        const story = res?.data?.stories?.map((elm: any) => ({
          ...elm,
          id: elm._id,
          isSeen: false,
          resolved: false,
        }));
        setprofileImage(profileImage);
        // console.log("@@@@@@@@@@@@@@@@@@@@@@",res.data.user.drink,res.data.user.eyeColor)
        setCompleteProfile(res.data.user.completionPercentage);
        setStory([...story]);
        setUserDetails({
          ...res.data.user,
          user_images: res.data.user_images,
          profileImage,
          story,
          subscription: res?.data?.subscription,
        });
        return res;
      });
    }, []),
  );

  useEffect(() => {
    if (!isFocused) {
      setCompleteProfile(0);
    } else {
      // setCompleteProfile(userDetails.completionPercentage)
    }
  }, [isFocused, userDetails]);

  const userStories = useMemo(() => {
    return {
      id: userDetails._id, //unique id (required)
      username: userDetails.first_name + ' ' + userDetails.last_name, //user name on header
      title: 'Story', //title below username
      profile: profileImage?.mediaUrl && profileImage?.mediaUrl,
    };
  }, [userDetails._id, profileImage, story?.length]);

  const setValueSet = async (name: string) => {
    // console.log('name ==== >>>>', name)
    let newTag = tags.map((item: any, index: number) => {
      if (name == item.name) {
        item.isSelected = !item.isSelected;
      }
      return item;
    });
    settags(newTag);
  };
  // console.log('wjhjhdbwdcjbw',story)
  const [isTempNav, setIsTempNav] = useState<any>('false');

  useEffect(() => {
    // Define an async function to handle the async operation
    const fetchData = async () => {
      try {
        setIsTempNav(await AsyncStorage.getItem('isTempNav'));
      } catch (error) {
        console.error('Error retrieving data from AsyncStorage:', error);
      }
    };

    // Call the async function
    fetchData();
  }, []); // The empty dependency array ensures this effect runs only once

  useEffect(() => {
    // AsyncStorage.clear()
    //   console.log('userDetails',userDetails)
  }, [userDetails]);

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

  const uploadImages = (image: any) => {
    // setLoading(true)
    if (image == null) {
      return showErrorMessage('Please select image');
      // console.log(image.path)
    }
    if (uploadtype == 1) {
      setVisible(true);
      let formData = new FormData();
      formData.append('galleryImages', {
        uri: image.path,
        type: image.mime,
        name: `profilephoto.jpeg`,
      });
      uploadFile(formData)
        .then((res: any) => {
          console.log(res);
          if (res?.data?.status) {
            setTimeout(() => {
              setUploded(true);
              getMyProfile().then(res => {
                setUserDetails({
                  ...res.data.user,
                  user_images: res.data.user_images,
                });
              });
            }, 1500);

            // showSuccessMessage(res?.data?.message)
            // setVisible(false)
            return;
          }

          showErrorMessage(res?.data?.message || 'Something went wrong');
          setLoading(false);
          setVisible(false);
        })
        .catch(err => {
          setLoading(false);
          console.log(err);
        });
    } else {
      props.navigation.navigate('CameraComponent', {
        image,
        loading: true,
      });
    }
  };

  const openCamerafunc = () => {
    bottomSheetModalRef.current?.close();
    if (uploadtype == 2) {
      // return setShowCamera(true)
      return props.navigation.navigate('CameraComponent');
    }
    bottomSheetModalRef.current?.close();
    const option = {
      cropping: true,
      // compressImageQuality:1,
      freeStyleCropEnabled: true,
      width: 1000,
      height: 1000,
      // mediaType: "video",
    };
    // checkCamerapermissions()
    openCamera(option)
      .then(res => {
        if (uploadtype == 1) {
          uploadImages(res);
        }
      })
      .catch(err => {
        console.log('kelfn jw wk', err);
        showErrorMessage('No image selected');
      });
  };

  const openGallery = () => {
    bottomSheetModalRef.current?.close();
    // const option =
    openPicker({
      cropping: true,
      // mediaType: "any",
      height: 1000,
      width: 1000,
      // compressImageQuality:1
    }).then(res => {
      uploadImages(res);
    });
    //     .catch(err => {
    //         showErrorMessage('No image selected')
    // })
  };
  // console.log(progress,uploaded)

  useEffect(() => {
    const increaseProgress = () => {
      if (uploaded) {
        // Set progress to 100% when the Snackbar is visible
        setProgress(1);
      } else {
        // Gradually increase progress while Snackbar is not visible, up to 90%
        if (progress < 0.9) {
          setProgress(progress + 0.01); // You can adjust the increment value
        }
      }
    };

    if (visible) {
      setTimeout(increaseProgress, 100); // Adjust the interval as needed
    }
    if (uploaded) {
      setTimeout(() => {
        setVisible(false);
        setUploded(false);
        setProgress(0);
      }, 1000);
    }

    // return () => clearInterval(interval); // Cleanup on component unmount
  }, [visible, progress, uploaded]);

  const handlePresentModalPress = useCallback((type: number) => {
    bottomSheetModalRef.current?.present();
    setUploadType(type);
  }, []);

  useEffect(() => {
    if (connected) {
      console.log('IAP connection established');
    } else {
      console.log('IAP connection not established');
    }

    if (currentPurchase) {
      finishTransaction(currentPurchase);
    }
  }, [connected, currentPurchase, finishTransaction]);

  const restorePurchases = async () => {
    setrestorePurchasesisLoading(true);
    try {
      console.log('Attempting to restore purchases...');
      const purchases = await getAvailablePurchases();
      console.log('Purchases:', purchases);
      setrestorePurchasesisLoading(false);
      if (purchases && purchases.length > 0) {
        Alert.alert('Success', 'Purchases restored successfully!');
      } else {
        Alert.alert('Message', 'No purchases available to restore.');
      }
    } catch (error) {
      setrestorePurchasesisLoading(false);
      console.warn('Error restoring purchases', error);
      //Alert.alert('Error', 'Failed to restore purchases.');
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.cardBg,
      }}
    >
      <BottomSheetModalProvider>
        <View style={{ flex: 1, marginHorizontal: -4 }}>
          {loading ? (
            <>
              <View style={commonStyle.center}>
                <View className="justify-center items-center ">
                  <Image
                    className="w-[250] h-[250]"
                    source={require('../../assets/gif/like.gif')}
                  />
                </View>
              </View>
            </>
          ) : (
            <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
              <View style={commonStyle.container}>
                <View>
                  <View className="flex-row justify-between items px-1 ">
                    <View
                      className="flex-row justify-start items-start -mb-5"
                      style={{ width: 200 }}
                    >
                    

                      <Text
                        style={{
                          fontFamily: Fonts.fontBold,
                          fontSize: 25,
                          marginTop: 10,
                          color: Colors.dark,
                        }}
                      >
                        My Profile
                      </Text>
                    </View>

                    <View className="flex-row gap-[10]">
                      <TouchableOpacity
                        onPress={() => {
                          props.navigation.navigate('PreferenceSettings');
                        }}
                        className="rounded-full w-[10] h-[10] items-center justify-center "
                        style={commonStyle.backshadowButton}
                      >
                        <Feather
                          name="settings"
                          size={20}
                          className="items-center self-center justify-center mb-5 rounded-full "
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          props.navigation.navigate('EditProfile');
                        }}
                        className="rounded-full w-[10] h-[10] items-center justify-center "
                        style={commonStyle.backshadowButton}
                      >
                        <Feather
                          name="edit-2"
                          size={20}
                          className=" items-center self-center justify-center mb-5 rounded-full "
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View
                    className="items-center mt-[20] mb-4  "
                    style={{ flexDirection: 'row' }}
                  >
                    <View className="rounded-full mt-[-12] p-[0]  justify-center items-center ">
                      <AnimatedCircularProgress
                        size={80}
                        width={3}
                        fill={completeProfile}
                        tintColor={Colors.primary}
                        onAnimationComplete={() =>
                          console.log('onAnimationComplete')
                        }
                        backgroundColor={Colors.darkBorder}
                        rotation={180}
                        duration={1500}
                        lineCap="round"
                      >
                        {fill => (
                          <TouchableOpacity
                            onPress={() =>
                              props.navigation.navigate('CompleteProfile')
                            }
                            style={{
                              width: 70,
                              height: 70,
                              // borderWidth:1
                            }}
                          >
                            <Image
                              source={{
                                uri: profileImage?.mediaUrl,
                              }}
                              className="w-[70] h-[70]  rounded-full"
                            />
                          </TouchableOpacity>
                        )}
                      </AnimatedCircularProgress>
                      <View className="absolute  justify-end items-end h-full ">
                        <View
                          className={
                            width < 414 && Platform.OS == 'ios'
                              ? 'mb-[2]'
                              : 'mb-[-2]'
                          }
                        >
                          <GradientBtn
                            onPress={() =>
                              props.navigation.navigate('CompleteProfile')
                            }
                            containerStyle={{
                              height: 24,
                              width: 50,
                              paddingHorizontal: 0,
                            }}
                            title={`${Math.floor(completeProfile)}%`}
                            textStyle={{
                              fontSize: 14,
                            }}
                          ></GradientBtn>
                        </View>
                      </View>
                    </View>
                    <View>
                      <CustomText
                        text={`${userDetails?.first_name} ${
                          userDetails?.last_name
                        }, ${calculateAge(userDetails?.dob)}`}
                        style={[
                          commonStyle.mediumtextBold,
                          {
                            color: Colors.dark,
                            fontSize: 22,
                            textAlign: 'left',
                          },
                        ]}
                        className="text-center ml-[7]"
                      />
                      <View className=" flex-row  ">
                        <CustomText
                          text={userDetails?.work}
                          style={[
                            commonStyle.regulartext,
                            {
                              color: Colors.dark,
                              fontSize: 15,
                              fontFamily: Fonts.fontBold,
                            },
                          ]}
                          className="ml-[10] "
                        />
                      </View>
                      <View className=" flex-row  ">
                        {(userDetails?.plan_details?.SubscriptionIsActive ||
                          userDetails?.addon_details?.length > 0) && (
                          <LinearGradient
                            colors={[
                              Colors.yellowGradient1,
                              Colors.yellowGradient2,
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.subBtn}
                          >
                            <Image
                              className="w-[25] h-[25] mt-[-2]"
                              style={{ resizeMode: 'contain' }}
                              source={require('../../assets/png/start.png')}
                            />
                            <CustomText
                              style={{
                                ...commonStyle.regulartext,
                                color: Colors.dark,
                                fontSize: 15,
                                fontFamily: Fonts.fontBold,
                              }}
                              text="Subscribed User"
                            />
                          </LinearGradient>
                        )}
                      </View>
                    </View>
                  </View>
                  <View>
                    {(userDetails?.plan_details?.SubscriptionIsActive ||
                      userDetails?.addon_details?.length > 0) && (
                      <SubCard navigation={props.navigation} />
                    )}
                  </View>
                  {userDetails?.bio?.length > 0 && (
                    <>
                      <CustomText
                        text="About"
                        style={[
                          commonStyle.smalltext,
                          {
                            color: Colors.dark,
                            fontSize: 22,
                            fontFamily: Fonts.fontBold,
                          },
                        ]}
                        className="mx-2 mt-[10] mb-[10]"
                      />
                      <View className="flex-row mb-1">
                        <CustomText
                          text={userDetails?.bio}
                          readmore={userDetails?.bio?.length > 180}
                          style={[
                            commonStyle.smalltext,
                            {
                              color: Colors.dark,
                              fontSize: 18,
                              fontFamily: Fonts.fontSemiBold,
                            },
                          ]}
                          className="mx-2"
                        />
                      </View>
                    </>
                  )}
                  <CustomText
                    text="Hobbies"
                    style={[
                      commonStyle.smalltext,
                      {
                        color: Colors.dark,
                        fontSize: 22,
                        fontFamily: Fonts.fontBold,
                      },
                    ]}
                    className="mx-2 mt-[10] mb-[10]"
                  />
                  <View
                    style={[
                      styles.flexRow,
                      styles.flexWrap,
                      styles.spaceX2,
                      styles.spaceY2,
                    ]}
                  >
                    {userDetails?.interest?.map(
                      (data: string, index: number) => {
                        // console.log('data======', data)
                        return (
                          <View
                            key={index}
                            className={` px-[15] py-[6] mx-[4] my-[4]  rounded-[30px] `}
                            style={{
                              borderColor: Colors.grey,
                              borderWidth: 1,
                            }}
                          >
                            <CustomText
                              className={'text-title'}
                              style={{
                                fontFamily: Fonts.fontBold,
                                fontSize: 15,
                              }}
                            >
                              {data}
                            </CustomText>
                          </View>
                        );
                      },
                    )}
                  </View>
                  <CustomText
                    text="Preferences"
                    style={[
                      commonStyle.smalltext,
                      {
                        color: Colors.dark,
                        fontSize: 22,
                        fontFamily: Fonts.fontBold,
                      },
                    ]}
                    className="mx-2 mt-[10] mb-[10]"
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
                      className={` px-[15] py-[6] mx-[4] my-[4]  rounded-[30px] `}
                      style={{
                        borderColor: Colors.grey,
                        borderWidth: 1,
                      }}
                    >
                      <CustomText
                        className={'text-title'}
                        style={{
                          fontFamily: Fonts.fontBold,
                          fontSize: 15,
                        }}
                      >
                        {userDetails.interested_in == 0
                          ? 'Female'
                          : userDetails?.interested_in == 1
                          ? 'Male'
                          : 'Non-binary'}
                      </CustomText>
                    </View>
                  </View>
                  <CustomText
                    text="Gallery"
                    style={[
                      commonStyle.smalltext,
                      {
                        color: Colors.dark,
                        fontSize: 22,
                        fontFamily: Fonts.fontBold,
                      },
                    ]}
                    className="mx-2 mt-[10] mb-[10]"
                  />
                  <View className="flex-row flex-wrap">
                    {userDetails?.user_images?.length > 0 &&
                      userDetails?.user_images?.map((prop: any, key: any) => {
                        return (
                          <TouchableOpacity
                            onLongPress={() => {
                              if (prop.mediaType == 'profile') {
                                return showErrorMessage(
                                  'Default profile photo cannot be deleted',
                                );
                              }
                              deleteBottomSheetModalRef?.current?.open();
                              setDeleteFile(prop);
                            }}
                            activeOpacity={0.7}
                            delayLongPress={800}
                            onPress={() => {
                              setModalVisible(true);
                              setSelectedindex(key);
                            }}
                            key={key}
                            className="p-1"
                          >
                            <Image
                              style={{
                                width:
                                  key == 0 || key == 1
                                    ? (Dimensions.get('window').width - 40) / 2
                                    : (Dimensions.get('window').width - 50) / 3,
                                height: key == 0 || key == 1 ? 200 : 111,
                              }}
                              // width={(key == 0 || key == 1) ? 160 : 104} height={key == 0 || key == 1 ? 200 : 111}
                              source={{
                                uri: prop.mediaUrl,
                              }}
                              className=" items-center self-center rounded-[12px]"
                            />
                          </TouchableOpacity>
                        );
                      })}
                    <View
                      className={
                        userDetails?.user_images?.length != 1
                          ? 'w-1/3'
                          : 'w-1/2'
                      }
                    >
                      {userDetails?.user_images?.length < 8 && (
                        <TouchableOpacity
                          onPress={() => {
                            handlePresentModalPress(1);
                          }}
                          activeOpacity={0.9}
                          style={[
                            styles.imageBox,
                            {
                              borderColor: Colors.lightText,
                              height:
                                userDetails?.user_images?.length == 1
                                  ? 200
                                  : 111,
                              width:
                                userDetails?.user_images?.length == 1
                                  ? (Dimensions.get('window').width - 40) / 2
                                  : (Dimensions.get('window').width - 50) / 3,
                            },
                          ]}
                          className="w-full items-center self-center  rounded-[12px] "
                        >
                          {false ? (
                            <>
                              <Image
                                source={{
                                  uri: images[1].uri,
                                }}
                                style={{
                                  width: 90,
                                  height: 60,
                                  borderRadius: 12,
                                }}
                              />
                              <TouchableOpacity
                                onPress={() => removeImageItem(1)}
                                activeOpacity={0.8}
                                style={{
                                  height: 25,
                                  width: 25,
                                  borderRadius: 20,
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  zIndex: 1,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: Colors.danger,
                                }}
                              >
                                <FeatherIcon
                                  name="x"
                                  size={16}
                                  color={Colors.white}
                                />
                              </TouchableOpacity>
                            </>
                          ) : (
                            <>
                              <FeatherIcon
                                name="plus"
                                color={Colors.lightText}
                                size={40}
                              />
                            </>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {userDetails?.address && (
                    <>
                      <CustomText
                        text="Location"
                        style={[
                          commonStyle.smalltext,
                          {
                            color: Colors.dark,
                            fontSize: 22,
                            fontFamily: Fonts.fontBold,
                          },
                        ]}
                        className="mx-2 mt-[10] mb-[10]"
                      />

                      <View className="flex-row">
                        <CustomText
                          text={userDetails.address}
                          readmore={userDetails?.address?.length > 180}
                          style={[
                            commonStyle.smalltext,
                            {
                              color: Colors.dark,
                              lineHeight: 25,
                              fontSize: 15,
                              fontFamily: Fonts.fontSemiBold,
                            },
                          ]}
                          className="mx-2"
                        />
                      </View>
                    </>
                  )}
                </View>
              </View>
            </ScrollView>
          )}

          <Modal
            style={{
              flex: 1,
              margin: 0,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}
            isVisible={modalVisible}
            onBackdropPress={() => {
              setModalVisible(!modalVisible);
            }}
          >
           
            <View
              style={{
                height: ScreenHeight,
                width: ScreenWidth,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'flex-end',
              }}
            >
          
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(!modalVisible);
                }}
                className="rounded-full w-[10] h-[10] items-center justify-center "
                style={[
                  commonStyle.shadowButton,
                  {
                    marginRight: 20,
                    marginTop: Platform.OS == 'ios' ? 60 : 20,
                  },
                ]}
              >
              
                <Ionicons
                  name="close-sharp"
                  size={22}
                  className=" items-center self-center justify-center mb-5 rounded-full "
                />
              </TouchableOpacity>
              <SwiperFlatList
                index={selectedindex}
                // style={{ backgroundColor: 'red' }}
                showPagination
                paginationStyleItem={{ height: 10, width: 10 }}
                paginationActiveColor={Colors.primary}
                data={
                  userDetails.user_images?.length ? userDetails.user_images : []
                }
                renderItem={({ item, index }) => (
                  <View
                    style={{
                      height: ScreenHeight * 0.8,
                      width: ScreenWidth,
                      paddingHorizontal: 5,
                    }}
                  >
                    <Image
                      key={index}
                      source={{ uri: item?.mediaUrl }}
                      style={{
                        height: ScreenHeight * 0.8,
                        width: '100%',
                      }}
                      resizeMode="contain"
                    />
                  </View>
                )}
              />
            </View>
          </Modal>
          {!loading && (
            <FloatingBtn
              style={{ marginBottom: 10 }}
              title="Subscription Plans "
              isLoading={false}
              onPress={() => {
                props?.navigation?.navigate?.('Subscriptions', {});
              }}
            />
          )}
        </View>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          backgroundStyle={{
            // borderWidth:1,
            backgroundColor: 'transparent',
            marginHorizontal: 10,
            overflow: 'hidden',
          }}
        >
          <View className="flex-1 px-2  mx-[10]  rounded ">
            <View className="bg-white mb-2  rounded-[12px]">
              <TouchableOpacity
                onPress={openCamerafunc}
                className="  rounded p-3 flex-row items-center space-x-3"
              >
                <AntDesign size={30} color={Colors.gradient1} name="camerao" />
                <CustomText text={'Camera'} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openGallery}
                className="  rounded p-3 flex-row items-center space-x-3"
              >
                <FontAwesome size={30} color={Colors.gradient1} name="photo" />
                <CustomText text={'Gallery'} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => bottomSheetModalRef.current.close()}
              className="bg-white mb-4   rounded-[12px] justify-center items-center py-3"
            >
              <CustomText text="Cancel" />
            </TouchableOpacity>
          </View>
        </BottomSheetModal>
        <RBSheet
          ref={deleteBottomSheetModalRef}
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
            className=""
            style={{
              paddingHorizontal: 15,
              borderBottomWidth: 1,
              borderColor: Colors.borderColor,
              paddingVertical: 12,
            }}
          >
            <CustomText style={[commonStyle.mediumtextBold]}>
              {`Are you sure you want to delete selected image ?`}{' '}
            </CustomText>
          </View>
          <View
            style={{
              paddingHorizontal: 15,
              flexDirection: 'row',
              width: '100%',
              gap: 10,
              justifyContent: 'center',
              marginTop: 30,
            }}
          >
            <View className="flex-1">
              <GradientBtn
                isLoading={delLoading}
                onPress={() => {
                  setDelLoading(true);
                  deleteFiles({
                    file_id: deleteFile._id,
                    type: 'gallery_image',
                  })
                    .then(res => {
                      getProfile();
                      setDelLoading(false);
                      showSuccessMessage(res.data.message);
                      deleteBottomSheetModalRef.current.close();
                    })
                    .catch(err => {
                      setDelLoading(false);
                      showErrorMessage(
                        err.data.message || 'Something went wrong ',
                      );
                      deleteBottomSheetModalRef.current.close();
                    });
                }}
                title={'Delete'}
              />
            </View>
            <View className="flex-1">
             
              <SimpleBtn
                onPress={() => {
                  deleteBottomSheetModalRef.current.close();
                }}
                title={'Cancel'}
              />
            </View>
          </View>
        </RBSheet>
      </BottomSheetModalProvider>
      <Snackbar
        wrapperStyle={{ top: Platform.OS == 'ios' ? 40 : 10 }}
        visible={visible}
        // rippleColor={Colors.text}
        theme={{ colors: { surface: Colors.text, accent: Colors.text } }}
        style={{ backgroundColor: Colors.white }}
        elevation={5}
        onDismiss={() => console.log()}
      >
        <View className="flex-row gap-[10]  justify-center items-center">
          <MaterialIcons name="cloud-upload" size={32} color={Colors.primary} />
          <View className="border-l pl-[10] border-l-borderPrimary">
            <CustomText
              style={commonStyle.smalltextBold}
              className="mb-2"
              text="Uploading Image"
            />
            <Progress.Bar
              progress={progress}
              color={Colors.primary}
              height={2}
              width={Dimensions.get('window').width - 95}
            />
          </View>
        </View>
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    marginTop: 2,
    marginBottom: 2,
  },
  imageBox: {
    // flex: 1,
    borderWidth: 1.3,
    marginVertical: 5,
    borderRadius: 12,
    borderStyle: 'dashed',
    minHeight: 12 / 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    width: '100%',
    // height:24
    imageBox: {
      flex: 1,
      borderWidth: 1.3,
      marginVertical: 5,
      borderRadius: 12,
      borderStyle: 'dashed',
      minHeight: 12 / 3.5,
      // alignItems: 'center',
      // justifyContent: 'center',
      padding: 12,
    },
  },
  crown: {
    position: 'absolute',
    width: 75,
    height: 75,
    objectFit: 'contain',
    resizeMode: 'contain',
    top: -40,
    right: -26,
    transform: [{ rotate: '35deg' }],
  },
  subBtn: {
    marginTop: 10,
    gap: 2,
    paddingHorizontal: 15,
    height: 'auto',
    paddingVertical: 5,
    // paddingVertical:0
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    flexDirection: 'row',
  },
});
export default ProfilePage;
