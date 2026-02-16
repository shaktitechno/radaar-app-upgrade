import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Image,
} from 'react-native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Header from './Header';
import Footer from './Footer';
import Colors from '../constant/colors';
import CustomText from './customText';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { commonStyle } from '../constant/commonStyle';
import { calculateAge } from '../constant/veriables';
// import { MultiStory, MultiStoryContainer } from 'react-native-story-view';
import { useFocusEffect } from '@react-navigation/native';
// import Footercomp from './Footer';

const MapUser = (props: any) => {
  const { user } = props;
  const multiStoryRef = useRef(null);
  const [visible, setVisible] = useState<boolean>(false);
  // const [profileImage,setProfileImage ] =useState<any>(null)
  // const [userDetails,setUserDetails] = useState<any>({
  //     id: user._id, //unique id (required)
  //     username: user.first_name +' '+ user.last_name, //user name on header
  //     title: 'Story', //title below username
  //     profile:'',
  // })
  const [comments, setComments] = useState<any>([]);
  const [stories, setStories] = useState<any>([]);
  const callStoryApi = () => {};

  // useEffect(()=>{
  //     setStories(user.stories.map((elm:any)=>({...elm,id:elm._id,isSeen:false,resolved:false})))
  // },[user._id,user.stories])
  // useEffect(()=>{
  //     // console.log('multiStoryRef',multiStoryRef)
  //     const [profile] = user.media.filter(((elm:any)=>elm?.mediaType == 'profile'))
  //     setProfileImage(profile)
  // },[user._id])

  // useEffect(()=>{
  //     setUserDetails((state:any)=>({...state, profile:profileImage?.mediaUrl && profileImage?.mediaUrl,}))
  //     // console.log('profileImage',profileImage)
  // },[profileImage])
  // console.log(stories)
  useEffect(() => {
    // console.log('=======>>>>>>',user.stories)
  }, []);
  useFocusEffect(
    useCallback(() => {
      // console.log(user?.stories)
      setComments(user?.stories?.map((elm: any) => elm?.comments || []));
      setStories(
        user?.stories?.map?.((elm: any) => ({
          ...elm,
          id: elm?._id,
          resolved: false,
        })),
      );
    }, [user._id, user.stories]),
  );
  // console.log('storiesds..............',user.first_name,user.last_name,user.stories)
  

  
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        props?.navigation.navigate('OtherUserProfile', { user: props.user });
      }}
      className={props.currentIndex == props.totalUser ? 'px-2 mr-5' : 'px-2'}
    >
      <View
        className={`px-2 h-[77] items-center bg-white flex-1 rounded-full flex-row `}
        style={[{ width: Dimensions.get('window').width - 130 }, styles.blur]}
      >
        {/* <Image 
                    source={require('../../assets/png/modal3.jpg')}
                    className='w-[57] h-[57] rounded-full'
                /> */}
        <View className="h-[57] w-[57] items-center justify-center ">
          {/* <MultiStory
            setIsStoryViewShow={setVisible}
            isStoryViewVisible={visible}
            scrollEnabled={false}
            style={{ padding: 0, margin: 0, borderWidth: 0 }}
            setComments={setComments}
            // contentContainerStyle={{justifyContent:'center',alignItems:'center',padding:0,margin:0}}
            // containerStyle={Image:{}}
            // stories={userStories}
            stories={[
              {
                id: user?._id, //unique id (required)
                username: user?.first_name + ' ' + user?.last_name, //user name on header
                title: 'Story', //title below username
                profile: user?.media?.filter(
                  (elm: any) => elm?.mediaType == 'profile',
                )?.[0]?.mediaUrl,
                stories,
              },
            ]}
            setStories={setStories}
            ref={multiStoryRef}
            avatarProps={{
              userImageStyle: { height: 50, width: 50 },
              containerStyle: {
                height: 57,
                width: 57,
                borderWidth: 2.5,
                borderRadius: 30,
                borderColor: Colors.primary,
              },
              viewedStoryContainerStyle: {
                height: 57,
                width: 57,
                borderRadius: 30,
                borderColor: stories.length > 0 ? Colors.grey : 'transparent',
                borderWidth: 2.5,
              },
            }}
            // all StoryContainer props applies here
            storyContainerProps={{
              renderHeaderComponent: ({
                userStories,
                progressIndex,
                userStoryIndex,
                ...rest
              }: any) => (
                <Header
                  {...{
                    userStories,
                    progressIndex,
                    multiStoryRef,
                    setVisible: setVisible,
                    ...rest,
                  }}
                />
              ),
              renderFooterComponent: ({
                userStories,
                progressIndex,
                userStoryIndex,
                ...rest
              }: any) => (
                <Footer
                  {...{
                    storycomments: comments,
                    setComments,
                    userStories,
                    progressIndex,
                    multiStoryRef,
                    userStoryIndex,
                    ...rest,
                  }}
                />
              ),
              // renderCustomView:()=>{
              //     return(
              //         <View className='flex-1 bg-red'>
              //         </View>
              //     )
              // },
              barStyle: {
                // barActiveColor: Colors.red,
              },
              // visible:true
            }}
          /> */}
        </View>
        <View className=" h-[57]  ml-[12] flex-1 ">
          <CustomText
            ellipsizeMode={'tail'}
            text={`${props.user?.first_name} ${props.user?.last_name}`}
            className="pb-[5] h-[35] pr-[4]"
            numberOfLines={1}
            style={[commonStyle.headingtextBold, { fontSize: 22 }]}
          />
          <View className="flex-row justify-between flex-1 pr-1.5">
            <View style={{ maxWidth: 100 }}>
              <CustomText
                numberOfLines={1}
                text={`${calculateAge(props?.user?.dob)} Years `}
                style={commonStyle.smalltext}
              />
            </View>
            <View className="flex-row flex-1 pr-[3] justify-end ">
              <Ionicons name="location-outline" size={16} color={Colors.red} />
              <CustomText
                style={[commonStyle.errorText, { fontSize: 15 }]}
                text={
                  (props.user?.distance
                    ? (props.user.distance / 1000).toFixed(2)
                    : 0) + ' km'
                }
              />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MapUser;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    height: 300,
    width: 300,
  },
  map: {
    flex: 1,
  },
  back: {
    borderRadius: 50,
    // borderWidth: 1,
    borderColor: Colors.red,
  },
  blur: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    // filter: 'blur(30px)'
  },
});
