import MapboxGL, { Camera, MarkerView, UserLocation } from '@rnmapbox/maps';
// import {mapboxToken} from "@env"
import {
  Dimensions,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ParamListBase,
  RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { UserProfileData } from '../../contexts/userDetailscontexts';
import { useAuthToken } from '../../recoil/atoms/authToken';
import { getMyProfile } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { socket } from '../../services/apiConfig';
import axios from 'axios';
import { showErrorMessage } from '../../services/alerts';
// import Geolocation from '@react-native-community/geolocation';
import Geolocation from 'react-native-geolocation-service';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import {
  locationPermissions,
  requestPermission,
} from '../../services/permissions';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import {
  CameraOptions,
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import RotatingLineInCircle from '../../components/loder';
import CustomText from '../../components/customText';
import { commonStyle } from '../../constant/commonStyle';
import Colors from '../../constant/colors';
import Feather from 'react-native-vector-icons/Feather';
import CircleAnimation from '../../components/RotatingCircle';
// import { MultiStory } from 'react-native-story-view';
import Header from '../../components/Header';
import Footercomp from '../../components/Footer';
import GradientBtn from '../../components/gradientBtn';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapUser from '../../components/MapUser';
import Octicons from 'react-native-vector-icons/Octicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CitySearch from '../../components/citySearch';
import VersionCheckComp from '../../components/VersionCheckComp';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';

MapboxGL.setWellKnownTileServer('Mapbox');
MapboxGL.setAccessToken(
  'pk.eyJ1IjoiaG90c3BvdG1lZXQiLCJhIjoiY2xzOXk1bnl1MGE0cDJrdGVzbWZmZjd5ZiJ9.62-TdPZjKBB2fKkp5ES8UQ',
);
const mapboxToken =
  'pk.eyJ1IjoiaG90c3BvdG1lZXQiLCJhIjoiY2xzOXk1bnl1MGE0cDJrdGVzbWZmZjd5ZiJ9.62-TdPZjKBB2fKkp5ES8UQ';
// const socket = io(getHOST());
const height = Dimensions.get('window').height;
type Bounds = [[number, number], [number, number]];
const MapScreen = (props: {
  route: RouteProp<ParamListBase, string>;
  navigation: any;
}) => {
  const camera = useRef<Camera>(null);
  const [mylocation, setMyLocation] = useState({
    latitude: -37.833421506353554,
    longitude: 144.962730469359,
  });
  const [myTemplocation, setTempMyLocation] = useState(null);
  const [users, setUsers] = useState<any>([]);
  const scrollViewRef = useRef<any>(null);
  const [usersLocations, setUsersLocations] = useState<Array<any>>([]);
  const token = useAuthToken(state => state.authToken);
  const { userDetails: currentUserData, setUserDetails } =
    useContext(UserProfileData);
  const [loadingNewUsers, setLoadingNewUsers] = useState<boolean>(false);
  const [loadingNewUsers2, setLoadingNewUsers2] = useState<boolean>(false);
  const [permition, setpermitions] = useState(false);
  const [gps, setGps] = useState(false);
  const [watchId, setWatchId] = useState<any>(null);
  const [locationpermition, setlocationpermition] = useState(false);
  const snapPoints = useMemo(() => [`${(200 / height) * 100}%`], []);
  const snapPointsForCamera = useMemo(() => [`${(280 / height) * 100}%`], []);
  const [city, setCity] = useState(null);
  const bottomSheetModalRef = useRef<any>();
  const cityVisibleBottomSheetModalRef = useRef<any>();
  const bottomSheetModalRefForStatus = useRef<any>();
  const bottomSheetModalRefForSettings = useRef<any>();
  // story state
  const [visibleStory, setVisibleStory] = useState<boolean>(false);
  const [comments, setComments] = useState<any>([]);
  const [profileImage, setprofileImage] = useState<any>(null);
  // const [cityVisible,setCityVisible] = useState(false)
  const [story, setStory] = useState<any>([]);
  // custome location state
  const [maplocation, setMapLocation] = useState(null);
  const permitiontimeoutref = useRef<any>(null);
  const multiStoryRef = useRef();
  const timeoutRef = useRef<any>();
  const timeoutRef2 = useRef<any>();
  const isMounted = useRef(false);
  const ref = useRef();
  const [isOnline, setIsOnline] = useState<any>(true);
  const [isTempNav, setIsTempNav] = useState<any>(null);

 

  useFocusEffect(
    useCallback(() => {
      getMyProfile().then(async res => {
        let temp = await AsyncStorage.getItem('isTempNav');
        setIsTempNav(temp);

        if (temp === 'true') {
          bottomSheetModalRefForSettings?.current?.present?.();
        }
        // console.log('chatttttttttttt',res)
        const [profileImage] = res.data.user_images.filter(
          (elm: any) => elm?.mediaType == 'profile',
        );
        const story = res?.data?.stories?.map((elm: any) => ({
          ...elm,
          id: elm._id,
          isSeen: false,
          resolved: false,
        }));
        setprofileImage(profileImage);
        setStory([...story]);
        setUserDetails({
          ...res.data.user,
          user_images: res.data.user_images,
          profileImage,
          story,
          subscription: res?.data?.subscription,
        });
        return res;
      });
    }, []),
  );

  const userStories = useMemo(() => {
    return {
      id: currentUserData._id, //unique id (required)
      username: currentUserData.first_name + ' ' + currentUserData.last_name, //user name on header
      title: 'Story', //title below username
      profile: profileImage?.mediaUrl && profileImage?.mediaUrl,
    };
  }, [currentUserData._id, profileImage, story?.length]);

  useEffect(() => {
    if (token) {
      setUsers([]);
      socket?.on?.('fetchNearbyusers', (users: any) => {
        setUsersLocations(users);
        setUsers(users);
      });
    }
  }, [token]);

  const getlocation = (lat: number, long: number) => {
    try {
      // console.log('latlatlat',lat,long)
      axios
        .get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lat},${long}.json?types=place&access_token=${mapboxToken}`,
        )
        .then(res => {
          // console.log('asjla',res?.data?.features.length > 0 && res?.data?.features[0]?.text )
          if (res?.data?.features.length > 0) {
            setCity(res?.data?.features[0]?.text);
          }
        })
        .catch(err => {
          console.log('errorrrr', err);
          showErrorMessage(err?.message || 'Unable to fetch current location');
        });
    } catch (err) {
      console.log('ascascfvew', err);
    }
  };

  const getcurrentLocation = async () => {
    // console.log('watchIdwatchIdwatchId',)
    if (watchId >= 0) {
      Geolocation.clearWatch(watchId);
      setWatchId(null); // Reset watchId state
    }
    Geolocation.getCurrentPosition(
      position => {
        setMyLocation({
          latitude: position?.coords?.latitude,
          longitude: position?.coords?.longitude,
        });
        socket.emit('locationUpdate', {
          token,
          lat: position?.coords?.latitude,
          lon: position?.coords?.longitude,
        });
        getlocation(position?.coords?.longitude, position?.coords?.latitude);
        // console.log(camera)
        camera.current?.setCamera({
          centerCoordinate: [
            position?.coords?.longitude,
            position?.coords?.latitude,
          ],
          zoomLevel: 15,
          animationDuration: 1000,
        });
        const tempWatchid = addLListnertoLocation();
        setWatchId(tempWatchid);
      },
      async errr => {
        checkPermittionsAndGps();
      },
      {
        // enableHighAccuracy: true,
        timeout: 5000,
      },
    );
  };

  const changeLocation = (latlong: any) => {
    socket?.emit('getNearbyUsersByLocation', {
      user_id: currentUserData._id,
      lat: latlong[1],
      lon: latlong[0],
    });

    setTempMyLocation({ latitude: latlong[1], longitude: latlong[0] });

    setMapLocation(latlong);
    setLoadingNewUsers2(true);
    camera.current?.setCamera({
      centerCoordinate: latlong,
      zoomLevel: 15,
      animationDuration: 1000,
    });
    getlocation(latlong[0], latlong[1]);
    cityVisibleBottomSheetModalRef?.current?.close();
    if (timeoutRef2.current) {
      return;
    }
    timeoutRef2.current = setTimeout(() => {
      setLoadingNewUsers2(false);
      timeoutRef2.current = null;
    }, 5000);
  };

  const addLListnertoLocation = () => {
    let tempwatchId;
    if (token) {
      tempwatchId = Geolocation.watchPosition(
        position => {
          // console.log('inside live fetch ', position);
          setMyLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          socket.emit('locationUpdate', {
            token,
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });

          if (camera.current) {
            // camera.current.setCamera({
            //     centerCoordinate: [position.coords.longitude, position.coords.latitude],
            //     zoomLevel: 15,
            //     animationDuration: 1000
            // });
          }
        },
        error => {
          console.log('Error watching location:', error);
          addLListnertoLocation();
        },
        {
          // enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 1000,
          distanceFilter: 10,
        },
      );
    }
    // console.log('inside live fetch ',tempwatchId,token);
    return tempwatchId;
  };

  const UpdateView = () => {
    if (maplocation) {
      changeLocation(maplocation);
    } else {
      getNewUsers();
    }
  };

  const checkPermittionsAndGps = async () => {
    if (Platform.OS == 'android') {
      const checkEnabled: boolean = await isLocationEnabled();
      if (!checkEnabled) {
        await promptForEnableLocationIfNeeded();
      }
    }
    if (!locationpermition) {
      requestPermission(setpermitions, setlocationpermition);
      return;
    }
  };

  useEffect(() => {
    return () => {
      if (watchId >= 0) {
        // console.log('clear location listner',watchId)
        Geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // console.log('mylocation',mylocation)
  useFocusEffect(
    useCallback(() => {
      if (token) {
        UpdateView();
      }
    }, [token, maplocation, mylocation]),
  );

  useEffect(() => {
    getcurrentLocation();
  }, []);

  const getNewUsers = () => {
    socket.emit('getNearbyUsers', token);
    setLoadingNewUsers(true);

    getlocation(mylocation.longitude, mylocation.latitude);
    camera.current?.setCamera({
      centerCoordinate: [mylocation.longitude, mylocation.latitude],
      zoomLevel: 15,
      animationDuration: 1000,
    });
    // socket.emit('deletemessages')
    if (timeoutRef.current) {
      return;
    }
    timeoutRef.current = setTimeout(() => {
      setLoadingNewUsers(false);
      timeoutRef.current = null;
    }, 5000);
  };

  const setUsersList = () => {
    // console.log(usersLocations)
    if (users.length < usersLocations.length) {
      // setTimeout(() => {
      //     setUsers((state: any) => ([...state, usersLocations[users.length]]))
      // }, 1000)
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollViewRef.current) {
      const itemWidth = Dimensions.get('window').width - 114; // Adjust to your item width
      const offsetX = index * itemWidth;
      scrollViewRef?.current?.scrollTo({ x: offsetX, animated: true });
    }
  };

  useEffect(() => {
    if (usersLocations?.length > 0) {
      setUsersList();
    }
  }, [users.length, usersLocations]);

  useEffect(() => {
    locationPermissions(setlocationpermition);
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={1}
        animatedIndex={{
          value: 1,
        }}
      />
    ),
    [],
  );
  // console.log('permition',permition)
  useEffect(() => {
    if (isMounted.current) {
      // This code runs not on the initial mount, but on subsequent updates
      if (permition) {
        bottomSheetModalRef?.current?.present();
      } else {
        bottomSheetModalRef?.current?.close();
        getcurrentLocation();
      }
    } else {
      // After the first render/mount, mark it as mounted
      isMounted.current = true;
    }
  }, [permition]);

  // console.log(users,mylocation)
  //     useEffect(()=>{
  // AsyncStorage.clear()
  //     },[])
  // useEffect(()=>{
  //     socket.emit('consoleallrooms')
  // },[])

  // useEffect(() => {
  //     getlocation(mylocation?.longitude, mylocation?.latitude)
  // }, [mylocation])

  const handelStatusOptions = (type: number) => {
    // props.navigation.navigate('CameraComponent')
    if (type == 1 || type == 2) {
      const option: CameraOptions = {
        mediaType: type == 1 ? 'photo' : 'video',
        // durationLimit:30,
        saveToPhotos: false,
        videoQuality: 'high',
        presentationStyle: 'fullScreen',
        quality: 1,
        assetRepresentationMode: 'auto',
        // maxHeight:5000,
        // maxWidth:5000
      };
      launchCamera(option, (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log('user cancelled image picker');
          // navigation.goBack()
        } else if (response?.errorCode) {
          console.log('ImagePcker Error', response?.errorCode);
          // navigation.goBack()
        } else if (response?.errorMessage) {
          console.log('User tapped custom button: ', response?.errorMessage);
          // navigation.goBack()
        } else {
          // console.log('afkjbahfbakj',response?.assets?.[0])
          if (response?.assets?.[0]) {
            props.navigation.navigate('CameraComponent', {
              data: response?.assets?.[0],
              loading: true,
              mediaType: type == 1 ? 'photo' : 'video',
            });
          } else {
            showErrorMessage('Something went wrong');
          }
        }
        bottomSheetModalRefForStatus.current.close();
      });
    } else {
      const option: CameraOptions = {
        mediaType: 'mixed',
        // durationLimit:30,
        saveToPhotos: false,
        videoQuality: 'medium',
        presentationStyle: 'fullScreen',
        quality: 1,
        assetRepresentationMode: 'auto',
        // maxHeight:5000,
        // maxWidth:5000
      };
      launchImageLibrary(option, (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log('user cancelled image picker');
          // navigation.goBack()
        } else if (response?.errorCode) {
          console.log('ImagePcker Error', response?.errorCode);
          // navigation.goBack()
        } else if (response?.errorMessage) {
          console.log('User tapped custom button: ', response?.errorMessage);
          // navigation.goBack()
        } else {
          console.log('afkjbahfbakj', response?.assets?.[0]);
          if (response?.assets?.[0]) {
            const media = response?.assets?.[0].type?.split('/')?.[0];
            props.navigation.navigate('CameraComponent', {
              data: response?.assets?.[0],
              loading: true,
              mediaType: media == 'video' ? media : 'photo',
            });
          } else {
            showErrorMessage('Something went wrong');
          }
        }
        bottomSheetModalRefForStatus.current.close();
      });
    }
  };

  const cameraRef = useRef<MapboxGL.Camera>(null);
  const [bounds, setBounds] = useState<Bounds | null>(null);
  // Helper function to validate coordinates
  const validateCoordinates = (coords: Bounds | null): boolean => {
    if (!coords || coords.length !== 2) return false;
    return coords.every(
      ([lng, lat]) =>
        typeof lng === 'number' &&
        !isNaN(lng) &&
        typeof lat === 'number' &&
        !isNaN(lat),
    );
  };

  const calculateBounds = () => {
    if (!myTemplocation) {
      var coordinates: [number, number][] = [
        ...(maplocation &&
        Array.isArray(maplocation) &&
        maplocation.length === 2
          ? [maplocation]
          : []),
        ...(mylocation && mylocation.longitude && mylocation.latitude
          ? [[mylocation.longitude, mylocation.latitude]]
          : []),
        ...((users &&
          users
            .map(user => user?.location?.coordinates)
            .filter(coord => Array.isArray(coord) && coord.length === 2)) ||
          []),
      ];
    } else {
      var coordinates: [number, number][] = [
        ...(maplocation &&
        Array.isArray(maplocation) &&
        maplocation.length === 2
          ? [maplocation]
          : []),
        ...(myTemplocation &&
        myTemplocation.longitude &&
        myTemplocation.latitude
          ? [[myTemplocation.longitude, myTemplocation.latitude]]
          : []),
        ...((users &&
          users
            .map(user => user?.location?.coordinates)
            .filter(coord => Array.isArray(coord) && coord.length === 2)) ||
          []),
      ];
    }

    if (coordinates.length === 0) {
      console.warn('No valid coordinates found.');
      return;
    }

    const lngs = coordinates.map(([lng]) => lng);
    const lats = coordinates.map(([, lat]) => lat);

    const bounds: Bounds = [
      [Math.min(...lngs), Math.min(...lats)], // Southwest
      [Math.max(...lngs), Math.max(...lats)], // Northeast
    ];

    // console.log('Calculated Bounds:', bounds);
    setBounds(bounds);
  };

  useEffect(() => {
    calculateBounds();
    //console.log("users ,",users)
  }, [maplocation, mylocation, users, myTemplocation]);

  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });

  // Capture map width and height using onLayout
  const handleMapLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setMapDimensions({ width, height });
  };
  useEffect(() => {
    if (
      bounds &&
      cameraRef.current &&
      mapDimensions.width > 0 &&
      mapDimensions.height > 0
    ) {
      const [[swLng, swLat], [neLng, neLat]] = bounds;
      const padding = 50; // Adjust padding as needed

      const centerLng = (swLng + neLng) / 2;
      const centerLat = (swLat + neLat) / 2;

      // Calculate zoom level based on map dimensions and bounds
      const zoomLevel = calculateZoomLevel(
        bounds,
        mapDimensions.width,
        mapDimensions.height,
      );
      //console.log('Calculated zoom level:', zoomLevel);

      cameraRef.current.setCamera({
        centerCoordinate: [centerLng, centerLat],
        zoomLevel: zoomLevel,
        padding: {
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
        },
      });
    }
  }, [bounds, mapDimensions]);

  // Function to calculate zoom level based on bounds and map size
  const calculateZoomLevel = (bounds, mapWidth, mapHeight) => {
    const [[swLng, swLat], [neLng, neLat]] = bounds;

    const latDiff = Math.abs(neLat - swLat);
    const lngDiff = Math.abs(neLng - swLng);

    const worldSize = 256; // World map size in tile coordinates (zoom level 0)

    const latZoom = Math.log2(worldSize / (latDiff * mapHeight));
    const lngZoom = Math.log2(worldSize / (lngDiff * mapWidth));

    const zoom = Math.min(latZoom, lngZoom);

    // Ensure the zoom level is within your desired range
    return Math.max(12, Math.min(zoom, 20));
  };

  //console.log("myTemplocation L",myTemplocation)

  return (
    <SafeAreaView style={{flex:1,backgroundColor:'transparent'}}>
    <BottomSheetModalProvider>
      <View className={''} style={{ flex: 1 }} onLayout={handleMapLayout}>
        {/* <StatusBar translucent backgroundColor="transparent"  /> */}

        <MapboxGL.MapView
          styleURL={MapboxGL.StyleURL.Street}
          style={[styles.map]}
          attributionEnabled={false}
        >
          <Camera
            ref={cameraRef}
            animationMode="flyTo"
            animationDuration={3000}
            centerCoordinate={
              maplocation
                ? maplocation
                : [mylocation?.longitude, mylocation?.latitude]
            }
          />
          {maplocation && (
            <MarkerView allowOverlap={true} coordinate={maplocation}>
              <View className="">
                <View className=" p-3 justify-center items-center   ">
                  {loadingNewUsers2 && (
                    <View className="overflow-hidden border-red  relative h-[290] w-[290] justify-center items-center  p-10 rounded-full">
                      <RotatingLineInCircle />
                    </View>
                  )}
                  <TouchableOpacity
                    className={`${
                      loadingNewUsers2 && 'absolute'
                    }  bg-white rounded-full border-[4px] border-white items-center`}
                  >
                    <Image
                      // source={user.image}
                      source={require('../../assets/png/screen.png')}
                      style={{ width: 58, height: 58, borderRadius: 100 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </MarkerView>
          )}
          <MarkerView
            allowOverlap={true}
            coordinate={[mylocation?.longitude, mylocation?.latitude]}
          >
            <View className="">
              <View className=" p-3 justify-center items-center  ">
                {loadingNewUsers && (
                  <View style={{borderColor:Colors.themeRed}} className="overflow-hidden   relative h-[290] w-[290] justify-center items-center  p-10 rounded-full">
                    <RotatingLineInCircle />
                  </View>
                )}
                {isOnline && (
                  <TouchableOpacity style={{borderColor:Colors.themeRed}}
                    className={`${
                      loadingNewUsers && 'absolute'
                    }  border-[4px] rounded-full border-red items-center`}
                  >
                    <Image
                      // source={user.image}
                      source={
                        currentUserData?.profileImage
                          ? { uri: currentUserData?.profileImage?.mediaUrl }
                          : ''
                      }
                      style={{ width: 58, height: 58, borderRadius: 100 }}
                    />
                    <View style={{backgroundColor:Colors.themeRed}} className="absolute bottom-[-10] w-[40] h-[18] py-[0] rounded rounded-[6px] text-center justify-center items-center">
                      <CustomText
                        text="Me"
                        style={[
                          commonStyle.smalltextBold,
                          { color: Colors.white, fontSize: 14 },
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </MarkerView>
          {users?.length > 0 &&
            users?.map((user: any, index: number) => {
              const a = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
              // console.log('user?.location?.coordinates',user)
              return (
                <MarkerView
                  allowOverlap={true}
                  id={JSON.stringify(user)}
                  key={user?._id}
                  onSelected={() => scrollToIndex(index)}
                  coordinate={[
                    user?.location?.coordinates[0],
                    user?.location?.coordinates[1],
                  ]}
                >
                  <View className=" p-3 overflow-auto">
                    <TouchableOpacity
                      onPress={() => scrollToIndex(index)}
                      style={styles.back}
                      className="justify-center items-center"
                    >
                      <Image
                        source={
                          user?.media?.length > 0
                            ? { uri: user?.media[0]?.mediaUrl }
                            : ''
                        }
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 100,
                          borderWidth: 1,
                          borderColor: Colors.red,
                        }}
                      />
                      <View style={{backgroundColor:Colors.themeRed}} className="relative bottom-[5] px-2 h-[18] py-[0] rounded rounded-[6px] text-center justify-center items-center">
                        <CustomText
                          text={user?.first_name}
                          className=" w-full"
                          style={[
                            commonStyle.smalltextBold,
                            { color: Colors.white, fontSize: 12 },
                          ]}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                </MarkerView>
              );
            })}
        </MapboxGL.MapView>

        <View
          className="absolute flex-row  w-full justify-between px-[20]"
          style={{ top: Platform.OS == 'ios' ? 55 : 20 }}
        >
          {currentUserData?.plan_details?.SubscriptionIsActive ? (
            <TouchableOpacity
              onPress={() => {
                cityVisibleBottomSheetModalRef?.current?.present?.();
              }}
              // onPress={() => {props.navigation.navigate('Settings')}}
              className="rounded-full  w-[50] h-[50] items-center justify-center "
              style={commonStyle.shadowButton}
            >
              <Feather name="search" color={Colors.primary} size={20} />
            </TouchableOpacity>
          ) : (
            <View className="rounded-full  w-[50] h-[50] items-center justify-center "></View>
          )}
          <View
            // onPress={() => {props.navigation.navigate('Settings')}}
            className="rounded-full w-[190] bg-white   items-center pl-2 flex-row "
            style={[
              commonStyle.shadowButton,
              {
                width: 190,
                alignItems: 'center',
                padding: 0,
                justifyContent: 'flex-start',
              },
            ]}
          >
            {/* <Image className='w-[38] h-[38] rounded-full' source={{ uri: currentUserData?.profileImage?.mediaUrl}} /> */}
            <View className=" w-[38] h-[38]">
              <CircleAnimation ref={ref}>
                {/* <MultiStory
                  setIsStoryViewShow={setVisibleStory}
                  setComments={setComments}
                  isStoryViewVisible={visibleStory}
                  scrollEnabled={false}
                  style={{ padding: 0, margin: 0, borderWidth: 0 }}
                  stories={[{ ...userStories, stories: story }]}
                  setStories={setStory}
                  ref={multiStoryRef}
                  avatarProps={{
                    userImageStyle: { height: 36, width: 36, borderRadius: 99 },
                    containerStyle: {
                      height: 38,
                      width: 38,
                      borderWidth: 2,
                      borderRadius: 99,
                      borderColor: Colors.primary,
                    },
                    viewedStoryContainerStyle: {
                      height: 38,
                      width: 38,
                      borderRadius: 99,
                      borderColor:
                        story.length > 0 ? Colors.grey : 'transparent',
                      borderWidth: 2,
                    },
                  }}
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
                          setVisible: setVisibleStory,
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
                      <Footercomp
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
                  }}
                /> */}
              </CircleAnimation>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (!currentUserData?.plan_details?.SubscriptionIsActive) {
                  return;
                }
                //cityVisibleBottomSheetModalRef?.current?.present?.()
              }}
              className="flex-1 items-center  justify-center h-[45] mr-4"
            >
              <CustomText
                style={commonStyle.regulartextBold}
                className="pl-2 "
                text={city || ''}
              />
            </TouchableOpacity>

            {currentUserData?.subscription?.connects?.type != 'unlimited' &&
              !currentUserData?.subscription?.connects?.count && (
                <View
                  style={{
                    position: 'absolute',
                    left: 5,
                    top: 60,
                    width: '100%',
                    justifyContent: 'center',
                    flexDirection: 'row',
                  }}
                >
                  <View>
                    <GradientBtn
                      title={'Out of Connects'}
                      textStyle={{ fontSize: 12 }}
                      containerStyle={{ height: 30, paddingHorizontal: 20 }}
                      onPress={() => {
                        props?.navigation?.navigate?.('Subscriptions', {});
                      }}
                    />
                  </View>
                </View>
              )}
          </View>

          <View>
            <TouchableOpacity
              onPress={() => {
                bottomSheetModalRefForStatus?.current?.present?.();
              }}
              className="rounded-full w-[50] h-[50] items-center justify-center "
              style={commonStyle.shadowButton}
            >
              {/* <MaterialIcons name='add-to-photos' color={Colors.themeBlack} size={25} /> */}
              <Image
                source={require('../../assets/png/imageUpload.png')}
                tintColor={Colors.red}
                className="w-[30] h-[30]"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate('StatusInput');
              }}
              className="rounded-full w-[50] h-[50] mt-[10] items-center justify-center "
              style={commonStyle.shadowButton}
            >
              {/* <FontAwesome name='edit' color={Colors.themeBlack} size={25} /> */}
              <Image
                source={require('../../assets/png/textUpload.png')}
                tintColor={Colors.red}
                className="w-[30] h-[30]"
              />
            </TouchableOpacity>
            {isTempNav == 'true' && (
              <TouchableOpacity
                onPress={() => {
                  bottomSheetModalRefForSettings?.current?.present?.();
                }}
                className="rounded-full w-[50] h-[50] mt-[10] items-center justify-center "
                style={commonStyle.shadowButton}
              >
                {/* <FontAwesome name='edit' color={Colors.themeBlack} size={25} /> */}
                <Ionicons
                  name="settings-outline"
                  size={30}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            )}
          </View>
          {/* {!currentUserData?.plan_details?.SubscriptionIsActive &&
                    <View 
                         className='rounded-full  absolute mx-[20]  items-center justify-center '
                         style={[commonStyle.shadowButton,{position:'absolute',flexDirection:'column'}]}
                         >
                             <CustomSearchBar navigation={props.navigation}/>
                     </View>  
                    } */}
        </View>
        <View className="absolute bottom-[30] w-full ">
          <ScrollView
            ref={scrollViewRef}
            pagingEnabled
            horizontal
            className="pl-3 "
            snapToInterval={Dimensions.get('window').width - 113}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            bounces={false}
          >
            {users &&
              users?.length > 0 &&
              users?.map((prop: any, key: number) => {
                console.log('prop',prop)
                return (
                  <MapUser
                    currentIndex={key}
                    key={prop?._id}
                    totalUser={UserLocation.length}
                    user={prop}
                    navigation={props.navigation}
                  />
                );
              })}
          </ScrollView>
        </View>
        <View className="  absolute bottom-[120]  right-[0] items-end px-[20] ">
          <TouchableOpacity
            onPress={() => {
              setTempMyLocation(null);
              setMapLocation(null);
              getcurrentLocation();
            }}
            style={commonStyle.shadowButton}
          >
            <Octicons name="location" size={18} color={Colors.red} />
          </TouchableOpacity>
        </View>
        <View className="  absolute bottom-[180] right-[0] items-end px-[20] ">
          <TouchableOpacity
            onPress={() => {
              UpdateView();
            }}
            style={commonStyle.shadowButton}
          >
            <MaterialCommunityIcons name="radar" size={20} color={Colors.red} />
          </TouchableOpacity>
        </View>
      </View>

      <BottomSheetModal
        ref={cityVisibleBottomSheetModalRef}
        index={0}
        snapPoints={[`90%`]}
        backdropComponent={renderBackdrop}
        style={{}}
        backgroundStyle={{
          overflow: 'hidden',
        }}
        enableDynamicSizing={false}

      >
        <CitySearch
          changeLocation={changeLocation}
          mylocation={mylocation}
          onPress={() => cityVisibleBottomSheetModalRef?.current?.close()}
        />
      </BottomSheetModal>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        onDismiss={() => setpermitions(false)}
        style={{}}
        backgroundStyle={{
          // borderWidth:1,
          backgroundColor: 'transparent',
          marginHorizontal: 10,
          overflow: 'hidden',
        }}
        enableDynamicSizing={false}

      >
        <View className="flex-1 px-2  mx-[10]  rounded ">
          <View className="bg-white mb-2  rounded-[12px]">
            <CustomText
              style={commonStyle.regulartextBold}
              text={
                'We need access to your location to show nearby users. Please enable location services.'
              }
              className="px-3 pt-2"
            />
            <TouchableOpacity
              onPress={() => {
                setTimeout(() => {
                  setpermitions(false);
                }, 1000);
                Linking.openSettings();
              }}
              className="  rounded p-3 flex-row items-center space-x-3"
            >
              <Feather name="settings" color={Colors.primary} size={20} />
              <CustomText text={'Open settings'} />
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={()=>{}} className='  rounded p-3 flex-row items-center space-x-3'>
                                <CustomText text={'Gallery'} />
                            </TouchableOpacity> */}
          </View>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              bottomSheetModalRef.current.close();
            }}
            className="bg-white mb-2  rounded-[12px] justify-center items-center py-3"
          >
            <CustomText text="Cancel" />
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
      <VersionCheckComp />
      <BottomSheetModal
        ref={bottomSheetModalRefForStatus}
        index={0}
        snapPoints={snapPointsForCamera}
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          // borderWidth:1,
          backgroundColor: 'transparent',
          marginHorizontal: 10,
          overflow: 'hidden',
        }}
        enableDynamicSizing={false}

      >
        <View className="flex-1 px-2  mx-[10]  rounded ">
          <View className="bg-white mb-2  rounded-[12px]">
            <TouchableOpacity
              onPress={() => handelStatusOptions(1)}
              className="  rounded p-3 flex-row items-center space-x-3"
            >
              <AntDesign size={30} color={Colors.gradient1} name="camerao" />
              <CustomText text={'Capture Image'} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handelStatusOptions(2)}
              className="  rounded p-3 flex-row items-center space-x-3"
            >
              <Ionicons
                size={30}
                color={Colors.gradient1}
                name="videocam-outline"
              />
              <CustomText text={'Capture Video'} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handelStatusOptions(3)}
              className="  rounded p-3 flex-row items-center space-x-3"
            >
              <FontAwesome size={30} color={Colors.gradient1} name="photo" />
              <CustomText text={'Gallery'} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => bottomSheetModalRefForStatus.current.close()}
            className="bg-white mb-4   rounded-[12px] justify-center items-center py-3"
          >
            <CustomText text="Cancel" />
          </TouchableOpacity>
        </View>
      </BottomSheetModal>

      <BottomSheetModal
        ref={bottomSheetModalRefForSettings}
        index={0}
        snapPoints={snapPointsForCamera}
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          // borderWidth:1,
          backgroundColor: 'transparent',
          marginHorizontal: 10,
          overflow: 'hidden',
        }}
        enableDynamicSizing={false}

      >
        <View className="flex-1 px-2  mx-[10]  rounded mt-5">
          <View className="bg-white mb-2  rounded-[12px]">
            <View className="bg-white mb-2 rounded-[12px]">
              <CustomText
                text="Enable your location on map?"
                style={{ paddingTop: 20, paddingLeft: 20, fontWeight: 600 }}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignContent: 'center',
                justifyContent: 'center',
                marginTop: 10,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setIsOnline(true);
                  bottomSheetModalRefForSettings.current.close();
                }}
                className={`px-[10] py-[10] px-[70]  mx-[4] mb-4 rounded-[30px] border mt-6`}
                style={{
                  backgroundColor: isOnline ? Colors.primary : Colors.white,
                  borderColor: Colors.primary,
                }}
              >
                <CustomText
                  text={'Yes'}
                  style={{ color: isOnline ? '#fff' : Colors.primary }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setIsOnline(false);
                  bottomSheetModalRefForSettings.current.close();
                }}
                className={` px-[10] py-[10] px-[70]   mx-[4] mb-4 rounded-[30px] border mt-6`}
                style={{
                  backgroundColor: !isOnline ? Colors.primary : Colors.white,
                  borderColor: Colors.primary,
                }}
              >
                <CustomText
                  text={'No'}
                  style={{ color: !isOnline ? '#fff' : Colors.primary }}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => bottomSheetModalRefForSettings.current.close()}
            className="bg-white mb-4   rounded-[12px] justify-center items-center py-3"
          >
            <CustomText text="Cancel" />
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
    </BottomSheetModalProvider>
    </SafeAreaView>
  );
};
``;

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
    filter: 'blur(30px)',
  },
});

export default MapScreen;

export const MapScreenOptions = {
  headerShown: false,
};
