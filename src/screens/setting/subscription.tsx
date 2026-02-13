import React, { useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, ImageBackground, Linking, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
// import Header from '../layout/Header';
import GradientBtn from '../../components/gradientBtn';
import Colors from '../../constant/colors';
import Fonts from '../../constant/fonts';
import { commonStyle } from '../../constant/commonStyle';
import { StyleSheet } from 'react-native';
import { ParamListBase, RouteProp } from '@react-navigation/native';
import BackButton from '../../components/backButton';
import CustomText from '../../components/customText';
import { getMyProfile, getPurchase, getSubscriptionPlan, initPayment, restoreGooglePurchase, userSubscription, validateApplePayment } from '../../services/api';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { showErrorMessage, showSuccessMessage } from '../../services/alerts';
import { UserProfileData } from '../../contexts/userDetailscontexts';
import { capitalizeString } from '../../constant/veriables';
import PopupModal from '../../components/noPlane';
import Carousel from 'react-native-snap-carousel';
import {PurchaseError, finishTransaction, purchaseUpdatedListener, useIAP,Purchase, purchaseErrorListener, getReceiptIOS , getSubscriptions, initConnection} from 'react-native-iap';
import RBSheet from 'react-native-raw-bottom-sheet';
const Subscriptions = (props: {
    route: RouteProp<ParamListBase, string>;
    navigation: any;
}) => {
    const {width} = Dimensions.get('window')
    const { initPaymentSheet, presentPaymentSheet,confirmPaymentSheetPayment ,confirmPayment} = useStripe();
    // const { activeSlide =0}: any = props.route.params;
    const [pricingData,setPricingData] = useState<any>([])
    const [addOn,setAddOn] = useState<any>([])
    const [activeIndex, setActiveIndex] = useState<any>(null);
    const [loading,setLoading] = useState(true)
    const [addonLoading,setAddonLoading] = useState(false)
    const [paymentInit,setPaymentInit] = useState(false)
    const {userDetails,setUserDetails} =useContext(UserProfileData)
    const [visible,setVisible]=useState(false)
    const [paymentSuccess ,setPaymentSuccess]=useState(false)
    const [selectedAddon,setSelectedaddon]= useState<any>(null)
    const [selectedProduct,setSelectedProduct]= useState<any>(null)
    const [myPurchases,setMyPurchases]= useState<any>([])
    const restoprePopup = useRef<any>();
    const {getAvailablePurchases,getProducts ,products,requestPurchase,getPurchaseHistory,requestSubscription} = useIAP();
    const [laoding,setLoadiung] = useState(false)

    const [restorePurchase,setRestorePurchase] = useState<any>(null)
    // const isTestUser = userDetails?.mobile?.includes?.('9780813081')
    const isTestUser = Platform.OS =='ios'
    useEffect(()=>{
        getSubscriptionPlan()
            .then(res=>{
                console.log('addonsaddonsaddons :',res?.data.addons)
                if(res.data.status){
                    setPricingData(res?.data?.plans)
                    setActiveIndex(res?.data?.plans?.[0] ?? null)
                 //   console.log("res.data.addon :", res.data.addons)
                    setAddOn(res.data.addons)
                }
                if(res.data.status==false){
                    setTimeout(() => {
                        props.navigation.goBack()
                        showErrorMessage('No plan available.')
                    }, 900);
                }
            })
            .catch((err:any)=>{
                console.log('eroor in subscription',err)
            })
            .finally(()=>{
                setTimeout(()=>{
                    setLoading(false)
                },1000)
            })
    },[])
    const getopr = async () =>{
        try {
           
            let tempapp = [...addOn,...pricingData].map((item:any) =>  item._id)

            const res  = await getProducts({skus:tempapp});
            
            await getAvailablePurchases().then(async(ress:any) =>{
                console.log("ress :", ress);
                if (ress) {
                    const purchaseToken = ress.map((purchase:any)=>purchase.purchaseToken)
                
                    await getPurchase({purchaseToken}).then((foo)=>{
                        console.log("getPurchase :" ,foo.data)
                        if(foo.data.status){
                            setMyPurchases(foo.data?.data)
                        }
                    
                        
                        
                    });
                }
               
                
            })
           
            await getPurchaseHistory();
           
           
       }catch(err ){
            console.log('error ins',err)
        }
    }
    // console.log("myPurchases : ", myPurchases)
    useEffect(()=>{
        getopr()
    },[getProducts, addOn])
    

    const restore = async() =>{
        if(restorePurchase){

            //console.log("restorePurchase :", restorePurchase)
            await restoreGooglePurchase({userSubscriptionID:restorePurchase?.userSubscriptionID}) // check If already user has subscription
            .then(async res=>{ 

                if(res.data?.status){
                    console.log("restore res :", res.data)
                    restoprePopup?.current?.close()
                    showSuccessMessage('Subscription has been restored successfully')
                }else{
                    showErrorMessage("Something went wrong!. Please try again later")
                }
                
              
            }).catch((error) =>{
                console.log("restore error :", error)
                showErrorMessage("Something went wrong!. Please try again later")
            }) 
           // console.log("restorePurchase :", restorePurchase)
        }
    }
    const startPayment =async (productId:string,isaddon:boolean)=>{
      
        try {
            const existingPurchase = myPurchases.find((purchase: any) => purchase.planID === productId);
            console.log("existingPurchase")
            console.log(existingPurchase)


            if(existingPurchase){
                console.log("product already purchased show restore option")
                setRestorePurchase(existingPurchase);
                restoprePopup?.current?.open();
                return;
            }
          
            if(isaddon || !existingPurchase){
                console.log(productId)
                console.log("Addon purchase - requesting purchase for product:", productId);


                await requestPurchase({skus:[productId]}).then(async(res:any) => {

                    // console.log("requestPurchase res", res)
                    console.log("requestPurchase res[0]", res[0])
                    if (res) {
                        await finishTransaction({purchase:res[0], isConsumable:true, developerPayloadAndroid: ""})
                        let purchaseToken = res[0]?.purchaseToken  
                        let packageNameAndroid = res[0]?.packageNameAndroid  
                        let productId = res[0]?.productId  

                        await validateApplePayment({
                            platform:"android", 
                            purchaseToken:purchaseToken, 
                            productId:productId,
                            packageName:packageNameAndroid,
                            isaddon:isaddon,
                            id:productId
                        })
                        .then(async (res) =>{  
                            console.log("validateApplePayment res", res.data)
                            if(res.data.status){
                                await getMyProfile()
                                .then((res:any)=>{
                                    console.log("getMyProfile res", res)
                                    showSuccessMessage('Congratulations! 🎉 Your payment has been successfully processed.')
                                    setPaymentSuccess(true);
                                    const [profileImage] = res.data.user_images.filter(((elm:any)=>elm?.mediaType == 'profile'))
                                    const story =res?.data?.stories?.map((elm:any)=>({...elm,id:elm._id,isSeen:false,resolved:false}))
                                    setUserDetails({
                                        ...res.data.user,
                                        user_images: res.data.user_images,
                                        profileImage,
                                        story,
                                        subscription: res?.data?.subscription
                                    });
                                    setPaymentInit(false)
                                    setAddonLoading(false)
                                }).catch((e) =>{
                                    console.log("validateApplePayment catch", e)
                                })
                            }else{
                                showErrorMessage(res.data.message)
                            }

                            setAddonLoading(false)
                        }) 
                    }else{
                        setAddonLoading(false)
                    }
                })
            
            }else{
                console.log("in else block")

                await userSubscription({isaddon:isaddon, id:productId}) // check If already user has subscription
                .then(async res=>{ 
                    if(res?.data.status == true){
                        console.log("productId :",productId)
                        await getSubscriptions({skus:[productId]}).then(async(res:any) => {
                          
                            let offerToken = res[0].subscriptionOfferDetails[0].offerToken
                            if(myPurchases.length > 0){

                               let filterMPurchases =  myPurchases.filter((item:any) => item.planID === productId && item.myPurchase === false);

                                if(filterMPurchases.length > 0){
                                    setRestorePurchase(filterMPurchases[0])
                                    restoprePopup?.current?.open()
                                    return
                                }

                               
                            }
                            
                             
                            await requestSubscription({
                                sku: productId,
                                ...(offerToken && {
                                subscriptionOffers: [{sku: productId, offerToken}],
                                }),
                            }).then(async (res:any) =>{
                                console.log("requestSubscription res[0]", res[0])
                                if(res){
                                    let purchaseToken = res[0]?.purchaseToken  
                                    let packageNameAndroid = res[0]?.packageNameAndroid  
                                    let productId = res[0]?.productId  

                                    await validateApplePayment({
                                        platform:"android", 
                                        purchaseToken:purchaseToken, 
                                        productId:productId,
                                        packageName:packageNameAndroid,
                                        isaddon:isaddon,
                                        id:productId
                                    })
                                    .then(async (res) =>{  
                                        console.log("validateApplePayment res", res.data)
                                        if(res.data.status){
                                            await getMyProfile()
                                            .then((res:any)=>{
                                                console.log("getMyProfile res", res)
                                                showSuccessMessage('Congratulations! 🎉 Your payment has been successfully processed.')
                                                setPaymentSuccess(true);
                                                const [profileImage] = res.data.user_images.filter(((elm:any)=>elm?.mediaType == 'profile'))
                                                const story =res?.data?.stories?.map((elm:any)=>({...elm,id:elm._id,isSeen:false,resolved:false}))
                                                setUserDetails({
                                                    ...res.data.user,
                                                    user_images: res.data.user_images,
                                                    profileImage,
                                                    story,
                                                    subscription: res?.data?.subscription
                                                });
                                                setPaymentInit(false)
                                                setAddonLoading(false)
                                            }).catch((e) =>{
                                                console.log("validateApplePayment catch", e)
                                            })
                                        }else{
                                            showErrorMessage(res.data.message)
                                        }
                                        setPaymentInit(false)
                                        setAddonLoading(false)
                                    
                                    }) 
                                }else{
                                    showErrorMessage("Something went wrong!. Please try again later")
                                    setAddonLoading(false)
                                }
                            });
                        
                        
                        })
                    }else{
                        showErrorMessage(res?.data?.message || 'Could not initialize payment at the moment. Please try again later')
                        return
                    } 
          
                }).finally(() =>{
                    setPaymentInit(false)
                    setAddonLoading(false)
                })
                
            }
            
        } catch (error:any) {
            setPaymentInit(false)
            setAddonLoading(false)
            if (error instanceof PurchaseError) {
                console.log({message: `[${error.code}]: ${error.message}`, error});
            } else {
                console.log({message: 'handleBuyProduct', error});
            }
            showErrorMessage(error.message)
        }
      
    }
    
    const buyNewAddone = async (productId:any) => {
        setAddonLoading(true)
       await applePay(productId,true)
    }
    const applePay = async(productId:any,isaddon:boolean) =>{
        // console.log("productId :",productId)
        // console.log("productId :",productId)
        try {
            // setPaymentInit(true)
            if(isaddon){
                let res : any =  await requestPurchase({sku:productId});
                console.log('requestPurchase---------->>>>>>>',res) 
                //getReceipt(res)
                let transactionReceipt = res.transactionReceipt
                await validateApplePayment({transactionReceipt,id:productId,isaddon}).then((res) =>{
                    console.log('response---------->>>>>>>',res) 
                    setPaymentInit(false)
                    setAddonLoading(false)
                    // props.navigation.goBack()
                    })
                getMyProfile()
                    .then((res:any)=>{
                        // showSuccessMessage('Congratulations! 🎉 Your payment has been successfully processed.')
                        setPaymentSuccess(true);
                        const [profileImage] = res.data.user_images.filter(((elm:any)=>elm?.mediaType == 'profile'))
                        const story =res?.data?.stories?.map((elm:any)=>({...elm,id:elm._id,isSeen:false,resolved:false}))
                        setUserDetails({
                            ...res.data.user,
                            user_images: res.data.user_images,
                            profileImage,
                            story,
                            subscription: res?.data?.subscription
                        });
                        setPaymentInit(false)
                        setAddonLoading(false)
                        
                        // return res
                    })
            }else{
                const res:any = await requestSubscription({sku:activeIndex?._id});
                console.log('requestSubscription------------->>>>>>>>>>>>',res)
                await validateApplePayment({transactionReceipt :res.transactionReceipt,id:activeIndex?._id,isaddon:false}).then((res) =>{ 
                        setAddonLoading(false)
                }) 

                getMyProfile()
                        .then((res:any)=>{
                            // showSuccessMessage('Congratulations! 🎉 Your payment has been successfully processed.')
                            setPaymentSuccess(true);
                            const [profileImage] = res.data.user_images.filter(((elm:any)=>elm?.mediaType == 'profile'))
                            const story =res?.data?.stories?.map((elm:any)=>({...elm,id:elm._id,isSeen:false,resolved:false}))
                            setUserDetails({
                                ...res.data.user,
                                user_images: res.data.user_images,
                                profileImage,
                                story,
                                subscription: res?.data?.subscription
                            });
                            setPaymentInit(false)
                            setAddonLoading(false) 
                            // return res
                        })
            }
            
        } catch (error) {
            setPaymentInit(false)
                    setAddonLoading(false)
            if (error instanceof PurchaseError) {
            console.log({message: `[${error.code}]: ${error.message}`, error});
            } else {
                console.log({message: 'handleBuyProduct', error});
            }
        }
    }
    const checkUserSubscription = async (productId:any,isaddon:boolean) =>{ 
        console.log('-------------------------------Checking existing subscription--------------------------------------')
        try{
            setSelectedProduct(productId)
            const existingPurchase = myPurchases.find((purchase: any) => purchase.planID === productId);
    if (existingPurchase) {
        // If the product exists, trigger restore
        setRestorePurchase(existingPurchase);
        restoprePopup?.current?.open();
        return;
    }

            await userSubscription({isaddon:isaddon, id:productId})
            .then(async res=>{ 

                console.log('userSubscriptionresresresres-------',res.data)
                if(res?.data.status == true){
                    console.log('-------------------------------MAKING APPLE APY--------------------------------------')
                   await applePay(productId,isaddon)
                }else{
                    setPaymentInit(false)
                        setAddonLoading(false)
                    console.log('-------------------------------ALREADY PLAN EXISTS--------------------------------------')
                    if(isaddon){
                        setVisible(true) 
                    }else{
                        
                        showErrorMessage(res?.data?.message || 'Could not initialize payment at the moment. Please try again later')
                    }
                   
                    return
                } 
                console.log('-------------------------------Plan bought--------------------------------------')
            }).catch((e) =>{
                setPaymentInit(false)
                setAddonLoading(false)
                console.log("userSubscription : ",e)
            })
        }catch(err){
            setPaymentInit(false)
            setAddonLoading(false)
        }
    }
    
    useEffect(() => {
        // Setup the purchase updated listener
        const purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase: Purchase) => {
            const transactionReceipt = purchase.transactionReceipt;
            if (transactionReceipt) {
                try {
                    finishTransaction(purchase);
                    
                } catch (error) {
                    console.warn('Purchase validation error:', error);
                }
            }
        });
        const purchaseErrorSubscription = purchaseErrorListener((error) => {
          console.warn('Purchase error:', error);
        });
    
        // Clean up the listeners when the component unmounts
        return () => {
          purchaseUpdateSubscription.remove();
          purchaseErrorSubscription.remove();
          //RNIap.endConnection();
        };
      }, []);

      const getReceipt = async (res:any) => {
        try {
          const result = await getReceiptIOS(res);
          if (!result) {
            console.log('No receipt found, attempting to refresh');
         //();
          } else {
            console.log('Receipt:', result);
          }
        } catch (err) {
        //  console.warn(err.code, err.message);
        }
      };

    const _renderItem = ({item, index}:any) => {
        return (
            <View className='flex-1 h-[180] rounded-[30px] overflow-hidden border-[2.5px] border-[#a18b43] flex-row'>
                <View className='bg-[#ebebeb] h-[60] w-[60] rounded-full absolute bottom-[-10]  right-[-25]'/>
                <View className='bg-[#ebebeb] h-[60] w-[60] rounded-full absolute bottom-[-30]  left-[-15]'/>
                <View className='bg-[#ebebeb] h-[8] w-[8] rounded-full absolute top-[20]  left-[160]'/>
                <View className='bg-[#ebebeb] h-[8] w-[8] rounded-full absolute top-[10]  left-[110]'/>
                <View className='bg-[#ebebeb] h-[8] w-[8] rounded-full absolute bottom-[20]  left-[180]'/>
                <View className='bg-[#ebebeb] h-[8] w-[8] rounded-full absolute bottom-[50]  left-[140]'/>
                <View className='justify-center gap-[20] pl-[30]'>
                    <View className=''>
                        <CustomText style={{fontFamily: Fonts.fontSemiBold,fontSize: 16,color:Colors.black}}>{item?.name}</CustomText>
                        <CustomText style={commonStyle.headingtextBold}>
                            ${item?.price}
                            <CustomText  style={{fontFamily: Fonts.fontSemiBold,fontSize: 16,color:Colors.black}}>  1 day plan</CustomText>
                        </CustomText>
                        <CustomText style={[{ fontFamily: Fonts.fontSemiBold, fontSize: 13, color: Colors.black}
                        ]}>
                            {item?.benefits?.name == 'video_audio_call' ? `Video/Audio Call (${item?.benefits?.value} minutes) ` : ` ${item?.benefits?.value < 5000 ? "Unlimited" : item?.benefits?.value} ${capitalizeString(item?.benefits?.name)} ${item?.benefits?.name == 'video_audio_call' ? ' minutes' :''}`}</CustomText>
                    </View>
                    <GradientBtn
                        onPress={ async()=>{
                            if(isTestUser){
                                checkUserSubscription(item?._id,true);setAddonLoading(true)
                             }else{
                                startPayment(item?._id,true);setAddonLoading(true)}
                             } 
                        } 
                        title={`Pay Now`}
                        isLoading={addonLoading}
                        disable={paymentInit || addonLoading}
                        textStyle={{fontSize: 16,fontFamily:Fonts.fontBold}}
                        style={{width:100}}
                        containerStyle={{height: 40, paddingHorizontal: 0,width:100,marginBottom:2}}
                    />
                </View>
                <View style={{alignItems:'center',justifyContent: "center",flex:1}}>
                    <Image
                        source={require("../../assets/png/dimond.png")}
                        style={{
                            width:80,
                            height: 60,
                            resizeMode:'contain'
                        }}></Image>
                </View>
            </View>
        );
    }

    const closeSuccess = () =>{
        setPaymentSuccess(false)
        setTimeout(() => {
            props.navigation.goBack()
        }, 100);
    }


    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef<any>(null);

    useEffect(() => {
        if (carouselRef.current) {
            if (!addonLoading) {
                carouselRef.current.startAutoplay();
            } else {
                carouselRef.current.stopAutoplay();
            }
        }
    }, [addonLoading]);


    const handleSnapToItem = (index:any) => {
        setCurrentIndex(index);
    };

    return (
        <StripeProvider
            publishableKey='pk_live_51O8GD2CdFEnwGvJ6VRQBoVktYV5jreEFwcmPvRV162xOgvK4BtFKaed6SESvt3t0RGFYa3UklVUtaU7YpK1MsMCK00x0XyO2iu'
        >
        {/* //      <StripeProvider
        //     publishableKey='pk_test_51O8GD2CdFEnwGvJ6gAVuYJHbMQyI2WWbAnbORDpjqiGVPMqu1HbuAjryjtGRfn8YIJ1GXRcOs2stHTxHvaX4HNuc00r1eEWsVF'
        // > */}
            <>
                {paymentSuccess && (
                    <View style={{position: "absolute", zIndex: 100}}>
                        <Image
                        source={require("../../assets/gif/Confetti.gif")}
                        style={{width: Dimensions.get("screen").width, height: Dimensions.get("screen").height}}
                        />
                    </View>
                )}
                <SafeAreaView
                    style={[{
                        flex: 1,
                        backgroundColor: Colors.cardBg,
                    },]}
                >
                {loading
                        ?
                            <>
                                <View style={commonStyle.center}>
                                    <View className='justify-center items-center' >
                                        <Image className='w-[250] h-[250]' source={require('../../assets/gif/like.gif')} />
                                    </View>
                                </View>
                            </>
                        :
                    <ScrollView  showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
                        <View style={[commonStyle.container]}>
                            <View >
                            <BackButton navigation={props.navigation}/>
                            <View className=''>
                                <Carousel
                                   ref={carouselRef}
                                   loop={false}
                                   loopClonesPerSide={2}
                                   autoplay={!addonLoading}
                                   autoplayDelay={500}
                                   autoplayInterval={3000}
                                   data={addOn ?? []}
                                   renderItem={_renderItem}
                                   sliderWidth={Dimensions.get('window').width - 30}
                                   itemWidth={Dimensions.get('window').width - 80}
                                   onSnapToItem={handleSnapToItem}
                                   firstItem={currentIndex}
                                    // layout={'stack'} layoutCardOffset={`18`}
                                />
                            </View>
                            {/* {console.log('first',acti)} */}
                            <View style={{ flexDirection: "row",alignItems:'center', justifyContent: "center", width: "100%",marginTop:30,marginBottom:25}}>
                                <View style={{borderBottomWidth:0.5,width:'100%',position:'absolute',borderColor:Colors.grey}} ></View>
                                <View className='p-[.5] bg-white'>
                                    {/* <Image
                                        source={require("../../assets/png/crown.png")}
                                        style={{
                                            width: 70,
                                            height: 70,
                                        }}></Image> */}
                                        <Image
                                            source={require("../../assets/png/dimond.png")}
                                            style={{
                                                width: 80,
                                                height: 60,
                                            }}></Image>
                                </View>
                            </View>
                            <CustomText style={[commonStyle.headingtextBold, { color: Colors.dark, fontSize: 25,fontFamily: Fonts.fontBold, width: 300 }]}>Unlock maximum app benefits with a sizzling subscription to</CustomText>
                            <CustomText style={[commonStyle.headingtextBold, { color: Colors.gradient1, marginBottom: 15, fontSize: 25, fontFamily: Fonts.fontSemiBold }]}>HotSpot Premium Plans!</CustomText>
                            <CustomText style={[
                                    {color: Colors.lightText, fontFamily:Fonts.fontBold, fontSize:15, marginVertical: 10},
                                ]}>Select Plan</CustomText>
                            <FlatList
                                data={pricingData}
                                renderItem={({item, index}) => (
                                    <TouchableOpacity 
                                        key={item?.id} 
                                        style={{
                                            width: 150, 
                                            height: 130,
                                            marginRight: 10,
                                            borderRadius: 20, 
                                            borderWidth: 1, 
                                            borderColor: activeIndex?._id == item._id ? Colors.gradient1 : Colors.light, 
                                            backgroundColor: activeIndex?._id == item._id ? '#faf2f0' : Colors.bgLight
                                        }} 
                                        onPress={() => {
                                           ///  if(!isTestUser){
                                                setActiveIndex(item)
                                            // }
                                        }}
                                    >
                                        <CustomText style={{fontFamily: Fonts.fontBold, paddingHorizontal: 10, fontSize: 16, marginTop: 10}}>{item?.name}</CustomText>
                                            <CustomText style={{ paddingHorizontal: 10, fontSize: 14}}>Duration - {item?.billing_duration?.duration + " " + item?.billing_duration?.unit}</CustomText>
                                            <CustomText style={{ fontFamily: Fonts.fontBold, paddingHorizontal: 10, fontSize: 16, position: "absolute", bottom: 15}}>${item?.price}/-</CustomText>
                                    </TouchableOpacity>
                                )}
                                contentContainerStyle={{
                                    alignSelf: 'flex-start',
                                }}
                                numColumns={1}
                                showsVerticalScrollIndicator={false}
                                showsHorizontalScrollIndicator={false}
                                horizontal={true}
                                // keyExtractor={item => item}
                            />
                            {/* {addOn?.length > 0 && 
                            <>
                                <CustomText style={[commonStyle.headingtextBold, { color: Colors.grey,marginTop:20, marginBottom: 10, fontSize: 18 ,fontFamily: Fonts.fontSemiBold }]}>Add ons</CustomText>
                                <FlatList
                                    data={addOn}
                                    renderItem={({item, index}) => (
                                        <TouchableOpacity 
                                            key={item?.id} 
                                            style={{
                                                width: 150, 
                                                height: 130,
                                                marginRight: 10,
                                                borderRadius: 20, 
                                                borderWidth: 1, 
                                                borderColor: activeIndex?._id == item._id ? Colors.gradient1 : Colors.light, 
                                                backgroundColor: activeIndex?._id == item._id ? '#faf2f0' : Colors.bgLight
                                            }} 
                                            onPress={() => setActiveIndex(item)}
                                        >
                                            <CustomText style={{fontFamily: Fonts.fontSemiBold, paddingHorizontal: 10, fontSize: 16, marginTop: 10}}>{item?.name}</CustomText>
                                            <CustomText style={{ paddingHorizontal: 10, fontSize: 12}}>1 day plan</CustomText>
                                            <CustomText style={{ fontFamily: Fonts.fontSemiBold, paddingHorizontal: 10, fontSize: 12, position: "absolute", bottom: 15}}>${item?.price}/-</CustomText>
                                        </TouchableOpacity>
                                    )}
                                    contentContainerStyle={{
                                        alignSelf: 'flex-start',
                                    }}
                                    numColumns={1}
                                    showsVerticalScrollIndicator={false}
                                    showsHorizontalScrollIndicator={
                                        false
                                    }
                                    horizontal={true}
                                    // keyExtractor={item => item}
                                />
                            </>
                            } */}
                            {/* <View
                                style={{
                                    height: 135,
                                    // borderWidth:2
                                }}
                            >
                                <PricingSwiper
                                    pricingData={pricingData}
                                    activeIndex={activeIndex}
                                    setActiveIndex={setActiveIndex}
                                />
                            </View> */}
                            <View style={{
                                flex: 1,
                            }}>
                                <View>
                                    <View
                                        style={{
                                            // paddingHorizontal: 20,
                                            paddingVertical: 0,
                                        }}
                                    >
                                        {/* {feature?.map((data:any, index:number) => {
                                            return (
                                                <View
                                                    key={index}
                                                    style={{
                                                        paddingVertical: 12,
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <FeatherIcon style={{ marginRight: 12, opacity: data.lock ? .8 : 1 }} size={20} color={data.lock ? Colors.textLight : Colors.primary2} name={data.lock ? 'lock' : 'check'} />
                                                    <CustomText style={[{ fontFamily: Fonts.fontSemiBold, fontSize: 15, color: Colors.title },
                                                    data.lock && {
                                                        color: Colors.textLight,
                                                        opacity: .8,
                                                    }
                                                    ]}>{data.title}</CustomText>
                                                </View>
                                            )
                                        })} */}
                                        {/* {Chat} */}
                                        {activeIndex && 
                                            <>
                                                <CustomText style={[
                                    {color: Colors.lightText, fontFamily:Fonts.fontBold, fontSize:15, marginTop: 20},
                                ]}>Included in Plan</CustomText>
                                                {activeIndex?.benefits ? 
                                                    <>
                                                        <View
                                                            style={{
                                                                paddingVertical: 12,
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <FeatherIcon style={{ marginRight: 12, opacity: 1 }} size={20} color={  Colors.gradient1} name={'check'} />
                                                            <CustomText style={[{ fontFamily: Fonts.fontSemiBold, fontSize: 15, color: Colors.title },
                                                            ]}>{activeIndex?.benefits?.name == 'video_audio_call' ? `Video/Audio Call (${activeIndex?.benefits?.value} minutes) ` : `${capitalizeString(activeIndex?.benefits?.name)} (${activeIndex?.benefits?.value}${activeIndex?.benefits?.name == 'video_audio_call' ? ' minutes' :''})`}</CustomText>
                                                        </View>
                                                    </>
                                                :
                                                    <>
                                                        <View
                                                            style={{
                                                                paddingVertical: 12,
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <FeatherIcon style={{ marginRight: 12, opacity: !activeIndex?.chat ? .8 : 1 }} size={20} color={ !activeIndex?.chat  ? Colors.textLight : Colors.gradient1} name={ !activeIndex?.chat  ? 'lock' : 'check'} />
                                                            <CustomText style={[{ fontFamily: Fonts.fontSemiBold, fontSize: 15, color: Colors.title },
                                                                !activeIndex?.chat && {
                                                                    color: Colors.textLight,
                                                                    opacity: .8,
                                                                }
                                                            ]}>Chat</CustomText>
                                                        </View>
                                                        <View
                                                            style={{
                                                                paddingVertical: 12,
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <FeatherIcon style={{ marginRight: 12, opacity: !activeIndex?.video_audio_call?.isAvailable ? .8 : 1 }} size={20} color={ !activeIndex?.video_audio_call?.isAvailable  ? Colors.textLight : Colors.gradient1} name={ !activeIndex?.video_audio_call?.isAvailable  ? 'lock' : 'check'} />
                                                            <CustomText style={[{ fontFamily: Fonts.fontSemiBold, fontSize: 15, color: Colors.title },
                                                                !activeIndex?.video_audio_call?.isAvailable && {
                                                                    color: Colors.textLight,
                                                                    opacity: .8,
                                                                }
                                                            ]}>Video/Audio Call {activeIndex?.video_audio_call?.isAvailable && `(${activeIndex?.video_audio_call?.duration} minutes)`}</CustomText>
                                                        </View>
                                                        <View
                                                            style={{
                                                                paddingVertical: 12,
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <FeatherIcon 
                                                                style={{ 
                                                                    marginRight: 12, 
                                                                    opacity: activeIndex?.connects?.type == 'no_connects' ? .8 : 1 
                                                                }} 
                                                                size={20} 
                                                                color={  activeIndex?.connects?.type == 'no_connects' ? Colors.textLight : Colors.gradient1}
                                                                name={ activeIndex?.connects?.type == 'no_connects' ? 'lock' : 'check'} />
                                                            <CustomText style={[{ fontFamily: Fonts.fontSemiBold, fontSize: 15, color: Colors.title },
                                                                activeIndex?.connects?.type == 'no_connects' && {
                                                                    color: Colors.textLight,
                                                                    opacity: .8,
                                                                }
                                                            ]}>Connects {activeIndex?.connects?.type != 'no_connects' &&  `(${ ( activeIndex?.connects?.type == 'unlimited' ? 'Unlimited' :activeIndex?.connects?.count)})`}</CustomText>
                                                        </View>
                                                        <View
                                                            style={{
                                                                paddingVertical: 12,
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <FeatherIcon 
                                                                style={{ 
                                                                    marginRight: 12, 
                                                                    opacity: activeIndex?.swipes?.type == 'no_swipes' ? .8 : 1 
                                                                }} 
                                                                size={20} 
                                                                color={  activeIndex?.swipes?.type == 'no_swipes' ? Colors.textLight : Colors.gradient1}
                                                                name={ activeIndex?.swipes?.type == 'no_swipes' ? 'lock' : 'check'} />
                                                            <CustomText style={[{ fontFamily: Fonts.fontSemiBold, fontSize: 15, color: Colors.title },
                                                                activeIndex?.swipes?.type == 'no_swipes' && {
                                                                    color: Colors.textLight,
                                                                    opacity: .8,
                                                                }
                                                            ]}> Swipes {activeIndex?.swipes?.type != 'no_swipes' && `(${ ( activeIndex?.swipes?.type == 'unlimited' ? 'Unlimited' : activeIndex?.swipes?.count)})`}</CustomText>
                                                        </View>
                                                        <View
                                                            style={{
                                                                paddingVertical: 12,
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <FeatherIcon 
                                                                style={{ 
                                                                    marginRight: 12, 
                                                                    opacity: activeIndex?.swipes?.type == 'no_swipes' ? .8 : 1 
                                                                }} 
                                                                size={20} 
                                                                color={  activeIndex?.swipes?.type == 'no_swipes' ? Colors.textLight : Colors.gradient1}
                                                                name={ activeIndex?.swipes?.type == 'no_swipes' ? 'lock' : 'check'} />
                                                            <CustomText style={[{ fontFamily: Fonts.fontSemiBold, fontSize: 15, color: Colors.title },
                                                                
                                                            ]}> Virtual Location Enabling</CustomText>
                                                        </View>
                                                    </>
                                                }
                                            </>
                                        }
                                    </View>
                                </View>
                            </View>
                            </View>
                        </View>
                    </ScrollView>
                }
                {!loading && 
                    <View
                        style={{
                            paddingHorizontal: 15,
                            paddingBottom:(Platform.OS == 'ios'  && width >= 414) ? 0: 15,
                            paddingTop:5
                        }}
                    >
                    <CustomText style={[commonStyle.headingtextBold, { color: Colors.dark, fontSize: 14, paddingBottom: 10, }]}>Your plan will automatically renew at the same cost unless you choose to cancel.</CustomText>
                   
                   <View style={{flexDirection:'row', justifyContent: 'center',marginBottom:10}}>
                        <TouchableOpacity
                            onPress={() => {
                                Linking.openURL('https://hotspotmeet.com.au/terms-conditions/')
                            }}
                            style={[
                                
                                {
                                    
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginRight:5
                                },
                            ]}>

                                <CustomText
                                style={{
                                    color: Colors.primary,
                                    fontFamily:Fonts.fontBold
                                    
                                }}> 
                                Terms & Conditions 
                                </CustomText>
                        </TouchableOpacity>
                        <CustomText
                                style={{
                                    color: Colors.title,
                                    fontFamily:Fonts.fontBold
                                    
                                    
                                    
                                }}>
                                    and
                                </CustomText>
                        <TouchableOpacity
                            onPress={() => {
                                Linking.openURL('https://hotspotmeet.com.au/privacy-policy/')
                            }}
                            style={{
                                        
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginLeft:5
                               
                            }}
                                
                          >

                                <CustomText
                                style={{
                                    color: Colors.primary,
                                    fontFamily:Fonts.fontBold
                                    
                                }}>
                                    Privacy Policy
                                </CustomText>
                        </TouchableOpacity>
                   </View>

                   
                        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>

                            <CustomText style={[commonStyle.headingtextBold, { color: Colors.dark, fontSize: 25, fontFamily: Fonts.fontBold }]}>${activeIndex?.price}/-</CustomText>

                            <GradientBtn
                                onPress={async()=>{
                                    if(isTestUser){ 
                                        try {
                                            setPaymentInit(true) 
                                            await checkUserSubscription(activeIndex?._id,false);
                                           
                                          } catch (error) {
                                            setPaymentInit(false) 
                                            if (error instanceof PurchaseError) {
                                              console.log({message: `[${error.code}]: ${error.message}`, error});
                                            } else {
                                                console.log({message: 'handleBuyProduct', error});
                                            }
                                        }
                                    } else {
                                       
                                        startPayment(activeIndex?._id,activeIndex?.benefits ? true:false,false);setPaymentInit(true)
                                    }
                                }}
                                // gradient={pricingData?.[activeIndex]?.colors ||["#090A0C","#374550"]}
                                title={`Pay Now`}
                                isLoading={paymentInit}
                                disable={paymentInit || addonLoading}
                                textStyle={{fontSize: 16,fontFamily:Fonts.fontBold}}
                                style={{width:120}}
                                containerStyle={{height: 40, paddingHorizontal: 0,width:120}}
                            />
                            </View>
                    </View>
                }
                </SafeAreaView>
            </>
            <PopupModal
                progressPress={()=>{setVisible(false); isTestUser ?  buyNewAddone(selectedProduct) : startPayment(selectedAddon._id,true,true)}}
                navigation={props.navigation} 
                isVisible={visible} 
                btnTitle={'Buy Addon'}
                imgKey='Chat' 
                title={'Add-on already exists'}
                subTitle={"Purchasing this add-on will cancel your existing add-on plan"}
                onClose={()=>{setVisible(false);}} 
            />
            <PopupModal
                progressPress={()=>{closeSuccess()}}
                navigation={props.navigation} 
                isVisible={paymentSuccess} 
                btnTitle={'Close'}
                hideBtn={true}
                imgKey='Chat' 
                title={'Congratulations! 🎉'}
                subTitle={"You are a subscribed user now"}
                onClose={()=>{closeSuccess()}} 
            />

            <RBSheet
                ref={restoprePopup}
                height={200}
                openDuration={100}
                closeOnDragDown={true}
                customStyles={{
                    wrapper: {},
                    container: {
                        backgroundColor: Colors.cardBg,
                        borderTopLeftRadius: 15,
                        borderTopRightRadius: 15,
                    },

                    draggableIcon: {
                        marginTop: 5,
                        marginBottom: 0,
                        height: 5,
                        width: 90,
                        backgroundColor: Colors.borderColor,
                    },
                }}>
                <View
                    className="padd"
                    style={{
                        paddingHorizontal: 15,
                        borderBottomWidth: 1,
                        borderColor: Colors.borderColor,
                        paddingVertical: 12,
                    }}>
                    <CustomText style={[commonStyle.mediumtextBold]}>
                    This subscription is already linked to a different user on this Play Store ID. Would you like to restore access?
                    </CustomText>
                </View>
                <View
                    style={{
                        paddingHorizontal: 15,
                        flexDirection: 'row',
                        width: '100%',
                        gap: 10,
                        justifyContent: 'center',
                        marginTop: 20,
                    }}>
                    <View className="flex-1">
                        <GradientBtn
                            isLoading={laoding}
                            onPress={restore}
                            title={'Restore'}
                        />
                    </View>
                    <View className="flex-1">
                        <GradientBtn
                            onPress={() => {
                                restoprePopup?.current?.close();
                            }}
                            title={'Cancel'}
                        />
                    </View>
                </View>
            </RBSheet>
        </StripeProvider>

        
    );
};

const styles = StyleSheet.create({

    header: {
        position: 'absolute',
        width: '100%',
        height: 250,
        //   position: 'relative',
        top: 0,
        left: 0,
        backgroundColor: 'indigo',
    },
});

export default Subscriptions;