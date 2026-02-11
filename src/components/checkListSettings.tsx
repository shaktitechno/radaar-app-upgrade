import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Colors from '../constant/colors';
import CustomText from './customText';
// import { COLORS, FONTS, SIZES } from '../../constants/theme';
import Fonts from '../constant/fonts';

interface CheckListProps {
    item: any;
    checked: boolean;
    onPress: () => void;
    index: number;
  }
  
const CheckList : React.FC<CheckListProps>  = ({item,checked,onPress, index}) => {
    return (
        <>
            <TouchableOpacity
                onPress={() => onPress()}
                style={[{
                    borderBottomWidth: index == 2 ? 0 : 1,
                    marginBottom:5,
                    borderColor:Colors.borderColor,
                    paddingHorizontal:15,
                    paddingVertical:14,
                    flexDirection:'row',
                    alignItems:'center',
                }]}
            >
                <CustomText style={{color:Colors.text,fontSize:16,top:1,flex:1, fontFamily:Fonts.fontBold}}>{item?.name ? item?.name : item}</CustomText>
                <View
                    style={[{
                        height:16,
                        width:16,
                        borderWidth:1.5,
                        borderRadius:10,
                        borderColor:Colors.borderColor,
                        marginLeft:10,
                        alignItems:'center',
                        justifyContent:'center',
                    }, checked && {
                        borderColor:Colors.primary,
                    }]}
                >
                    {checked &&
                        <View
                            style={{
                                height:8,
                                width:8,
                                borderRadius:8,
                                backgroundColor:Colors.primary,
                            }}
                        />
                    }
                </View>
            </TouchableOpacity>
        </>
    );
};

export default CheckList;