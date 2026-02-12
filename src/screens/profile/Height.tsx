import React, {useContext, useEffect, useState} from 'react';
import {
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    View,
} from 'react-native';
import CustomText from '../../components/customText';
import {commonStyle} from '../../constant/commonStyle';
import BackButton from '../../components/backButton';
import Colors from '../../constant/colors';
import GradientBtn from '../../components/gradientBtn';
import {UserProfileData} from '../../contexts/userDetailscontexts';

  import WheelPicker from 'react-native-wheely';
import Fonts from '../../constant/fonts';
const Height = (props: any) => {
    const [listData, setListData] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const ref = React.useRef();
    const data = props?.route?.params?.data;
    const profileData = props?.route?.params?.profileData;
    const [pickerdata,setPickerData] = useState( Array.from({length:  241 - 90 + 1}, (_, index) => (index + 90).toString()))
    // const [dataSource, setDataSource] = useState([]);
    const {userDetails, setUserDetails} = useContext(UserProfileData);
    const [selectedAge, setSelectedAge] = useState('27'); // Default selected age
    useEffect(() => {
        // const dataArr = [];
        // for (let i = 1; i < 251; i++) {
        //     const cm = i == 1 ? ' cm' : ' cms';
        //     dataArr.push(i + cm);
        // }
        // setDataSource(dataArr);
        let data = [];
        data = profileData?.filter(
            item => item?.questions_name === 'height',
        );

        if (userDetails['height']?.length > 0) {
            data[0].options = [
                {
                    selected:
                        userDetails['height']?.length > 0
                            ? true
                            : false,
                    text:
                        parseInt(
                            userDetails['height']?.split('cm')[0],
                        ) - 1,
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
                    <View
                        style={{
                            paddingHorizontal: 20,
                            paddingTop: 5,
                            paddingBottom: 30,
                            flex: 1,
                        }}>
                        <CustomText
                            style={[
                                commonStyle.headingtextBold,
                                {fontSize: 20},
                            ]}>
                            {(listData[count] as any)?.question}
                        </CustomText>
                        <CustomText style={{fontFamily:Fonts.fontSemiBold, fontSize:15, color:Colors.black}}>
                            {(listData[count] as any)?.input_type ==
                            'multi_select'
                                ? 'Choose as many as you want:'
                                : (listData[count] as any)?.input_type ==
                                  'single_select'
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
                                    opacity: 0.4,
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
                                    height:  50 ,
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
            {(listData[count] as any)?.options?.filter(item => item?.selected)
                ?.length > 0 && (
                <View
                    style={{position: 'absolute', width: '100%', bottom: 0}}
                    className="px-[15] mb-4">
                    <GradientBtn
                        onPress={() => {
                            props?.navigation?.navigate('Weight', {
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
export default Height;
