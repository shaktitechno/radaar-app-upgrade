import { View, Text, TouchableOpacity, ImageBackground } from 'react-native'
import React from 'react'
import { commonStyle } from '../constant/commonStyle'

const BackButton = (props:any) => {
    return (
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:10,marginBottom:10}}> 
            <TouchableOpacity onPress={()=>{
                if(props?.onPress){
                    props?.onPress();
                }else props.navigation.goBack()
            }} style={[commonStyle.backshadowButton,{    marginLeft:0}]} >
                <ImageBackground source={require('../assets/png/blackBack.png')} resizeMode='cover' style={{width:20,height:20}}></ImageBackground> 
            </TouchableOpacity> 
        </View>
    )
}

export default BackButton