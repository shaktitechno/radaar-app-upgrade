import React, {useContext, useEffect, useState} from 'react';
import {
    Button,
    Dimensions,
    FlatList,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import CustomText from '../../components/customText';
import {commonStyle} from '../../constant/commonStyle';
import BackButton from '../../components/backButton';
import Colors from '../../constant/colors';

import {
    getCompleteProfileData,
    getMyProfile,
    submitCompleteProfileData,
} from '../../services/api';
import {ScrollView} from 'react-native-gesture-handler';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import CustomInput from '../../components/customInput';
import GradientBtn from '../../components/gradientBtn';
import {showErrorMessage, showSuccessMessage} from '../../services/alerts';
import Fonts from '../../constant/fonts';
import {UserProfileData} from '../../contexts/userDetailscontexts';

  import WheelPicker from 'react-native-wheely';

const Weight = (props: any) => {
    const [listData, setListData] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const ref = React.useRef();
    const [submitLoading, setSubmitLoading] = useState(false);
    const [dataSourceWeight, setDataSourceWeight] = useState([]);
    const completeData = props?.route?.params?.data;
    const profileData = props?.route?.params?.profileData;
    const {userDetails, setUserDetails} = useContext(UserProfileData);
    const [pickerdata,setPickerData] = useState( Array.from({length:  150 - 30 + 1}, (_, index) => (index + 30).toString()))
    useEffect(() => {
        const dataArr2 = [];
        for (let i = 1; i < 151; i++) {
            dataArr2?.push(i + ' KG');
        }
        setDataSourceWeight(dataArr2);
        let data = [];
        data = profileData?.filter(
            item => item?.questions_name === 'weight',
        );
        if (userDetails['weight']?.value) {
            data[0].options = [
                {
                    selected: true,
                    text: userDetails['weight']?.value?.toString(),
                },
            ];
        } else {
            data[0].options = [
                {
                    selected: false,
                    text: 0,
                },
            ];
        }
        setListData(data);
        setLoading(false);
    }, []);
    function submitData() {
        setSubmitLoading(true);
        let body;
        completeData?.push(listData[0]);
        completeData.map(item => {
            let data;
            if (item?.input_type == 'multi_select') {
                data = [];
                let items = item?.options?.filter(i => i.selected);
                items?.map(d => {
                    data?.push(d?.text);
                });
            } else if (item?.input_type == 'single_select') {
                data = '';
                let items = item?.options?.filter(i => i.selected);
                items?.map(d => {
                    data = d.text;
                });
            } else {
                if (item?.questions_name == 'height') {
                    data = '';
                    let items = item?.options?.filter(i => i.selected);
                    items?.map(d => {
                        data = d.text;
                    });
                } else {
                    let items = item?.options?.filter(i => i.selected);
                    items?.map(d => {
                        data = {
                            value: d?.text,
                            unit: 'KG',
                        };
                    });
                }
            }
            body = {
                ...body,
                [item?.questions_name]: data,
            };
        });
        setSubmitLoading(false)
        submitCompleteProfileData(body)
            .then(res => {
                if (res?.status == 200) {
                    Math.ceil(userDetails?.completionPercentage) == 100 ? 
                    showSuccessMessage('Profile updated successfully')
                    : showSuccessMessage('Profile completed successfully')
                    props?.navigation?.navigate('MyTabs',{
                        screen:'ProfilePage'
                    });
                } else {
                    showErrorMessage(res?.data?.message);
                }
                setSubmitLoading(false);
            })
            .catch(err => setSubmitLoading(false));
    }
    return (
        <>
            {loading ? (
                <>
                    <View style={commonStyle.center}>
                        <View className="justify-center items-center">
                            <Image
                                className="w-[250] h-[250]"
                                source={require('../../assets/gif/like.gif')}
                            />
                        </View>
                    </View>
                </>
            ) : (
                <>
                    <View
                        style={{
                            paddingHorizontal: 15,
                            marginTop: Platform.OS == 'android' ? 10 : 50,
                        }}>
                        <BackButton
                            navigation={props.navigation}
                            onPress={() => {
                                if (count > 0) {
                                    setCount(count - 1);
                                } else props.navigation.goBack();
                            }}
                        />
                    </View>
                    <View style={{paddingHorizontal: 20, paddingTop: 5, paddingBottom: 30}}>
                        <CustomText
                            style={[
                                commonStyle.headingtextBold,
                                {fontSize: 20},
                            ]}>
                            {listData[count]?.question}
                        </CustomText>
                        <CustomText>
                            {listData[count]?.input_type == 'multi_select'
                                ? 'Choose as many as you want:'
                                : listData[count]?.input_type == 'single_select'
                                ? ''
                                : ''}{' '}
                        </CustomText>
                        
                        <View
                            style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                              
                            }}>
                            <View
                                style={{
                                    width:Platform.OS == 'ios' ?  Dimensions.get('window').width * 0.6 :  Dimensions.get('window').width * 0.2, // 90% of screen width // Adjust the width to your requirement for the oval shape
                                    // height: 300, // Adjust the height to your requirement for the oval shape
                                    backgroundColor: Colors.textInputBackground,
                                    borderRadius: 600,
                                    transform: [
                                        {scaleX:Platform.OS == 'ios' ?  2 : 5}, // stretching the circle to create an oval shape
                                    ],
                                    position: 'absolute',
                                    opacity: 0.2,
                                    top: 0,
                                    bottom: 0,
                                }}></View>
                            
                            <WheelPicker
                                selectedIndex={pickerdata.findIndex((elm:any)=>elm == ((listData[count] as any).options[0]?.text).toString()) != -1 ? pickerdata.findIndex((elm:any)=>elm == ((listData[count] as any).options[0]?.text).toString()) : 0}
                                options={pickerdata}
                                onChange={(index) =>{
                                    const newValue = pickerdata[index];
                                        (listData[count] as any).options = [
                                            {
                                                selected: true,
                                                text: newValue,
                                            },
                                        ];
                                        setListData([...listData]);
                                }}
                                selectedIndicatorStyle={{
                                    height:  48 ,
                                    width:  60,
                                    backgroundColor: Colors.textInputBackground,
                                    borderRadius: 10,
                                }}
                                // itemTextStyle={{
                                //     color:'#fafafa'
                                // }}
                                containerStyle={{
                                    // borderWidth:1,
                                    justifyContent:'center',
                                    alignItems:'center'
                                }}
                            />
                        </View>
                    </View>
                </>
            )}
            {listData[count]?.options?.filter(item => item?.selected)?.length >
                0 && (
                <View
                    style={{position: 'absolute', width: '100%', bottom: 0}}
                    className="px-[15] mb-4">
                    <GradientBtn
                        onPress={submitData}
                        title={'Complete'}
                        isLoading={submitLoading}
                    />
                </View>
            )}
        </>
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
export default Weight;
