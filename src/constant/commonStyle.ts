import { Platform, StyleSheet } from "react-native";
import Colors from "./colors";
import Fonts from "./fonts";


export const commonStyle = StyleSheet.create({
    center:{
        // ...StyleSheet.absoluteFill,
        ...StyleSheet.absoluteFillObject,
        justifyContent:'center',
        alignItems:"center",
        backgroundColor:Colors.white
    },
    resizeCover:{
        resizeMode:'cover'
    },
    resizeContain:{
        resizeMode:'contain'
    },
    errorText:{
        fontSize:15,
        //fontweight:Platform.OS =='ios'? '600' : "800",
        color:Colors.themeRed,
        fontFamily:Fonts.fontSemiMedium
    },
    smalltext:{
        fontSize:15,
        //fontweight:Platform.OS =='ios'? '600' : "800",
        color:Colors.themeBlack,
        fontFamily:Fonts.fontRegular
    },
    mediumSmallText:{
        fontSize:17,
        //fontweight:Platform.OS =='ios'? '600' : "800",
        color:Colors.themeBlack,
        fontFamily:Fonts.fontRegular
    },
    smalltextBold:{
        fontSize:17,
        //fontweight:Platform.OS =='ios'? '800' : "800",
        color:Colors.themeBlack,
        fontFamily:Fonts.fontSemiMedium
    },
    regulartext:{
        fontSize:17,
        //fontweight:Platform.OS =='ios'? '600' : "800",
        color:Colors.themeBlack,
        fontFamily:Fonts.fontRegular
    },
    regulartextBold:{
        fontSize:17,
        //fontweight:Platform.OS =='ios'? '800' : "800",
        color:Colors.themeBlack,
        fontFamily:Fonts.fontSemiMedium
    },
    mediumtext:{
        fontSize:19,
        //fontweight:Platform.OS =='ios'? '600' : "800",
        color:Colors.themeBlack,
        fontFamily:Fonts.fontRegular
    },
    mediumtextBold:{
        fontSize:18,
        //fontweight:Platform.OS ? "800" : '600',
        color:Colors.themeBlack,
        fontFamily:Fonts.fontBold
    },
    headingtext:{
        fontSize:23,
        //fontweight:Platform.OS =='ios'? '400' : "600",
        color:Colors.themeBlack,
        fontFamily:Fonts.fontRegular
    },
    headingtextBold:{
        fontSize:25,
        // fontweight:Platform.OS =='ios'? '300' : "400",
        // color:Colors.themeBlack,
        fontFamily:Fonts.fontBold
    },
    inputStyle:{
        height:55,
        padding:5,
        paddingHorizontal:15,
        borderWidth : 1,
        borderRadius: 30,
        marginBottom:5,
        flexDirection:'row',
        alignItems:'center',
        backgroundColor:Colors.inputColor,
        fontFamily:Fonts.fontSemiBold,
        fontSize:20
    },
    deafultBtn:{

    },
    headerBtn : {
        height:48,
        width:48,
        borderWidth:1,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:10,
    },
    homeHeader : {
        flexDirection:'row',
        alignItems:'center',
        paddingHorizontal:15,
        paddingVertical:10,
    },
    container : {
        height: "auto",
        padding : 15,
        marginLeft : 'auto',
        marginRight : 'auto',
        width : '100%',
    },
    row : {
        flexDirection : 'row',
        marginHorizontal : -5,
        flexWrap : 'wrap',
    },
    col33 : {
        width : '33.33%',
        paddingHorizontal : 5,
    },
    col66 : {
        width : '66.67%',
        paddingHorizontal : 5,
    },
    col50 : {
        width : '50%',
        paddingHorizontal : 5,
    },
    col100:{
        width : '100%',
        paddingHorizontal : 5,
    },
    card : {
        padding:15,
        borderRadius:15,
        marginBottom:15,
        borderWidth:1,
    },
    shadow : {
        shadowColor: 'rgba(0,0,0)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: .5, // IOS
        shadowRadius: 1, //IOS
        backgroundColor: '#FFF',
        elevation: 10, // Android
    },
    RoundBtns: {
        backgroundColor: '#ffffff',
        opacity: 0.6,
    },
    shadowButton:{
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: .5, // IOS
        shadowRadius: 1, //IOS
        backgroundColor: '#FFF',
        elevation: 10, // Android
        height: 50,
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius:200,
        
    },
    backshadowButton:{
        shadowColor: 'rgba(0,0,0)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: .5, // IOS
        shadowRadius: 1, //IOS
        backgroundColor: '#FFF',
        elevation: 10, // Android
        height: 50,
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius:200,
    },
    loading:{
        elevation:10,
        backgroundColor:Colors.white,
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: .5, // IOS
        shadowRadius: 1, //IOS
        // backgroundColor: '#FFF',
        flexDirection:"row",
        paddingHorizontal:24,
        paddingVertical:15,
        borderRadius:5,
        alignItems:'center'
    },
    transparentBack:{
        borderRadius: 25,
          backgroundColor: "rgba(255, 255, 255, 0.6)",
          shadowColor: "rgba(0, 0, 0, 0.1)",
          shadowOffset: {
            width: 0,
            height: 9,
          },
          shadowRadius: 24,
          elevation: 24,
          shadowOpacity: 1,
    }
})