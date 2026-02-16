import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  AppState,
  ImageBackground,
  KeyboardAvoidingView,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Colors from '../constant/colors';
import GradientBtn from '../components/gradientBtn';
import { commonStyle } from '../constant/commonStyle';
import CustomText from '../components/customText';
import SafeContainer from '../components/safeContainer';
import * as Yup from 'yup';
import { Formik } from 'formik';
import {
  getALLChatUsers,
  getMyProfile,
  getOtp,
  verifyOtp,
} from '../services/api';
import { showErrorMessage, showSuccessMessage } from '../services/alerts';
import { CommonActions, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigateRoutes } from '../constant/types';
import BackButton from '../components/backButton';
import FloatingBtn from '../components/floatingBtn';
import Feather from 'react-native-vector-icons/Feather';
import { initializeSocket, socket } from '../services/apiConfig';
import { useRecoilState } from 'recoil';

// import { authToken } from '../recoil/atoms/authToken';
import PopupModal from '../components/noPlane';
import Fonts from '../constant/fonts';
import { UserProfileData } from '../contexts/userDetailscontexts';
import { SignupDataContext } from '../contexts/signUpcontexts';
import { useAuthToken } from '../recoil/atoms/authToken';
import { useChatState } from '../recoil/atoms/chatData';
import { getFCMToken } from '../services/pushNotification';

const otpValidationSchema = Yup.object().shape({
  otp: Yup.string().min(3, 'Please enter full otp'),
});
const EnterCode = (props: navigateRoutes) => {
      console.log('enter code screen render:');
  const phone = props?.route?.params?.phone;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [focused, setfocused] = useState(false);
  const [otp, setOtp] = useState<string>('');
  const [timer, setTimer] = useState<number>(120); // 2 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
   const messages = useChatState(state => state.chatState);
  
  // const [messages, setMessages] = useRecoilState(chatState);
  const { setUserDetails, getMessages } = useContext(UserProfileData);
  const { getData } = useContext(SignupDataContext);
  const setToken = useAuthToken(state => state.setAuthToken);
  const pauseTimeStamp = useRef<any>(null);
  const [visible, setVisible] = useState(false);
  const [init, setInit] = useState(false);
  const [res, setResponse] = useState<any>(null);

  const route = useRoute();

  useEffect(() => {
    if (init && otp.length < 4) {
      return setError(true);
    }
    if (otp.length == 4) {
      return setError(false);
    }
    // setError(false);
  }, [otp]);

  useEffect(() => {
    if (timer > 0) {
      const timeoutId = setTimeout(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearTimeout(timeoutId);
    } else {
      setIsTimerRunning(false);
    }
  }, [isTimerRunning, timer]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: any) => {
        // console.log('App has gone to the background!',nextAppState);
        if (nextAppState == 'active') {
          // console.log('active')
          const currentTime: any = new Date();
          const secDiff = (currentTime - pauseTimeStamp?.current) / 1000;
          console.log('secDiffsecDiffsecDiff', secDiff);
          setTimer(state => state - Math.ceil(secDiff));
        } else if (nextAppState == 'background') {
          // console.log('inside of background ',socket,userDetails?._id);
          pauseTimeStamp.current = new Date();
        }
      },
    );

    return () => {
      subscription.remove(); // Unsubscribe on cleanup
    };
  }, []);

  // useEffect(() => {
  //     if (timer == 120) {
  //         statingTimeStamp.current = new Date();
  //     }
  // }, [timer]);
  //   console.log(timer,isTimerRunning)

  const resendOtp = async () => {
    setTimer(120);
    setIsTimerRunning(state => true);
    await getOtp(
      { mobile: route?.params?.countryCode + route?.params?.phoneNumber },
      setLoading,
    )
      .then(res => {
        // setTimer(120);
        // setIsTimerRunning(state => true);
        // console.log(res.data);
        if (res.data.status) {
          return showSuccessMessage('OTP sent successfully');
        }
        showErrorMessage(res.data.message);
      })
      .catch(err => {
        showErrorMessage(err?.data?.message);
      });
    // Implement logic to resend OTP
    // For demonstration purposes, let's just reset the timer to 2 minutes
  };

  const submitOtp = () => {
    setInit(true);
    if (otp.trim() == '') {
      return setError(true);
    }
    if (otp.length < 4) {
      return setError(true);
    }
    setLoading(true);
    // setTimeout(() => {
    //     setLoading(false)
    //     props.navigation.navigate('Name')
    // }, 1000);
    // console.log('here 22');
    const data = {
      mobile: phone,
      otp: otp,
    };
    verifyOtp({
      mobile: route?.params?.countryCode + route?.params?.phoneNumber,
      otp: otp,
    })
      .then(async res => {
        console.log('stringfied data:', res.data);
        setLoading(false);
        if (res.data.status) {
          await AsyncStorage.setItem('Token', res?.data?.token);
          setToken(res?.data?.token);
          await AsyncStorage.setItem('Token', res?.data?.token);
          if (res?.data?.IsprofileComplete) {
            setLoading(false);
            initializeSocket(res?.data?.token);
            getFCMToken();
            if (socket) {
              socket.on('connected', (response: any) => {});
            }
            getMessages();
            AsyncStorage.setItem(
              'user_details',
              JSON.stringify(res.data.user_details),
            );
            getMyProfile().then(res => {
              // console.log('resresres',res)
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
              props.navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'MyTabs' }],
                }),
              );
              return res;
            });

            return;
          }
          getData();
          setLoading(false);
          props.navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'FirstName' }],
            }),
          );
          // showSuccessMessage('Account Verified Successfully')
          // props.navigation.navigate('FirstName')
          return;
        } else {
          if (
            !res?.data?.InvalidOTP &&
            res?.data?.userDetails?.is_user_active == false
          ) {
            setResponse(res?.data?.userDetails);
            setVisible(true);
            return;
          }
          // console.log('first',res.data)
          showErrorMessage(res.data.message);
          setLoading(false);
          // props.navigation.goBack();
          return;
        }
      })
      .catch(err => {
        console.log('first', err);
        setLoading(false);
        showErrorMessage(err?.data?.message || 'Something went wrong');
      });
  };
  const codeRef = React.useRef(null);

  return (
    <SafeContainer
      style={{
        flex: 1,
        backgroundColor: Colors.cardBg,
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : ''}
      >
        <View style={{ flex: 1 }}>
          <ScrollView>
            <View style={commonStyle.container}>
              <BackButton navigation={props.navigation} />
              <CustomText
                text="Please Enter Your OTP"
                style={commonStyle.headingtextBold}
                className=" mb-[20]"
              />
              <View style={{ alignItems: 'center' }}>
                <View
                  style={[
                    styles.inputStyle,
                    {
                      borderColor: Colors.borderColor,
                      backgroundColor: Colors.inputColor,
                    },
                  ]}
                >
                  <TextInput
                    style={{
                      fontFamily: Fonts.fontRegular,
                      fontSize: 20,
                      color: Colors.title,
                      flex: 1,
                      top: 0,

                      paddingVertical: 5,
                      paddingLeft: 20,
                      // backgroundColor:Colors.inputColor
                      paddingRight: 15,
                    }}
                    autoFocus
                    value={otp}
                    onChangeText={e => setOtp(e)}
                    keyboardType="number-pad"
                    placeholder="Enter Your OTP"
                    placeholderTextColor={Colors.textLight}
                    textContentType="oneTimeCode"
                  />
                </View>
              </View>
              {error && (
                <CustomText
                  style={[
                    commonStyle.errorText,
                    { textAlign: 'center', marginTop: 10 },
                  ]}
                >
                  Enter 4 digits OTP
                </CustomText>
              )}
              <View className="flex-row justify-center items-center mt-[20]">
                <CustomText
                  text={`OTP sent to ${route?.params?.countryCode} ${route?.params?.phoneNumber}`}
                  className="  text-grey text-center "
                />
              </View>
            </View>
          </ScrollView>
        </View>
        <View
          style={{
            paddingHorizontal: 45,
            paddingVertical: 0,
            position: 'absolute',
            bottom: 100,
            left: 0,
            right: 0,
          }}
        >
          <View style={{ marginTop: 120, alignItems: 'center' }}>
            {isTimerRunning ? (
              <CustomText
                style={{
                  color: Colors.title,
                  fontSize: 20,
                  fontFamily: Fonts.fontSemiBold,
                }}
              >{`Resend OTP in ${Math.floor(timer / 60)}:${
                timer % 60 < 10 ? '0' : ''
              }${timer % 60}`}</CustomText>
            ) : (
              <TouchableOpacity onPress={resendOtp}>
                <CustomText
                  style={{
                    color: Colors.primary,
                    fontSize: 20,
                    fontFamily: Fonts.fontSemiBold,
                  }}
                >
                  Resend OTP
                </CustomText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <FloatingBtn
          title={'Continue'}
          isLoading={loading}
          onPress={() => {
            submitOtp();
          }}
        />
      </KeyboardAvoidingView>
      <PopupModal
        navigation={props.navigation}
        isVisible={visible}
        imgKey="Chat"
        title={
          res?.is_deactivated_by_admin
            ? 'Your account has been deactivated'
            : 'Account deleted'
        }
        subTitle={'Please contact support to activate your account'}
        onClose={() => {
          setVisible(false);
          props.navigation.goBack();
        }}
        progressPress={() => {
          Linking.openURL('https://hotspotmeet.com.au/contact-us/');
          setVisible(false);
          props.navigation.goBack();
        }}
        btnTitle={'Contact us'}
      />
    </SafeContainer>
  );
};
export default EnterCode;

const styles = StyleSheet.create({
  inputStyle: {
    height: 55,
    // padding: 5,
    // paddingHorizontal: 15,
    borderWidth: 1,
    borderRadius: 30,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,.05)',
  },
});
