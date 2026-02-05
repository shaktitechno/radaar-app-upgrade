import { View, Text, Image, Platform, Animated, Easing } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import LinearGradient from 'react-native-linear-gradient';

import CustomText from '../../components/customText';

import { TouchableOpacity } from 'react-native';
import Fonts from '../../constant/fonts';
import Colors from '../../constant/colors';
import { commonStyle } from '../../constant/commonStyle';

const Screen1 = (props: any) => {
  const imageAnim = useRef(new Animated.Value(-500)).current;
  const textAnim = useRef(new Animated.Value(500)).current;
  const buttonAnim = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    Animated.stagger(300, [
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
  }, []);

  return (
    <SafeAreaView edges={['top']} className="bg-white flex-1 ">
      <View className={`flex-1  bg-white px-8 pt-12`}>
        <Animated.View
          style={{ transform: [{ translateX: imageAnim }] }}
          className="flex-[.77] justify-center items-center"
        >
          <Image
            className="w-full h-full"
            resizeMode="contain"
            resizeMethod="resize"
            source={require('../../assets/png/welcome1.png')}
          />
        </Animated.View>
        <View className=" pt-[10] flex-[.21] justify-between">
          <Animated.View
            style={{ transform: [{ translateX: textAnim }] }}
            className="flex-1"
          >
            <CustomText
              style={[commonStyle.headingtextBold, { color: Colors.primary }]}
            >
              Find your match, Connect
            </CustomText>
            <CustomText style={commonStyle.headingtextBold}>
              with people near you...
            </CustomText>
          </Animated.View>
          <Animated.View style={{ transform: [{ translateY: buttonAnim }] }}>
            <TouchableOpacity
              onPress={() => props.navigation.navigate('Screen2')}
              style={{ alignSelf: 'flex-end', paddingBottom: 10 }}
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
      </View>
    </SafeAreaView>
  );
};

export default Screen1;
