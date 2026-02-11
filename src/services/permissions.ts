import { Alert, Platform,Linking, PermissionsAndroid } from "react-native";
import {check, PERMISSIONS,request, RESULTS,checkMultiple,requestMultiple} from 'react-native-permissions';


export const notificationPermissions = ()=>{
    if(Platform.OS == 'android'){
        check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS)
        .then(res=>{
            // console.log(res,Platform.OS)
            if(res == 'denied' || res == 'blocked'){
                request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS)
                .then(res=>{
                    // console.log('seconst222222',res)
                    if(res == 'blocked' || res == 'denied'){
                        Alert.alert(
                            'Permission Blocked',
                            'Permission to access notification is blocked. Open app settings to enable it?',
                            [
                                {
                                text: 'Cancel',
                                style: 'cancel',
                                },
                                {
                                text: 'Open Settings',
                                onPress: () => {
                                    // Open the app settings
                                    Linking.openSettings();
                                },
                                },
                            ]
                        );
                    }
                })
                .catch(err=>{
                    console.log('seconst3333333',err)
                })
            }
        })
        .catch(err=>{
            console.log(err)
        })
    }
}

export const audioVideoPermissions = () => {
    const granted = PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA, PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    granted.then((data)=>{
        if(!data) {
            const permissions = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, PermissionsAndroid.PERMISSIONS.CAMERA];
            PermissionsAndroid.requestMultiple(permissions);
        }
    }).catch((err)=>{
        console.log(err.toString());
    })
}

export const checkCamerapermissions = ()=>{
    if(Platform.OS == 'android'){
        check(PERMISSIONS.ANDROID.CAMERA)
        .then(res=>{
            if(res == 'denied' || res  == 'blocked'){
                request(PERMISSIONS.ANDROID.CAMERA)
                .then(res=>{
                    // console.log('seconst444444',res)
                    if(res == 'blocked' || res == 'denied'){
                        Alert.alert(
                            'Permission Blocked',
                            'We need access to your camera to allow you to take a profile picture. Please enable camera access. Open app settings to enable it?',
                            [
                                {
                                text: 'Cancel',
                                style: 'cancel',
                                },
                                {
                                text: 'Open Settings',
                                onPress: () => {
                                    // Open the app settings
                                    Linking.openSettings();
                                },
                                },
                            ]
                        );
                    }
                })
                .catch(err=>{
                    console.log('seconst5555555',err)
                })
            }
        })
        .catch(err=>{
            console.log(err)
        })
    }else{
        check(PERMISSIONS.IOS.CAMERA)
        .then(res=>{
            console.log('res',res)
            // if(res == 'denied' || res  == 'blocked'){
            //     request(PERMISSIONS.ANDROID.CAMERA)
            //     .then(res=>{
            //         // console.log('seconst666666',res)
            //         if(res == 'blocked' || res == 'denied'){
            //             Alert.alert(
            //                 'Permission Blocked',
            //                 'Permission to access camers is blocked. Open app settings to enable it?',
            //                 [
            //                     {
            //                     text: 'Cancel',
            //                     style: 'cancel',
            //                     },
            //                     {
            //                     text: 'Open Settings',
            //                     onPress: () => {
            //                         // Open the app settings
            //                         Linking.openSettings();
            //                     },
            //                     },
            //                 ]
            //             );
            //         }
            //     })
            //     .catch(err=>{
            //         console.log('seconst777777',err)
            //     })
            // }
        })
        .catch(err=>{
            console.log(err)
        })
    }
    
}
export const checkImages = ()=>{
    check(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES)
    .then(res=>{
        if(res == 'denied' || res  == 'blocked'){
            request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES)
            .then(res=>{
                console.log('seconst8888888',res)
                if(res == 'blocked' || res == 'denied'){
                    Alert.alert(
                        'Permission Blocked',
                        'We need access to your photos to allow you to upload a profile picture. Please enable photo access. Open app settings to enable it?',
                        [
                            {
                            text: 'Cancel',
                            style: 'cancel',
                            },
                            {
                            text: 'Open Settings',
                            onPress: () => {
                                // Open the app settings
                                Linking.openSettings();
                            },
                            },
                        ]
                    );
                }
            })
            .catch(err=>{
                console.log('images',err)
            })
        }
    })
    .catch(err=>{
        console.log(err)
    })
}


export const initialpermissions =()=>{
    requestMultiple([PERMISSIONS.ANDROID.POST_NOTIFICATIONS,PERMISSIONS.ANDROID.CAMERA,PERMISSIONS.ANDROID.READ_MEDIA_IMAGES])
}



export const locationPermissions = (callback:any)=>{
    
    if(Platform.OS == 'ios'){
        check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
        .then(res=>{
            // console.log('location permissions in ios ',res)
            if(res == 'granted' || res == 'limited'){
                callback(true)
            }else{
                callback(false)
            }
        })
        .catch(err=>{
            console.log('permissions',err)
        })
    }else{
        check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
        .then(res=>{
            // console.log('grented',res)
            if(res == 'denied' || res  == 'blocked'){
                console.log('insides')
                callback(false)
            }else if(res == 'granted' || res == 'limited'){
                callback(true)
            }
        })
        .catch(err=>{
            console.log('firstadc',err)
        })
    }
}



export const requestPermission = (callback:any, setLocationPermission:any) => {
    let permissionType:any;

    if (Platform.OS === 'android') {
        permissionType = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    } else if (Platform.OS === 'ios') {
        // Choose the appropriate permission type for your app
        // PERMISSIONS.IOS.LOCATION_WHEN_IN_USE for foreground use
        // PERMISSIONS.IOS.LOCATION_ALWAYS for background use
        permissionType = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
    }

    request(permissionType)
        .then(res => {
            console.log('Permission response:', res);
            if (res == 'granted' || res == 'limited') {
                setLocationPermission(true);
            } else if (res === 'blocked' || res === 'denied') {
                callback(true);
                // Optionally, guide users to settings if permission is blocked
            }
        })
        .catch(err => {
            console.error('Error requesting location permission:', err);
        });
};