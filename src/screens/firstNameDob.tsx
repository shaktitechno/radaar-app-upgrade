import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import GradientBtn from '../components/gradientBtn';
import { commonStyle } from '../constant/commonStyle';
import CustomText from '../components/customText';
import Colors from '../constant/colors';
import SafeContainer from '../components/safeContainer';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Yup from 'yup';
import { Formik, useFormik } from 'formik';
import Fonts from '../constant/fonts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ParamListBase, RouteProp } from '@react-navigation/native';
import BackButton from '../components/backButton';
import FloatingBtn from '../components/floatingBtn';

const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() - 18));

const nameDobSchema = Yup.object().shape({
  firstName: Yup.string()
    .max(40, 'First name must be of max 40 characters')
    .min(3, 'First name must be of min 3 characters')
    .matches(
      /^[a-zA-Z\s]*$/,
      'First name must not contain any special character or number',
    )
    .required('Please enter your first name')
    .trim(),

  date_value: Yup.string().required('Please enter your date of birth'),
});
const FirstNameDob = ({ route, navigation }: any) => {
  const [datePicker, setDatePicker] = useState(false);
  const [date, setDate] = useState(maxDate);
  const [dateString, setDateString] = useState<any>();

  const getdateString = (selectedDate: any) => {
    return (
      selectedDate.getDate() +
      '/' +
      (Number(selectedDate.getMonth()) + 1) +
      '/' +
      selectedDate.getFullYear()
    );
  };

  const onDateSelected = (event: any, selectedDate: any) => {
    setDatePicker(Platform.OS === 'ios'); // Show DateTimePicker on iOS, hide on Android
    if (event.type == 'dismissed') {
      return;
    } else if (selectedDate) {
      const datesrting = getdateString(selectedDate);
      setDate(selectedDate);
      setFieldValue('date_value', datesrting);
    }
  };

  const {
    handleChange,
    handleBlur,
    handleSubmit,
    values,
    errors,
    touched,
    isValid,
    setFieldValue,
    setFieldTouched,
  } = useFormik({
    validationSchema: nameDobSchema,
    initialValues: {
      firstName: route.params?.first_name,
      lastName: '',
      date_value: '',
    },
    onSubmit: e => {
      navigation.navigate('Gender', {
        firstName: e.firstName,
        lastName: e.lastName,
        date_value: e.date_value,
      });
    },
  });

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
        <View style={{ flex: 1 }}>
          <ScrollView>
            <View style={[commonStyle.container, {}]}>
              <CustomText
                text="What's your Name and Birthday?"
                style={commonStyle.headingtextBold}
                className=" mb-[5] mt-[20]"
              />
              <Text
                style={{
                  fontFamily: Fonts.fontSemiBold,
                  fontSize: 15,
                  color: Colors.black,
                  marginBottom: 20,
                }}
              >
                This will be shown on your profile.
              </Text>
              <View className=" mb-[10]">
                <TextInput
                  style={[
                    commonStyle.inputStyle,
                    { borderColor: Colors.borderColor },
                  ]}
                  autoFocus
                  onChangeText={handleChange('firstName')}
                  onBlur={handleBlur('firstName')}
                  value={values.firstName}
                  placeholder="Enter name"
                  placeholderTextColor={Colors.textLight}
                  onFocus={() => {
                    setDatePicker(false);
                  }}
                />
                {errors.firstName && touched.firstName && (
                  <CustomText
                    style={[commonStyle.errorText, { marginLeft: 10 }]}
                  >
                    {errors.firstName}
                  </CustomText>
                )}
              </View>

              <View>
                <TextInput
                  style={[
                    commonStyle.inputStyle,
                    { borderColor: Colors.borderColor },
                  ]}
                  value={values.date_value}
                  placeholder={getdateString(maxDate)}
                  placeholderTextColor={Colors.textLight}
                />
                <TouchableOpacity
                  onPress={() => {
                    setDatePicker(true);
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                  }}
                ></TouchableOpacity>
                {errors.date_value && touched.date_value && (
                  <CustomText
                    style={[commonStyle.errorText, { marginLeft: 10 }]}
                  >
                    {errors.date_value}
                  </CustomText>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
        <FloatingBtn
          title={'Continue'}
          // isLoading={loading}
          onPress={handleSubmit}
        />
      </KeyboardAvoidingView>
      {datePicker && (
        <>
          {Platform.OS == 'ios' && (
            <View className="flex-row justify-between px-2 justify-end">
              <TouchableOpacity
                onPress={() => {
                  setDatePicker(false);
                }}
                className="px-2 py-1 rounded"
              >
                <CustomText
                  text="Done"
                  customeStyle={[commonStyle.regulartext, { fontSize: 16 }]}
                  className="text-borderPrimary"
                />
              </TouchableOpacity>
            </View>
          )}
          <DateTimePicker
            value={date}
            mode={'date'}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            is24Hour={true}
            maximumDate={maxDate}
            minimumDate={new Date(1900, 0, 1)}
            onChange={(event, date) => onDateSelected(event, date)}
          />
        </>
      )}
    </SafeContainer>
  );
};

export default FirstNameDob;
