import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  StyleSheet,
} from 'react-native';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Colors from '../../constant/colors';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { commonStyle } from '../../constant/commonStyle';
import CustomText from '../../components/customText';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import BackButton from '../../components/backButton';
import { getBlockuserList, unblockUser } from '../../services/api';
import { Image } from 'react-native';
import GradientBtn from '../../components/gradientBtn';
import {
  formatDateString,
  formatDateStringWithTime,
  formatDateStringmsg,
} from '../../constant/veriables';
import Fonts from '../../constant/fonts';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { showErrorMessage, showSuccessMessage } from '../../services/alerts';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { UserProfileData } from '../../contexts/userDetailscontexts';
const maxDate = new Date();
maxDate.setFullYear(maxDate.getFullYear() - 18);

const height = Dimensions.get('window').height;

const BlockedUserList = (props: any) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(
    () => [`${((Platform.OS == 'ios' ? 530 : 480) / height) * 100}%`],
    [],
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [blockUserList, setBlockUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState<any>();
  const [unblockLoading, setUnblockLoading] = useState(false);
  const {
    userDetails: { _id: my_id, ...rest },
    setUserDetails,
    getMessages,
  } = useContext(UserProfileData);
  useEffect(() => {
    setLoading(true);
    getBlockuserList()
      .then((res: any) => {
        if (res?.data?.status) {
          setBlockUserList(res?.data?.users);
        }
      })
      .catch((err: any) => {
        console.log('err in block list ', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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

  const UnblockUser = () => {
    setUnblockLoading(true);
    unblockUser({ id: selectedUser?._id })
      .then(res => {
        console.log('res in unblock ic c', res);
        if (res?.data?.status) {
          bottomSheetModalRef?.current?.close?.();
          showSuccessMessage('User has been unblocked.');
          setBlockUserList(state =>
            state.filter((item: any) => item._id != selectedUser?._id),
          );
          getMessages();
          return;
        }
        showErrorMessage('Unable to unblock user');
      })
      .catch(err => {
        console.log('errerrerr', err);
        showErrorMessage('Unable to unblock user');
      })
      .finally(() => {
        setTimeout(() => {
          setUnblockLoading(false);
        }, 500);
      });
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
              backgroundColor: 'transparent',
              marginHorizontal: 10,
              overflow: 'hidden',
            }}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={20}
              style={{ flex: 1 }}
            >
              <View className="flex-1 rounded pb-10 bg-white ">
                <View className="bg-white flex-1  pb-10 rounded-[12px] pt-[15] ">
                  <View
                    className=""
                    style={{
                      paddingHorizontal: 15,
                      borderBottomWidth: 1,
                      borderColor: Colors.borderColor,
                      paddingVertical: 12,
                      paddingTop: 45,
                    }}
                  >
                    <View style={styles.blockImage}>
                      <Image
                        source={
                          selectedUser?.media && {
                            uri: selectedUser?.media?.mediaUrl,
                          }
                        }
                        className="w-24 h-24 mb-5 rounded-full  "
                      />
                    </View>
                    <CustomText
                      style={[
                        { color: Colors.title, fontFamily: Fonts.fontSemiBold },
                        styles.alignAllCenetr,
                        commonStyle.headingtextBold,
                      ]}
                      className="pb-[10] "
                    >
                      {'Unblock ' +
                        selectedUser?.user_details?.[0]?.first_name +
                        '?'}
                    </CustomText>
                    <View style={{ marginHorizontal: 10, marginTop: 10 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          marginBottom: 8,
                        }}
                      >
                        <MaterialCommunityIcons
                          style={{ opacity: 1, zIndex: 10 }}
                          name={'account-eye-outline'}
                          size={23}
                        />
                        <CustomText
                          style={[
                            {
                              color: Colors.title,
                              fontFamily: Fonts.fontSemiBold,
                              alignItems: 'flex-start',
                              flex: 1,
                            },
                            ,
                            commonStyle.mediumSmallText,
                          ]}
                          className="pb-[10] pl-[10] "
                        >
                          User will be able to see your profile and send you
                          request.
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
                          name={'notifications-off-outline'}
                          size={23}
                        />
                        <CustomText
                          style={[
                            {
                              color: Colors.title,
                              fontFamily: Fonts.fontSemiBold,
                              alignItems: 'flex-start',
                              flex: 1,
                            },
                            commonStyle.mediumSmallText,
                          ]}
                          className="pb-[10] pl-[10]"
                        >
                          They won't be notified that you unblocked them.
                        </CustomText>
                      </View>
                    </View>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 15,
                      flexDirection: 'row',
                      width: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: 15,
                    }}
                  >
                    <View className="flex-1">
                      <GradientBtn
                        isLoading={unblockLoading}
                        onPress={() => {
                          UnblockUser();
                        }}
                        title={'Unblock '}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>
          </BottomSheetModal>
          <View className="flex-1">
            <ScrollView
              contentContainerStyle={blockUserList?.length == 0 && { flex: 1 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={[commonStyle.container, { flex: 1 }]}>
                <BackButton navigation={props.navigation} />
                <CustomText
                  customeStyle={commonStyle.headingtextBold}
                  text={'Blocked Users List'}
                />
                <View className="flex-1">
                  {blockUserList.map((data: any) => {
                    return (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                          bottomSheetModalRef?.current?.present?.();
                          setSelectedUser(data);
                        }}
                        className="border-b-borderColor  bordewqr border-b  py-3 mt-[10]"
                      >
                        <View
                          className={` items-center  border-borderColor bg-white w-full  rounded-full flex-row `}
                        >
                          <View className=" items-center justify-center ">
                            <Image
                              style={{
                                height: 57,
                                width: 57,
                                borderRadius: 999,
                              }}
                              source={
                                data?.media && { uri: data.media?.mediaUrl }
                              }
                            />
                          </View>

                          <View className="flex-row items-center   ml-[12]   justify-between flex-1 pr-1.5">
                            <View className=" flex-1  justify-center pr-3">
                              <CustomText
                                text={`${data?.user_details?.[0]?.first_name} ${data?.user_details?.[0]?.last_name}`}
                                className=""
                                style={[
                                  commonStyle.regulartextBold,
                                  { fontFamily: Fonts.fontBold, fontSize: 18 },
                                ]}
                                ellipsizeMode={true}
                                numberOfLines={1}
                              />
                              <CustomText
                                text={formatDateStringmsg(data?.timestamp)}
                                className=""
                                style={[
                                  commonStyle.smalltext,
                                  { color: Colors.grey },
                                ]}
                              />
                            </View>
                            <View className="flex-row   h-[25]">
                              <CustomText
                                text={`Tap to unblock`}
                                className=""
                                style={[
                                  commonStyle.regulartext,
                                  { color: Colors.primary },
                                ]}
                              />
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                  {blockUserList?.length == 0 && (
                    <View
                      style={{
                        width: '100%',
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Image
                        style={{ height: 200, width: 200, marginBottom: 20 }}
                        resizeMode="contain"
                        source={require('../../assets/png/noBlock.png')}
                      />
                      <CustomText
                        text="No Blocked Users"
                        style={[
                          commonStyle.smalltextBold,
                          { textAlign: 'center', marginBottom: 25 },
                        ]}
                      />
                    </View>
                  )}
                  {loading && (
                    <View
                      style={[
                        StyleSheet.absoluteFill,
                        {
                          flex: 1,
                          overflow: 'hidden',
                          backgroundColor: Colors.white,
                        },
                      ]}
                    >
                      <SkeletonPlaceholder borderRadius={4}>
                        <SkeletonPlaceholder.Item style={{ paddingTop: 20 }}>
                          {Array(25)
                            .fill('')
                            .map((_, index) => {
                              return (
                                <SkeletonPlaceholder.Item
                                  flexDirection="row"
                                  marginVertical={10}
                                  alignItems="center"
                                >
                                  <SkeletonPlaceholder.Item
                                    width={60}
                                    height={60}
                                    borderRadius={50}
                                  />
                                  <SkeletonPlaceholder.Item marginLeft={20}>
                                    <SkeletonPlaceholder.Item
                                      width={220}
                                      height={20}
                                    />
                                    <SkeletonPlaceholder.Item
                                      marginTop={6}
                                      width={80}
                                      height={20}
                                    />
                                  </SkeletonPlaceholder.Item>
                                </SkeletonPlaceholder.Item>
                              );
                            })}
                        </SkeletonPlaceholder.Item>
                      </SkeletonPlaceholder>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
          </View>
        </BottomSheetModalProvider>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    position: 'absolute',
    width: '100%',
    height: 250,

    top: 0,
    left: 0,
    backgroundColor: 'indigo',
  },
  circle: {
    width: '100%',
    paddingTop: 250,
    borderRadius: 20,

    position: 'relative',
    top: -40,

    flex: 1,
    marginBottom: -40,
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
  },
});

export default BlockedUserList;
