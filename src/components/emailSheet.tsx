import React from 'react';
import { Text, View } from 'react-native';
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import CustomInput from '../components/customInput';
import GradientBtn from '../components/gradientBtn';
import { commonStyle } from '../constant/commonStyle';
import Colors from '../constant/colors';
import Fonts from '../constant/fonts';
import CustomText from './customText';

const EmailSheet = () => {

    return (
        <>
            <View style={{
                    paddingHorizontal:15,
                    borderBottomWidth:1,
                    borderColor:Colors.borderColor,
                    paddingVertical:12,
                }}>
                    <CustomText style={{color:Colors.title,fontFamily:Fonts.fontSemiBold}}>Email Address</CustomText>
            </View>
            <View style={commonStyle.container}>
                <View style={{marginBottom:15}}>
                    <CustomInput
                        icon={<MaterialIcon style={{opacity:1,zIndex:10}} name={'email'} size={20} color={Colors.themeBlack}/> }
                        value={'yourname@gmail.com'}    
                        placeholder={'Email'}
                        onChangeText={(value:string)=> console.log(value)}
                        
                    />
                </View>
                <View
                    style={{
                        paddingHorizontal:15,
                    }}
                >
                    <GradientBtn onPress={()=>{}} title={'Save'}/>
                </View>
            </View>
        </>
    );
};

export default EmailSheet;