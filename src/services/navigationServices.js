import * as React from 'react';
import { socket } from './apiConfig';
import { StackActions } from '@react-navigation/native';

// Create a ref to hold the navigation object
export const NavigationRef = React.createRef();

// Flag to indicate if the navigation container is ready
let isReady = false;

// Object to store deferred navigation action
let deferredNavigationAction = null;

// Function to mark navigation container as ready
export const onReady = () => {
  // console.log('onReadyonReady')
  isReady = true;
  // Execute any deferred navigation action if it exists
  if (deferredNavigationAction) {
    executeDeferredNavigation();
  }
};

export function getCurrentRoute() {
  let route = NavigationRef.current.getRootState();
  while (route.routes) {
    route = route.routes[route.index || 0];
  }
  return route;
}

// Function to navigate immediately if ready, or defer the navigation if not
export const navigate = (name, params) => {
  // console.log('isReadyisReadyisReady',isReady)
  if (isReady && NavigationRef.current) {
    const currentRoute = getCurrentRoute();
    console.log('currentRoute', currentRoute);
    if (
      (currentRoute.name === 'SingleChat' && name == 'SingleChat') ||
      (currentRoute.name == 'MyTabs' && name == 'MyTabs')
    ) {
      // If we're already on a SingleChat screen but with different params, push a new screen
      const pushAction = StackActions.replace(name, params);
      NavigationRef.current.dispatch(pushAction);
    } else {
      NavigationRef.current.navigate(name, params);
      // const pushAction = StackActions.replace(name, params);
      // NavigationRef.current.dispatch(pushAction);
    }
  } else {
    // Store the navigation action to be executed later
    deferredNavigationAction = { name, params };
  }
};

// Function to execute the deferred navigation action
export const executeDeferredNavigation = () => {
  if (deferredNavigationAction && NavigationRef?.current) {
    const { name, params } = deferredNavigationAction;
    // if(name == 'SingleChat' && !socket){
    //   return
    // }
    NavigationRef.current.navigate(name, params);
    deferredNavigationAction = null;
  }
};

export const goBack = () => {
  if (isReady && NavigationRef.current) {
    NavigationRef.current.goBack();
  }
};

export const dispatch = (name, params) => {
  NavigationRef.current?.dispatch(name);
};
