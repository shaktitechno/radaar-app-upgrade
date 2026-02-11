import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { ICONS } from '../constant/iconsTheme';



import Colors from '../constant/colors';
import Fonts from '../constant/fonts';

const CustomInput = forwardRef<any,any>((props,ref) => {

    const [passwordShow , setPasswordShow ] = useState(true);
    const inputRef = useRef<any>()
    const handndleShowPassword = () => {
        setPasswordShow(!passwordShow);
    }

    useImperativeHandle(ref, () => ({
        childfocus: () => {
            inputRef.current.focus()
        },
    }));

    return (
        <>
            <View style={{position:'relative',justifyContent:'center'}}>
                
                <TextInput
                    maxLength={props.maxLength && props.maxLength }
                    ref={inputRef}
                    secureTextEntry={props?.type === "password" ? passwordShow : false}
                    style={[{
                        fontSize:18,
                        borderWidth:1,
                        color:Colors.title,
                        borderColor:Colors.borderColor,
                        borderRadius:35,
                        paddingVertical:12,
                        paddingHorizontal:15,
                        backgroundColor:Colors.inputColor,
                        fontFamily:Fonts.fontRegular,
                    }, props?.icon && {
                        paddingLeft:50,
                    },props?.inputLg && {
                        paddingVertical:18,
                    },props?.inputSm && {
                        paddingVertical:7,
                    },props?.inputRounded && {
                        borderRadius:30,
                    },props?.inputBorder && {
                        borderWidth:0,
                        borderBottomWidth:1,
                        borderRadius:0,
                        textAlignVertical:'center'
                    },props?.style && props?.style]}
                    placeholderTextColor={Colors.textLight}
                    placeholder={props?.placeholder}
                    onChangeText={props?.onChangeText}
                    value={(props.value == '' || props.value) &&  props?.value}
                    defaultValue={props?.defaultValue && props?.defaultValue}
                    multiline={props?.multiline || false}
                    onChange={props?.onChange &&props?.onChange }
                    onFocus={props?.onFocus && props?.onFocus}
                    onBlur={props?.onBlur && props?.onBlur}
                    numberOfLines={props?.numberOfLines && props?.numberOfLines}
                    inputMode={props?.inputMode && props?.inputMode}
                />
                {props?.type === "password" &&
                    <TouchableOpacity
                        accessible={true}
                        accessibilityLabel="Password"
                        accessibilityHint="Password show and hidden"
                        onPress={() => handndleShowPassword()}
                        style={styles.eyeIcon}>
                        <SvgXml
                            xml={passwordShow ? ICONS.eyeClose : ICONS.eyeOpen}
                        />
                    </TouchableOpacity>
                }
            <View style={{
                    position:'absolute',
                    left:20,
                    //top:16,
                }}>
                    {props?.icon && props?.icon}
            </View>
            </View>
        </>
    );
})

const styles = StyleSheet.create({
    
    eyeIcon:{
        position:'absolute',
        height:50,
        width:50,
        alignItems:'center',
        justifyContent:'center',
        right:0,
        zIndex:1,
        top:0,
    }
})

export default CustomInput;