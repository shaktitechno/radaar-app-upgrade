import { ParamListBase, RouteProp } from "@react-navigation/native";
import { ReactNode } from "react"
import { StyleProp, ViewStyle } from "react-native"

export type login ={
    navigation:any,
    route:any,
}

export type navigateRoutes={

    route: RouteProp<ParamListBase, string>;
    navigation: any;

}

export type safecontainer = {
    children?:ReactNode,
    className?:string,
    style?:StyleProp<ViewStyle>
}


export type completeProfileType = {
    first_name: string,
	last_name: string,
	dob: string,
	gender: string, 
	interest: Array<string>,
    interested_in : string,
    age_range : Array<number | string>,
    bio : string
}
export type UpdateProfileType = {
    first_name: string,
	last_name: string,
	dob: string,
    bio : string,
    address:string,
    gender:string,
    user_images:any
}
export type swipeUserType = {
    swipeeUserId: string,
    swipeDirection: string
}
export type getUserForSwipe ={
    page:string;
}

export type UploadImages = {
    route: RouteProp<ParamListBase, string>,
    navigation: any
}