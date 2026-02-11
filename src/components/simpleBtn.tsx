import React, { useState } from 'react';
import { TouchableOpacity, Text, Platform, ImageBackground, View, ActivityIndicator } from 'react-native';
import DropShadow from 'react-native-drop-shadow';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constant/colors';
import Fonts from '../constant/fonts';
// import { Image } from 'react-native-svg';
// import { COLORS } from '../constant/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Image } from 'react-native';
// interface GradiantProps = {
//     title: string;
//     Onpress: function;
//     title: string;
//     title: string;
// }
const SimpleBtn = ({ title, onPress, gradient, icon, isLoading ,style,disable}: any) => {
    return (
        <TouchableOpacity
            activeOpacity={.8}
            style={[{backgroundColor:'transparent'},style]}
            onPress={() => onPress && onPress()}
            disabled={isLoading || disable}
        >
            <View
                style={{
                    // elevation:10,
                    borderRadius:30,
                    // backgroundColor:Colors.white,
                    // shadowColor: 'rgba(0,0,0,)', // IOS
                    // shadowOffset: { height: 1, width: 1 }, // IOS
                    // shadowOpacity: 1, // IOS
                    // shadowRadius: 2, //IOS
                }}
            >
                <LinearGradient
                    colors={gradient ? gradient : [Colors.white, Colors.white]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={{
                        height: 50,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 20,
                        borderRadius: 30,
                        borderWidth:1,
                        borderColor:Colors.primary,
                    }}
                >
                   
                    <View style={{ flexDirection: 'row',alignItems:'center', }}>
                        {isLoading ? (
                            <ActivityIndicator size="small" color={Colors.white} />
                        ) : (
                            <>
                                {icon === 'chat' && (
                                        <Image tintColor={Colors.white} source={require('../assets/png/chat.png')} style={{ width: 20, height: 20 ,marginRight:10}} />
                              
                                )}
                                {title && (
                                    <Text
                                        style={{
                                            fontFamily: Fonts.fontRegular, fontSize:20,
                                            color: Colors.primary,
                                            top: 1,
                                        }}
                                    >
                                        {title}
                                    </Text>
                                )}
                            </>
                        )}
                    </View>

                </LinearGradient>

            </View>
        </TouchableOpacity>
    );
};

export default SimpleBtn;