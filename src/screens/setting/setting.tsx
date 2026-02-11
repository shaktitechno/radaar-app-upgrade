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
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import RBSheet from 'react-native-raw-bottom-sheet';

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

import PushNotificationIOS from '@react-native-community/push-notification-ios';

import { onUserLogout } from '../../contexts/callingContaxt';
import PushNotification from 'react-native-push-notification';
import RNRestart from 'react-native-restart';
import PhoneNumberSheet from '../../components/phoneNumberSheet';
import EmailSheet from '../../components/emailSheet';
import LocationSheet from '../../components/locationSheet';
import GenderSheet from '../../components/genderSheetSettings';
import { useAuthToken } from '../../recoil/atoms/authToken';
import { useChatState } from '../../recoil/atoms/chatData';
import { chatData } from '../../recoil/atoms/types';

const Settings = (props: {
  route: RouteProp<ParamListBase, string>;
  navigation: any;
}) => {
  const { signupState, setSignupState } = useContext(SignupDataContext);
  const { width } = Dimensions.get('screen');
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
   const setMessages = (value: chatData) =>
      useChatState.setState({ chatState: value });
   const setToken = useAuthToken(state => state.setAuthToken);
 
 

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
        if (Platform.OS == 'ios') {
        
          PushNotificationIOS?.removeAllPendingNotificationRequests();
          PushNotificationIOS?.removeAllDeliveredNotifications();
          PushNotification?.cancelAllLocalNotifications();
        } else {
          PushNotification?.cancelAllLocalNotifications();
        }
        // console.log(res)
        if (res?.data?.status) {
          showSuccessMessage('Account deleted successfully');
          if (socket) {
            socket.disconnect();
          }
          getData(null);
         
          setToken('');
          onUserLogout();
          setMessages({ loading: false, data: [] });
          // AsyncStorage.clear()
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
      // console.log(Platform.OS)
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
      // AsyncStorage.clear()
      removeStorage().then(res => {
        RNRestart.restart();
        setLoadiung(false);
      });
    });
  };

  useFocusEffect(
    useCallback(() => {
      getData(true);
      getProfile();
    }, []),
  );

  function onSave(gender?: any, distance?: any, age?: any) {
    // console.log(age , ageValue)
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
        // console.log('data save ', res?.data)
        getProfile();
        if (res.data.status) {
          props.navigation.goBack();
        }
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
        height={160}
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
          <CustomText
            style={{
              color: Colors.title,
              fontFamily: Fonts.fontSemiBold,
            }}
          >
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
            marginTop: 30,
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
            <GradientBtn
              onPress={() => {
                deletPopup.current.close();
              }}
              title={'Cancel'}
            />
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
            <GradientBtn
              onPress={() => {
                logoutPopup?.current?.close();
              }}
              title={'Cancel'}
            />
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
            // onSave(gender);
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
                Preferences
              </CustomText>
            </View>

            <CustomText
              text="Distance"
              style={[
                {
                  color: Colors.lightText,
                  fontFamily: Fonts.fontBold,
                  fontSize: 15,
                },
              ]}
              className="mx-2 mb-[10]"
            />
            <View
              style={[
                commonStyle.card,
                {
                  backgroundColor: Colors.cardBg,
                  borderColor: Colors.borderColor,
                  paddingBottom: 5,
                  marginBottom: 8,
                },
              ]}
            >
              <View
                style={{
                  paddingBottom: 8,
                  marginBottom: 5,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.borderColor,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <CustomText
                  style={{
                    color: Colors.title,
                    fontFamily: Fonts.fontBold,
                  }}
                >
                  Maximum Distance
                </CustomText>
                <CustomText
                  style={{
                    color: Colors.title,
                    fontFamily: Fonts.fontBold,
                  }}
                >
                  {distanceVal[0]} Km
                </CustomText>
              </View>
              <MultiSlider
                trackStyle={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'rgba(142,165,200,.3)',
                }}
                selectedStyle={{
                  backgroundColor: Colors.primary,
                }}
                values={distanceVal}
                markerStyle={{
                  backgroundColor: Colors.white,
                  top: 1,
                  height: 16,
                  width: 16,
                  borderWidth: 3,
                  borderColor: Colors.primary,
                }}
                onValuesChange={val => {
                  setDistanceVal(val);
                }}
                onValuesChangeFinish={(values: any) => {}}
                sliderLength={width - 60}
                min={1}
                max={userDetails?.setting?.[0]?.values || 100}
              />
            </View>
            <CustomText
              text="Who you want to date ?"
              style={[
                {
                  color: Colors.lightText,
                  fontFamily: Fonts.fontBold,
                  fontSize: 15,
                },
              ]}
              className="mx-2 mt-[10] mb-[10]"
            />
            <View
              style={[
                commonStyle.card,
                {
                  backgroundColor: Colors.cardBg,
                  borderColor: Colors.borderColor,
                  paddingBottom: 5,
                  marginBottom: 8,
                },
              ]}
            >
              {genderData?.length > 0 && (
                <GenderSheet
                  default={
                    genderData?.filter(
                      item => item?.value == userDetails?.interested_in,
                    )[0]?.name
                  }
                  genderData={genderData}
                  activeGender={(gender: any) => {
                    genderSheet.current.close();
                    setGender(gender);
                  }}
                />
              )}
            </View>
            <CustomText
              text="Age"
              style={[
                {
                  color: Colors.lightText,
                  fontFamily: Fonts.fontBold,
                  fontSize: 15,
                },
              ]}
              className="mx-2 mt-[10] mb-[10]"
            />
            <View
              style={[
                commonStyle.card,
                {
                  backgroundColor: Colors.cardBg,
                  borderColor: Colors.borderColor,
                  paddingBottom: 5,
                  marginBottom: 60,
                },
              ]}
            >
              <View
                style={{
                  paddingBottom: 8,
                  marginBottom: 5,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.borderColor,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <CustomText
                  style={{
                    color: Colors.title,
                    fontFamily: Fonts.fontBold,
                  }}
                >
                  Age Range
                </CustomText>
                <CustomText
                  style={{ color: Colors.title, fontFamily: Fonts.fontBold }}
                >
                  {ageValue[0]}-{ageValue[1]}
                </CustomText>
              </View>
              <MultiSlider
                trackStyle={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'rgba(142,165,200,.3)',
                }}
                selectedStyle={{
                  backgroundColor: Colors.primary,
                }}
                values={ageValue}
                markerStyle={{
                  backgroundColor: Colors.white,
                  top: 1,
                  height: 16,
                  width: 16,
                  borderWidth: 3,
                  borderColor: Colors.primary,
                }}
                onValuesChange={val => setAgeValue(val)}
                sliderLength={width - 60}
                min={18}
                max={100}
              />
            </View>
          </View>
        </ScrollView>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <GradientBtn
            style={{ position: 'absolute', bottom: 10, width: '90%' }}
            onPress={onSave}
            title={'Save'}
            isLoading={saveLoading}
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
