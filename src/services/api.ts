import axios from 'axios';
import { getHOST, getHeaders, getToken, removeStorage } from './apiConfig';

import { CommonActions } from '@react-navigation/native';
import ApiRoutes from '../constant/apiRoutes';
import { dispatch } from "./navigationServices";
import { completeProfileType, getUserForSwipe, swipeUserType, UpdateProfileType } from '../constant/types';
import { onUserLogout } from '../contexts/callingContaxt';


let headers = {};
let navigatedToLogin = false;
console.log(' getHOST() :', getHOST());
const axiosInstance = axios.create({
  baseURL: getHOST(),
  headers,
});

axiosInstance.interceptors.request.use(
  async (config: any) => {
    const token = await getToken();
    //console.log("token :",token);
    // console.log(token,config.headers)
    if (token && !config.headers.customToken) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    config.headers = { ...getHeaders(config.url), ...config.headers };
    // console.log('token:----',token)

    return config;
  },
  error => {
    Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  async config => {
    // console.log(config)
    return config;
  },
  async error => {
    console.log('error :', error);
    if (error?.response?.status == 401) {
      if (!navigatedToLogin) {
        // showErrorMessage(error?.response?.data?.message)
        dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'SocialLogin' }],
          }),
        );
        // setMessages({loading:false,data:[]})
        onUserLogout();
        navigatedToLogin = true;
      }

      // AsyncStorage.clear()
      removeStorage();
    } else if (error) {
      // showErrorMessage(error?.message)
      return;
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;

export const getOtp = async (payload: any, setLoading: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.getotp, payload);
    setLoading(false);
    return res;
  } catch (err) {
    setLoading(false);
    console.log(err);
    throw err;
  }
};

export const googleSocialLogin = async (payload: any, setLoading: any) => {
  // console.log('$$$ >>> ',payload.loginType)
  try {
    const res = await axiosInstance.post(
      ApiRoutes.googleSocialLogin,
      { loginType: payload.loginType },
      {
        headers: {
          Authorization: `Bearer ${payload.res.idToken}`,
          customToken: true,
        },
      },
    );
    console.log("res::",res)
    setLoading(false);
    return res;
  } catch (err) {
    setLoading(false);
    console.log(err);
    throw err;
  }
};

export const verifyOtp = async (payload: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.verifyOtp, payload);
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const completeProfile = async (payload: completeProfileType) => {
  try {
    const res = await axiosInstance.post(
      ApiRoutes.completeUserProfile,
      payload,
    );
    // console.log('object',res.data)
    if (navigatedToLogin == true) {
      navigatedToLogin = false;
    }
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getSignupData = async () => {
  try {
    // console.log('askhdvasjgdvaskhbd')
    const res = await axiosInstance.post(ApiRoutes.getSignupData);
    // console.log('object',res.data)
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const UpdateProfle = async (payload: UpdateProfileType) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.updateProfile, payload);
    // console.log('object',res.data)
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const swipeUser = async (payload: swipeUserType) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.registerSwipe, payload);
    console.log('swipeUser :', res.data);
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getuserForSwipe = async (payload?: getUserForSwipe) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.getMySwipes);
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getTempNavigation = async (payload?: getUserForSwipe) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.tempNavifation);
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const uploadFile = async (payload: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.uploadFile, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // console.log(res)
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getMyProfile = async () => {
  try {
    const res = await axiosInstance.post(ApiRoutes.getUserProfile);
    // console.log('getUserProfilegetUserProfile',JSON.stringify())
    if (res?.data?.getUserDetails?.length == 0) {
      navigatedToLogin = true;
      dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'SocialLogin' }],
        }),
      );
      // setMessages({loading:false,data:[]})
      // AsyncStorage.clear()
      removeStorage();
      throw {
        response: {
          status: 401,
          data: { message: 'Unauthorized access or no user details found.' },
        },
      };
    }
    if (navigatedToLogin == true) {
      navigatedToLogin = false;
    }
    let profileImg = {};
    const restImg = res?.data?.getUserDetails?.[0]?.media.filter((elm: any) => {
      if (elm?.mediaType == 'profile') {
        profileImg = elm;
        return false;
      }
      return true;
    });
    const data = {
      user: {
        ...res?.data?.getUserDetails?.[0],
        plan_details: res?.data?.getUserDetails?.[0]?.plan_details?.[0] || {},
        setting: res?.data?.setting || {},
      },
      user_images: [profileImg, ...restImg],
      stories: res?.data?.getUserDetails?.[0]?.stories || [],
      subscription: res?.data?.benift_available || {},
    };
    return { ...res, data };
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getALLChatUsers = async () => {
  try {
    const res = await axiosInstance.post(ApiRoutes.GetAllChatUsers);
    const chats = res?.data?.chats?.reverse();
    // console.log('asddaderqw',chats)
    return { ...res, data: { ...res.data, chats } };
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const searchUser = async (payload: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.getSearchedUsers, payload);
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const deletUser = async () => {
  try {
    const res = await axiosInstance.post(ApiRoutes.deleteMyProfile);
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const reportBlockuser = async (payload: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.blockReportUser, payload);
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const unblockUser = async (payload: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.unblockUser, payload);
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getUsersWhoLikedMe = async (payload: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.GetUserWhoLikeMe, payload);
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getmyMatches = async (paylaod: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.GetMyMatches, paylaod);
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getPurchase = async (paylaod: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.getPurchase, paylaod);
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const uploadStory = async (payload: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.uploadstory, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // console.log(res)
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const viewStory = async (payload: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.viewStory, payload);
    // console.log(res)
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const addCommentToStory = async (payload: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.addCommentToStory, payload);
    // console.log(res)
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const adddTextStory = async (payload: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.uploadTextStory, payload);
    // console.log(res)
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const deletStoty = async (payload: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.deleteUserStory, payload);
    // console.log(res)
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const pushNotification = async (payload: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.saveUserFcm, payload);
    // console.log(res)
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
export const getUserById = async (payload: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.getUserById, payload);
    // console.log(res)
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getSubscriptionPlan = async () => {
  try {
    const res = await axiosInstance.post(ApiRoutes.getAllSubscription);
    // console.log(res)
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const initPayment = async (payload: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.createPayment, payload);
    // console.log(res)
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
export const userSubscription = async (payload: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.userSubscription, payload);
    return res;
  } catch (err) {
    throw err;
  }
};

export const logoutApi = async () => {
  try {
    const res = await axiosInstance.post(ApiRoutes.logout);
    // console.log(res)
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const uploadMessagesMedia = async (payload: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.chatImages, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // console.log(res)
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getCompleteProfileData = async (payload: any) => {
  try {
    const res = await axiosInstance.post(
      ApiRoutes.completeProfileData,
      payload,
    );
    // console.log(res)
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const submitCompleteProfileData = async (payload: any) => {
  try {
    const res = await axiosInstance.post(
      ApiRoutes.submitCompleteProfileData,
      payload,
    );
    // console.log(res)
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
export const submitSettings = async (payload: any) => {
  try {
    const res = await axiosInstance.post(
      ApiRoutes.submitCompleteProfileData,
      payload,
    );
    // console.log(res)
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const deletChat = async (payload: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.deleteChat, payload);
    // console.log(res)
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getBlockuserList = async () => {
  try {
    const res = await axiosInstance.post(ApiRoutes.blockuUsersList);
    // console.log(res)
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// export const submitSettings = async (payload:any)=>{
//     try{
//         const res= await axiosInstance.post(
//             ApiRoutes.submitCompleteProfileData,
//             payload,
//             )
//         // console.log(res)
//         return res
//     }
//     catch(err){
//         console.log(err)
//         throw(err)
//     }
// }

export const checkOtherUserPlan = async (payload: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.otherUserPlan, payload);
    // console.log(res)
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
export const callLog = async (payload: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.callLog, payload);
    // console.log(res)
    return res;
  } catch (err) {
    console.log('callLog error', err);
    throw err;
  }
};

export const callLogHisorty = async (payload: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.calHistory, payload);
    // console.log(res)
    return res;
  } catch (err) {
    console.log('callLogHisorty error', err);
    throw err;
  }
};

export const updateTimeApi = async (payload: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.deductCall, payload);
    return res;
  } catch (err) {
    console.log('updateTimeApi error', err);
    throw err;
  }
};

export const deleteFiles = async (payload: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.dleteFile, payload);
    return res;
  } catch (err) {
    console.log('deleteFiles error', err);
    throw err;
  }
};

export const cacelSub = async (payload: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.cancelSubscription, {
      user_subscription_id: payload?.user_subscription_id,
      subscription_id: payload?.subscription_id,
    });
    return res;
  } catch (err) {
    console.log('cacelSub error', err);
    throw err;
  }
};

export const checkBlockedUser = async (payload: any) => {
  try {
    const res = await axiosInstance.post(ApiRoutes.checkBlockedStatus, payload);
    console.log('first', res);
    return res;
  } catch (err) {
    console.log('cacelSub error', err);
    throw err;
  }
};

export const validateApplePayment = async (payload: any) => {
  try {
    const res = await axiosInstance.post(
      ApiRoutes.validateApplePayment,
      payload,
    );
    // console.log('validateApplePayment------->>>>>>>>',res)
    return res;
  } catch (err) {
    console.log('validateApplePayment error', err);
    throw err;
  }
};

export const restoreGooglePurchase = async (paylaod: any) => {
  try {
    const res = await axiosInstance.post(
      ApiRoutes.restoreGooglePurchase,
      paylaod,
    );
    return res;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
