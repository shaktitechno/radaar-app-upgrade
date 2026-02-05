import { View, Text } from 'react-native'
import React from 'react'
import GradientBtn from './gradientBtn';

interface props{
    title: string;
    isLoading: boolean;
    onPress: () => void;
    icon?: string;
    gradient?: string[]; 
    style?:any;
}
const FloatingBtn = (props:props) => {
    return (
        <View className="px-[20] mb-[30] absolute bottom-0 w-full flex-row" style={props.style && props.style}>
            <View className="flex-1">
            <GradientBtn
                onPress={() => {
                props?.onPress()
                }}
                // onPress={()=>{handleSubmit(values.phoneNumber)}}
                title={props.title}
                icon={props.icon && props.icon}
                gradient={props.gradient && props.gradient}
                isLoading={props.isLoading && props.isLoading}
            />
            </View>
        </View>
    )
}

export default FloatingBtn