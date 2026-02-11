import React, { Component, Dispatch, SetStateAction } from 'react';
import {
  Animated,
  Image,
  View,
  PanResponder,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';

import Colors from '../constant/colors';
import CustomText from './customText';
import { commonStyle } from '../constant/commonStyle';
import { AxiosResponse } from 'axios';
import { swipeUserType } from '../constant/types';
import { swipeUser } from '../services/api';

import { calculateAge } from '../constant/veriables';
import EmptyCard from './empatyCard';

type Props = {
  navigation: any;
  users: any;

  setPage: Dispatch<SetStateAction<any>>;
  setmatch: Dispatch<SetStateAction<any>>;
  setModalVisible: Dispatch<SetStateAction<any>>;
  setCurrentIndex: Dispatch<SetStateAction<any>>;
  empaty: boolean;
  mydetails: any;
  setLoading: (parm: boolean) => void;
  currentIndex: any;
  setVisible: any;
  setUserDetails: any;
};
const SIZES = Dimensions.get('screen');
class MainSlider extends Component<Props> {
  position: Animated.ValueXY;
  rotate: any;
  rotateAndTranslate: { transform: any[] };
  likeOpacity: any;
  layerlikeOpacity: any;
  nopeOpacity: any;
  nlayerOpacity: any;
  nextCardOpacity: any;
  nextCardScale: any;

  constructor(props: Props) {
    super(props);
    this.position = new Animated.ValueXY();
    this.state = {
      currentIndex: 0,
      isEmpty: false,
    };
    this.rotate = this.position.x.interpolate({
      inputRange: [-SIZES.width / 2, 0, SIZES.width / 2],
      outputRange: ['-10deg', '0deg', '10deg'],
      extrapolate: 'clamp',
    });
    this.rotateAndTranslate = {
      transform: [
        {
          rotate: this.rotate,
        },
        ...this.position.getTranslateTransform(),
      ],
    };
    this.likeOpacity = this.position.x.interpolate({
      inputRange: [-SIZES.width / 2, 0, SIZES.width / 2],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp',
    });
    this.layerlikeOpacity = this.position.x.interpolate({
      inputRange: [-SIZES.width / 2, 0, SIZES.width / 2],
      outputRange: [0, 0, 0.4],
      extrapolate: 'clamp',
    });
    this.nopeOpacity = this.position.x.interpolate({
      inputRange: [-SIZES.width / 2, 0, SIZES.width / 2],
      outputRange: [1, 0, 0],
      extrapolate: 'clamp',
    });
    this.nlayerOpacity = this.position.x.interpolate({
      inputRange: [-SIZES.width / 2, 0, SIZES.width / 2],
      outputRange: [0.4, 0, 0],
      extrapolate: 'clamp',
    });
    this.nextCardOpacity = this.position.x.interpolate({
      inputRange: [-SIZES.width / 2, 0, SIZES.width / 2],
      outputRange: [1, 0, 1],
      extrapolate: 'clamp',
    });

    this.nextCardScale = this.position.x.interpolate({
      inputRange: [-SIZES.width / 2, 0, SIZES.width / 2],
      outputRange: [1, 0.8, 1],
      extrapolate: 'clamp',
    });
  }

  PanResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onPanResponderMove: (evt, gestureState) => {
      this.position.setValue({ x: gestureState.dx, y: 0 });
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx > 120) {
        if (
          !this?.props?.mydetails?.subscription?.swipes ||
          this?.props?.mydetails?.subscription?.swipes?.type == 'no_swipes' ||
          (this?.props?.mydetails?.subscription?.swipes?.type ==
            'custom_swipes' &&
            this?.props?.mydetails?.subscription?.swipes?.count <= 0)
        ) {
          this.props?.setVisible(true);
          Animated.spring(this.position, {
            toValue: { x: 0, y: 0 },
            friction: 4,
            useNativeDriver: false,
          }).start();
          return;
        }
        if (
          this?.props?.mydetails?.subscription?.swipes?.type == 'custom_swipes'
        ) {
          this.props?.setUserDetails((oldstate: any) => {
            return {
              ...oldstate,
              subscription: {
                ...oldstate?.subscription,
                swipes: {
                  ...oldstate?.subscription?.swipes,
                  count: oldstate?.subscription?.swipes?.count
                    ? oldstate?.subscription?.swipes?.count - 1
                    : 0,
                },
              },
            };
          });
        }
        if (this.props.users.length == this.props.currentIndex + 1) {
          this.props.setLoading(true);
        }

        const data = {
          swipeDirection: 'right',
          swipeeUserId: this?.props?.users[this?.props?.currentIndex]?._id,
        };
        swipeUser(data)
          .then(res => {
            if (res?.data?.status && res?.data?.is_matched) {
              this.props.setmatch((state: any) => [
                ...state,
                res?.data?.SwipeeUserData[0],
              ]);
              this.props.setModalVisible(true);
            }
            if (this.props.users.length == this.props.currentIndex + 1) {
              this.props.setPage((state: number) => state + 1);
              this.props.setCurrentIndex((state: number) => state + 1);
            }
          })
          .catch(err => {
            if (
              this?.props?.mydetails?.subscription?.swipes?.type ==
              'custom_swipes'
            ) {
              this.props?.setUserDetails((oldstate: any) => {
                return {
                  ...oldstate,
                  subscription: {
                    ...oldstate?.subscription,
                    swipes: {
                      ...oldstate?.subscription?.swipes,
                      count: oldstate?.subscription?.swipes?.count
                        ? oldstate?.subscription?.swipes?.count + 1
                        : 1,
                    },
                  },
                };
              });
            }
          });
        Animated.spring(this.position, {
          toValue: { x: SIZES.width + 100, y: gestureState.dy },
          useNativeDriver: false,
        }).start(() => {
          this.props.setCurrentIndex((state: number) => state + 1);
          this.position.setValue({ x: 0, y: 0 });
        });
      } else if (gestureState.dx < -120) {
        if (
          !this?.props?.mydetails?.subscription?.swipes ||
          this?.props?.mydetails?.subscription?.swipes?.type == 'no_swipes' ||
          (this?.props?.mydetails?.subscription?.swipes?.type ==
            'custom_swipes' &&
            this?.props?.mydetails?.subscription?.swipes?.count <= 0)
        ) {
          this.props?.setVisible(true);
          Animated.spring(this.position, {
            toValue: { x: 0, y: 0 },
            friction: 4,
            useNativeDriver: false,
          }).start();
          return;
        }
        if (
          this?.props?.mydetails?.subscription?.swipes?.type == 'custom_swipes'
        ) {
          this.props?.setUserDetails((oldstate: any) => {
            return {
              ...oldstate,
              subscription: {
                ...oldstate?.subscription,
                swipes: {
                  ...oldstate?.subscription?.swipes,
                  count: oldstate?.subscription?.swipes?.count
                    ? oldstate?.subscription?.swipes?.count - 1
                    : 0,
                },
              },
            };
          });
        }
        if (this.props.users.length == this.props.currentIndex + 1) {
          this.props.setLoading(true);
        }

        const data = {
          swipeDirection: 'left',
          swipeeUserId: this?.props?.users[this?.props?.currentIndex]?._id,
        };
        swipeUser(data)
          .then(res => {
            if (this.props.users.length == this.props.currentIndex + 1) {
              this.props.setCurrentIndex((state: number) => state + 1);
              this.props.setPage((state: number) => state + 1);
            }
          })
          .catch(err => {
            if (
              this?.props?.mydetails?.subscription?.swipes?.type ==
              'custom_swipes'
            ) {
              this.props?.setUserDetails((oldstate: any) => {
                return {
                  ...oldstate,
                  subscription: {
                    ...oldstate?.subscription,
                    swipes: {
                      ...oldstate?.subscription?.swipes,
                      count: oldstate?.subscription?.swipes?.count
                        ? oldstate?.subscription?.swipes?.count + 1
                        : 1,
                    },
                  },
                };
              });
            }
          });
        Animated.spring(this.position, {
          toValue: { x: -SIZES.width - 100, y: gestureState.dy },
          useNativeDriver: false,
        }).start(() => {
          this.props.setCurrentIndex((state: number) => state + 1);
          this.position.setValue({ x: 0, y: 0 });
        });
      } else {
        Animated.spring(this.position, {
          toValue: { x: 0, y: 0 },
          friction: 4,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  renderFoods = () => {
    return this.props.users
      .map(
        (
          item: {
            media: any[];
            first_name: any;
            last_name: any;
            dob: string | undefined;
          },
          i: React.Key,
        ) => {
          if (i < this.props.currentIndex) {
            return null;
          } else if (i == this.props.currentIndex) {
            return (
              <Animated.View
                {...this.PanResponder.panHandlers}
                key={i}
                style={[
                  this.rotateAndTranslate,
                  {
                    height: '100%',
                    width: SIZES.width,
                    padding: 10,
                    position: 'absolute',
                  },
                ]}
              >
                <Animated.View
                  style={{
                    opacity: this.likeOpacity,
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    top: 50,
                    left: 40,
                    height: 50,
                    width: 50,
                    borderRadius: 50,
                    backgroundColor: Colors.success,
                    zIndex: 1000,
                  }}
                >
                  <FontAwesome5 size={24} color={Colors.white} name="check" />
                </Animated.View>
                <Animated.View
                  style={{
                    opacity: this.nopeOpacity,
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    top: 50,
                    right: 40,
                    height: 50,
                    width: 50,
                    borderRadius: 50,
                    backgroundColor: Colors.red,
                    zIndex: 1000,
                  }}
                >
                  <FontAwesome5 size={24} color={Colors.white} name="times" />
                </Animated.View>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: Colors.white,
                    borderRadius: 20,
                  }}
                >
                  <Image
                    style={{
                      flex: 1,
                      height: null,
                      width: null,
                      resizeMode: 'cover',
                      borderRadius: 20,
                    }}
                    source={{
                      uri: item?.media?.filter?.(
                        (elm: any) => elm?.mediaType == 'profile',
                      )?.[0]?.mediaUrl,
                    }}
                  />
                  <Animated.View
                    style={{
                      opacity: this.nlayerOpacity,
                      position: 'absolute',
                      height: '100%',
                      width: '100%',
                      top: 0,
                      left: 0,
                      backgroundColor: Colors.red,
                      borderRadius: 20,
                    }}
                  ></Animated.View>
                  <Animated.View
                    style={{
                      opacity: this.layerlikeOpacity,
                      position: 'absolute',
                      height: '100%',
                      width: '100%',
                      top: 0,
                      left: 0,
                      backgroundColor: '#00c37b',
                      borderRadius: 20,
                    }}
                  ></Animated.View>
                  <LinearGradient
                    colors={[
                      'rgba(0,0,0,0)',
                      'rgba(0,0,0,.5)',
                      'rgba(0,0,0,1)',
                    ]}
                    style={{
                      position: 'absolute',
                      height: 200,
                      width: '100%',
                      bottom: 0,
                      borderRadius: 20,
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      flexDirection: 'row',
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        paddingVertical: 20,
                        paddingHorizontal: 20,
                      }}
                    >
                      <CustomText
                        style={[
                          commonStyle.headingtext,
                          { color: Colors.white },
                        ]}
                        text={`${item?.first_name} ${
                          item?.last_name
                        } ${calculateAge(item?.dob)}`}
                      />

                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      ></View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        this.props?.navigation.navigate('OtherUserProfile', {
                          user: item,
                        })
                      }
                      style={{
                        paddingVertical: 20,
                        marginRight: 30,
                      }}
                    >
                      <Entypo
                        size={34}
                        color={Colors.red}
                        name="arrow-with-circle-up"
                      />
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </Animated.View>
            );
          } else {
            return (
              <Animated.View
                {...this.PanResponder.panHandlers}
                key={i}
                style={[
                  {
                    opacity: this.nextCardOpacity,
                    transform: [{ scale: this.nextCardScale }],
                    height: '100%',
                    width: SIZES.width,
                    padding: 10,
                    position: 'absolute',
                  },
                ]}
              >
                <View
                  style={{
                    flex: 1,
                    backgroundColor: Colors.white,
                    borderRadius: 20,
                  }}
                >
                  <Image
                    style={{
                      flex: 1,
                      height: null,
                      width: null,
                      resizeMode: 'cover',
                      borderRadius: 20,
                    }}
                    source={{
                      uri: item?.media?.filter?.(
                        (elm: any) => elm?.mediaType == 'profile',
                      )?.[0]?.mediaUrl,
                    }}
                  />
                  <LinearGradient
                    colors={[
                      'rgba(0,0,0,0)',
                      'rgba(0,0,0,.5)',
                      'rgba(0,0,0,1)',
                    ]}
                    style={{
                      position: 'absolute',
                      height: 200,
                      width: '100%',
                      bottom: 0,
                      borderRadius: 20,
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      flexDirection: 'row',
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        paddingVertical: 20,
                        paddingHorizontal: 20,
                      }}
                    >
                      <CustomText
                        style={[
                          commonStyle.headingtext,
                          { color: Colors.white },
                        ]}
                        text={`${item?.first_name} ${
                          item?.last_name
                        } ${calculateAge(item.dob)}`}
                      />
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      ></View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        this.props?.navigation.navigate('OtherUserProfile', {
                          user: item,
                        })
                      }
                      style={{
                        paddingVertical: 20,
                        marginRight: 30,
                      }}
                    >
                      <Entypo
                        size={34}
                        color={Colors.red}
                        name="arrow-with-circle-up"
                      />
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </Animated.View>
            );
          }
        },
      )
      .reverse();
  };

  render() {
    return (
      <>
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            {this.renderFoods()}
            {this.props.empaty && (
              <EmptyCard mydetails={this.props.mydetails} />
            )}
          </View>
        </View>
      </>
    );
  }
}

export default MainSlider;
