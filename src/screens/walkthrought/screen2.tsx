import {
  View,
  Text,
  Image,
  Platform,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../../constant/colors';
import CustomText from '../../components/customText';
import { commonStyle } from '../../constant/commonStyle';
import Fonts from '../../constant/fonts';

const Screen2 = (props: any) => {
  const [height, setHeight] = useState(0);
  const viewRef = useRef<any>(null);
  const { width } = Dimensions.get('window');

  const imageAnim = useRef(new Animated.Value(-500)).current;
  const textAnim = useRef(new Animated.Value(500)).current;
  const buttonAnim = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(imageAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(textAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(buttonAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);
  }, []);

  const onLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setHeight(height);
  };

  return (
    <SafeAreaView edges={['top']} className="bg-white flex-1 ">
      <View className={`flex-1 bg-white `}>
        <View className="pb-[0]  px-8 pt-12  justify-between ">
          <Animated.View style={{ transform: [{ translateX: textAnim }] }}>
            <View>
              <View className="flex-row">
                <CustomText
                  style={[
                    commonStyle.headingtextBold,
                    {
                      fontSize:
                        Platform.OS == 'android' ? 30 : width >= 414 ? 30 : 26,
                    },
                  ]}
                >
                  Connect through
                </CustomText>
                <CustomText
                  style={[
                    commonStyle.headingtextBold,
                    {
                      fontSize:
                        Platform.OS == 'android' ? 30 : width >= 414 ? 30 : 26,
                    },
                    { color: Colors.primary },
                  ]}
                >
                  {' '}
                  stories
                </CustomText>
              </View>
              <View className="mt-[20]">
                <CustomText
                  style={[
                    commonStyle.headingtextBold,
                    {
                      fontSize:
                        Platform.OS == 'android' ? 30 : width >= 414 ? 30 : 26,
                    },
                    { color: Colors.primary },
                  ]}
                >
                  Discover and Meet
                  <CustomText
                    style={[
                      commonStyle.headingtextBold,
                      {
                        fontSize:
                          Platform.OS == 'android'
                            ? 30
                            : width >= 414
                            ? 30
                            : 26,
                      },
                    ]}
                  >
                    {' '}
                    new
                  </CustomText>
                </CustomText>
                <CustomText
                  style={[
                    commonStyle.headingtextBold,
                    {
                      fontSize:
                        Platform.OS == 'android' ? 30 : width >= 414 ? 30 : 26,
                    },
                  ]}
                >
                  people around...
                </CustomText>
              </View>
            </View>
          </Animated.View>
        </View>

        <Animated.View
          onLayout={onLayout}
          style={{ transform: [{ translateX: imageAnim }] }}
          className="flex-1 pr-14 justify-end"
        >
          <Image
            style={{ maxHeight: height }}
            className="w-full h-full"
            resizeMode="stretch"
            source={require('../../assets/png/welcome2.png')}
          />
        </Animated.View>

        <Animated.View style={{ transform: [{ translateY: buttonAnim }] }}>
          <TouchableOpacity
            onPress={() => props.navigation.navigate('Screen3')}
            style={{ alignSelf: 'flex-end', paddingBottom: 10 }}
            className={`pr-8 absolute bottom-[10] `}
          >
            <LinearGradient
              colors={[Colors.gradient1, Colors.gradient2]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: 50,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 30,
                paddingHorizontal: 0,
                width: 120,
                flexDirection: 'row',
                gap: 5,
              }}
            >
              <CustomText
                style={{
                  fontFamily: Fonts.fontSemiBold,
                  color: Colors.white,
                  fontSize: 20,
                }}
              >
                Next
              </CustomText>
              <FontAwesome6
                color={Colors.white}
                size={19}
                name="arrow-right-long"
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default Screen2;
