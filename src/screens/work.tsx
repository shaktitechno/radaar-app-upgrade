import { View, Text, TextInput, Platform, KeyboardAvoidingView, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import React, { useContext, useReducer, useState } from 'react'

import FeatherIcon from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native'
import { login } from '../constant/types';
import { useDispatch } from 'react-redux';
import { SignupDataContext } from '../contexts/signUpcontexts';
import { showErrorMessage } from '../services/alerts';
import { saveUser } from '../redux/action/signup';
import Colors from '../constant/colors';
import { commonStyle } from '../constant/commonStyle';
import BackButton from '../components/backButton';
import CustomText from '../components/customText';
import Fonts from '../constant/fonts';
import GradientBtn from '../components/gradientBtn';

// import { SignupDataContext } from '../../navigation/stackNavigation'


const Work = (props: login) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [formState, setFormState] = useState<string>('')
    const [err,setErr]=useState<boolean>(false)
    const dispatch = useDispatch()
    const { signupState } = useContext(SignupDataContext);

    // console.log("occupation---------",props.route.params)

    function submit() {
        if (!formState?.id) {
            showErrorMessage('Kindle select one option')
            return
        }

        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            props.navigation.navigate('Interest')
            dispatch(saveUser({ work: formState }))
        }, 1000)
    }
    // console.log('signupdata',signupState)

    return (
        <SafeAreaView
        style={{
            flex: 1,
            backgroundColor: Colors.cardBg,
        }}
        >
            <View className='flex-1'>
                <ScrollView showsVerticalScrollIndicator={false}>
                <View style={commonStyle.container}>
                    {/* <TouchableOpacity
                        onPress={() => props.navigation.goBack()}
                        style={[commonStyle.shadowButton, { marginBottom: 15 }]}


                    >
                        <FeatherIcon size={26} color={Colors.title} name={'arrow-left'} />
                    </TouchableOpacity> */}
                     <BackButton navigation={props.navigation}/>
                    <CustomText text="Select Your Occupation" style={commonStyle.headingtextBold} className=' mb-[5]' />
                    <Text style={{fontFamily:Fonts.fontSemiBold, fontSize:15, color:Colors.black, marginBottom:20}}>Select an occupation to show on your profile.</Text>
                    <View
                        style={[styles.flexRow, styles.flexWrap, styles.spaceX2, styles.spaceY2]}
                    >
                        {signupState?.occupation?.length > 0 
                        && signupState?.occupation?.map((data: any, index: number) => {
                            // console.log('data======', data)
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={formState != data.name ? { borderColor: Colors.grey, borderWidth: 1 } : { borderColor: Colors.primary, borderWidth: 1 }}
                                    className={` px-[15] py-[6] mx-[4] my-[4]  rounded-[30px] `}
                                    onPress={()=>{
                                        if(formState == data.name){
                                            setFormState('')
                                        }else{
                                            setFormState(data.name)
                                        }
                                    }}
                                >
                                    <CustomText className={`${formState != data.name ? 'text-title' : 'text-borderPrimary'} `} style={{
                                        fontFamily:Fonts.fontSemiBold, fontSize: 16
                                    }}>{data?.name}</CustomText>
                                </TouchableOpacity>
                            )
                        })

                        }
                    </View>
                    {(err && formState =='') &&
                    <CustomText style={[commonStyle.errorText, { marginLeft : 10,marginTop:10 }]}>Please select your occupation </CustomText>}
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
                        setErr(true)
                        if(formState ==''){
                            return
                        }
                        props.navigation.navigate('UploadImages', { ...props.route.params,work:formState })
                    }}
                    title={'Continue'}
                />
            </View>
        </SafeAreaView>
    )
}

export default Work


export const screenOptions = {
    headerShown: false,
}
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