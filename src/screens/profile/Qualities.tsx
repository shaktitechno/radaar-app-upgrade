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
// import ForwardButton from '../../components/ForwardButton';
import Colors from '../../constant/colors';
// import BackwardButton from '../../components/BackwardButton';
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

const Qualities = (props: any) => {
    const [listData, setListData] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const data = props?.route?.params?.data;
    const profileData = props?.route?.params?.profileData;
    const {userDetails, setUserDetails} = useContext(UserProfileData);

    useEffect(() => {
        let data;
        data = JSON.stringify(profileData?.filter(item => item?.questions_name === 'partnerQualities'));
        data = JSON.parse(data);
        let options = data[0].options;
        data[0].options = [];
        options?.map(item => {
            data[0].options = [
                ...data[0].options,
                {
                    selected:
                        userDetails['partnerQualities']?.filter(i => i === item)
                            ?.length > 0
                            ? true
                            : false,
                    text: item,
                },
            ];
        });
        setListData(data);
        setLoading(false);
    }, []);

    const [submitLoading, setSubmitLoading] = useState(false);

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
                               
                            ]}>
                            {listData[count]?.question}
                        </CustomText>
                        <CustomText style={{fontFamily:Fonts.fontSemiBold, fontSize:15, color:Colors.black}}>
                            {listData[count]?.input_type == 'multi_select'
                                ? 'Choose as many as you want:'
                                : listData[count]?.input_type == 'single_select'
                                ? ''
                                : ''}{' '}
                        </CustomText>
                        <ScrollView style={{height: '65%'}}>
                            <View style={{marginTop: 10}}>
                                <View style={[styles.flexRow, styles.flexWrap]}>
                                    {listData[count].options?.map(
                                        (item, index) => (
                                            <TouchableOpacity
                                                style={
                                                    item.selected == false
                                                        ? {
                                                              borderColor:
                                                                  Colors.grey,
                                                              borderWidth: 1,
                                                          }
                                                        : {
                                                              borderColor:
                                                                  Colors.primary,
                                                              borderWidth: 1,
                                                          }
                                                }
                                                className={` px-[15] py-[6] mx-[4] my-[4]  rounded-[30px] `}
                                                onPress={() => {
                                                    if (
                                                        listData[count]
                                                            ?.input_type ==
                                                        'multi_select'
                                                    ) {
                                                        listData[count].options[
                                                            index
                                                        ].selected =
                                                            !listData[count]
                                                                .options[index]
                                                                .selected;

                                                        setListData([
                                                            ...listData,
                                                        ]);
                                                    } else {
                                                        let data = [];
                                                        listData[
                                                            count
                                                        ]?.options?.map(i => {
                                                            i.selected = false;
                                                        });
                                                        data = listData;

                                                        data[count].options[
                                                            index
                                                        ].selected =
                                                            !data[count]
                                                                .options[index]
                                                                .selected;

                                                        setListData([...data]);
                                                        // setListData(data);
                                                    }
                                                }}>
                                                <CustomText
                                                    className={`${
                                                        item.selected == false
                                                            ? 'text-title'
                                                            : 'text-borderPrimary'
                                                    } `}
                                                    style={{
                                                        fontFamily:
                                                        Fonts.fontBold,
                                                        fontSize: 15,
                                                    }}>
                                                    {item?.text}
                                                </CustomText>
                                            </TouchableOpacity>
                                        ),
                                    )}
                                </View>
                                <View style={{paddingBottom:100}} ></View>
                            </View>
                        </ScrollView>
                    </View>
                </>
            )}
            {listData[count]?.options?.filter(item => item?.selected)?.length >
                0 && (
                <View
                    style={{position: 'absolute', width: '100%', bottom: 0}}
                    className="px-[15] mb-4">
                    <GradientBtn
                        onPress={() => {
                            props?.navigation?.navigate('EyeColor', {
                                data: [...data, listData[0]],
                                profileData,
                            });
                        }}
                        title={'Continue'}
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
export default Qualities;
