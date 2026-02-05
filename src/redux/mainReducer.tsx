import { combineReducers } from "redux";
import { signupReducer } from "./action/signup";



const mainReducer = combineReducers({
    signUp:signupReducer
})


export default mainReducer

