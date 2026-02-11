import { useEffect, useState } from "react";
import { NativeModules, Platform,Linking } from "react-native";

export const formatDateString = (dateString:string) =>{
  if(dateString){
    return new Date(dateString).toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }
};
export const formatDateStringWithTime = (dateString: string) => {
  if (dateString) {
    return new Date(dateString).toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  }
};




export const calculateAge = (birthdateString: string = '') => {
  const birthdate = new Date(birthdateString);
  const currentDate = new Date();

  // Extract year, month, and day from birthdate
  const birthYear = birthdate.getFullYear();
  const birthMonth = birthdate.getMonth();
  const birthDay = birthdate.getDate();

  // Get current year, month, and day
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();

  // Calculate age
  let age = currentYear - birthYear;
  // Adjust age if the current month is before the birth month or
  // it's the same month but the current day is before the birth day
  if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
    age--;
  }

  return age;
}





export function useDebounce(value: string | undefined, delay: number) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value)
      }, delay)
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler)
      }
    },
    [value, delay] // Only re-call effect if value or delay changes
  )
  return debouncedValue
}

export const getDynamicFontSize = (textLength:any) => {
  const initialFontSize = 34; // The initial font size for text length of 0
  const minimumFontSize = 14; // The minimum font size for text length of 500
  const maxTextLength = 500; // The text length at which the minimum size is reached
  const decrementStep = 50; // Decrease font size every 50 characters
  
  // Calculate the number of steps to decrease size based on character count
  let decreaseCount = Math.floor(textLength / decrementStep);

  // Calculate total size decrease based on number of steps
  let totalSizeDecrease = decreaseCount * 2; // Decrease by 2 for each step
  
  // Calculate the font size based on the decrease
  let fontSize = initialFontSize - totalSizeDecrease;
  
  // Ensure the font size does not go below the minimum size or above the initial size
  if (fontSize < minimumFontSize) fontSize = minimumFontSize;
  if (fontSize > initialFontSize) fontSize = initialFontSize;
  
  return fontSize;
};

export const getDynamicLineHeight = (textLength:any) => {
  const initialFontSize = 34; // Initial font size, same as in getDynamicFontSize
  const initialLineHeight = 40; // Initial line height - usually larger than the font size
  const minimumLineHeight = 20; // Minimum line height for maximum text length
  const maxTextLength = 500; // Same as in getDynamicFontSize
  const decrementStep = 50; // Same as in getDynamicFontSize
  if(textLength == 0){
    return 30
  }
  // Calculate decrease count as in getDynamicFontSize
  let decreaseCount = Math.floor(textLength / decrementStep);

  // Calculate total size decrease - can be adjusted as per design needs
  let totalHeightDecrease = decreaseCount * 2; // Example: Decrease by 2 for each step

  // Calculate the line height based on the decrease
  let lineHeight = initialLineHeight - totalHeightDecrease;

  // Ensure the line height does not go below or above minimum/initial values
  if (lineHeight < minimumLineHeight) lineHeight = minimumLineHeight;
  if (lineHeight > initialLineHeight) lineHeight = initialLineHeight;

  return lineHeight;
};


export const dynamicMargin = Platform.OS == 'ios' ? 80: 40


export const checkGPS = async () => {
  if (Platform.OS === 'android') {
    try {
      const isGpsEnabled = await NativeModules.GpsModule.isGpsEnabled();
      
      if (!isGpsEnabled) {
        // GPS is not enabled. Prompt user or handle accordingly.
      }
    } catch (error) {
      console.error(error);
    }
  }
};

export function formatDateStringmsg(dateString:any='',flag?:boolean) {
  const inputDate = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const day = inputDate.getDate();
  const month = inputDate.getMonth() + 1;
  const year = inputDate.getFullYear().toString().substr(-2);
  const hours = inputDate.getHours();
  const minutes = inputDate.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = ((hours + 11) % 12 + 1);
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

  // For today
  if (inputDate >= today) {
      return `${formattedHours}:${formattedMinutes} ${ampm}`;
  } 
  // For this week
  else if (inputDate >= weekAgo) {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = daysOfWeek[inputDate.getDay()];
      if(!flag){
        return `${dayName}, ${formattedHours}:${formattedMinutes} ${ampm}`;
      }else{
        return dayName
      }
  } 
  // For older dates
  else {
    if(!flag){
      return `${day}/${month}/${year} ${formattedHours}:${formattedMinutes} ${ampm}`;
    }else{
      return `${day}/${month}/${year}`
    }
  }
}

export function capitalizeString(str:string) {
  if(str && typeof str === 'string') {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  return str;
}

export function formatTime(sec = 0) {
  if (sec < 60) {
      return `${sec} sec`;
  } else if (sec < 3600) {
      const minutes = Math.floor(sec / 60);
      const seconds = sec % 60;
      return `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} sec`;
  } else {
      const hours = Math.floor(sec / 3600);
      const minutes = Math.floor((sec % 3600) / 60);
      const seconds = sec % 60;
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} sec`;
  }
}