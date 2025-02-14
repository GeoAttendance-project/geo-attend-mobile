import { useEffect } from "react";
import { Alert, BackHandler } from "react-native";

// This function will show a confirmation dialog on back button press
export const handleBackButtonPress = (navigation) => {
  Alert.alert(
    "Exit App",
    "Do you want to exit?",
    [
      {
        text: "Cancel",
        onPress: () => null, // Do nothing, close the alert
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: () => {
          // Exit the app if Yes is pressed
          BackHandler.exitApp();
        },
      },
    ],
    { cancelable: false }
  );
};

// Hook to be used in the screens
export const useBackHandler = (navigation) => {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // Handle back button press
        handleBackButtonPress(navigation);
        return true; // Prevent the default behavior
      }
    );

    // Cleanup on unmount
    return () => backHandler.remove();
  }, [navigation]);
};
