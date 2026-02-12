import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import RBSheet from 'react-native-raw-bottom-sheet';
import { Divider, List } from 'react-native-paper';
// import Header from '../layout/Header';
import PhoneNumberSheet from '../../components/phoneNumberSheet';
import EmailSheet from '../../components/emailSheet';
import LocationSheet from '../../components/locationSheet';
import GenderSheet from '../../components/genderSheetSettings';
import Colors from '../../constant/colors';
import { commonStyle } from '../../constant/commonStyle';
import GradientBtn from '../../components/gradientBtn';
import {
  CommonActions,
  ParamListBase,
  RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
import { showErrorMessage, showSuccessMessage } from '../../services/alerts';
import {
  deletUser,
  getSignupData,
  logoutApi,
  submitSettings,
} from '../../services/api';
import CustomText from '../../components/customText';
import Fonts from '../../constant/fonts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackButton from '../../components/backButton';
import SimpleBtn from '../../components/simpleBtn';
import { SignupDataContext } from '../../contexts/signUpcontexts';
import { removeStorage, socket } from '../../services/apiConfig';
import { useRecoilState } from 'recoil';

import { UserProfileData } from '../../contexts/userDetailscontexts';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

import { onUserLogout } from '../../contexts/callingContaxt';
import RNRestart from 'react-native-restart';

import {
  locationPermissions,
  requestPermission,
} from '../../services/permissions';
import { useChatState } from '../../recoil/atoms/chatData';
import { chatData } from '../../recoil/atoms/types';
import { useAuthToken } from '../../recoil/atoms/authToken';

const Settings = (props: {
  route: RouteProp<ParamListBase, string>;
  navigation: any;
}) => {
  const { signupState, setSignupState } = useContext(SignupDataContext);

  const settingSheet = useRef();
  const genderSheet = useRef();
  const deletPopup = useRef();
  const logoutPopup = useRef<any>();
  const [sheetType, setSettingSheet] = useState();
  const [genderData, setGenderData] = useState([]);
  const { getProfile, userDetails, setUserDetails } =
    useContext(UserProfileData);
  const [activeGender, setGender] = useState('');
  const [distanceVal, setDistanceVal] = useState([
    userDetails?.distance_preference,
  ]);
  const [ageValue, setAgeValue] = useState(userDetails?.age_range);
  const [laoding, setLoadiung] = useState(false);
  const [genderLoading, setGenderLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [city, setCity] = useState('');
  const setMessages = (value: chatData) =>
    useChatState.setState({ chatState: value });
  const setToken = useAuthToken(state => state.setAuthToken);

  useEffect(() => {
    locationPermissions(setLocationPermission);
  }, []);

  const Features = [
    'Unlimited likes',
    'Beeline',
    'Advanced filters',
    'Incognito mode',
    'Travel mode',
    '5 SuperSwipes a week',
    '1 Spotlight a week',
    'Unlimited Extends',
    'Unlimited Rematch',
    'Unlimited Backtrack',
  ];

  const getData = (gender: any) => {
    getSignupData().then(res => {
      // console.log(res)
      if (res?.data?.status) {
        if (gender) {
          setGenderData(res?.data?.data?.gender);
          setGender(
            res?.data?.data?.gender?.filter(
              item => item?.value == userDetails?.interested_in,
            )[0]?.name,
          );
          setGenderLoading(false);
        } else {
          setSignupState(res?.data?.data);
          setUserDetails({});
        }
        return;
      }
      showErrorMessage(res.data.message);
    });
  };

  const deletUserfunc = () => {
    setLoadiung(true);
    deletUser()
      .then(res => {
        console.log('resresresresresresres', res.data);
        if (Platform.OS == 'ios') {
          // console.log(Platform.OS)
          PushNotificationIOS?.removeAllPendingNotificationRequests();
          PushNotificationIOS?.removeAllDeliveredNotifications();
          PushNotification?.cancelAllLocalNotifications();
        } else {
          PushNotification?.cancelAllLocalNotifications();
        }

        if (res?.data?.status) {
          showSuccessMessage('Account deleted successfully');
          if (socket) {
            socket.disconnect();
          }
          getData(null);

          setToken('');
          onUserLogout();
          setMessages({ loading: false, data: [] });
          removeStorage().then(res => {
            console.log(res);
            RNRestart.restart();
            setLoadiung(false);
          });
          return;
        }
        setLoadiung(false);
        showErrorMessage(res?.data?.message || 'Something Went Wrong');
      })
      .catch(err => {
        setLoadiung(false);
        console.log(err);
        showErrorMessage(err?.data?.message || 'Something Went Wrong');
      });
  };

  const logout = () => {
    logoutPopup?.current?.close();
    if (Platform.OS == 'ios') {
      PushNotificationIOS?.removeAllPendingNotificationRequests();
      PushNotificationIOS?.removeAllDeliveredNotifications();
      PushNotification?.cancelAllLocalNotifications();
    } else {
      PushNotification?.cancelAllLocalNotifications();
    }
    setMessages({ loading: false, data: [] });
    logoutApi().then(res => {
      if (Platform.OS == 'ios') {
        console.log(Platform.OS);
        PushNotificationIOS?.removeAllPendingNotificationRequests();
        PushNotification?.cancelAllLocalNotifications();
      } else {
        PushNotification?.cancelAllLocalNotifications();
      }
      getData();
      if (socket) {
        socket.disconnect();
      }
      showSuccessMessage('Logout successfully');
      props.navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'SocialLogin' }],
        }),
      );
      setToken('');
      onUserLogout();

      removeStorage().then(res => {
        RNRestart.restart();
        setLoadiung(false);
      });
    });
  };

  useFocusEffect(
    useCallback(() => {
      getData(true);
    }, []),
  );

  function onSave(gender?: any, distance?: any, age) {
    const distan = distance || distanceVal[0];
    const genData = gender || activeGender;
    const ageData = age || ageValue;
    setSaveLoading(true);
    submitSettings({
      interested_in: genderData?.filter(item => item?.name == genData)[0]
        ?.value,
      age_range: ageData,
      distance_preference: distan,
    })
      .then(res => {
        showSuccessMessage(res?.data?.message);
        setSaveLoading(false);
        console.log('data save ', getProfile());
        getProfile();
      })
      .catch(() => {});
  }
  return (
    <>
      <RBSheet
        ref={settingSheet}
        height={240}
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
        {sheetType == 'phoneNumber' ? (
          <PhoneNumberSheet />
        ) : sheetType == 'email' ? (
          <EmailSheet />
        ) : sheetType == 'location' ? (
          <LocationSheet />
        ) : (
          <></>
        )}
      </RBSheet>
      <RBSheet
        ref={deletPopup}
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
            Are you sure you want to delete account?
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
              isLoading={laoding}
              onPress={() => {
                deletUserfunc();
              }}
              title={'Delete'}
            />
          </View>
          <View className="flex-1">
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                deletPopup.current.close();
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
            {/* <GradientBtn
                            onPress={() => {
                                deletPopup.current.close();
                            }}
                            title={'Cancel'}
                        /> */}
          </View>
        </View>
      </RBSheet>
      <RBSheet
        ref={logoutPopup}
        height={Platform.OS == 'ios' ? 160 : 150}
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
            Are you sure want to logout?
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
              isLoading={laoding}
              onPress={logout}
              title={'Logout'}
            />
          </View>
          <View className="flex-1">
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                logoutPopup?.current?.close();
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
          </View>
        </View>
      </RBSheet>
      <RBSheet
        ref={genderSheet}
        height={300}
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
        <GenderSheet
          default={
            genderData?.filter(
              item => item?.value == userDetails?.interested_in,
            )[0]?.name
          }
          genderData={genderData}
          activeGender={(gender: any) => {
            onSave(gender);
            genderSheet.current.close();
            setGender(gender);
          }}
        />
      </RBSheet>

      <SafeAreaView
        style={{
          flex: 1,
        }}
      >
        <ScrollView>
          <View style={commonStyle.container}>
            <BackButton navigation={props.navigation} />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <CustomText
                style={[
                  commonStyle.headingtextBold,
                  { color: Colors.dark, marginBottom: 15 },
                ]}
              >
                Account Settings
              </CustomText>
            </View>

            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate('BlockedUserList');
              }}
              style={[
                commonStyle.card,
                {
                  backgroundColor: Colors.cardBg,
                  borderColor: Colors.borderColor,

                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                },
              ]}
            >
              <CustomText
                style={{
                  color: Colors.title,
                  fontFamily: Fonts.fontBold,
                }}
              >
                Blocked Users
              </CustomText>
              <FeatherIcon size={18} color={Colors.text} name="chevron-right" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Linking.openURL('https://hotspotmeet.com.au/privacy-policy/');
              }}
              style={[
                commonStyle.card,
                {
                  backgroundColor: Colors.cardBg,
                  borderColor: Colors.borderColor,

                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                },
              ]}
            >
              <CustomText
                style={{
                  color: Colors.title,
                  fontFamily: Fonts.fontBold,
                }}
              >
                Privacy Policy
              </CustomText>
              <FeatherIcon size={18} color={Colors.text} name="chevron-right" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Linking.openURL('https://hotspotmeet.com.au/contact-us/');
              }}
              style={[
                commonStyle.card,
                {
                  backgroundColor: Colors.cardBg,
                  borderColor: Colors.borderColor,

                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                },
              ]}
            >
              <CustomText
                style={{
                  color: Colors.title,
                  fontFamily: Fonts.fontBold,
                }}
              >
                Contact Us
              </CustomText>
              <FeatherIcon size={18} color={Colors.text} name="chevron-right" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Linking.openURL('https://hotspotmeet.com.au/terms-conditions/');
              }}
              style={[
                commonStyle.card,
                {
                  backgroundColor: Colors.cardBg,
                  borderColor: Colors.borderColor,

                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                },
              ]}
            >
              <CustomText
                style={{
                  color: Colors.title,
                  fontFamily: Fonts.fontBold,
                }}
              >
                Terms & Conditions
              </CustomText>
              <FeatherIcon size={18} color={Colors.text} name="chevron-right" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Linking.openURL(
                  'https://hotspotmeet.com.au/frequently-asked-questions/',
                );
              }}
              style={[
                commonStyle.card,
                {
                  backgroundColor: Colors.cardBg,
                  borderColor: Colors.borderColor,

                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                },
              ]}
            >
              <CustomText
                style={{
                  color: Colors.title,
                  fontFamily: Fonts.fontBold,
                }}
              >
                FAQs
              </CustomText>
              <FeatherIcon size={18} color={Colors.text} name="chevron-right" />
            </TouchableOpacity>
          </View>
        </ScrollView>
        <View
          style={{
            paddingHorizontal: 15,
            paddingVertical: 10,
            gap: 10,
          }}
        >
          <SimpleBtn
            onPress={() => {
              logoutPopup?.current?.open();
            }}
            title={'Logout'}
          />

          <GradientBtn
            onPress={() => {
              deletPopup.current.open();
            }}
            title={'Delete My Account'}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  headerArea: {
    flexDirection: 'row',
    paddingTop: 15,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
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
  actionBtn: {
    height: 50,
    width: 50,
    borderRadius: 50,
    backgroundColor: Colors.primayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileArea: {
    paddingBottom: 40,
    paddingHorizontal: 15,
  },
  profileProgress: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 2,
  },
  priceListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
});

export default Settings;
