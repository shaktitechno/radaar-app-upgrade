import { View, Text } from 'react-native'
import React, { FC } from 'react'
import { safecontainer } from '../constant/types'
import { SafeAreaView } from 'react-native-safe-area-context'

const SafeContainer:FC<safecontainer> = ({children,style}) => {
    return (
        <SafeAreaView style={style} className='flex-1' >
            {children}
        </SafeAreaView>
    )
}

export default SafeContainer