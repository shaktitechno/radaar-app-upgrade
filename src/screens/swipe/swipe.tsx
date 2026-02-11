import {
    View,
    SafeAreaView,
    Image,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    Alert,
    Linking,
    Text,
    Platform
} from 'react-native';
import React, {FC, useCallback, useContext, useEffect, useState} from 'react';

import Colors from '../../constant/colors';
import {commonStyle} from '../../constant/commonStyle';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import {ScreenHeight, ScreenWidth} from '@rneui/base';
import GradientBtn from '../../components/gradientBtn';
import CustomText from '../../components/customText';
import Fonts from '../../constant/fonts';
import {
    ParamListBase,
    RouteProp,
    useFocusEffect,
} from '@react-navigation/native';
import {getuserForSwipe} from '../../services/api';
import {showErrorMessage} from '../../services/alerts';
import { UserProfileData } from '../../contexts/userDetailscontexts';
import PopupModal from '../../components/noPlane';
import VersionCheckComp from '../../components/VersionCheckComp';
import Modal from 'react-native-modal';
import MainSlider from '../../components/MainSlider';


const Swipe: FC<any> = (props: {
    route: RouteProp<ParamListBase, string>;
    navigation: any;
}) => {
    
    const [usersLocations, setUsersLocations] = useState<Array<number>>([]);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [match, setmatch] = useState<Array<any>>([]);
    const [empaty, setEmpaty] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [userIndex, setUserIndex] = useState(0);
    const {userDetails,setUserDetails} =useContext(UserProfileData)
    const [visible,setVisible] = useState(false)
    const [visibleCall,setVisibleCall] = useState(false)
    const [visibleCallDetails,setVisibleCallDetails] = useState({name: null, video: false, callId: ''})
    const [istab , setIstab] = useState(false)
    const getUsers = (caalingPage?: number) => {
        setLoading(true);
        getuserForSwipe()
            .then(res => {
                if (caalingPage) {
                    setPage(caalingPage);
                }
                if (res.data.status) {
                    if (res.data.users.length <= 0) {
                        setEmpaty(true);
                    } else {
                        setEmpaty(false);
                    }
                    setUsersLocations(res.data.users);
                } else {
                    showErrorMessage(res?.data?.message);
                }
                setTimeout(() => {
                    setLoading(false);
                }, 1000);
                setUserIndex(0);
            })
            .catch(err => {
                console.log(err);
            });
    };

    useEffect(() => {
        if (page > 1) {
            getUsers();
        }
    }, [page, userDetails?._id]);

    useFocusEffect(
        useCallback(() => {
            console.log("useCallback callijg")
            getUsers(1);
        }, []),
    );
    return (
        <SafeAreaView style={{flex: 1, backgroundColor: Colors.bgLight}}>
          
            <View style={commonStyle.container}>
                <View className="flex-row justify-between items-center  px-1">
                    <View className='flex-row justify-start items-start -mb-5' style={{width:200}}>
                        <Image
                            style={{width:'100%'}}
                            source={require('../../assets/png/iconImage.png')}
                            className="mb-5"
                        />
                    </View>
                    {!userDetails.subscription?.swipes ||( userDetails.subscription?.swipes?.type == 'no_swipes' || (userDetails.subscription?.swipes?.type == 'custom_swipes' && userDetails.subscription?.swipes?.count <=0)) ? (
                        <GradientBtn
                            title={'Out of Swipes'}
                            textStyle={{fontSize: 12}}
                            containerStyle={{height: 30, paddingHorizontal: 25}}
                            onPress={()=>{props?.navigation?.navigate?.('Subscriptions',{})} }
                        />
                    ): (
                        <TouchableOpacity 
                            className="rounded-full w-[10] h-[10] items-center justify-center "
                            style={
                                commonStyle.backshadowButton
                            }
                        onPress={() => props.navigation.navigate('Settings')}>
                            <FontAwesome6
                                name="sliders"
                                size={20}
                                className=" items-center self-center justify-center mb-5 rounded-full "
                            />
                        </TouchableOpacity>

                    
                    )}
                
                   
                </View>
               
            </View>
            <VersionCheckComp/>
            <Modal
                animationIn={'fadeIn'}
                style={{
                    flex: 1,
                    margin: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
                isVisible={modalVisible}
                onBackdropPress={() => {
                    setModalVisible(!modalVisible);
                }}>
                {/* outer view container for modal view */}
                {match?.map((prop, key) => {
                    if (key > 0) return;
                    return (
                        <View
                            key={key}
                            style={{
                                height: ScreenHeight,
                                width: ScreenWidth,
                                borderRadius: 20,
                                justifyContent: 'center',
                                alignItems: 'flex-end',
                            }}>
                            <View
                                style={{
                                    flex: 1,
                                    width: '100%',
                                    backgroundColor: Colors.white,
                                    paddingHorizontal: 20,
                                    justifyContent: 'space-around',
                                    paddingTop:30
                                }}>
                                <View style={{height: 350, marginTop: 90, marginBottom:30}}>
                                    <ImageBackground
                                        source={
                                            prop?.media?.length > 0
                                                ? {
                                                    uri: prop?.media[0]
                                                        ?.mediaUrl,
                                                }
                                                : ''
                                        }
                                        borderRadius={20}
                                        resizeMode="cover"
                                        style={[
                                            styles.imageStyl,
                                            {
                                                alignSelf: 'flex-end',
                                                right: 20,
                                                transform: [{rotate: '10deg'}],
                                            },
                                        ]}>
                                        <TouchableOpacity
                                            onPress={() => {}}
                                            style={[
                                                commonStyle.shadowButton,
                                                {
                                                    marginLeft: 10,
                                                    width: 50,
                                                    height: 50,
                                                    right: 20,
                                                    bottom: 20,
                                                },
                                            ]}>
                                            <ImageBackground
                                                source={require('../../assets/png/filledHeart.png')}
                                                resizeMode="cover"
                                                style={{
                                                    width: 30,
                                                    height: 30,
                                                }}></ImageBackground>
                                        </TouchableOpacity>
                                    </ImageBackground>
                                    <ImageBackground
                                        source={
                                            userDetails?.user_images?.length > 0
                                                ? {
                                                    uri: userDetails
                                                        .user_images[0]
                                                        .mediaUrl,
                                                }
                                                : ''
                                        }
                                        borderRadius={20}
                                        resizeMode="cover"
                                        style={[
                                            styles.imageStyl,
                                            {
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 40,
                                                transform: [{rotate: '-10deg'}],
                                            },
                                        ]}>
                                        <TouchableOpacity
                                            onPress={() => {}}
                                            style={[
                                                commonStyle.shadowButton,
                                                {
                                                    marginLeft: 10,
                                                    width: 50,
                                                    height: 50,
                                                    right: 20,
                                                    bottom: 20,
                                                },
                                            ]}>
                                            <ImageBackground
                                                source={require('../../assets/png/filledHeart.png')}
                                                resizeMode="cover"
                                                style={{
                                                    width: 30,
                                                    height: 30,
                                                }}></ImageBackground>
                                        </TouchableOpacity>
                                    </ImageBackground>
                                </View>
                                <View className="mb-0">
                                    <CustomText
                                        customeStyle={styles.textStyl}
                                        text={`It's a match`}
                                    />
                                </View>
                                <View
                                    style={{flex:1, justifyContent:'center', alignSelf:'center', marginBottom:0,}}
                                    className="">
                                    

                                    <GradientBtn
                                        onPress={() => {
                                            if (match.length > 1) {
                                                setmatch(state =>
                                                    state.filter((elm, key) => {
                                                        return key != 0;
                                                    }),
                                                );
                                                props?.navigation.navigate('OtherUserProfile',{user_id:prop._id})
                                                return;
                                            }
                                            props?.navigation.navigate('OtherUserProfile',{user_id:prop._id})
                                            setmatch([]);
                                            setModalVisible(!modalVisible);
                                            
                                        }}
                                        title={`Say Hi!`}
                                    
                                        textStyle={{fontSize: 20,fontFamily:Fonts.fontBold}}
                                        style={{width:300}}
                                        containerStyle={{height: 40, paddingHorizontal: 0,width:300,marginBottom:0}}
                                    />
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (match.length > 1) {
                                                setmatch(state =>
                                                    state.filter((elm, key) => {
                                                        console.log(
                                                            'testtttttt',
                                                            key != 0,
                                                            key,
                                                        );
                                                        return key != 0;
                                                    }),
                                                );
                                                return;
                                            }
                                            setmatch([]);
                                            setModalVisible(!modalVisible);
                                        }}
                                        className="px-1 items-center mt-5">
                                    
                                        <CustomText
                                            style={[
                                                commonStyle.smalltextBold,
                                                {
                                                    color: Colors.primary,
                                                    fontSize: 16,
                                                    fontWeight: '400',
                                                },
                                            ]}
                                            text="  Keep swiping"
                                        />
                                    </TouchableOpacity>
                                </View>
                                <View className=" justify-center  items-center">
                            
                                </View>
                            </View>
                        </View>
                    );
                })}
            </Modal>
            {loading ? (
                <>
                    <View style={commonStyle.center}>
                        <View className="justify-center items-center">
                            <Image
                                className="w-[250] h-[250]"
                                source={require('../../assets/gif/like.gif')}
                            />
                        </View>
                    </View>
                </>
            ) : (
                <MainSlider
                    setPage={setPage}
                    users={usersLocations}
                    setmatch={setmatch}
                    setModalVisible={setModalVisible}
                    navigation={props.navigation}
                    mydetails={userDetails}
                    empaty={empaty}
                    setLoading={setLoading}
                    currentIndex={userIndex}
                    setCurrentIndex={setUserIndex}
                    setVisible={setVisible}
                    setUserDetails={setUserDetails}
                />
            )}
                <PopupModal 
                    navigation={props.navigation} 
                    isVisible={visible} 
                    imgKey='Swipes' 
                    title={"You're killing it!"}
                    subTitle={'Keep the pace going! \n You never know you might find match on next swipe 😉'}
                    onClose={()=>setVisible(false)} 
                />
                
           
            
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    textStyl: {
        color: Colors.primary,
        fontFamily: Fonts.fontSemiBold,
        textAlign: 'center',
        fontSize: 40,
    },
    imageStyl: {
        width: 170,
        height: 250,
        borderRadius: 50,
    },
});

export default Swipe;
