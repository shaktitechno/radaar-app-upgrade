import React, { useContext, useEffect, useRef } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Fonts from '../constant/fonts';
import Colors from '../constant/colors';
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import { calculateAge } from '../constant/veriables';
import { SwipeRow } from 'react-native-swipe-list-view';
import { UserProfileData } from '../contexts/userDetailscontexts';

const LikeSwipeCard = ({dislike,index,indexKey:key,data,setIndex,navigation,setVisible}:any) => {
    const {userDetails:currentUserData,setUserDetails} =useContext(UserProfileData)
    const ref= useRef<any>()
    useEffect(()=>{
        if(index != key){
            ref?.current?.closeRow?.()
        }
    },[index,key])


    return (
        <View className={`w-1/2 px-1 mb-[10] ${index == key && 'z-10'}`}  >
            <SwipeRow
                ref={ref}
                leftOpenValue={75}
                rightOpenValue={-75}
                stopLeftSwipe={80}
                stopRightSwipe={-80}
                swipeToClosePercent={75}
                swipeGestureEnded={(swipeKey,data)=>{
                    // console.log('hello',swipeKey,data)
                }}
                swipeGestureBegan={()=>setIndex(key)}
                style={{flex:1,}}
            >
            <View style={styles.standaloneRowBack}>
                    <View className='flex-1 rounded-[10px] overflow-hidden'>
                        <TouchableOpacity
                            activeOpacity={.9}
                            style={{
                                height:35,
                                backgroundColor:'rgba(255,74,92,.15)',
                                borderRadius:10,
                                borderWidth:1,
                                borderColor:'rgba(255,74,92,.25)',
                                alignItems:'center',
                                justifyContent:'center',
                                flex:1,

                            }}
                            onPress={()=>{
                                dislike(data?._id,'left')
                            }}
                        >
                            <Entypo name='cross' size={25} color={Colors.red}/>
                        </TouchableOpacity>
                    </View>
                    <View  className='flex-1 rounded-[10px] overflow-hidden'>
                        <TouchableOpacity
                            activeOpacity={.9}
                            style={{
                                height:35,
                                backgroundColor:'rgba(186,112,255,.15)',
                                borderRadius:10,
                                borderWidth:1,
                                borderColor:'rgba(186,112,255,.25)',
                                alignItems:'center',
                                justifyContent:'center',
                                flex:1,
                            }}
                            onPress={()=>{
                                dislike(data?._id,'right')
                            }}
                            >
                            <AntDesign name='heart' size={18} color={'#BA70FF'} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View
                    style={[styles.col50, ]}
                    key={index}
                >
                    <TouchableOpacity
                        onPress={() =>
                            Object.keys(currentUserData?.plan_details).length == 0 ? 
                            setVisible(true):
                            navigation.navigate('OtherUserProfile',{user_id:data._id})
                        }
                    >
                        <Image
                            blurRadius={Object.keys(currentUserData?.plan_details).length == 0 ? 20 : 0}
                            style={{
                                width: '100%',
                                height: 220,
                                borderRadius: 10,
                            }}
                            source={{uri:data?.media?.[0]?.mediaUrl}}
                        />
                        <LinearGradient
                            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,.7)']}
                            style={{
                                position: 'absolute',
                                height: '100%',
                                width: '100%',
                                top: 0,
                                borderRadius: 10,
                                paddingHorizontal: 15,
                                paddingVertical: 15,
                                justifyContent: 'flex-end',
                            }}
                        >
                            {Object.keys(currentUserData?.plan_details).length > 0 && <Text style={{ fontFamily: Fonts.fontRegular, color: Colors.white }}>{data.first_name + ' ' + data.last_name }</Text>}
                            <Text style={{ fontFamily: Fonts.fontRegular, color: Colors.white, opacity: .75 }} numberOfLines={1}>{calculateAge(data.dob) + ' Years Old'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                </View>
            </SwipeRow>
    </View>
    )
}


const styles = StyleSheet.create({
    headerArea: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 15,
        // borderBottomWidth: 1,
    },
    headerBtn: {
        height: 48,
        width: 48,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    homeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    container: {
        paddingHorizontal: 15,
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '100%',
        // borderWidth:2,
        flex:1                  
    },
    row: {
        // flexDirection: 'row',
        // marginHorizontal: -10,
        // flexWrap: 'wrap',
        // borderWidth:1,
        flex:1,
        marginTop:20
    },
    col33: {
        width: '33.33%',
        paddingHorizontal: 5,
    },
    col66: {
        width: '66.67%',
        paddingHorizontal: 5,
    },
    col50: {
        borderRadius:10,
        width: '100%',
        // padding: 10,
        backgroundColor:Colors.white
    },
    col100: {
        width: '100%',
        paddingHorizontal: 5,
    },
    card: {
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
    },
    shadow: {
        shadowColor: "rgba(0,0,0,.5)",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: .30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    standaloneRowBack: {
        alignItems: 'center',
        // backgroundColor: '#8BC645',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        // padding: 15,
        // borderWidth
        // height:220
    },
    backTextWhite: {
        color: '#FFF',

    },
})

export default LikeSwipeCard