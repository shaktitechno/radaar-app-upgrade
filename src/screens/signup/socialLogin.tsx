import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  CommonActions,
  ParamListBase,
  RouteProp,
} from '@react-navigation/native';
import Colors from '../../constant/colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CustomText from '../../components/customText';
import { commonStyle } from '../../constant/commonStyle';
import PopupModal from '../../components/noPlane';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRecoilState } from 'recoil';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { AccessToken, LoginManager, Settings } from 'react-native-fbsdk-next';
import { UserProfileData } from '../../contexts/userDetailscontexts';
import {
  getToken,
  initializeSocket,
  socket,
} from '../../services/apiConfig';
import { getMyProfile, googleSocialLogin } from '../../services/api';
import { showSuccessMessage } from '../../services/alerts';
import Fonts from '../../constant/fonts';
import { useAuthToken } from '../../recoil/atoms/authToken';

const SocialLogin = (props: {
  route: RouteProp<ParamListBase, string>;
  navigation: any;
}) => {
  const [visible, setVisible] = useState(false);
  // const [token, setToken] = useRecoilState(authToken);
  const [res, setResponse] = useState<any>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const setToken = useAuthToken(state => state.setAuthToken);
  const { setUserDetails, getMessages } = useContext(UserProfileData);

  const tokenCall = async () => {
    await getToken();
  };

  useEffect(() => {
    tokenCall();
  }, []);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '959857594400-4nj1c4j7lma3jl2ggij6thbhc9nis0nd.apps.googleusercontent.com',
    });
    // Settings.setAppID('1306494930033830')
    // Settings.initializeSDK();
  }, []);
  async function onGoogleButtonPress() {
    // Check if your device supports Google Play
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
    } catch (e) {
      console.log('Play services error', e);
      return;
    }
    // Get the users ID token
    try {
      const res = await GoogleSignin.signIn();
      const data = { loginType: 'Google', res };
      googleSocialLogin(data, setLoading).then(res => {
        setToken(res?.data?.token);
        console.log('gooogle login ',res.data)
        AsyncStorage.setItem('Token', res?.data?.token);
        setGoogleLoading(false);
        if (res?.data?.IsprofileComplete) {
          initializeSocket(res?.data?.token);
          // getFCMToken()

          if (socket) {
            socket.on('connected', (response: any) => {
              console.log(
                '+========================================> connected',
                response,
                socket?.id,
              );
            });
          }
          // getALLChatUsers()
          // .then(res => {
          //     setMessages({loading:false,data:res?.data?.chats})
          // })
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

          // // return props.navigation.navigate('MyTabs')
          props.navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'MyTabs' }],
            }),
          );

          return;
        }

        if (res?.data?.status) {
          console.log("in the status:")
          // props.navigation.dispatch(
          //   CommonActions.reset({
          //     index: 0,
          //     routes: [{ name: 'FirstName' }],
          //   }),
          // );
        }
        console.log(res?.data);
        if (res?.data?.userDetails?.is_user_active == false) {
          setResponse(res?.data?.userDetails);
          setVisible(true);
          return;
        }
        // props.navigation.navigate('FirstName')
        showSuccessMessage(res?.data?.message || 'Login Successful');
      });
    } catch (err) {
      console.log('errin google login', err);
      setGoogleLoading(false);
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      {/* <LinearGradient
                colors={[Colors.white, Colors.white]}
                style={{
                    flex: 1,
                }}
            > */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 40,
          }}
        >
          <Image
            /// style={{width:200, height:130}}
            source={require('../../assets/png/slogo.png')}
          />
          <Text style={styles.headText}>Meet & Connect</Text>
          {/* /Join us with other millions of people and find your best matches. */}
        </View>

        <View className="px-[40] mb-[20] w-full flex-row">
          <View className="flex-1">
            <TouchableOpacity
              onPress={() => {
                console.log('pressed:');
                props.navigation.navigate('Login');
              }}
            >
              <LinearGradient
                colors={[Colors.gradient1, Colors.gradient2]}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255,255,255,1)',
                  alignItems: 'center',
                  // justifyContent: 'center',
                  height: 55,
                  width: '100%',
                  borderRadius: 30,
                  flexDirection: 'row',
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    backgroundColor: Colors.white,
                    height: 46,
                    width: 46,
                    left: 4,
                    borderRadius: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image
                    style={{
                      height: 22,
                      width: 22,
                    }}
                    tintColor={Colors.gradient1}
                    source={require('../../assets/png/phone.png')}
                  />
                </View>
                <View className="flex-1 ml-[-8] justify-center items-center">
                  <Text
                    style={[
                      styles.buttonText,
                      { fontSize: Platform.OS == 'ios' ? 20 : 18 },
                    ]}
                  >
                    Continue with Phone
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onGoogleButtonPress();
                setGoogleLoading(true);
              }}
              style={{
                marginBottom: 10,
              }}
              disabled={googleLoading || appleLoading}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[Colors.gradient1, Colors.gradient2]}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255,255,255,1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 55,
                  width: '100%',
                  borderRadius: 30,
                  flexDirection: 'row',
                }}
              >
                <View
                  style={{
                    backgroundColor: Colors.white,
                    height: 46,
                    width: 46,
                    // position: 'absolute',
                    left: 4,
                    borderRadius: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image
                    style={{
                      height: 22,
                      width: 22,
                    }}
                    source={require('../../assets/png/google.png')}
                  />
                </View>
                <View className="flex-1 ml-[-8] justify-center items-center">
                  {googleLoading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text
                      style={[
                        styles.buttonText,
                        { fontSize: Platform.OS == 'ios' ? 20 : 18 },
                      ]}
                    >
                      Continue with Google
                    </Text>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
            {Platform.OS == 'ios' && (
              <TouchableOpacity
                style={{
                  backgroundColor: Colors.black,

                  alignItems: 'center',
                  // justifyContent: 'center',
                  height: 55,
                  borderRadius: 30,
                  marginBottom: 10,
                  flexDirection: 'row',
                }}
              >
                <View
                  style={{
                    backgroundColor: Colors.black,
                    height: 46,
                    width: 46,
                    // position: 'absolute',
                    left: 40,
                    borderRadius: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AntDesign name="apple1" color={Colors.white} size={22} />
                </View>
                <View className="flex-1 ml-[-8] justify-center items-center">
                  {true ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text
                      style={[
                        styles.buttonText,
                        { fontSize: 20, color: Colors.white },
                      ]}
                    >
                      Continue with Apple
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}

            <CustomText
              className="mt-[20]  text-center"
              style={[commonStyle.smalltextBold, { fontSize: 14 }]}
            >
              By signing in, you agree to our
              {Platform.OS == 'ios' ? (
                <>
                  <TouchableOpacity
                    className={`mt-[-2]`}
                    onPress={() => {
                      Linking.openURL(
                        'https://hotspotmeet.com.au/terms-conditions/',
                      );
                    }}
                  >
                    <Text
                      className=" "
                      style={[
                        commonStyle.smalltextBold,
                        { fontSize: 12, color: Colors.primary },
                      ]}
                    >
                      {' '}
                      T&C{' '}
                    </Text>
                  </TouchableOpacity>
                  and
                  <TouchableOpacity
                    className={`mt-[-2]`}
                    onPress={() => {
                      Linking.openURL(
                        'https://hotspotmeet.com.au/privacy-policy/',
                      );
                    }}
                  >
                    <Text
                      className=""
                      style={[
                        commonStyle.smalltextBold,
                        { fontSize: 12, color: Colors.primary },
                      ]}
                    >
                      {' '}
                      Privacy Policy
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text
                    onPress={() => {
                      Linking.openURL(
                        'https://hotspotmeet.com.au/terms-conditions/',
                      );
                    }}
                    className=" text-center"
                    style={[
                      commonStyle.smalltextBold,
                      { fontSize: 12, color: Colors.primary },
                    ]}
                  >
                    {' '}
                    T&C{' '}
                  </Text>
                  and
                  <Text
                    onPress={() => {
                      Linking.openURL(
                        'https://hotspotmeet.com.au/privacy-policy/',
                      );
                    }}
                    className="text-center"
                    style={[
                      commonStyle.smalltextBold,
                      { fontSize: 12, color: Colors.primary },
                    ]}
                  >
                    {' '}
                    Privacy Policy
                  </Text>
                </>
              )}
            </CustomText>
          </View>
        </View>
      </ScrollView>
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
          setResponse(null);
        }}
        progressPress={() => {
          Linking.openURL('https://hotspotmeet.com.au/contact-us/');
          setVisible(false);
        }}
        btnTitle={'Contact us'}
      />
      {/* </LinearGradient> */}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  buttonText: {
    ...commonStyle.smalltext,
    color: Colors.white,
  },
  headText: {
    fontFamily: Fonts.fontSemiBold,
    fontSize: 20,
    color: Colors.themeBlack,
    textAlign: 'center',
    marginTop: 30,
  },
});

export default SocialLogin;
