import React from 'react';
import { Text, View } from 'react-native';
import FeatherIcon from "react-native-vector-icons/Feather";
import CustomInput from './customInput';
import GradientBtn from './gradientBtn';
import Colors from '../constant/colors';
import { commonStyle } from '../constant/commonStyle';
import Fonts from '../constant/fonts';
import CustomText from './customText';

const LocationSheet = () => {

    return (
        <>
            <View style={{
                    paddingHorizontal:15,
                    borderBottomWidth:1,
                    borderColor:Colors.borderColor,
                    paddingVertical:12,
                }}>
                    <CustomText style={{color:Colors.title,fontFamily:Fonts.fontSemiBold}}>Location</CustomText>
            </View>
            <View style={commonStyle.container}>
                <View style={{marginBottom:15}}>
                    <CustomInput
                        icon={<FeatherIcon style={{opacity:1,zIndex:10}} name={'map-pin'} size={20} color={Colors.themeBlack}/> }
                        value={'2300 Traverwood Dr.Ann Arbor, MI 48105 United States'}    
                        placeholder={'Emai'}
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

export default LocationSheet;