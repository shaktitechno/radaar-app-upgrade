import { View, Text, Image, Platform, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'
import LinearGradient from 'react-native-linear-gradient'
import Colors from '../../constant/colors'
import CustomText from '../../components/customText'
import { commonStyle } from '../../constant/commonStyle'
import Fonts from '../../constant/fonts'
import { CommonActions } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Screen3 = (props: any) => {
    const { width } = Dimensions.get('window')
    
    const imageAnim = useRef(new Animated.Value(-width)).current;
    const textAnim = useRef(new Animated.Value(500)).current;
    const buttonAnim = useRef(new Animated.Value(width)).current;

    useEffect(() => {
        setTimeout(()=>{
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
        },200)
    }, []);

    return (
        <View className={`flex-1 bg-white px-8 `}>
            <View className='flex-1 justify-end '>
                <Animated.View style={[{ transform: [{ translateX: imageAnim }] }]} 
                    className='w-[250] h-[250]  justify-center items-center'>
                    <Image className=' ' resizeMode='contain' source={require('../../assets/png/welcome3.png')} />
                </Animated.View>
                <View className='pb-[20] pt-[10] justify-between '>
                    <Animated.View style={{ transform: [{ translateY: textAnim }] }}>
                        <View>
                            <View className='mt-[20]'>
                                <CustomText style={[commonStyle.headingtextBold, { fontSize: 28 }]}>
                                    We <CustomText style={[commonStyle.headingtextBold, { color: Colors.primary, fontSize: 28 }]}>Don’t access your
                                    </CustomText>
                                </CustomText>
                                <CustomText style={[commonStyle.headingtextBold, { color: Colors.primary }, { fontSize: 28 }]}>location.
                                </CustomText>
                            </View>
                            <View className=''>
                                <CustomText style={[commonStyle.headingtextBold, { fontSize: 28 }]}>
                                    When the application is
                                </CustomText>
                                <CustomText style={[commonStyle.headingtextBold, { fontSize: 28 }]}>
                                    not in use
                                </CustomText>
                            </View>
                            <View className='justify-center items-center mt-[35]'>
                                <CustomText style={[commonStyle.mediumtextBold, { fontSize: 15 }]}>
                                    We respect privacy, your data is safe with us
                                </CustomText>
                            </View>
                        </View>
                    </Animated.View>
                </View>
            </View>
            <Animated.View style={{ transform: [{ translateX: buttonAnim }] }} >
                <TouchableOpacity
                    onPress={() => {
                        props.navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: 'SocialLogin' }],
                            }),
                        )
                        AsyncStorage.setItem('intro', JSON.stringify(true))
                    }}
                    style={{ paddingBottom: 20, width: '100%'}}
                >
                    <LinearGradient
                        colors={[Colors.gradient1, Colors.gradient2]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={{
                            height: 50,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 30,
                            flexDirection: 'row',
                            gap: 5,
                            marginTop: 30,
                            alignSelf: 'flex-end',
                            width: '100%'
                        }}
                    >
                        <CustomText
                            style={{
                                fontFamily: Fonts.fontSemiBold, color: Colors.white, fontSize: 20,
                            }}
                        >
                            Continue
                        </CustomText>
                        <FontAwesome6 color={Colors.white} size={19} name='arrow-right-long' />
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </View>
    )
}

export default Screen3
