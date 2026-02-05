import {
  View,
  Text,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import React, { useContext, useReducer, useState } from 'react';
import SafeContainer from '../../components/safeContainer';
import CustomText from '../../components/customText';
import { commonStyle } from '../../constant/commonStyle';
import { login } from '../../constant/types';
import { useDispatch } from 'react-redux';
import Colors from '../../constant/colors';
import { showAlert, showErrorMessage } from '../../services/alerts';
import { SafeAreaView } from 'react-native';
import Fonts from '../../constant/fonts';
import GradientBtn from '../../components/gradientBtn';
import BackButton from '../../components/backButton';
import { SignupDataContext } from '../../contexts/signUpcontexts';
// import { SignupDataContext } from '../../navigation/stackNavigation'

const Sports = (props: login) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [formState, setFormState] = useState<string>('');
  const [err, setErr] = useState<boolean>(false);
  const dispatch = useDispatch();
  const { signupState } = useContext(SignupDataContext);

  // console.log("Sports screen--------",signupState.sports)
  const propData = props.route.params;

  // console.log('signupdata',signupState)

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.cardBg,
      }}
    >
      <View className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={commonStyle.container}>
            <BackButton navigation={props.navigation} />
            <CustomText
              text="Select Your Sports"
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
              Select an sports to show on your profile.
            </Text>
            <View
              style={[
                styles.flexRow,
                styles.flexWrap,
                styles.spaceX2,
                styles.spaceY2,
              ]}
            >
              {signupState?.sports?.length > 0 &&
                signupState?.sports?.map((data: any, index: number) => {
                  // console.log('data======', data)
                  return (
                    <TouchableOpacity
                      key={index}
                      style={
                        formState != data.name
                          ? { borderColor: Colors.grey, borderWidth: 1 }
                          : { borderColor: Colors.primary, borderWidth: 1 }
                      }
                      className={` px-[15] py-[6] mx-[4] my-[4]  rounded-[30px] `}
                      onPress={() => {
                        console.log(
                          '(((((((((((((((((((((((((((((((((((',
                          data.name,
                        );
                        if (formState == data.name) {
                          setFormState('');
                        } else {
                          setFormState(data.name);
                        }
                      }}
                    >
                      <CustomText
                        className={`${
                          formState != data.name
                            ? 'text-title'
                            : 'text-borderPrimary'
                        } `}
                        style={{
                          fontFamily: Fonts.fontSemiBold,
                          fontSize: 16,
                        }}
                      >
                        {data?.name}
                      </CustomText>
                    </TouchableOpacity>
                  );
                })}
            </View>
            {err && formState == '' && (
              <CustomText
                style={[
                  commonStyle.errorText,
                  { marginLeft: 10, marginTop: 10 },
                ]}
              >
                Please select your sports{' '}
              </CustomText>
            )}
          </View>
        </ScrollView>
      </View>
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 35,
        }}
      >
        <GradientBtn
          onPress={() => {
            setErr(true);
            if (formState == '') {
              return;
            }
            // props.navigation.navigate('UploadImages', { ...props.route.params,work:formState })
            props.navigation.navigate('Work', {
              ...props.route.params,
              All_tags: propData?.All_tags,
              description: propData?.description.trim(),
              sports: formState,
            });
          }}
          title={'Continue'}
        />
      </View>
    </SafeAreaView>
  );
};

export default Sports;

export const screenOptions = {
  headerShown: false,
};
const styles = StyleSheet.create({
  flexRow: {
    flexDirection: 'row',
  },
  flexWrap: {
    flexWrap: 'wrap',
  },
  spaceX2: {
    marginLeft: 2,
    marginRight: 2,
  },
  spaceY2: {
    marginTop: 2,
    marginBottom: 2,
  },
});
