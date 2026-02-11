import React, { Component } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import Colors from '../constant/colors';
import LinearGradient from 'react-native-linear-gradient';

class RotatingLineInCircle extends Component {
  spinValue: Animated.Value;
  constructor(props: {} | Readonly<{}>) {
    super(props);

    this.spinValue = new Animated.Value(0);
  }

  componentDidMount() {
    this.spin();
  }

  spin() {
    this.spinValue.setValue(0);
    Animated.timing(this.spinValue, {
        toValue: 1,
        duration: 3000, // Adjust the duration as needed
        easing: Easing.linear,
        useNativeDriver: true,
    }).start(() => this.spin());
  }

  render() {
    const rotate = this.spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <View style={styles.circle}>
                <Animated.View
                    style={[
                    styles.line,
                    {
                        transform: [{ rotate }],
                    },
                    ]}
                >
                    
                    <View className='flex-1  '  >
                        <LinearGradient 
                            colors={['#EB575709', '#EB5757']} 
                            style={{width:200,height:150,borderWidth:0}}
                            start={{ x: 1, y: 0 }} end={{ x: 1, y: 1 }}
                            >
                        </LinearGradient>
                        <View className=' justify-center items-center flex-1'>
                        </View>
                    </View>
                    <View className='flex-1  bg-transparent' ></View>
                </Animated.View>
            </View>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 290,
    height: 290,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth:1,
  },
  circle: {
    
    width: '100%',
    height: '100%',
    borderRadius: 100,
    // backgroundColor: Colors.themeRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    
    flex:1,
    width:1,
    // width: 2,
    // height: 100,
    // backgroundColor: 'blue',
  },
});

export default RotatingLineInCircle;