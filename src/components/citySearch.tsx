import { View, Text, Modal, Platform, ActivityIndicator, TouchableOpacity, Dimensions, Image } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import Colors from '../constant/colors';
import Entypo from 'react-native-vector-icons/Entypo';
import uuid from 'react-native-uuid';
import {mapboxToken} from "@env"
import axios from 'axios';
import { FlatList } from 'react-native-gesture-handler';
import Octicons from 'react-native-vector-icons/Octicons'
import Feather from 'react-native-vector-icons/Feather'
import CustomText from './customText';
import { commonStyle } from '../constant/commonStyle';
import { socket } from '../services/apiConfig';
import { UserProfileData } from '../contexts/userDetailscontexts';
import { Keyboard } from 'react-native';
import Fonts from '../constant/fonts';
import CustomInput from './customInput';

const CitySearch = (props:any) => {
    const inputref = useRef<any>(null);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [session_token,setSessionToken] =useState(uuid.v4())
    const [suggesionData,setSessitiondata] = useState([])
    const [input,setInput] = useState('')
    const typingTimeoutRef = useRef<any>(null);
    const {userDetails:{_id:my_id,...rest}} =useContext(UserProfileData)
    const [retrive,setRetrive] =useState(false)
    const [focus,setFocus] =useState(false)
    // console.log('visible in modal   sd d sd sd', props)
    useEffect(()=>{
        // console.log('focusfocusfocusfocus',focus)
        if(inputref?.current?.childfocus && !focus){
            setTimeout(() => {
                // console.log('runrunrunrunrunrunrun')
                inputref?.current?.childfocus?.();
                setFocus(true)
            }, 100);
        }
    },[inputref?.current,focus])

    const getSessionData = (input:string) =>{
        if(input.trim() == ''){return setSessitiondata([])}
        setSearchLoading(true)
        const url = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${input.trim()}&language=en&proximity=${props?.mylocation?.longitude},${props?.mylocation?.latitude}&types=city,street,poi,address,neighborhood,region,postcode&limit=10&session_token=${session_token}&access_token=${mapboxToken}`
        // const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${input}.json?limit=10&proximity=${props?.mylocation?.longitude},${props?.mylocation?.latitude}&access_token=${mapboxToken}`
        
        axios.get(url)
            .then(res=>{
                // console.log('res in map search ',res)
                const unique = new Set();
                const arr =  res?.data?.suggestions.filter((obj:any) => {
                  const isDuplicate = unique.has(obj.name);
                  unique.add(obj.name);
                  return !isDuplicate;
                });
                // console.log('res in map search 'arr)
                setSessitiondata(arr)
                setSearchLoading(false)
            })
            .catch(err=>{
                console.log('err in map search ',err)
                setSearchLoading(false)
            })
    }

    useEffect(()=>{
        if(typingTimeoutRef?.current){
            clearTimeout(typingTimeoutRef?.current)
        }
        typingTimeoutRef.current = setTimeout(() => {
            getSessionData(input)
        }, 500);
    },[input])

    // console.log('  inputref?.current',inputref?.current)
    const onSelect =(mapbox_id:string)=>{
        setRetrive(true)
     
        const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapbox_id}?&session_token=${session_token}&access_token=${mapboxToken}`
        axios.get(url)
        .then(res=>{
            props.changeLocation(res?.data?.features[0]?.geometry?.coordinates)
            setRetrive(false)
            props?.onPress()
        })
        .catch(err=>{
            console.log('err in map search ',err)
            setRetrive(false)
            setSearchLoading(false)
        })
    }

    return (
        // <Modal
        //     // transparent
        //     animationType="slide"
        //     onRequestClose={() => {
        //         props?.cityVisible(false);
        //     }}
        //     visible={props?.cityVisible}
        // >
            <View 
                className='flex-1 px-[10] bg-white '
                style={{marginTop: Platform.OS == 'ios' ? 19 : 19}}
            >
                <View className=" w-full pl-[14]  pr-1 overflow-hidden  border-borderColor bg-white flex-row  border  rounded-full items-center ">
                    <TouchableOpacity 
                        onPress={() => {
                            props?.onPress()
                        }}
                        activeOpacity={1}
                    >
                        <Entypo
                            name="cross"
                            
                            size={23}
                            color={Colors.themeBlack}
                            
                        />
                    </TouchableOpacity>
                    <View className='flex-1'>
                        <CustomInput
                            ref={inputref}
                            value={input}
                            placeholder="Search location"
                            className="h-[50] border-[0] bg-white "
                            onChangeText={(text:any)=>{
                                setInput(text);
                                if(text.trim() == ''){
                                    setSearchLoading(false)
                                }else{
                                    setSearchLoading(true)
                                }

                            }}
                        />
                    </View>
                    {searchLoading && (
                        <View className="bg-white absolute right-[10] rounded-full">
                            <ActivityIndicator
                                size={'small'}
                                color={Colors.primary}
                            />
                        </View>
                    )}
                </View>
                <View className=' flex-1 mt-1 px-[15]'>
                    <FlatList
                        data={input.trim() == '' ? [] : suggesionData}
                        keyExtractor={(item:any,index)=>item.mapbox_id}
                        showsVerticalScrollIndicator={false}
                        // onScroll={()=>Keyboard.dismiss()}
                        onTouchStart={()=>Keyboard.dismiss()}
                        renderItem={({item,index}:any)=>{
                            return(
                                <TouchableOpacity onPress={()=>onSelect(item.mapbox_id)} className='  flex-row ' key={index} >
                                    <View  className='justify-center  items-center' >
                                        <View style={{backgroundColor:Colors.light}} className='w-[30] h-[30]  rounded-full justify-center items-center'>
                                            <Octicons name='location' size={15} color={Colors.red}/>
                                        </View>
                                        {item?.distance && 
                                            <CustomText style={[commonStyle.smalltext]}>
                                                {item.distance/1000} km
                                            </CustomText>
                                        }
                                    </View>
                                    <View 
                                        style={{
                                            borderBottomWidth:1,
                                            // borderWidth:1,
                                            borderColor:Colors.light,
                                            flex:1,
                                            paddingVertical:20,
                                            marginLeft:20,
                                            flexDirection:'row',
                                            // justifyContent:'center',
                                            alignItems:'center'
                                        }}
                                    >
                                        <View className='flex-1 '>
                                            <CustomText style={[commonStyle.smalltextBold, {fontFamily:Fonts.fontBold}]}>
                                                {item?.name}
                                            </CustomText>
                                            <CustomText style={[commonStyle.smalltext,  {fontFamily:Fonts.fontSemiBold}]}>
                                                {item?.full_address || item?.place_formatted}
                                            </CustomText>
                                        </View>
                                        {false 
                                        ?
                                            <ActivityIndicator size={'small'} color={Colors.primary}/>
                                        :
                                            <Feather name='arrow-up-left' size={22}/>
                                        }
                                    </View>
                                </TouchableOpacity>
                            )
                        }}
                        contentContainerStyle={(suggesionData?.length == 0 || input.trim() == '') && {flex: 1}}
                        ListEmptyComponent={
                            <View style={{
                                // height:((Dimensions.get('window').height*0.90)/2) -70
                                flex:1,
                            }} className={` justify-center items-center`}>
                                {!searchLoading &&
                                <>
                                <Image source={require('../assets/png/pin.png')} className='w-[150] h-[150]' resizeMode='contain'/>
                                <CustomText
                                    customeStyle={commonStyle.headingtextBold}
                                    text={input?.trim() == ''? "Search for a location" : 'Location not found'}
                                    className="text-primary "
                                />
                                </>
                                 } 
                              
                            </View>
                        }
                    />
                </View>
            </View>
        // </Modal>
    )
}

export default CitySearch