import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { navigate } from "../navigationRef"; // Assuming navigate is already set up.
import AsyncStorage from "@react-native-async-storage/async-storage";

const ResolveAuthScreen = () => {
  useEffect(() => {
    // Check if the user is logged in by looking for a token or similar.
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");

      if (token) {
        // If the user is logged in, navigate to the main flow
        navigate("mainFlow");
      } else {
        // Otherwise, navigate to the authentication flow
        navigate("authFlow");
      }
    };

    checkAuth();
  }, []);

  return (
    <View>
      <Text>Loading...</Text>
    </View>
  );
};

export default ResolveAuthScreen;
