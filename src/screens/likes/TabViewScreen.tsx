import * as React from 'react';
import {Image, Platform, SafeAreaView, StatusBar, View, useWindowDimensions,Text} from 'react-native';


import { commonStyle } from '../../constant/commonStyle';
import Colors from '../../constant/colors';
import Fonts from '../../constant/fonts';
import {TabView, TabBar} from 'react-native-tab-view';
import Likes from './likes';
import Matches from './matches';






export default function TabViewScreen(props:any) {
    const layout = useWindowDimensions();
    const redirect = props?.route?.params?.match
    const [index, setIndex] = React.useState(redirect ? 1 : 0);
    const [routes] = React.useState([
        {key: 'like', title: 'Likes'},
        {key: 'matches', title: 'Matches'},
    ]);
  
    const renderTabBar = (props:any) => (
       
       <TabBar
         inactiveColor={Colors.dark}
        activeColor={Colors.primary}
        {...props}
    indicatorStyle={{ backgroundColor: Colors.primary, }}
    style={{ backgroundColor: Colors.white }}
        labelStyle={{fontFamily: Fonts.fontSemiBold}}
       />
    );
    
    const renderScene = ({ route }:any) => {
        switch (route.key) {
          case 'like':
            return <Likes navigation={props.navigation} activeTabIndex={index} />;
          case 'matches':
            return <Matches navigation={props.navigation} activeTabIndex={index} />;
          default:
            return null;
        }
    };
    
    return (
        <>
            <SafeAreaView style={{backgroundColor: Colors.white}}>
                <View style={[commonStyle.container, {backgroundColor: Colors.white}]}>
                    <View className="flex-row justify-between items-center pb- px-1">
                        <View className='flex-row justify-start items-start -mb-5' style={{width: 200,}} >
                        
                            <Image
                            style={{width:'100%'}}
                            source={require('../../assets/png/iconImage.png')}
                            className="mb-5"
                        />
                        </View>
                    </View>
                </View>
            </SafeAreaView>
          
             <TabView
                navigationState={{index, routes}}
                renderScene={renderScene}
                renderTabBar={renderTabBar}
                onIndexChange={setIndex}
                initialLayout={{width: layout.width}}
                swipeEnabled={false}
            /> 
        </>
    );
}
