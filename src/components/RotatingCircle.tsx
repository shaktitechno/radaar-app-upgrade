import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { Animated, View, StyleSheet, Button } from 'react-native';
import { useRecoilState } from 'recoil';
import { useStoryUploadStore } from '../recoil/atoms/storyUpload';

const CircleAnimation = forwardRef((props:any, ref) => {
  const scaleAnim = useRef(new Animated.Value(1)).current; // Controls the scale of the circle
  const rotateAnim = useRef(new Animated.Value(0)).current; // Controls the rotation of the circle
  const { storyUpload: uploadStoryState, setStoryUpload: setUploadStoryState } =
  useStoryUploadStore();
  useImperativeHandle(ref, () => ({
    startAnimation: () => {
        startAnimation()
    }
  }));

  const startAnimation = () =>{

    Animated.parallel([
        // Scale animation to zoom in and out
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 2,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        // Rotation animation
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,

          useNativeDriver: true,
        })

      ]).start(() => rotateAnim.setValue(0)); 
  }

  useEffect(()=>{
    if(uploadStoryState){
        setTimeout(()=>{
            startAnimation()
            setUploadStoryState(false)
        },500)
    }
},[uploadStoryState])
  const rotationInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const animatedStyle = {
    transform: [
      { scale: scaleAnim },
      { rotateY: rotationInterpolate }
    ],
  };

  return (
        <Animated.View style={[styles.circle, animatedStyle]} >
            {props.children}
        </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    // width: 100,
    // height: 100,
    // borderRadius: 50,
    // backgroundColor: 'blue',
  },
});

export default CircleAnimation;
