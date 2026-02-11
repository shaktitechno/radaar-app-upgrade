import React from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import FeatherIcon from 'react-native-vector-icons/Feather';
import GradientBtn from './gradientBtn';
import { commonStyle } from '../constant/commonStyle';
import Colors from '../constant/colors';
import Fonts from '../constant/fonts';
import CustomText from './customText';

const PhoneNumberSheet = () => {


    const countriesWithFlags = [
        {title: '+971'},
        {title: '+61'},
        {title: '+91'},
        {title: '+1'},
    ];

    return (
        <>
            <View style={{
                    paddingHorizontal:15,
                    borderBottomWidth:1,
                    borderColor:Colors.borderColor,
                    paddingVertical:12,
                }}>
                    <CustomText style={{color:Colors.title,fontFamily:Fonts.fontSemiBold}}>Phone Number</CustomText>
            </View>
            <View style={commonStyle.container}>
                <View style={[commonStyle.inputStyle,{borderColor:Colors.borderColor}]}>   
                    <View
                        style={{
                            flexDirection:'row',
                            alignItems:'center',
                        }}
                    >
                        <SelectDropdown
                            data={countriesWithFlags}
                            defaultValue={countriesWithFlags[0]}
                            onSelect={(selectedItem, index) => {}}
                            buttonStyle={{
                                padding:0,
                                backgroundColor:'transparent',
                                width:102,
                                paddingRight:0,
                                height:24,
                            }}
                            renderDropdownIcon={() => {
                                return <FeatherIcon size={16} color={Colors.textLight} name='chevron-down'/>
                            }}
                            renderCustomizedButtonChild={(selectedItem, index) => {
                                return (
                                <View style={{flexDirection:'row'}}>
                                   
                                    <CustomText  style={{color:Colors.title,top:1}}>{selectedItem ? selectedItem.title : '000'}</CustomText>
                                </View>
                                );
                            }}
                            dropdownStyle={{
                                width:100,
                                borderRadius:4,
                            }}
                            rowStyle={{
                                height:40,
                                borderBottomColor:Colors.borderColor,
                            }}
                            renderCustomizedRowChild={(item, index) => {
                                return (
                                    <View style={{flexDirection:'row',paddingHorizontal:10}}>
                                        {/* <View
                                            style={{
                                                borderWidth:1,
                                                borderColor:Colors.borderColor,
                                                overflow:'hidden',
                                                marginRight:6,
                                            }}
                                        >
                                           
                                        </View> */}
                                        <CustomText style={{color:Colors.title}}>{item.title}</CustomText>
                                    </View>
                                );
                            }}
                        />
                    </View>

                    <TextInput
                        style={{
                            fontSize:16,
                            color:Colors.title,
                            flex:1,
                            top:0,
                            borderLeftWidth:1,
                            borderLeftColor:Colors.borderColor,
                            paddingVertical:0,
                            paddingLeft:12,
                        }}
                        defaultValue='+00 0540 4705'
                        keyboardType='number-pad'
                        placeholder='Phone number'
                        placeholderTextColor={Colors.textLight}
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

export default PhoneNumberSheet;