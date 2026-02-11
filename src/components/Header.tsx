import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import { ScreenHeight } from '@rneui/base';
import React, { useCallback, useMemo, useRef } from 'react';
import { ProfileHeader } from 'react-native-story-view';
import Colors from '../constant/colors';
import CustomText from './customText';
import { commonStyle } from '../constant/commonStyle';
import GradientBtn from './gradientBtn';
import { Platform, View } from 'react-native';
;
import { deletStoty } from '../services/api';
import SimpleBtn from './simpleBtn';
// import { HeaderProps } from './types';

const Header = ({ userStories,progressIndex,setVisible, multiStoryRef,setStories,setPause, ...props }: any) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(()=>[`${((Platform.OS == 'ios' ?  180:170)/ScreenHeight) *100} %`],[]);
  const renderBackdrop = useCallback(
    (props:any) => (
        <BottomSheetBackdrop
            {...props}
            appearsOnIndex={1}
            animatedIndex={{
            value: 1,
            }}
        />
    ),
    []
  )

  const handeldelStory = (story_id:any)=>{
    const data ={story_id}
    deletStoty(data)
    .then(res=>{
      multiStoryRef?.current?.close?.();
      setTimeout(()=>{
        setStories((state:any)=>state.filter((elm:any,key:any)=>elm._id != story_id))
      },100)
    })
    .catch(err=> console.log(err))
    
  }

  return(
  <>
    <ProfileHeader
      userImage={{ uri: userStories?.profile ?? '' }}
      userName={userStories?.username}
      // userMessage={userStories?.title}
      onClosePress={() => {
        multiStoryRef?.current?.close?.();
      }}
      ondelPress={()=>{bottomSheetModalRef?.current?.present();setPause(true)}}
      {...{
        userStories,
        progressIndex
      }}
      {...props}
    />
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={()=>setPause(false)}
      style={{}}
      backgroundStyle={{
        // borderWidth:1,
        backgroundColor:Colors.white,
        // backgroundColor:'transparent',
        // marginHorizontal: 10,
        overflow: 'hidden'
      }}>
        <View className='' style={{
            paddingHorizontal:15,
            borderBottomWidth:1,
            borderColor:Colors.borderColor,
            paddingVertical:12,
        }}>
            <CustomText style={[commonStyle.mediumtextBold]}>Are you sure want delete this story?</CustomText>
            
        </View>
        <View
        style={{
                paddingHorizontal:15,
                flexDirection:'row',
                width:'100%',
                gap:10,
                justifyContent:'center',
                marginTop:21
            }}>
                <View className='flex-1'>
                    <GradientBtn isLoading={false} onPress={()=>{
                       handeldelStory(userStories?.stories[progressIndex]._id)
                    }} title={'Delete'}/>
                </View>
                <View className='flex-1'> 
                    <SimpleBtn onPress={()=>{bottomSheetModalRef?.current?.close()}} title={'Cancel'}/>
                </View>
        </View>
      </BottomSheetModal>
  </>

)}

export default Header;
