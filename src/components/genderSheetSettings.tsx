import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { commonStyle } from '../constant/commonStyle';
import Colors from '../constant/colors';
import CustomText from './customText';
import { submitSettings } from '../services/api';
import GradientBtn from './gradientBtn';
import { showSuccessMessage } from '../services/alerts';
import CheckList from './checkListSettings';

const GenderSheet = (props:any) => {
    const [genderData, setGenderData] = useState([...props?.genderData]);
    // const genderData= ["Women" , "Men", "Everyone"];
    const [activeGender , setGender] = useState(props?.default);
    const [loading , setLoading] = useState(false);

    // useEffect(() => {
    //     props?.activeGender(activeGender);
    // }, [activeGender])

    // function onSave() {
    //     setLoading(true);
    //     submitSettings({interested_in: genderData?.filter(item => item?.name == activeGender)[0]?.value}).then((res) => {
    //         showSuccessMessage(res?.data?.message)
    //         setLoading(false);
    //         props?.activeGender(activeGender);
    //     }).catch(() => {})
    // }
    return (
        <>
            <View style={{
                    flexDirection: 'row',
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
            </View>
            <View>
                { genderData.map((data,index) => {
                    return(
                        <CheckList
                            onPress={() =>{   props?.activeGender(data?.name);setGender(data?.name)}}
                            item={data?.name}
                            checked={data?.name == activeGender ? true : false}
                            key={index}
                            index={index}
                        />
                    )
                })}
            </View>
        </>
    );
};

export default GenderSheet;