import {
  View,
  Text,
  Image,
  Platform,
  KeyboardAvoidingView,
  Animated,
  NativeModules,
  NativeTouchEvent,
  Dimensions,
  Keyboard,
} from 'react-native';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Reanimated, {
  Extrapolate,
  interpolate,
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native';
import Colors from '../constant/colors';
import CustomInput from './customInput';
import PhotoEditor from 'react-native-photo-editor';
import CustomText from './customText';
import { commonStyle } from '../constant/commonStyle';
import RNFS from 'react-native-fs';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import uuid from 'react-native-uuid';
import Feather from 'react-native-vector-icons/Feather';
import SimpleBtn from './simpleBtn';
import GradientBtn from './gradientBtn';
import { uploadStory } from '../services/api';
import Video from 'react-native-video';
// import { showEditor } from 'react-native-video-trim';
import { NativeEventEmitter } from 'react-native';
import mime from 'mime';
import { useFocusEffect } from '@react-navigation/native';
import {
  CameraOptions,
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import { ActivityIndicator } from 'react-native';
import { showErrorMessage, showSuccessMessage } from '../services/alerts';
import { Video as videoCompressior } from 'react-native-compressor';
import { useRecoilState } from 'recoil';

const { RNPhotoEditor } = NativeModules;
interface CameraComponentProps {
  navigation?: any;
  route: any;
}
const { width, height, scale } = Dimensions.get('window');
const targetAspectRatio = 16 / 9; // 9:16 aspect ratio

// Calculate the adjusted height to maintain the target aspect ratio
const adjustedHeight = width * targetAspectRatio;

// Calculate the dynamic margin by subtracting the adjusted height from the actual height
const dynamicMargin = (height - adjustedHeight) / 2;

const screenAspectRatio = (height - 2 * dynamicMargin) / width;

// console.log('screenAspectRatio',height,dynamicMargin)
const generateRandomImagePath = (type?: 'photo' | 'video' | '') => {
  const randomString = uuid.v4().toString();
  if (type == 'video') {
    return Platform.OS == 'ios'
      ? `${RNFS.DocumentDirectoryPath}/${randomString}.mov`
      : `${RNFS.DocumentDirectoryPath}/${randomString}.mov`;
  } else {
    return `${RNFS.DocumentDirectoryPath}/${randomString}.jpg`;
  }
};
const CameraComponent = ({ navigation, route }: CameraComponentProps) => {
  const captureimageFromFGalary = route?.params?.data;
  const mediaTypeFromProps = route?.params?.mediaType;
  const loadingFromProp = route?.params?.loading;
  const [capturedImage, setCapturedImage] = useState<any>(null);
  const [caption, setCaption] = useState('');
  const [VedioEditing, SetVideoEditing] = useState<boolean>(false);
  const [mediaType, setMediaType] = useState<'photo' | 'video' | ''>('');
  const [editedImagePath, setEditedImagePath] = useState(
    generateRandomImagePath(),
  );
  const [loding, setLoading] = useState<boolean>(false);
//   const [uploadStoryState, setUploadStoryState] = useRecoilState(storyUpload);
  // const device = devices.back

  useFocusEffect(
    useCallback(() => {
      if (captureimageFromFGalary) {
        onMediaCaptured(
          { ...captureimageFromFGalary, path: captureimageFromFGalary.uri },
          mediaTypeFromProps,
        );
      }
    }, []),
  );

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(NativeModules.VideoTrim);
    const subscription = eventEmitter.addListener('VideoTrim', event => {
      switch (event.name) {
        case 'onShow': {
          console.log('onShowListener', event);
          SetVideoEditing(true);
          break;
        }
        case 'onHide': {
          console.log('onHide', event);
          SetVideoEditing(false);
          break;
        }
        case 'onStartTrimming': {
          console.log('onStartTrimming', event);
          // setEditedImagePath(event.outputPath)

          break;
        }
        case 'onFinishTrimming': {
          console.log('onFinishTrimming', event);
          const newPath = generateRandomImagePath('video');
          setEditedImagePath(newPath);
          RNFS.copyFile(event.outputPath, newPath);

          setCapturedImage({
            ...capturedImage,
            uri: `file://${newPath}`,
            path: `file://${newPath}`,
          });
          // setCapturedImage((state:any)=>({...state,uri: event.outputPath}))
          break;
        }
        case 'onCancelTrimming': {
          console.log('onCancelTrimming', event);
          break;
        }
        case 'onError': {
          console.log('onError', event);
          break;
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const EditVedio = async (videoPath: string) => {
    // SetVideoEditing(true)
    // showEditor(videoPath,{
    //     maxDuration:30,
    //     saveToPhoto:false,
    // })
  };

  const onPressEdit = () => {
    console.log('edited imsage', capturedImage.path);
    if (mediaType == 'photo') {
      PhotoEditor.Edit({
        hiddenControls: ['save', 'share'],
        path: capturedImage?.path,
        onDone: path => {
          const newPath = generateRandomImagePath();
          setEditedImagePath(newPath);
          RNFS.copyFile(path, newPath)
            .then(() => {
              // const newPath = generateRandomImagePath()
              // setEditedImagePath(newPath);
              setCapturedImage({ ...capturedImage, uri: `file://${newPath}` });
            })
            .catch(error => {
              console.error('Error copying file:', error);
            });
        },
        onCancel: path => {
          console.log('Photo edit cancelled. Path:', path);
        },
      });
    } else {
      EditVedio(capturedImage.path);
    }
  };

  const onMediaCaptured = useCallback(
    (media: any, type: 'photo' | 'video') => {
      // console.log(`Media captured! ${JSON.stringify(media) , type}`)
      // console.log('media.path',media.path)
      const newPath = generateRandomImagePath(type);
      setEditedImagePath(newPath);
      setMediaType(type);
      RNFS.copyFile(media.path, newPath);
      if (type == 'photo') {
        setCapturedImage({
          ...media,
          path: Platform.OS == 'ios' ? `file://${newPath}` : newPath,
        });
      }
      if (type == 'video') {
        setCapturedImage({
          ...media,
          path: `file://${newPath}`,
          uri: `file://${newPath}`,
        });
        // EditVedio(`file://${newPath}`)
      }
    },
    [navigation],
  );
  // const capturePic =async ()=>{
  //     setEditedImagePath(generateRandomImagePath());
  //     RNFS.copyFile(photo.path, editedImagePath)
  //     setCapturedImage({...photo,uri: `file://${editedImagePath}`})
  // }

  const uploadFile = async () => {
    console.log('firstdcacas/////', capturedImage);
    if (capturedImage?.duration && capturedImage?.duration > 30) {
      return showErrorMessage('Video can be of maximum 30 sec.');
    }
    setLoading(true);
    let result;
    if (mediaType == 'photo') {
    } else {
      result = await videoCompressior.compress(capturedImage.path, {}, prer =>
        console.log(prer),
      );
    }
    // console.log(result,mediaType)

    let formData = new FormData();
    formData.append('stories', {
      uri: mediaType == 'video' ? result : capturedImage.uri,
      type: mime.getType(capturedImage.uri),
      name: capturedImage.uri.split('/').pop(),
      caption: caption.trim(),
    });
    formData.append('caption', caption.trim());
    console.log(formData);
    // console.log('uri :::--',mime.getType(capturedImage.uri),capturedImage.uri.split("/").pop())
    uploadStory(formData)
      .then(res => {
        console.log(res.data);
        Keyboard.dismiss();
        navigation?.goBack();
        setLoading(false);
        if (res?.data?.status) {
          showSuccessMessage(res?.data?.message);
        //   setUploadStoryState(true);
        }
      })
      .catch(err => {
        setLoading(false);
        console.log(err?.message);
      });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS == 'ios' ? 'padding' : undefined}
      className="flex-1"
    >
      {!capturedImage ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            { alignItems: 'center', justifyContent: 'center' },
          ]}
        >
          <ActivityIndicator color={Colors.primary} size={'large'} />
        </View>
      ) : (
        <>
          <View
            style={{
              flex: 1,
              backgroundColor: Colors.white,
              // justifyContent:'center',
              // borderWidth:1
            }}
          >
            {/* {console.log(capturedImage.uri)} */}
            <View
              style={{
                // borderWidth:2,borderColor:'red',
                backgroundColor: Colors.white,
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 40,
              }}
            >
              {/* {console.log('capturedImage',capturedImage,mediaType)} */}
              {mediaType === 'video' ? (
                <>
                  {!VedioEditing && (
                    <Video
                      source={capturedImage}
                      style={{
                        width: width,
                        flex: 1,
                      }}
                      // resizeMode="cover"
                      // posterResizeMode="cover"
                      // allowsExternalPlayback={false}
                      // automaticallyWaitsToMinimizeStalling={false}
                      // useTextureView={false}
                      controls={true}
                      // playWhenInactive={true}
                      // ignoreSilentSwitch="ignore"
                      // onError={(err)=>console.log('firsterror in viredo ',err)}
                      // onBuffer={(err)=>console.log('buffer in viredo ',err)}
                    />
                  )}
                </>
              ) : (
                <Image
                  style={{
                    // height:height,
                    aspectRatio: 9 / 16,
                    width: width,
                    // flex:1,
                    resizeMode: !loadingFromProp ? 'cover' : 'contain',
                  }}
                  // resizeMode='contain'
                  source={{ uri: capturedImage.uri }}
                />
              )}
            </View>
            <View
              style={{
                height: 150,
                // borderWidth:1
                padding: 10,
                // justifyContent:'space-evenly',

                paddingBottom: Platform.OS == 'ios' ? 20 : 10,
              }}
            >
              <View style={{ marginBottom: 10, top: 5 }}>
                <CustomInput
                  maxLength={100}
                  style={[
                    commonStyle.inputStyle,
                    { borderColor: Colors.borderColor },
                  ]}
                  placeholder="Add caption"
                  value={caption}
                  onChangeText={(text: string) => setCaption(text)}
                />
              </View>
              <View className="flex-row gap-[15]" style={{ top: 5 }}>
                <View className="flex-1">
                  <GradientBtn
                    isLoading={loding}
                    onPress={() => uploadFile()}
                    title={'Post Story'}
                  />
                </View>
                <View className="flex-1 ">
                  <SimpleBtn
                    onPress={() => {
                      Keyboard.dismiss();
                      navigation.goBack();
                      setTimeout(() => {
                        setCapturedImage(null);
                        setCaption('');
                      }, 1000);
                    }}
                    title={'Cancel'}
                  />
                </View>
              </View>
            </View>
            <View
              style={[
                // commonStyle.shadow,
                {
                  position: 'absolute',
                  top: Platform.OS == 'ios' ? 60 : 20,
                  right: 25,
                  left: 25,
                  paddingHorizontal: 10,
                  borderRadius: 99,
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  alignItems: 'center',
                  // borderWidth:1
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  {
                    // borderWidth:1,
                    // backgroundColor:Colors.white
                  },
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  navigation.goBack();
                  setTimeout(() => {
                    setCapturedImage(null);
                    setCaption('');
                  }, 1000);
                }}
              >
                <Entypo name="cross" color={Colors.primary} size={30} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onPressEdit}
                style={
                  [
                    // commonStyle.shadow,
                    // {
                    // backgroundColor:Colors.white,
                    // paddingHorizontal:20,
                    // paddingVertical:5,
                    // borderRadius:5}
                  ]
                }
              >
                <Feather name="edit-2" color={Colors.primary} size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
    // </Modal>
  );
};

export default CameraComponent;
