import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constant/colors';
import CustomText from './customText';

import { commonStyle } from '../constant/commonStyle';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Image } from 'react-native';
import { UserProfileData } from '../contexts/userDetailscontexts';

const LinearGradientContainer = ({
  gradient,
  styles,
  children,
  ...rest
}: any) => {
  return (
    <LinearGradient
      colors={gradient ? gradient : ['#BB9550', '#EED29C']}
      style={[style.borderGradient, style && styles]}
      {...rest}
    >
      {children}
    </LinearGradient>
  );
};

const BlackCard = ({ navigation, image, count, text, ...rest }: any) => {
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('ActiveSubscription')}
      className="bg-[#F2F0F1] px-[20] py-4 mb-[20] border-[2.5px] border-[#A08B43] rounded-[6px]"
    >
      <View className="flex-row ">
        <View className="bg-white w-[46] h-[46] rounded-full items-center justify-center">
          <Image source={image} className="w-[35] h-[35]" />
        </View>
        <View className="flex-1 justify-center items-end">
          {/* <GradientText 
                        text={count +" "+ text}
                        height={28}
                        fontSize={20}
                        end={true}
                    /> */}
          <CustomText
            text={count + ' ' + text}
            style={[commonStyle.headingtextBold, { fontSize: 20 }]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SubCard = ({ navigation }: any) => {
  const { userDetails } = useContext(UserProfileData);
  const [benefits, setBenefits] = useState<any>({
    swipes: null,
    connects: null,
    video_audio_call: null,
  });
  // console.log('userDetailsuserDetails',userDetails)

  useEffect(() => {
    let data: any = {
      swipes: null,
      connects: null,
      video_audio_call: null,
    };
    if (
      userDetails?.plan_details?.original_plan_details?.swipes?.type ==
      'unlimited'
    ) {
      data.swipes = 'Unlimited';
    } else if (
      userDetails?.plan_details?.original_plan_details?.swipes?.type ==
      'custom_swipes'
    ) {
      data.swipes =
        userDetails?.plan_details?.original_plan_details?.swipes?.count;
    }

    if (
      userDetails?.plan_details?.original_plan_details?.connects?.type ==
      'unlimited'
    ) {
      data.connects = 'Unlimited';
    } else if (
      userDetails?.plan_details?.original_plan_details?.connects?.type ==
      'custom_connects'
    ) {
      data.connects =
        userDetails?.plan_details?.original_plan_details?.connects?.count;
    }

    if (
      userDetails?.plan_details?.original_plan_details?.video_audio_call
        ?.duration
    ) {
      data.video_audio_call =
        userDetails?.plan_details?.original_plan_details?.video_audio_call?.duration;
    }

    userDetails.addon_details.map((addon: any) => {
      if (addon?.original_addon_details?.benefits?.name == 'swipes') {
        if (data.swipes == null) {
          data.swipes =
            addon?.original_addon_details?.benefits?.value < 5000
              ? 'Unlimited'
              : addon?.original_addon_details?.benefits?.value;
        } else if (data.swipes == 'Unlimited') {
        } else {
          data.swipes =
            data.swipes + addon?.original_addon_details?.benefits?.value;
        }
      }
      if (addon?.original_addon_details?.benefits?.name == 'connects') {
        if (data.connects == null) {
          data.connects =
            addon?.original_addon_details?.benefits?.value < 5000
              ? 'Unlimited'
              : addon?.original_addon_details?.benefits?.value;
        } else if (data.connects == 'Unlimited') {
        } else {
          data.connects =
            data.connects + addon?.original_addon_details?.benefits?.value;
        }
      }
      if (addon?.original_addon_details?.benefits?.name == 'video_audio_call') {
        if (data.video_audio_call == null) {
          data.video_audio_call =
            addon?.original_addon_details?.benefits?.value;
        } else if (data.video_audio_call == 'Unlimited') {
        } else {
          data.video_audio_call =
            data.video_audio_call +
            addon?.original_addon_details?.benefits?.value;
        }
      }
    });
    setBenefits(data);
  }, [userDetails]);

  return (
    <View className="mt-0">
      {/* <LinearGradientContainer>
                <View className='bg-[#0C0E12] flex-1 rounded-[6px]'>
                    <View className='mt-10 flex-1'> 
                        <GradientText 
                            text='You are a Subscribed User'
                            height={50}
                            fontSize={25}
                        />
                    </View>
                    <TouchableOpacity
                    onPress={()=>
                        navigation.navigate(
                            'ActiveSubscription',
                        )
                    }
                    >
                        <LinearGradientContainer
                            gradient={['#FDE7BF','#E5C486']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            styles={{
                                marginHorizontal:20,
                                marginTop:30,
                                marginBottom:30
                            }}
                        >
                            <CustomText
                                text='Explore Subscription'
                                style={commonStyle.headingtext}
                            />
                        </LinearGradientContainer>
                    </TouchableOpacity>
                </View>
            </LinearGradientContainer> */}
      {/* <View className='absolute justify-center items-center w-full top-[-15]' >
                <View className='bg-[#90671B] border border-[#EED29C]  px-5 rounded-full py-1 '>
                    <CustomText
                        style={{color:Colors.cardBg}}
                        text='Congratulations'
                    />
                </View>
            </View> */}
      <View className="gap-[5] flex-row items-center justify-center  my-5 pb-1 ">
        <FontAwesome size={18} name="star" color={'#D1A44D'} />
        <CustomText>P L A N B E N E F I T S</CustomText>
        <FontAwesome size={18} name="star" color={'#D1A44D'} />
      </View>
      <View>
        <BlackCard
          navigation={navigation}
          image={require('../assets/png/hand.png')}
          count={benefits.swipes ? benefits.swipes : 0}
          text="Swipes"
        />
        <BlackCard
          navigation={navigation}
          image={require('../assets/png/social.png')}
          count={benefits.connects ? benefits.connects : 0}
          text="Connects"
        />

        <BlackCard
          navigation={navigation}
          image={require('../assets/png/telephone.png')}
          count={benefits.video_audio_call ? benefits.video_audio_call : 0}
          text="mins Calling"
        />

        {/* <BlackCard image={require('../assets/png/social.png')} count={5} text='Connected'/> */}
        {/* <BlackCard image={require('../assets/png/telephone.png')} count={5} text='mins Caling'/> */}
      </View>
    </View>
  );
};

export default SubCard;

const style = StyleSheet.create({
  borderGradient: {
    // gap:5,
    // paddingHorizontal:15,
    // height:150,
    padding: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    flexDirection: 'row',
    // flex:1
  },
});
