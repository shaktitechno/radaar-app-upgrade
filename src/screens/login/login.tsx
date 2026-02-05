import {
  View,
  Text,
  TextInput,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
} from 'react-native';
import React, { FC, useEffect, useState } from 'react';

import CustomText from '../../components/customText';
import { commonStyle } from '../../constant/commonStyle';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Colors from '../../constant/colors';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { Settings } from 'react-native-fbsdk-next';

import { ActivityIndicator } from 'react-native';
import { login } from '../../constant/types';
import axiosInstance, { completeProfile, getOtp } from '../../services/api';
import { showErrorMessage, showSuccessMessage } from '../../services/alerts';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { ParamListBase, RouteProp, useTheme } from '@react-navigation/native';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { CountryPicker } from 'react-native-country-codes-picker';

import GradientBtn from '../../components/gradientBtn';

import Fonts from '../../constant/fonts';
import SafeContainer from '../../components/safeContainer';
import BackButton from '../../components/backButton';
import FloatingBtn from '../../components/floatingBtn';

const loginSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .matches(/^[0-9]+$/, 'Phone number must contain only digits')
    .min(7, 'The phone number digit must be in between 7 to 13 digits.')
    .max(13, 'The phone number digit must be in between 7 to 13 digits.')
    .required('Phone number is required'),
});

const Login: FC<login> = (props: {
  route: RouteProp<ParamListBase, string>;
  navigation: any;
}) => {
  const [phone, setphone] = useState<string>('');
  const [otpsend, setOtpSend] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState(false);
  const [focused, setfocused] = useState(false);
  const [show, setShow] = useState(false);
  const [countryCode, setCountryCode] = useState('+61');
  const [errors, setErrors] = useState({});

  // const theme = useTheme();
  // const {Colors} = theme;

  // useEffect(() => {
  //     GoogleSignin.configure({
  //         webClientId: '959857594400-4nj1c4j7lma3jl2ggij6thbhc9nis0nd.apps.googleusercontent.com',
  //     });
  //     // Settings.setAppID('1306494930033830')
  //     Settings.initializeSDK();
  // }, [])

  async function onGoogleButtonPress() {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    try {
      const res = await GoogleSignin.signIn();
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  }

  async function onFacebookButtonPress() {
    if (Platform.OS === 'android') {
      LoginManager.setLoginBehavior('web_only');
    }
    const result = await LoginManager.logInWithPermissions([
      'public_profile',
      'email',
    ]);

    if (result.isCancelled) {
      throw 'User cancelled the login process';
    }

    // Once signed in, get the users AccessToken
    const data = await AccessToken.getCurrentAccessToken();
    // console.log(data)
    if (!data) {
      throw 'Something went wrong obtaining access token';
    }
    console.log('facebookCredential', data);
  }

  useEffect(() => {
    if (phone.trim() == '') {
      return setError(true);
    }
    if (phone.length < 10) {
      return setError(true);
    }
    setError(false);
  }, [phone]);

  const otpCall = async (phoneNumber: number) => {
    setfocused(true);
    // console.log("New number >> $$ ", phoneNumber.phoneNumber)
    setLoading(true);
    getOtp({ mobile: countryCode + phoneNumber }, setLoading)
      .then(res => {
        console.log('res::', res.data);
        if (res.data.status) {
          return props.navigation.navigate('EnterCode', {
            phoneNumber: phoneNumber,
            countryCode,
          });
        }
        showErrorMessage(res.data.message);
      })
      .catch(err => {
        showErrorMessage(err?.data?.message);
      });
  };

  return (
    <SafeContainer
      style={{
        flex: 1,
        backgroundColor: Colors.cardBg,
      }}
    >
      <Formik
        validationSchema={loginSchema}
        initialValues={{ phoneNumber: '' }}
        onSubmit={E => {
          otpCall(E);
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isValid,
        }) => (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : ''}
          >
            <CountryPicker
              lang="en"
              show={show}
              pickerButtonOnPress={item => {
                setCountryCode(item.dial_code);
                setShow(false);
                console.log(item.dial_code);
              }}
              onBackdropPress={() => setShow(false)}
              style={{
                modal: {
                  height: '60%',
                  backgroundColor: Colors.cardBg,
                },
                textInput: {
                  paddingHorizontal: 12,
                  height: 48,
                  color: Colors.title,
                  backgroundColor: Colors.bgLight,
                },
                dialCode: {
                  fontFamily: Fonts.fontRegular,
                  color: Colors.title,
                },
                countryName: {
                  fontFamily: Fonts.fontRegular,
                  color: Colors.text,
                },
                countryButtonStyles: {
                  height: 50,
                  backgroundColor: Colors.cardBg,
                  borderRadius: 0,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.borderColor,
                  marginBottom: 0,
                },
              }}
            />
            <View style={{ flex: 1 }}>
              <ScrollView>
                <View style={commonStyle.container}>
                  <BackButton navigation={props.navigation} />
                  {/* <USER width="100%" height="100%"/> */}
                  {/* <CustomText style={{...FONTS.h3,color:Colors.title,marginBottom:20}}>Please Enter your Phone Number</CustomText> */}
                  <CustomText
                    text="Please Enter Your Phone Number"
                    style={commonStyle.headingtextBold}
                    className=" mb-[20]"
                  />
                  <View>
                    <View
                      style={[
                        styles.inputStyle,
                        {
                          borderColor: Colors.borderColor,
                          backgroundColor: Colors.inputColor,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => setShow(true)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingRight: 8,
                          // backgroundColor:Colors.inputColor
                          // borderWidth:1,
                          height: '100%',
                          // width:'100%'
                          paddingVertical: 5,
                          paddingLeft: 15,
                        }}
                      >
                        <CustomText
                          style={{
                            fontFamily: Fonts.fontRegular,
                            fontSize: 20,
                            color: Colors.title,
                          }}
                        >
                          {countryCode}
                        </CustomText>
                        <FeatherIcon
                          style={{ marginLeft: 2 }}
                          color={Colors.title}
                          size={18}
                          name="chevron-down"
                        />
                      </TouchableOpacity>

                      <TextInput
                        style={{
                          fontFamily: Fonts.fontRegular,
                          fontSize: 20,
                          color: Colors.title,
                          flex: 1,
                          top: 0,
                          borderLeftWidth: 1,
                          borderLeftColor: Colors.borderColor,
                          paddingVertical: 5,
                          paddingLeft: 12,
                          // backgroundColor:Colors.inputColor
                          paddingRight: 15,
                        }}
                        autoFocus
                        onChangeText={handleChange('phoneNumber')}
                        // onBlur={handleBlur('phoneNumber')}
                        value={values.phoneNumber}
                        keyboardType="number-pad"
                        placeholder="Phone number"
                        placeholderTextColor={Colors.textLight}
                      />
                    </View>
                    {errors.phoneNumber && touched.phoneNumber && (
                      <CustomText
                        style={[commonStyle.errorText, { marginLeft: 10 }]}
                      >
                        {errors.phoneNumber}
                      </CustomText>
                    )}
                  </View>
                </View>
              </ScrollView>
            </View>
            {/* <View
                            style={{
                                paddingHorizontal: 45,
                                paddingVertical: 35,
                            }}
                        >
                            <GradientBtn
                                onPress={() => { handleSubmit(values.phoneNumber) }}
                                title={'Continue'}
                                isLoading={loading}
                            />
                        </View> */}
            {/* <View className='absolute bottom-[30] w-full'> */}
            <FloatingBtn
              title={'Continue'}
              isLoading={loading}
              onPress={handleSubmit}
            />

            {/* </View> */}
          </KeyboardAvoidingView>
        )}
      </Formik>
    </SafeContainer>
  );
};

export default Login;

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

export const screenOptions = {
  headerShown: false,
};
