import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Screen1 from '../screens/walkthrought/screen1';
import Screen2 from '../screens/walkthrought/screen2';
import Screen3 from '../screens/walkthrought/Screen3';
import SocialLogin from '../screens/signup/socialLogin';
import Login from '../screens/login/login';
import EnterCode from '../screens/enterCode';
import { SigninUpDataProvider } from '../contexts/signUpcontexts';
import { UserProfileDataProvider } from '../contexts/userDetailscontexts';
import { useEffect, useRef } from 'react';
import { getALLChatUsers } from '../services/api';
// import { useRecoilState } from 'recoil';
import { useChatState } from '../recoil/atoms/chatData';
import { ChatData, chatData, Message } from '../recoil/atoms/types';
import TabNavigation from './tabNavigation';
import { socket } from '../services/apiConfig';
import FirstNameDob from '../screens/firstNameDob';
import Gender from '../screens/signup/gender';
import GenderInterestedAgeGroup from '../screens/signup/genderInterestAgeGroup';
import OccupHobbiesDescri from '../screens/signup/occupationHobbiesDescri';
import Sports from '../screens/signup/sports';
import Work from '../screens/work';
import RecentPics from '../screens/signup/uploadImges';
import CameraComponent from '../components/CameraComponent';
import CallHistory from '../screens/call/callHistory';
import Settings from '../screens/setting/setting';
const StackNavigation = ({ token, intro }: any) => {
  const Stack = createNativeStackNavigator();
  const messages = useChatState(state => state.chatState);
  const setMessages = (value: chatData) =>
    useChatState.setState({ chatState: value });
  const messagesRef = useRef(messages);
  const userIDRef = useRef(null);
  useEffect(() => {
    const value = messages.data?.some(
      (elm: any) => elm.deliveredMessagesCount > 0,
    );
    setMessages((state: any) => ({ ...state, unreadMesage: value }));
  }, [messages.data]);

  const defaultOptions = () => {
    return {
      headerShown: false,
    };
  };
  const updateGlobleState = (response: any) => {
    try {
      // console.log('========>>>>>>',response)
      // console.log('========>>>>>> inside privte message ',messagesRef?.current)
      const message: Message = {
        ...response,
        _id: response?._id,
        sender: response?.sender,
        __v: 0,
        conversationId: response?.conversationId,
        message: response?.message as string,
        timestamp: response?.timestamp,
      };
      const index = messagesRef?.current?.data?.findIndex(
        (elm: any) =>
          elm?.user?._id == response?.sender ||
          elm?.user?._id == response?.receiver,
      );
      // console.log('index',index,messagesRef?.current?.data?.[index])
      if (index != -1) {
        setMessages?.((oldState: chatData) => {
          let oldData;
          // console.log('response.sender == userDetails._idresponse.sender == userDetails._id',userIDRef?.current?._id?.(),response.sender)
          // if(response.sender == userIDRef?.current?._id?.()){
          //     oldData = {...oldState?.data?.[index] }
          // }
          // else if(response.message_state == 'delivered'){
          //     oldData = {...oldState?.data?.[index],deliveredMessagesCount:(oldState?.data?.[index]?.deliveredMessagesCount  + 1) }
          // }
          if (
            response?.receiver == userIDRef?.current?._id?.() &&
            response.message_state == 'delivered'
          ) {
            oldData = {
              ...oldState?.data?.[index],
              deliveredMessagesCount:
                oldState?.data?.[index]?.deliveredMessagesCount + 1,
            };
          } else {
            oldData = { ...oldState?.data?.[index] };
          }
          // console.log('atdh dcisd ciaeuieihwdcow',oldState?.data?.[index].deliveredMessagesCount)
          oldData.messages = [message, ...oldData.messages];

          let newData = [...oldState?.data];
          newData.splice(index, 1);
          const updatedNewData = [...newData, { ...oldData }];
          messagesRef.current = { loading: false, data: updatedNewData };
          return {
            loading: false,
            data: updatedNewData,
          };
        });
      } else {
        getMessages();
      }
    } catch (err) {
      console.log('first>>>>>>>>>', err);
    }
  };
  useEffect(() => {
    // console.log('soxkertiddddd,',socket)
    if (socket) {
      socket.on('GetPrivateMessage', response => updateGlobleState(response));
      socket.on('all_meesage_see', (response: any) => {
        // console.log('seen ', response,my_id); // ok
        setMessages(state => {
          let newData = [...state?.data];
          const index = state?.data?.findIndex(
            (elm: any) => elm?._id == response?.conversation_id,
          );
          if (index != -1) {
            let oldData = { ...state?.data?.[index] };
            const newMessagesObj: Message[] = oldData?.messages?.map(
              (message: Message) => {
                // console.log('firstatestatestatestatest', message?.sender == response?.other_user_id && {...message,message_state:'seen'} )
                return message?.sender == response?.other_user_id
                  ? { ...message, message_state: 'seen' }
                  : { ...message };
              },
            );

            oldData.messages = newMessagesObj;
            newData[index] = oldData;
            // console.log('firstatestatestatestatest',newData,oldData)
          }
          messagesRef.current = { loading: false, data: newData };
          return {
            loading: false,
            data: newData,
          };
        });
      });
      socket.on('all_meesage_delivered', (response: any) => {
        // console.log('seen ', response,my_id); // ok
        setMessages(state => {
          let newData = [...state?.data];
          const index = state?.data?.findIndex(
            (elm: any) => elm?._id == response?.conversation_id,
          );
          if (index != -1) {
            let oldData = { ...state?.data?.[index] };
            const newMessagesObj: Message[] = oldData?.messages?.map(
              (message: Message) => {
                // console.log('firstatestatestatestatest', message?.sender == response?.other_user_id && {...message,message_state:'seen'} )
                return message?.sender == response?.other_user_id &&
                  message?.message_state == 'sent'
                  ? { ...message, message_state: 'delivered' }
                  : { ...message };
              },
            );

            oldData.messages = newMessagesObj;
            newData[index] = oldData;
            // console.log('firstatestatestatestatest',newData,oldData)
          }
          messagesRef.current = { loading: false, data: newData };
          return {
            loading: false,
            data: newData,
          };
        });
      });
      socket.on('NewUserMsg', (response: any) => {
        console.log('firstresponseresponseresponse');
        getMessages();
        // console.log('first09090909000',response)
      });
      socket.on('chatRequestAccepted', response => {
        setMessages?.((oldState: chatData) => {
          const updatedState: ChatData[] = oldState?.data?.map(
            (elm: ChatData, ind) =>
              elm?._id == response?.conversation_id
                ? { ...elm, requestStatus: 'accepted' }
                : elm,
          );
          messagesRef.current = { loading: false, data: updatedState };
          return {
            data: updatedState,
            loading: false,
          };
        });
        // // setRequestStatus('accepted')
      });
      socket.on('chatRequestRejected', response => {
        setMessages?.((oldState: chatData) => {
          const updatedState: ChatData[] = oldState?.data?.map(
            (elm: ChatData, ind) =>
              elm?._id == response?.conversation_id
                ? { ...elm, requestStatus: 'rejected' }
                : elm,
          );
          messagesRef.current = { loading: false, data: updatedState };
          return {
            data: updatedState,
            loading: false,
          };
        });
      });
      socket.on('userOffline', (response: any) => {
        // console.log('ofline other user',response)
        setMessages?.((oldState: chatData) => {
          const newarrv = oldState.data.map((elm: any) =>
            elm?._id == response.chatId
              ? { ...elm, user: { ...elm.user, isOnline: false } }
              : elm,
          );
          messagesRef.current = { loading: false, data: newarrv };
          return { data: newarrv, loading: false };
        });
      });
      socket.on('userOnline', (response: any) => {
        // console.log('online other user',response)
        setMessages?.((oldState: chatData) => {
          const newarrv = oldState.data.map((elm: any) =>
            elm?._id == response.chatId
              ? { ...elm, user: { ...elm.user, isOnline: true } }
              : elm,
          );
          messagesRef.current = { loading: false, data: newarrv };
          return { data: newarrv, loading: false };
        });
      });
      socket.on('sendReactOnPrivateMessage', (response: any) => {
        // console.log('sendReactOnPrivateMessage>> ', response); // ok
        // console.log(messagesRef)
        const index = messagesRef?.current?.data?.findIndex(
          (elm: any) => elm?._id == response.conversationId,
        );
        // if(response.sender == my_id){return }
        if (index != -1) {
          setMessages?.((oldState: chatData) => {
            let oldData = { ...oldState.data?.[index] };
            oldData.messages = oldData.messages.map((elm: any) =>
              elm._id == response.message_id
                ? {
                    ...elm,
                    reaction: elm.reaction.map((res: any) =>
                      res.user_id == response.sender
                        ? { ...res, reaction: response.message }
                        : res,
                    ),
                  }
                : elm,
            );

            let newData = [...oldState.data];
            newData.splice(index, 1);
            const updatedNewData = [...newData, { ...oldData }];
            messagesRef.current = { loading: false, data: updatedNewData };
            messagesRef.current = { loading: false, data: updatedNewData };
            return {
              loading: false,
              data: updatedNewData,
            };
          });
        }
      });
      socket.on('GotBlocked', (response: any) => {
        getMessages();
      });
      socket.on('GotUnBlocked', (response: any) => {
        getMessages();
      });
    }
  }, [socket]);
  const getMessages = () => {
    // setLoading(true)
    getALLChatUsers().then(res => {
      console.log("res::", res)
      // console.log('chat data is heeer2',res)
      // console.log('data==-=-=-=-chat',res.data?.chats)
      // setTimeout(() => {
      // setLoading(false)
      messagesRef.current = { loading: false, data: res?.data?.chats };
      setMessages({ loading: false, data: res?.data?.chats });
      // }, 1000)
      // setUsers(res?.data?.chats)
    });
  };
  useEffect(() => {
    if (token) {
      getMessages();
    }
  }, [token]);
  console.log('token::', token);
  const screen = intro ? 'SocialLogin' : 'Screen1';
  return (
    <SigninUpDataProvider token={token}>
      <UserProfileDataProvider ref={userIDRef} {...{ token, getMessages }}>
        <Stack.Navigator
          screenOptions={defaultOptions()}
          initialRouteName={token ? 'MyTabs' : screen}
        >
          <Stack.Screen name="Screen1" component={Screen1} />
          <Stack.Screen name="Screen2" component={Screen2} />
          <Stack.Screen name="Screen3" component={Screen3} />
          <Stack.Screen name="SocialLogin" component={SocialLogin} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="EnterCode" component={EnterCode} />
          <Stack.Screen name="MyTabs" component={TabNavigation} />
          <Stack.Screen name="FirstName" component={FirstNameDob} />
          <Stack.Screen name="Gender" component={Gender} />
          <Stack.Screen
            name="GenderInterest"
            component={GenderInterestedAgeGroup}
          />
          <Stack.Screen
            name="OccupHobbiesDescri"
            component={OccupHobbiesDescri}
          />
          <Stack.Screen name="Sports" component={Sports} />
          <Stack.Screen name="Work" component={Work} />
          <Stack.Screen name="UploadImages" component={RecentPics} />
          <Stack.Screen name="CameraComponent" component={CameraComponent} />
          <Stack.Screen name='CallHistory' component={CallHistory} />
          <Stack.Screen name="Settings" component={Settings}  />


        </Stack.Navigator>
      </UserProfileDataProvider>
    </SigninUpDataProvider>
  );
};

export default StackNavigation;
