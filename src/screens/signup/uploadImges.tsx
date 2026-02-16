import React, {
  FC,
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
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CommonActions, useRoute, useTheme } from '@react-navigation/native';

import FeatherIcon from 'react-native-vector-icons/Feather';
import GradientBtn from '../../components/gradientBtn';
import Colors from '../../constant/colors';
import { commonStyle } from '../../constant/commonStyle';
import CustomText from '../../components/customText';
import {
  completeProfile,
  getALLChatUsers,
  getMyProfile,
  uploadFile,
} from '../../services/api';
import { showErrorMessage, showSuccessMessage } from '../../services/alerts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getHeaders,
  getToken,
  initializeSocket,
  socket,
} from '../../services/apiConfig';
// import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import ImagePicker from 'react-native-image-picker';

import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { UploadImages } from '../../constant/types';
import BackButton from '../../components/backButton';
import FloatingBtn from '../../components/floatingBtn';
import { useRecoilState } from 'recoil';

import { UserProfileData } from '../../contexts/userDetailscontexts';

import Fonts from '../../constant/fonts';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { openCamera, openPicker } from 'react-native-image-crop-picker';
import { getFCMToken } from '../../services/pushNotification';


const height = Dimensions.get('window').height;
const RecentPics: FC<UploadImages> = (props: any) => {
  const [focused, setfocused] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  // const [modalVisible, setModalVisible] = useState(false);
  const [images, setImages] = useState<Array<any>>([]);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => [`${(202 / height) * 100}%`], []);

  const { getProfile, userDetails, setUserDetails, getMessages } =
    useContext(UserProfileData);
  // const [token,setToken] = useRecoilState(authToken)
  const options = {
    title: 'Select Image',
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
  };

  const saveImages = (path: any) => {
    console.log(path);
    const obj = {
      ...path,
      uri: path.path,
      width: path.width,
      height: path.height,
      mime: path.mime,
    };
    setImages(state => [...state, obj]);
    bottomSheetModalRef.current?.close();
    // setModalVisible(false)
  };
  const openCamerafunc = () => {
    const option = {
      cropping: true,
      // compressImageQuality:1,
      freeStyleCropEnabled: true,
      width: 1000,
      height: 1000,
    };
    openCamera(option)
      .then(res => {
        console.log('sucess');
        saveImages(res);
      })
      .catch(err => {
        console.log('kelfn jw wk', err);
        // showErrorMessage('No image selected')
      });
  };

  const openGallery = () => {
    const option = {
      cropping: true,
      // compressImageQuality:1,
      freeStyleCropEnabled: true,
      width: 1000,
      height: 1000,
    };
    openPicker(option).then(res => {
      saveImages(res);
    });
    // .catch(err => showErrorMessage('No image selected'))
  };

  const route = useRoute<any>();

  const completeProfileApi = async () => {
    // const sortedTags = route.params.All_tags.map((item: any) => {
    //     if (item.isSelected == true) {
    //         return item.name
    //     }
    // })
    // const sortedTags = route.params.All_tags
    //     .filter((item: any) => item.isSelected === true)
    //     .map((item: any) => item.name);
    // console.log("New complete profile >> $$ ", sortedTags)

    setfocused(true);
    setLoading(true);
    const data = {
      first_name: route?.params?.firstName,
      last_name:
        route.params.lastName != undefined ? route.params.lastName : '',
      dob: route.params.date_value,
      gender: route.params.Your_Gender,
      interest: route.params.All_tags,
      interested_in: route.params.Interested_Gender,
      age_range: route.params.Age_Range,
      bio: route.params.description,
      work: route.params.work,
      sports: props.route.params.sports,
    };
    console.log('**************************************', data);
    completeProfile(data)
      .then(async (res: any) => {
        // console.log('mew >>>', res)
        if (res.data.status) {
          const token = await getToken();
          showSuccessMessage('Sign up successfully');
          getFCMToken();
          AsyncStorage.setItem(
            'user_details',
            JSON.stringify(res.data.user_details),
          );
          if (token) {
            // getALLChatUsers()
            //     .then(res => {
            //             setMessages({loading:false,data:res?.data?.chats})
            //     })
            getMessages();
            initializeSocket(token);
            if (socket) {
              socket.on('connected', (response: any) => {
                console.log(
                  '+========================================> connected',
                  response,
                  socket?.id,
                );
              });
            }
            getMyProfile()
              .then(res => {
                // console.log('chatttttttttttt',res)
                // setTimeout(()=>{
                //     setLoading(false)
                // },1000)
                const [profileImage] = res.data.user_images.filter(
                  (elm: any) => elm?.mediaType == 'profile',
                );
                const story = res?.data?.stories?.map((elm: any) => ({
                  ...elm,
                  id: elm._id,
                  isSeen: false,
                  resolved: false,
                }));
                setUserDetails({
                  ...res.data.user,
                  user_images: res.data.user_images,
                  profileImage,
                  story,
                  subscription: res?.data?.subscription,
                });
                // return res
                props.navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'MyTabs' }],
                  }),
                );
              })
              .catch((err: any) => {
                throw err;
              });
            // setUserDetails(res?.data?.user_details?.user)
            // const [profileImage] = res?.data?.user_details?.user_images?.filter(((elm:any)=>elm?.mediaType == 'profile'))
            // const story =res?.data?.stories?.map((elm:any)=>({...elm,id:elm?._id,isSeen:false,resolved:false}))
            // setUserDetails({...(res?.data)?.user_details?.user,user_images:res?.data?.user_details?.user_images,profileImage})

            // console.log()
            return;
          }
        }
        showErrorMessage(res.data.message);
      })
      .catch(error => {
        console.log('Api not working >> ', error);
        setLoading(false);
      });
  };
  // console.log('asjgvaskj')
  const uploadImages = () => {
    setLoading(true);
    if (images == null || images?.length == 0) {
      setLoading(false);
      return showErrorMessage('Please select image');
    }
    let formData = new FormData();
    // const arraydata = JSON.stringify(images.slice(1))
    images.map((result, index) => {
      if (index > 0) {
        formData.append('galleryImages', {
          uri: result.path,
          type: result.mime,
          name: `${index}profilephoto.jpeg`,
        });
      }
    });
    // formData.append('galleryImages', JSON.stringify(images))
    formData.append('profileImage', {
      uri: images[0].path,
      type: images[0].mime,
      name: `profilephoto.jpeg`,
    });

    console.log(formData);

    uploadFile(formData)
      .then((res: any) => {
        console.log('res::', res);
        // console.log("uploadFile -------------",res?.data)
        if (res?.data?.status) {
          // showSuccessMessage(res?.data?.message)
          completeProfileApi();
          return;
        }
        showErrorMessage(res?.data?.message || 'Something went wrong');
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        console.log(err);
      });
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={1}
        pressBehavior={'none'}
        animatedIndex={{
          value: 1,
        }}
      />
    ),
    [],
  );

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef?.current?.present();
  }, []);

  const removeImageItem = (index: any) => {
    setImages(state => state.filter((elm, key) => key != index));
  };

  // console.log(images)
  // useEffect(()=>{
  //     setLoading(false)
  // },[])
  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <BottomSheetModalProvider>
        <View style={{ flex: 1 }}>
          <ScrollView>
            <View style={[commonStyle.container]}>
              {/* <TouchableOpacity
                            onPress={() => props.navigation.goBack()}
                            style={[commonStyle.shadowButton, { marginBottom: 15 }]}
                        >
                            <FeatherIcon size={26} color={Colors.title} name={'chevron-left'} />
                        </TouchableOpacity> */}
              <BackButton navigation={props.navigation} />
              <CustomText
                text="Add Your Photos"
                style={commonStyle.headingtextBold}
                className=" mb-[5]"
              />
              <Text
                style={{
                  fontFamily: Fonts.fontSemiBold,
                  fontSize: 15,
                  color: Colors.black,
                  marginBottom: 20,
                }}
              >
                Enhance your profile by uploading photos to increase your
                chances of finding a match. Feel free to update them anytime.
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                }}
              >
                <View style={[commonStyle.col66]}>
                  <TouchableOpacity
                    onPress={() => {
                      handlePresentModalPress();
                    }}
                    activeOpacity={0.9}
                    style={[
                      styles.imageBox,
                      { height: 10, borderColor: Colors.lightText },
                    ]}
                  >
                    {images[0] ? (
                      <>
                        <Image
                          source={{ uri: images[0]?.uri }}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 12,
                          }}
                        />
                        <TouchableOpacity
                          onPress={() => removeImageItem(0)}
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
                          name="image"
                          color={Colors.lightText}
                          size={45}
                        />
                        <CustomText
                          text="Upload Profile Photo"
                          style={{ color: Colors.lightText }}
                        />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                <View style={commonStyle.col33}>
                  <TouchableOpacity
                    onPress={() => {
                      handlePresentModalPress();
                    }}
                    activeOpacity={0.9}
                    style={[styles.imageBox, { borderColor: Colors.lightText }]}
                  >
                    {images[1] ? (
                      <>
                        <Image
                          source={{ uri: images[1].uri }}
                          style={{
                            width: '100%',
                            height: '100%',
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
                  <TouchableOpacity
                    onPress={() => {
                      handlePresentModalPress();
                    }}
                    activeOpacity={0.9}
                    style={[styles.imageBox, { borderColor: Colors.lightText }]}
                  >
                    {images[2] ? (
                      <>
                        <Image
                          source={{ uri: images[2].uri }}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 12,
                          }}
                        />
                        <TouchableOpacity
                          onPress={() => removeImageItem(2)}
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
                      <FeatherIcon
                        name="plus"
                        color={Colors.lightText}
                        size={40}
                      />
                    )}
                  </TouchableOpacity>
                </View>
                <View style={commonStyle.col33}>
                  <TouchableOpacity
                    onPress={() => {
                      handlePresentModalPress();
                    }}
                    activeOpacity={0.9}
                    style={[styles.imageBox, { borderColor: Colors.lightText }]}
                  >
                    {images[3] ? (
                      <>
                        <Image
                          source={{ uri: images[3].uri }}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 12,
                          }}
                        />
                        <TouchableOpacity
                          onPress={() => removeImageItem(3)}
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
                      <FeatherIcon
                        name="plus"
                        color={Colors.lightText}
                        size={40}
                      />
                    )}
                  </TouchableOpacity>
                </View>
                <View style={commonStyle.col33}>
                  <TouchableOpacity
                    onPress={() => {
                      handlePresentModalPress();
                    }}
                    activeOpacity={0.9}
                    style={[styles.imageBox, { borderColor: Colors.lightText }]}
                  >
                    {images[4] ? (
                      <>
                        <Image
                          source={{ uri: images[4].uri }}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 12,
                          }}
                        />
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => removeImageItem(4)}
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
                      <FeatherIcon
                        name="plus"
                        color={Colors.lightText}
                        size={40}
                      />
                    )}
                  </TouchableOpacity>
                </View>
                <View style={commonStyle.col33}>
                  <TouchableOpacity
                    onPress={() => handlePresentModalPress()}
                    activeOpacity={0.9}
                    style={[styles.imageBox, { borderColor: Colors.lightText }]}
                  >
                    {images[5] ? (
                      <>
                        <Image
                          source={{ uri: images[5].uri }}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 12,
                          }}
                        />
                        <TouchableOpacity
                          onPress={() => removeImageItem(5)}
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
                </View>
              </View>
            </View>
          </ScrollView>
          {loading && (
            <View className="absolute top-0 bottom-0 right-0 left-0 border border-white"></View>
          )}
        </View>
        {/* <View
                style={{
                    paddingHorizontal: 45,
                    paddingVertical: 35,
                }}
            >
                <GradientBtn
                    onPress={() => { uploadImages() }}
                    title={'Continue'}
                    isLoading={loading}
                />
            </View> */}
        <FloatingBtn
          onPress={() => {
            uploadImages();
          }}
          title={'Continue'}
          isLoading={loading}
        />
        <BottomSheetModal
        enableDynamicSizing={false}
          ref={bottomSheetModalRef}
          // index={0}
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          // onChange={handleSheetChanges}

          //    onChange={handleSheetChanges}

          // customStyles={{
          //     wrapper: {

          //     },
          //     container: {
          //         backgroundColor: Colors.cardBg,
          //         borderTopLeftRadius: 15,
          //         borderTopRightRadius: 15,

          //     },

          //     draggableIcon: {
          //         marginTop: 5,
          //         marginBottom: 0,
          //         height: 5,
          //         width: 90,
          //         backgroundColor: Colors.borderColor,
          //     }
          // }}

          style={
            {
              // backgroundColor:'transparent',
              // borderWidth:1
            }
          }
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
              className="bg-white mb-2  rounded-[12px] justify-center items-center py-3"
            >
              <CustomText text="Cancel" />
            </TouchableOpacity>
          </View>
        </BottomSheetModal>
        {/* <Modal isVisible={modalVisible} onBackdropPress={() => { handlePresentModalPress() }}>
                <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 8 }}>
                    <CustomText>Choose an option:</CustomText>
                    <View style={{ flexDirection: 'row', margin: 10, justifyContent: 'space-around' }}>
                        <TouchableOpacity onPress={openCamerafunc}>
                            <Image
                                source={require('../../assets/png/camera.png')}
                                style={{
                                    width: 90,
                                    height: 60,
                                    borderRadius: 12,
                                    alignSelf: 'center'

                                }}
                            />
                            <CustomText>Open Camera</CustomText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={openGallery}>
                            <Image
                                source={require('../../assets/png/gallery.png')}
                                style={{
                                    width: 90,
                                    height: 60,
                                    borderRadius: 12,
                                    alignSelf: 'center'
                                }}
                            />
                            <CustomText>Open Gallery</CustomText>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ justifyContent: 'center' }} onPress={() => { handlePresentModalPress() }}>
                            <CustomText style={{ textAlign: 'center', }}>Cancel</CustomText>
                        </TouchableOpacity>
                    </View>

                </View>
            </Modal> */}
      </BottomSheetModalProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  imageBox: {
    flex: 1,
    borderWidth: 1.3,
    marginVertical: 5,
    borderRadius: 12,
    borderStyle: 'dashed',
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
});

export default RecentPics;
