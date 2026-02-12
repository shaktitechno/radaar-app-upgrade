import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
  Image,
  TextInput,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  InteractionManager,
} from 'react-native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Colors from '../../constant/colors';
import { ScrollView } from 'react-native-gesture-handler';
import { commonStyle } from '../../constant/commonStyle';
import CustomText from '../../components/customText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';
import CustomInput from '../../components/customInput';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import DateTimePicker from '@react-native-community/datetimepicker';
import GradientBtn from '../../components/gradientBtn';
import { useFormik } from 'formik';
import { UpdateProfileType } from '../../constant/types';
import { UpdateProfle, getMyProfile, uploadFile } from '../../services/api';
import { showErrorMessage, showSuccessMessage } from '../../services/alerts';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import mime from 'mime';
import { openCamera, openPicker } from 'react-native-image-crop-picker';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import * as Yup from 'yup';
import BackButton from '../../components/backButton';

const maxDate = new Date();
maxDate.setFullYear(maxDate.getFullYear() - 18);

const height = Dimensions.get('window').height;

const EditProfile = (props: any) => {
  const scrollRef = useRef<any>(null);
  const [userDetails, setUserDetails] = useState<
    UpdateProfileType | undefined
  >();
  const [date, setDate] = useState(new Date());
  const [datePicker, setDatePicker] = useState(false);
  const settingSheet = useRef();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [profileImage, steProfileImage] = useState<any>(null);
  const [type, setType] = useState<number | null>(null);
  const snapPoints = useMemo(() => [`${(202 / height) * 100}%`], []);
  const [loading, setLoading] = useState<boolean>(false);
  const [uloadedprofileImage, setUplodedprofileImage] = useState<any>(null);

  useEffect(() => {
    // console.log('jkjsasjnb')
    getMyProfile().then(res => {
      // console.log(res)
      setLoading(false);
      setUserDetails({ ...res.data.user, user_images: res.data.user_images });
      setDate(new Date(res.data.user.dob));
      const [profile] = res.data.user_images.filter(
        (elm: any) => elm?.mediaType == 'profile',
      );
      setUplodedprofileImage(profile);
      // console.log(new Date(res.data.user.dob),(res.data))
    });
  }, []);

  const onDateSelected = (event, selectedDate) => {
    setDatePicker(Platform.OS === 'ios'); // Show DateTimePicker on iOS, hide on Android

    if (selectedDate) {
      formik.setFieldValue(
        'dob',
        selectedDate.getDate() +
          '/' +
          (Number(selectedDate.getMonth()) + 1) +
          '/' +
          selectedDate.getFullYear(),
      );
      setDate(selectedDate);
    }
  };

  const nameDobSchema = Yup.object().shape({
    first_name: Yup.string()
      .max(40, 'First name must be of max 40 characters')
      .min(3, 'First name must be of min 3 characters')
      .matches(
        /^[a-zA-Z\s]*$/,
        'First name must not contain any special character or number',
      )
      .required('Please enter your first name')
      .trim(),

    dob: Yup.string().required('Please enter your date of birth'),
    address: Yup.string().max(255, 'Address must be of max 255 characters'),

    bio: Yup.string()
      .max(350, 'No more than 350 characters')

      .trim(),
  });

  const formik = useFormik({
    initialValues: {
      first_name: userDetails?.first_name || '',
      last_name: userDetails?.last_name || '',
      dob: userDetails?.dob
        ? new Date(userDetails?.dob)?.getDate() +
          '/' +
          (Number(new Date(userDetails?.dob)?.getMonth()) + 1) +
          '/' +
          new Date(userDetails?.dob)?.getFullYear()
        : '',
      bio: userDetails?.bio || '',
      gender: userDetails?.gender || 0,
      address: userDetails?.address || '',
    },
    enableReinitialize: true,
    validationSchema: nameDobSchema,
    onSubmit: values => {
      setDatePicker(false);
      if (profileImage) {
        setLoading(true);

        let formData = new FormData();
        formData.append('profileImage', {
          uri: profileImage.path,
          type: mime.getType(profileImage.path),
          name: profileImage.path.split('/').pop(),
        });

        console.log();
        uploadFile(formData)
          .then((res: any) => {
            console.log(res);

            UpdateProfle({ ...values, dob: date })
              .then(res => {
                console.log(res);

                if (res.data.status) {
                  AsyncStorage.setItem(
                    'user_details',
                    JSON.stringify({
                      user_images: userDetails?.user_images,
                      user: { ...userDetails, ...values },
                    }),
                  );
                  props.navigation.goBack();
                  console.log(props.navigation);
                  showSuccessMessage(res?.data?.message);
                  setLoading(false);
                  return;
                }
                showErrorMessage(res?.data?.message);
                setLoading(false);
              })
              .catch(err => {
                console.log(res);
                setLoading(false);
              });
          })
          .catch(err => {
            setLoading(false);
            console.log(err);
            return;
          });
      } else {
        UpdateProfle({ ...values, dob: date })
          .then(res => {
            console.log(res);

            if (res.data.status) {
              AsyncStorage.setItem(
                'user_details',
                JSON.stringify({
                  user_images: userDetails?.user_images,
                  user: { ...userDetails, ...values },
                }),
              );
              props.navigation.goBack();
              console.log(props.navigation);
              showSuccessMessage(res?.data?.message);
              setLoading(false);
              return;
            }
            showErrorMessage(res?.data?.message);
            setLoading(false);
          })
          .catch(err => {
            console.log(res);
            setLoading(false);
          });
      }
    },
  });

  const renderBackdrop = useCallback(
    props => (
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

  const handlePresentModalPress = useCallback((type: number) => {
    bottomSheetModalRef.current?.present();
    setType(type);
  }, []);

  const saveImages = path => {
    const obj = {
      ...path,
      uri: path.path,
      width: path.width,
      height: path.height,
      mime: path.mime,
    };
    // setImages(state=>([...state,obj]))
    if (type == 0) {
      steProfileImage(obj);
    }
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
  };

  const scrollRefTobotoom = () => {
    console.log('here', scrollRef.current?.scrollToEnd);
    setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    }, 100);
  };

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
        <BottomSheetModalProvider>
          <BottomSheetModal
            ref={bottomSheetModalRef}
            index={0}
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            style={{}}
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
                  onPress={() => openCamerafunc()}
                  className="  rounded p-3 flex-row items-center space-x-3"
                >
                  <AntDesign size={30} color={Colors.primary} name="camerao" />
                  <CustomText text={'Camera'} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => openGallery()}
                  className="  rounded p-3 flex-row items-center space-x-3"
                >
                  <FontAwesome size={30} color={Colors.primary} name="photo" />
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
          <View className="flex-1">
            <ScrollView ref={scrollRef}>
              <View style={[commonStyle.container]}>
                <BackButton navigation={props.navigation} />
                <CustomText
                  customeStyle={commonStyle.headingtextBold}
                  text={'Add Your Profile Detail'}
                />
                <CustomText
                  customeStyle={commonStyle.smalltext}
                  className="mt-2"
                  text={'Please add your profile detail here'}
                />
                <View className="justify-center items-center mt-[25]">
                  <View className="rounded-full border-[3px] border-borderPrimary">
                    {(uloadedprofileImage || profileImage) && (
                      <Image
                        source={
                          profileImage
                            ? { uri: profileImage.uri }
                            : { uri: uloadedprofileImage.mediaUrl }
                        }
                        className="w-[82] h-[82]  rounded-full"
                      />
                    )}
                    <TouchableOpacity
                      onPress={() => {
                        handlePresentModalPress(0);
                        setDatePicker(false);
                      }}
                      className="absolute bottom-0 p-[8] right-1 bg-borderPrimary  rounded-full"
                    >
                      <Feather name="edit-2" size={10} color={Colors.white} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View className="space-y-4 mt-[25] ">
                  <View className="py-0">
                    <CustomInput
                      onFocus={() => setDatePicker(false)}
                      placeholder="Enter First Name "
                      onChangeText={formik.handleChange('first_name')}
                      value={formik.values.first_name}
                      icon={
                        <AntDesign
                          style={{ opacity: 1, zIndex: 10 }}
                          name={'user'}
                          size={20}
                          color={Colors.title}
                        />
                      }
                    />
                    {formik.errors.first_name && formik.touched.first_name && (
                      <CustomText
                        style={[commonStyle.errorText, { marginLeft: 10 }]}
                      >
                        {formik.errors.first_name}
                      </CustomText>
                    )}
                  </View>

                  <View>
                    <CustomInput
                      placeholder="Date of Birth "
                      value={formik.values.dob}
                      icon={
                        <Ionicons
                          style={{ opacity: 1, zIndex: 10 }}
                          name={'calendar-outline'}
                          size={20}
                          color={Colors.title}
                        />
                      }
                    />
                    <TouchableOpacity
                      onPress={() => setDatePicker(true)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                      }}
                    ></TouchableOpacity>
                    {formik.errors.dob && formik.touched.dob && (
                      <CustomText
                        style={[commonStyle.errorText, { marginLeft: 10 }]}
                      >
                        {formik.errors.dob}
                      </CustomText>
                    )}
                  </View>
                  <View className="py-0">
                    <CustomInput
                      onFocus={() => {
                        setDatePicker(false);
                        scrollRefTobotoom();
                      }}
                      placeholder="Enter Address "
                      value={formik.values.address}
                      onChangeText={formik.handleChange('address')}
                      defaultValue={userDetails?.bio || ''}
                      multiline
                      style={{ paddingTop: 12 }}
                      icon={
                        <Ionicons
                          style={{ opacity: 1, zIndex: 10 }}
                          name={'location-outline'}
                          size={22}
                          color={Colors.title}
                        />
                      }
                    />
                    {formik.errors.address && formik.touched.address && (
                      <CustomText
                        style={[commonStyle.errorText, { marginLeft: 10 }]}
                      >
                        {formik.errors.address}
                      </CustomText>
                    )}
                  </View>
                  <View className="py-0">
                    <CustomInput
                      onFocus={() => {
                        setDatePicker(false);
                        scrollRefTobotoom();
                      }}
                      style={{ height: 120, textAlignVertical: 'top' }}
                      placeholder="A little bit about you"
                      onChangeText={formik.handleChange('bio')}
                      value={formik.values.bio}
                      multiline
                      numberOfLines={5}
                    />
                    <CustomText
                      style={{
                        color: Colors.textLight,
                        fontSize: 12,
                        textAlign: 'right',
                      }}
                    >
                      {formik.values?.bio?.trim()?.length}/350
                    </CustomText>
                    {formik.errors.bio && formik.touched.bio && (
                      <CustomText
                        style={[commonStyle.errorText, { marginLeft: 10 }]}
                      >
                        {formik.errors.bio}
                      </CustomText>
                    )}
                  </View>
                </View>
              </View>
            </ScrollView>
            <View className="px-[15] mb-4">
              <GradientBtn
                onPress={formik.handleSubmit}
                title={'Update'}
                isLoading={loading}
              />
            </View>
          </View>
        </BottomSheetModalProvider>
        {datePicker && (
          <>
            {Platform.OS == 'ios' && (
              <View className="flex-row justify-between px-2 justify-end">
                <TouchableOpacity
                  onPress={() => {
                    setDatePicker(false);
                  }}
                  className=""
                >
                  <CustomText style={{ color: Colors.primary }} text="Done" />
                </TouchableOpacity>
              </View>
            )}
            <DateTimePicker
              value={date}
              mode={'date'}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              is24Hour={true}
              maximumDate={maxDate}
              onChange={onDateSelected}
              minimumDate={new Date(1900, 0, 1)}
            />
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfile;
