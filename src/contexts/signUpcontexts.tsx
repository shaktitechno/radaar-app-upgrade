
import React, { createContext, useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { getSignupData } from '../services/api';
import { showErrorMessage } from '../services/alerts';

interface SignupContextType {
    signupState: any; // Replace 'any' with a more specific type if possible
    setSignupState: Dispatch<SetStateAction<any>>;
    getData:any
}

export const SignupDataContext = createContext<SignupContextType>({
    signupState: null,
    setSignupState: () => {}, // This is just a placeholder
    getData:()=>{}
}); 

export const SigninUpDataProvider = ({ children,token }:any) => {
    const [signupState,setSignupState]=useState<any>(null)

    const getData =()=>{
        // if(!token){
            getSignupData()
            .then(res=>{
                // console.log(res)
                if(res?.data?.status){
                    setSignupState({...res?.data?.data,getData})
                    return
                }
                showErrorMessage(res.data.message)
            })
        // }
    }
    // Add logic here to fetch user data, handle updates, etc.
    // console.log(signupState)
    useEffect(()=>{
        getData();
    },[token])
    return (
        <SignupDataContext.Provider value={{ signupState, setSignupState,getData}}>
            {children}
        </SignupDataContext.Provider>
    );
};