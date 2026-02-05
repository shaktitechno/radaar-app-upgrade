import { View, Text, StyleProp, TextStyle,TextProps, TouchableOpacity, Platform } from 'react-native'
import React, { ReactNode, useState } from 'react'
import { commonStyle } from '../constant/commonStyle'
import Colors from '../constant/colors'
import Fonts from '../constant/fonts'

type props = {
    text?:string 
      // newText?:string | ReactNode
      readmore?:boolean
      style?:StyleProp<TextStyle>, 
      customeStyle?:StyleProp<TextStyle>,
      className?:string,
      numberOfLines?:number | undefined
      children?:string | ReactNode | undefined
      ellipsizeMode?:any
}


const CustomText = ({readmore,text,style={},customeStyle,numberOfLines,children,ellipsizeMode}:props) => {
    const [show,setShowAll] =useState(false)
    return (
        <Text
            numberOfLines={numberOfLines && numberOfLines}
            style={[commonStyle.regulartext,customeStyle,style,]}>
            {!readmore 
            ? (text || children)
            :
            show ? text : (text?.substring(0,180))
            }
            {readmore && 
                (Platform.OS == 'ios' ? 
                <TouchableOpacity activeOpacity={1} onPress={()=>setShowAll(state=>!state)} className='mb-[-2]'>
                    <Text ellipsizeMode={ellipsizeMode && ellipsizeMode} numberOfLines={1}  style={[commonStyle.smalltext,{fontSize:16,color:Colors.danger,marginLeft:2,fontFamily:Fonts.fontRegular}]}  >
                    {!show && <Text style={{color:Colors.text}}>...  </Text>}
                        {show ? ' Read less' : 'Read more'}
                    </Text>
                </TouchableOpacity>
                :
                <Text onPress={()=>setShowAll(state=>!state)} ellipsizeMode={ellipsizeMode && ellipsizeMode} numberOfLines={1}  style={[commonStyle.smalltext,{fontSize:16,color:Colors.danger,marginLeft:2,fontFamily:Fonts.fontRegular}]}  >
                {!show && <Text style={{color:Colors.text}}>...  </Text>}
                    {show ? ' Read less' : 'Read more'}
                </Text>)
            }
        </Text>
    )
}

export default CustomText