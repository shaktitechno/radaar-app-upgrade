import { Alert, Platform, ToastAndroid } from "react-native";



export const Toast = (message:string ) => {
	ToastAndroid.showWithGravityAndOffset(
		message,
		ToastAndroid.SHORT,
		ToastAndroid.BOTTOM,
		25,
		50
	);
};

export const showAlert = (key:string = "Success", value:string) => {
	Platform.OS == "ios" ? Alert.alert(key, value) : Toast(value);
};




export const showErrorMessage = (msg='Something went wrong') => showAlert('Oops',msg)

export const showSuccessMessage = (msg:string) => showAlert("Success!", msg);



