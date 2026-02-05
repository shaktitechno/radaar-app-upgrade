import React, { JSX, useState } from 'react';
import { TouchableOpacity, Text, Platform, ImageBackground, View, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constant/colors';
import Fonts from '../constant/fonts';
// import { Image } from 'react-native-svg';
// import { COLORS } from '../constant/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Image } from 'react-native';
import CustomText from './customText';
import DropShadow from 'react-native-drop-shadow';

interface GradientBtnProps {
    title: string;
    textStyle?: TextStyle;
    onPress: () => void;
    gradient?: string[];
    icon?: string
    isLoading?: boolean;
    style?: ViewStyle;
    containerStyle?: ViewStyle;
    disable?:boolean | undefined
  }
const GradientBtn = ({ title, onPress, gradient, icon, isLoading ,style,disable, textStyle, containerStyle}:GradientBtnProps):JSX.Element => {
    return (
        <TouchableOpacity
            activeOpacity={.8}
            style={[{backgroundColor:'transparent'},style]}
            onPress={() => onPress && onPress()}
            disabled={isLoading || disable}
        >
            <DropShadow
                style={[{
                    shadowColor:gradient && gradient?.length > 0 ? gradient[0] :  Colors.primary,
                    shadowOffset: {
                        width: 0,
                        height: 5,
                    },
                    shadowOpacity: .5,
                    shadowRadius: 12,
                }, Platform.OS === 'ios' && {
                    backgroundColor: Colors.primary,
                    borderRadius: 30,
                }]}
            >
                <LinearGradient
                    colors={gradient ? gradient : [Colors.gradient1, Colors.gradient2]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={{
                        height: 50,
                        alignItems: 'center',
                        justifyContent: 'center',
                        // paddingHorizontal: 20,
                        borderRadius: 30,
                        // borderWidth:1,
                        ...containerStyle,
                    }}
                >
                    {/* <View style={{ flexDirection: 'row' }}>
                        {icon == 'chat' && <Ionicons style={{ marginRight: 5 }} size={25} color={Colors.white} name='chatbubble-ellipses-outline' />}
                        {title && <CustomText style={{
                            fontSize: 18,
                            fontFamily: Fonts.fontSemiMedium,
                            color: Colors.white,
                            top: 1,
                        }}>{title}</CustomText>}

                    </View> */}
                    <View style={{ flexDirection: 'row',alignItems:'center',marginBottom:4}}>
                        {isLoading ? (
                            <ActivityIndicator size="small" color={Colors.white} />
                        ) : (
                            <>
                                {icon === 'chat' && (
                                        <Image tintColor={Colors.white} source={require('../assets/png/chat.png')} style={{ width: 20, height: 20 ,marginRight:10}} />
                                )}
                                {title && (
                                    <CustomText
                                        style={{
                                            fontFamily: Fonts.fontRegular, color: Colors.white , fontSize:20,
                                            top: 1,
                                            ...textStyle
                                        }}
                                    >
                                        {title}
                                    </CustomText>
                                )}
                            </>
                        )}
                    </View>

                </LinearGradient>

            </DropShadow>
        </TouchableOpacity>
    );
};



export default GradientBtn;