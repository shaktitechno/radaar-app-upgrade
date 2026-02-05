
import React, { createContext, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { AppState } from 'react-native';
import { socket } from '../services/apiConfig';
import { getMyProfile } from '../services/api';


export const UserProfileData =createContext<any>(null)


export const UserProfileDataProvider = forwardRef(({ children,token,getMessages }:any,ref:any) => {
    const [userDetails,setUserDetails] =useState<any>({})
    useImperativeHandle(ref, () => ({
        _id: ()=>userDetails._id,
    }));
  
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            // console.log('App has gone to the background!',nextAppState);
            if (nextAppState == 'active') {
                // console.log('active')
                if(userDetails?._id){
                    getMessages()
                }
                // console.log('App has come to the foreground!');
                if(socket && userDetails?._id){
                    // console.log('OpenAppOpenApp')
                    socket?.emit?.('OpenApp',{userId:userDetails?._id})
                }
                
            } else if (nextAppState == 'background') {
                // console.log('inside of background ',socket,userDetails?._id);
                if(socket && userDetails?._id){
                    socket.emit('leaveApp',{userId:userDetails?._id})
                    // console.log('leaveAppjhgjhg')
                }
            }
        });

        return () => {
            subscription.remove(); // Unsubscribe on cleanup
        };
    }, [userDetails?._id,socket]);

    useEffect(()=>{
        if(socket && userDetails?._id){
            // console.log('OpenApp')
            socket?.emit?.('OpenApp',{userId:userDetails?._id})
        }
    },[socket && userDetails?._id])
   
    const getProfile = useCallback(async ()=>{
        if(token){
            return getMyProfile()
            .then((res:any)=>{
                const [profileImage] = res.data.user_images.filter(((elm:any)=>elm?.mediaType == 'profile'))
                const drink = res.data.user?.drink
                const eyeColor = res.data.user.eyeColor
                const story =res?.data?.stories?.map((elm:any)=>({...elm,id:elm._id,isSeen:false,resolved:false}))
                setUserDetails({...(res.data).user,user_images:res.data.user_images,profileImage,story,subscription:res?.data?.subscription,Drunk:drink})
               //  console.log('getMyProfile',res)
                return res
            })
        }
    },[token])

    useEffect(()=>{
        getProfile()
    },[token])
    return (
        <UserProfileData.Provider value={{getProfile,userDetails,setUserDetails,getMessages}} >
            {children}
        </UserProfileData.Provider>
    );
});