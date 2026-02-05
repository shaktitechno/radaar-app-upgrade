import React, {
  LegacyRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  InteractionManager,
  Keyboard,
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
import LinearGradient from 'react-native-linear-gradient';
import GradientBtn from '../../components/gradientBtn';
import Colors from '../../constant/colors';
import { commonStyle } from '../../constant/commonStyle';
import CustomText from '../../components/customText';

import * as Yup from 'yup';
import { Formik, useFormik } from 'formik';
import Fonts from '../../constant/fonts';
import { ParamListBase, RouteProp, useRoute } from '@react-navigation/native';
import BackButton from '../../components/backButton';
import FloatingBtn from '../../components/floatingBtn';
import SafeContainer from '../../components/safeContainer';
import { SignupDataContext } from '../../contexts/signUpcontexts';

const validationSchema = Yup.object().shape({
  description: Yup.string().trim().max(350, 'No more than 350 characters'),
  // .required('Description is required')
  // .min(50,'Please enter min 50 characters'),
  array: Yup.array()
    .min(2, 'Please select min 2 ')
    .max(15, 'You can select a maximum of 15 hobbies')
    .required('Please select min 2 ')
    .label('Hobbies'),
});

const OccupHobbiesDescri = (props: {
  route: RouteProp<ParamListBase, string>;
  navigation: any;
}) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const maxSelection = 15; // Maximum number of tags a user can select
  const [keyBoardShow, setKeyBoardshow] = useState<boolean>(false);
  const { signupState } = useContext(SignupDataContext);
  const scrollRef = useRef<any>();
  const signupStat = JSON.parse(JSON.stringify(signupState?.allInterest));
  const [tags, settags] = useState<any>(signupStat);
  const setValueSet = async (name: string) => {
    // console.log('name ==== >>>>', name)
    let newTag = tags.map((item: any, index: number) => {
      if (name == item.name) {
        item.isSelected = !item.isSelected;
      }
      return item;
    });
    settags(newTag);
  };

  const route = useRoute();

  useEffect(() => {
    // console.log("Route>> ", route.params)
    // console.log("ageValuwe >> ", ageValue)
  }, []);

  const countSelectedTags = () => {
    return tags.filter((tag: any) => tag.isSelected).length;
  };

  const {
    handleChange,
    handleBlur,
    handleSubmit,
    values,
    errors,
    touched,
    isValid,
    validateOnChange,
    setFieldValue,
  } = useFormik({
    validationSchema: validationSchema,
    initialValues: { description: '', array: '' },
    onSubmit: des => {
      props.navigation.navigate('Sports', {
        ...route.params,
        All_tags: des.array,
        description: des.description.trim(),
      });
    },
  });
  // console.log('dvlsidvkdsv----------------',signupState)
  // console.log('tagstagstagstagstagstags',tags)
  // console.log('valuesvaluesvalues',values)

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        // Do something when the keyboard is shown
        console.log('show');
        setKeyBoardshow(true);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        // Do something when the keyboard is shown
        console.log('hide');
        setKeyBoardshow(false);
      },
    );

    // Return a clean-up function to remove the event listener
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    if (keyBoardShow) {
      setTimeout(() => {
        // scrollRef.current?.scrollToEnd({ animated: true });
        InteractionManager.runAfterInteractions(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        });
      }, 10);
    }
  }, [keyBoardShow]);

  return (
    <SafeContainer
      style={{
        flex: 1,
        backgroundColor: Colors.cardBg,
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.cardBg,
          }}
        >
          <View style={{ flex: 1 }}>
            <ScrollView ref={scrollRef}>
              <View style={commonStyle.container}>
                {/* <TouchableOpacity
                                            onPress={() => props.navigation.goBack()}
                                            style={[commonStyle.shadowButton, { marginBottom: 15 }]}


                                        >
                                            <FeatherIcon size={26} color={Colors.title} name={'arrow-left'} />
                                        </TouchableOpacity> */}
                <BackButton navigation={props.navigation} />
                <CustomText
                  text="What Are You Into?"
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
                  Let everyone know that what you're passionate about, by adding
                  it to your profile.
                </Text>

                <View
                  style={[
                    styles.flexRow,
                    styles.flexWrap,
                    styles.spaceX2,
                    styles.spaceY2,
                  ]}
                >
                  {tags?.length > 0 &&
                    tags?.map((data: any, index: number) => {
                      // console.log('data======', data)
                      return (
                        <TouchableOpacity
                          key={index}
                          style={
                            !data.isSelected
                              ? { borderColor: Colors.grey, borderWidth: 1 }
                              : { borderColor: Colors.primary, borderWidth: 1 }
                          }
                          className={` px-[15] py-[6] mx-[4] my-[4]  rounded-[30px] `}
                          // onPress={() => {
                          //     console.log('datatatata', data)
                          //     setValueSet(data?.name)
                          // }}
                          onPress={() => {
                            if (countSelectedTags() < 15 || data.isSelected) {
                              // Check if the limit is not reached or the tag is already selected
                              setValueSet(data?.name);
                              setTimeout(() => {
                                let fieldTobeSet: Array<string> = [];
                                tags?.map(
                                  (item: any) =>
                                    item.isSelected &&
                                    fieldTobeSet?.push(item.name),
                                );
                                setFieldValue('array', fieldTobeSet);
                              }, 10);
                            }
                          }}
                        >
                          <CustomText
                            className={`${
                              !data.isSelected
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
                {errors.array && (
                  <CustomText
                    style={[commonStyle.errorText, { marginLeft: 10 }]}
                  >
                    {errors.array}
                  </CustomText>
                )}
                <CustomText
                  text="Describe Yourself"
                  style={commonStyle.headingtextBold}
                  className=" mb-[20] mt-[20]"
                />
                <View className=" mb-[20]">
                  <TextInput
                    style={[
                      commonStyle.inputStyle,
                      {
                        borderColor: Colors.borderColor,
                        borderRadius: 7,
                        height: 120,
                        textAlignVertical: 'top',
                        fontSize: 20,
                      },
                    ]}
                    onChangeText={handleChange('description')}
                    onBlur={handleBlur('description')}
                    value={values.description}
                    multiline={true}
                    numberOfLines={10}
                    placeholder="A little bit about you"
                    placeholderTextColor={Colors.textLight}
                  />
                  <CustomText
                    style={{
                      color: Colors.textLight,
                      fontSize: 12,
                      textAlign: 'right',
                    }}
                  >
                    {values?.description?.trim()?.length}/350
                  </CustomText>
                  {errors.description && touched.description && (
                    <CustomText style={commonStyle.errorText}>
                      {errors.description}
                    </CustomText>
                  )}
                </View>
              </View>
              {/* {keyBoardShow &&  */}
              <View style={{ marginBottom: 80 }}></View>
              {/* } */}
            </ScrollView>
          </View>
          {/* <View
                                style={{
                                    paddingHorizontal: 45,
                                    paddingVertical: 35,
                                }}
                            >
                                <GradientBtn
                                    onPress={() => { handleSubmit(values.description) }}
                                    title={'Continue'}
                                />
                            </View> */}
          {/* <FloatingBtn
                                onPress={() => { handleSubmit(values.description) }}
                                title={'Continue'}
                            /> */}
        </View>
        <FloatingBtn
          onPress={() => {
            handleSubmit();
          }}
          title={'Continue'}
          isLoading={false}
        />
      </KeyboardAvoidingView>
    </SafeContainer>
  );
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

export default OccupHobbiesDescri;
