import React, { useContext, useEffect, useState } from 'react';
import {
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

import { Dimensions } from 'react-native';
import { SignupDataContext } from '../../contexts/signUpcontexts';
import { navigateRoutes } from '../../constant/types';
import { useRoute } from '@react-navigation/native';
import Colors from '../../constant/colors';
import { commonStyle } from '../../constant/commonStyle';
import BackButton from '../../components/backButton';
import CustomText from '../../components/customText';
import Fonts from '../../constant/fonts';
import CheckList from '../../components/checkList';
import FloatingBtn from '../../components/floatingBtn';

const Gender = (props: navigateRoutes) => {
  const { signupState } = useContext(SignupDataContext);
  const [datePicker, setDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [birthDate, setBirthDate] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const [genderData, setGenderData] = useState([]);
  const [activeGender, setGender] = useState(genderData[1]);
  const [ageValue, setAgeValue] = useState([18, 30]);
  const { width, height } = Dimensions.get('screen');
  const [workList, setWorkList] = useState([]);
  const route = useRoute();
  useEffect(() => {
    // console.log("Route>> ", route.params)
    // console.log("ageValuwe >> ", ageValue)
  }, []);

  function onDateSelected(value: any) {
    setDate(value);
    setDatePicker(false);
    setBirthDate(true);
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.cardBg,
      }}
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
        <ScrollView>
          <View style={commonStyle.container}>
            {/* <TouchableOpacity
                            onPress={() => props.navigation.goBack()}
                            style={[commonStyle.shadowButton, { marginBottom: 15 }]}

                        >
                              <FeatherIcon size={26} color={Colors.title} name={'arrow-left'} />
                        </TouchableOpacity> */}
            <BackButton navigation={props.navigation} />

            <CustomText
              text="What's Your Gender?"
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
              Choose the option that best fits you and optionally share more
              about your gender.
            </Text>
            {/* {console.log('firstwwhbdfhbw',signupState)} */}
            <View>
              {signupState?.gender?.length > 0 &&
                signupState?.gender?.map?.((data, index) => {
                  // console.log(data)
                  return (
                    <CheckList
                      onPress={() => setGender(data)}
                      item={data}
                      checked={
                        data?.value == activeGender?.value ? true : false
                      }
                      key={index}
                    />
                  );
                })}
              {error && !activeGender && (
                <CustomText style={commonStyle.errorText}>
                  {'Please select your gender'}
                </CustomText>
              )}
            </View>
          </View>
        </ScrollView>
      </View>

      <View>
        <FloatingBtn
          title={'Continue'}
          // isLoading={loading}
          onPress={() => {
            if (!activeGender) {
              return setError(true);
            }
            props.navigation.navigate('GenderInterest', {
              ...route.params,
              Your_Gender: activeGender?.value,
            });
            setError(false);
          }}
        />
      </View>
    </SafeAreaView>
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

export default Gender;
