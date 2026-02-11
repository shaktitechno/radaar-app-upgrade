import React, { useCallback, useContext, useEffect, useState } from 'react';
import { FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Fonts from '../../constant/fonts';
import Colors from '../../constant/colors';
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import {  getUsersWhoLikedMe, getmyMatches } from '../../services/api';
import { calculateAge } from '../../constant/veriables';
import { commonStyle } from '../../constant/commonStyle';
import EmptyCard from '../../components/empatyCard';
import { UserProfileData } from '../../contexts/userDetailscontexts';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import PopupModal from '../../components/noPlane';
const Matches = ({ navigation ,activeTabIndex}: any) => {
    const {userDetails:currentUserData,setUserDetails} =useContext(UserProfileData)
    const [loading,setLoading]=useState<boolean>(true)
    const [LikedData,setLikedData] = useState<Array<any>>([])
    const [page,setPage]= useState(1)
    const [refresh,setRefreshing] = useState(false)
    const [visible,setVisible] = useState(false)

    const getData = (refresh?:boolean)=>{
        getmyMatches({page:refresh ? 1 : page})
        .then(res=>{
            if(refresh){
                setPage(1)
                setRefreshing(false)
            }
            setTimeout(() => {
                setLoading(false)
            }, 800);
            setLikedData(res?.data?.matches)
        })
        .catch(err=>{
            setLoading(false)
        })
    }
    useEffect(() => {
        if(page == 1){return }
        getData(false)
    },[page])
    useFocusEffect(useCallback(()=>{
        getData(true)
    },[activeTabIndex]))
    return (
        <>
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: Colors.white,
                    // borderWidth:1
                }}
            >
                <View 
                    style={{flex:1}}
                >
                   
                    <View
                        style={styles.container}
                    >
                        <View style={styles.row}>
                            <FlatList
                                style={{flex:1}}
                                data={LikedData}
                                // bounces={true}
                                contentContainerStyle={LikedData?.length == 0 && {flex:1}}
                                onRefresh={()=>{;getData(true);setRefreshing(true)}}
                                refreshing={refresh}
                                onEndReached={()=>setPage(state=>Number(state)+1)}
                                initialNumToRender={10}
                                onEndReachedThreshold={0.9}
                                showsVerticalScrollIndicator={false}
                                numColumns={2}  
                                keyExtractor={(item)=>item._id}
                                renderItem={({item:data,index})=>{
                                    return (
                                        <View key={index} className='px-1 w-1/2 mb-[10]'>
                                            <View
                                               
                                                // style={[styles.col50]}
                                                className='flex-1'
                                                key={index}
                                            >
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        // Object.keys(currentUserData?.plan_details).length == 0 ? 
                                                        // setVisible(true):
                                                        navigation.navigate('OtherUserProfile',{user_id:data._id})
                                                    }
                                                >
                                                    <Image
                                                        // blurRadius={Object.keys(currentUserData?.plan_details).length == 0 ? 20 : 0}
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
                                                        {/* {Object.keys(currentUserData?.plan_details).length > 0 && <Text style={{ fontFamily: Fonts.fontRegular, color: Colors.white }}>{data.first_name + ' ' + data.last_name }</Text>} */}
                                                        <Text style={{ fontFamily: Fonts.fontRegular, color: Colors.white }}>{data.first_name + ' ' + data.last_name }</Text>
                                                        <Text style={{ fontFamily: Fonts.fontRegular, color: Colors.white, opacity: .75 }} numberOfLines={1}>{calculateAge(data.dob) + ' Years Old'}</Text>
                                                    </LinearGradient>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )
                                }}
                                ListEmptyComponent={()=>
                                    <View style={commonStyle.center}>
                                        <EmptyCard
                                            text='No Matches Yet' 
                                            mydetails={undefined}                                        />
                                    </View>
                                }
                            />
                        </View>
                    </View>
                    {loading &&
                        <View style={[StyleSheet.absoluteFill,{flex:1,overflow:'hidden',marginHorizontal:5,backgroundColor:Colors.white}]}>
                            <SkeletonPlaceholder borderRadius={10} >
                                <SkeletonPlaceholder.Item style={{flexDirection:'row',flexWrap:'wrap'}}   >
                                    {Array(12).fill('').map((_,index)=>{
                                        return(
                                            <SkeletonPlaceholder.Item width={'50%'} padding={10} >
                                                <SkeletonPlaceholder.Item style={{margin:0}} height={220} width={'100%'}/>
                                            </SkeletonPlaceholder.Item>
                                        )
                                    })}
                                </SkeletonPlaceholder.Item>
                            </SkeletonPlaceholder>
                        </View>
                    }
                </View>
                <PopupModal 
                    navigation={navigation} 
                    isVisible={visible} 
                    imgKey='Swipes' 
                    title={"You're killing it!"}
                    subTitle={'Keep the pace going! \n You never know you might find match on next swipe 😉'}
                    onClose={()=>setVisible(false)} 
                />
               
            </SafeAreaView>
        </>
    );
};
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
        flex:1                
    },
    row: {
        // flexDirection: 'row',
        // marginHorizontal: -10,
        // flexWrap: 'wrap',
        flex:1  ,
        paddingTop:20
        // borderWidth:2
        // ,borderColor:'red'              
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
        padding: 10,
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
    }
})
export default Matches;