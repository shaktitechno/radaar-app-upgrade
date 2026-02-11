import React from 'react';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Image, Text, View } from 'react-native';
import CustomText from './customText';
import { commonStyle } from '../constant/commonStyle';

const EmptyCard = (props: { text?: string; mydetails: any }) => {
  return (
    <>
      <View
        style={{
          flex: 1,

          marginHorizontal: 15,
          borderRadius: 20,
          marginBottom: 12,
          justifyContent: 'center',
          paddingHorizontal: 30,
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              borderRadius: 100,

              marginBottom: 20,
              shadowColor: 'rgba(0,0,0)',
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.3,
              shadowRadius: 4.65,
            }}
          >
            <Image
              style={{
                height: 250,
                width: 250,
                borderRadius: 100,
              }}
              source={require('../assets/png/empty.png')}
            />
          </View>
        </View>
        <CustomText
          text={
            props?.text ||
            'No more profiles available. Try changing your preferences.'
          }
          style={[
            commonStyle.smalltextBold,
            { textAlign: 'center', marginBottom: 25 },
          ]}
        />
      </View>
    </>
  );
};

export default EmptyCard;
