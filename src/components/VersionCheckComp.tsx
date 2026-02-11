import { View, Text, StyleSheet, TouchableOpacity, Platform, Linking } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import Colors from '../constant/colors'
import VersionCheck from 'react-native-version-check';




const VersionCheckComp = () => {
    const [isAppUpdate,setIsAppUpdate] = useState(false)
    const checkForUpdate = async (): Promise<void> => {
        try {
            const latestVersion = await VersionCheck.getLatestVersion();
            
            const currentVersion = VersionCheck.getCurrentVersion();

            if (VersionCheck.needUpdate({ currentVersion, latestVersion }).isNeeded) {
                setIsAppUpdate(true)
                console.log("YESS")
            }else{
               // setIsAp
               setIsAppUpdate(false)
                console.log("NOO")
            }

        } catch (error) {
            console.error('Failed to check for updates:', error);
        }
    };
    
    useEffect(() => {
        console.log("checkForUpdate calling")
        checkForUpdate();
    }, []);
return (
        <>
            {isAppUpdate &&
                    
                
                <View style={{
                    position: 'absolute',
                    zIndex:9,
                    bottom: 0, // Sticks the view to the bottom
                    left: "0",
                    right:"0", // Centers the view horizontally

                    width: '100%', // Adjust the width as needed
                    height: 70, // Adjust the height as needed
                    justifyContent: 'center', // Centers the text vertically
                    alignItems: 'center', // Centers the text horizontally
                    }}>
                        <View style={{backgroundColor:Colors.primary, width:"90%", height:35, flexDirection:'column', alignItems:'center', justifyContent: 'center', borderRadius:5}}>
                            <TouchableOpacity onPress={()=>{ Platform.OS == 'ios' ?  Linking.openURL('https://apps.apple.com/app/hotspot-meet/id6502972597') :   Linking.openURL('https://play.google.com/store/apps/details?id=com.hotspotmeet')}}>
                                <Text style={{ color: 'white', textAlign:'center', fontSize:15}}>A new version of the app is available! <Text style={{fontWeight:600}}>Update App</Text></Text>
                            </TouchableOpacity>
                        
                        
                        </View>
                    
                </View>
                
            }
        </>
    ) 
}

export default VersionCheckComp

