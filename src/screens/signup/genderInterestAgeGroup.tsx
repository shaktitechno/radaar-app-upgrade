import React, { useContext, useEffect, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useRoute } from '@react-navigation/native';
import { navigateRoutes } from '../../constant/types';
import { SignupDataContext } from '../../contexts/signUpcontexts';
import SafeContainer from '../../components/safeContainer';
import Colors from '../../constant/colors';
import { commonStyle } from '../../constant/commonStyle';
import BackButton from '../../components/backButton';
import CustomText from '../../components/customText';
import Fonts from '../../constant/fonts';
import CheckList from '../../components/checkList';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import FloatingBtn from '../../components/floatingBtn';

const GenderInterestedAgeGroup = (props: navigateRoutes) => {
  const { signupState } = useContext(SignupDataContext);
  const [datePicker, setDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [birthDate, setBirthDate] = useState(false);
  const [activeGender2, setGender2] = useState();
  const [ageValue, setAgeValue] = useState([18, 30]);
  const { width, height } = Dimensions.get('screen');
  const [workList, setWorkList] = useState([]);
  const route = useRoute();
  const [error, setError] = useState<boolean>(false);

  function onDateSelected(value: any) {
    setDate(value);
    setDatePicker(false);
    setBirthDate(true);
  }

  // console.log('signupState -------------------',signupState)

  return (
    <SafeContainer
      style={{
        flex: 1,
        backgroundColor: Colors.cardBg,
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : ''}
      >
        {datePicker && (
          <DateTimePicker
            value={date}
            mode={'date'}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            is24Hour={true}
            onChange={onDateSelected}
          />
        )}

        <View style={{ flex: 1 }}>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            <View style={commonStyle.container}>
              {/* <TouchableOpacity
                                onPress={() => props.navigation.goBack()}
                                style={[commonStyle.shadowButton, { marginBottom: 15 }]}

                            >
                                <FeatherIcon size={26} color={Colors.title} name={'arrow-left'} />
                            </TouchableOpacity> */}
              <BackButton navigation={props.navigation} />

              <CustomText
                text="Who Are You Interested In Seeing?"
                style={commonStyle.headingtextBold}
                className=" mb-[5]"
              />
              <Text
                style={{
                  fontFamily: Fonts.fontSemiBold,
                  fontSize: 15,
                  color: Colors.black,
                  marginBottom: 20,
                }}
              >
                You can update this at any time. We're here for you.
              </Text>

              <View>
                {signupState?.gender?.length > 0 &&
                  signupState?.gender?.map((data, index) => {
                    return (
                      <CheckList
                        onPress={() => setGender2(data)}
                        item={data}
                        checked={
                          data?.value == activeGender2?.value ? true : false
                        }
                        key={index}
                      />
                    );
                  })}
                {error && !activeGender2 && (
                  <CustomText style={commonStyle.errorText}>
                    {'Please select the gender you are interested in '}
                  </CustomText>
                )}
              </View>

              <View
                style={[
                  styles.infoCard,
                  commonStyle.shadow,
                  {
                    backgroundColor: Colors.cardBg,
                    marginTop: 30,
                  },
                ]}
              >
                <CustomText
                  text="Age Range"
                  style={[
                    styles.cardtitle,
                    commonStyle.headingtextBold,
                    { borderColor: Colors.borderColor },
                  ]}
                  className=" mb-[20]"
                />
                <CustomText
                  style={{
                    color: Colors.title,
                    fontFamily: Fonts.fontRegular,
                  }}
                >
                  Between {ageValue[0]} and{' '}
                  {ageValue[1] == 65 ? '65+' : ageValue[1]}
                </CustomText>
                <View>
                  <MultiSlider
                    trackStyle={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: 'rgba(142,165,200,.3)',
                    }}
                    selectedStyle={{
                      backgroundColor: Colors.primary,
                    }}
                    values={ageValue}
                    markerStyle={{
                      backgroundColor: Colors.white,
                      top: 1,
                      height: 16,
                      width: 16,
                      borderWidth: 3,
                      borderColor: Colors.primary,
                    }}
                    onValuesChange={val => setAgeValue(val)}
                    min={18}
                    sliderLength={width - 60}
                    max={65}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        <FloatingBtn
          onPress={() => {
            if (!activeGender2) {
              return setError(true);
            }
            props.navigation.navigate('OccupHobbiesDescri', {
              ...route.params,
              Interested_Gender: activeGender2.value,
              Age_Range: ageValue,
              workList,
            });
            setError(false);
          }}
          title={'Continue'}
        />
      </KeyboardAvoidingView>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 15,
  },
  cardtitle: {
    // ...FONTS.fontBold,
    // ...FONTS.font,
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 10,
  },
});

export default GenderInterestedAgeGroup;
