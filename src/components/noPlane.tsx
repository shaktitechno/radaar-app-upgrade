import React, {useState} from 'react';
import {Modal, View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType, Platform, Dimensions} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Make sure to install this package
import Colors from '../constant/colors';

import CustomText from './customText';
import Fonts from '../constant/fonts';
import LinearGradient from 'react-native-linear-gradient';
import GradientBtn from './gradientBtn';

const Images : any={
    Chat :require('../assets/png/message_popup.png'),
    Swipes:require('../assets/png/swipe_img.png'),
    Hotspot:require('../assets/png/radar.png'),
    Call:require('../assets/png/no-call.png'),
}

const PopupModal = ({imgKey,isVisible, onClose,title,navigation,subTitle,progressPress,btnTitle,hideBtn}: any) => {

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            
            onRequestClose={onClose}>
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPressOut={onClose}>
                <View style={{position: "absolute", bottom: Platform.OS == "android"? 10 : 20, width: "92%",borderWidth:2,overflow:'hidden'}}>
                    <LinearGradient start={{ x: 0, y: 1 }}
                         end={{ x: 1, y: 1 }} style={styles.popup} colors={[
                        "#FFEBE3", "#FFFFFF"
                    ]}>
                    {/* <Image resizeMode="contain" style={{width:imgKey== 'Call' ? 800 : 150,height:imgKey==  'Call' ? 80 : 150,marginBottom:20}} source={Images[imgKey]} /> */}
                    <CustomText style={styles.title} text={title}></CustomText>
                    <CustomText style={{textAlign: "center", marginBottom: 20, marginTop: 10, fontFamily: Fonts.fontSemiBold}} text={subTitle}></CustomText>

                    <View style={{width:'100%'}}>
                        <GradientBtn
                            onPress={()=>{
                                if(progressPress){
                                    progressPress()
                                }else{
                                    onClose()
                                    navigation?.navigate?.('Subscriptions',{})
                                }
                            }}
                            isLoading={false}
                            textStyle={{fontFamily: Fonts.fontSemiBold}}
                            title={btnTitle ? btnTitle:'View Plans'  }
                        />
                    </View>
                    {!hideBtn &&
                        <TouchableOpacity onPress={onClose} style={styles.buttonSecondary}>
                            <Text style={styles.buttonSecondaryText}>
                                Close
                            </Text>
                        </TouchableOpacity>
                    }
                  {/* {hideBtn && 
                    <View style={{position: "absolute",top:-200,}}>
                        <Image source={require("../assets/gif/Confetti.gif")} style={{ width: Dimensions.get("screen").width, height: Dimensions.get("screen").height}} />
                    </View>} */}
                    </LinearGradient>
                    {/* <Icon
                        name="error-outline"
                        size={24}
                        color="#FFCC00"
                        style={styles.icon}
                    /> */}
                    
                </View>
            </TouchableOpacity>
            
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "'rgba(0,0,0,0.8)'",
    },
    popup: {
        borderRadius: 10,
        padding: 20,
        paddingVertical: 50,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        // position: "absolute",
        // bottom: 10
        // borderWidth:1
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', // Dimmed background
    },
    icon: {
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontFamily: Fonts.fontBold,
        marginBottom: 5,
        color:Colors.black,
        textAlign:"center"

    },
    description: {
        fontSize: 14,
        // color: 'gray',
        marginBottom: 20,
        color:Colors.black,
        textAlign:"center"
    },
    buttonPrimary: {
        backgroundColor: '#FF3B30',
        padding: 10,
        borderRadius: 5,
        width: '100%',
        marginBottom: 10,
    },
    buttonPrimaryText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    buttonSecondary: {
        // No background color for a text-only button
        padding: 10,
        marginTop:5
    },
    buttonSecondaryText: {
        color: Colors.dark,
        fontFamily: Fonts.fontBold,
        textAlign: 'center',
        fontSize: 18
    },
});

export default PopupModal;
