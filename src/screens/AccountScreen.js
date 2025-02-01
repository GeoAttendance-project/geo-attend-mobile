import React, { useContext } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { Context } from "../context/AuthContext"; // Import the AuthContext
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigate } from "../navigationRef"; // Ensure your navigation is correctly set up

const AccountScreen = () => {
  // Dummy user data for account
  const user = {
    name: "John Doe",
    email: "johndoe@example.com",
    phoneNumber: "123-456-7890",
  };

  // Get the logout function from context
  const { signout } = useContext(Context);

  const logout = async () => {
    console.log("Logging out...");

    // Remove the token from AsyncStorage
    await AsyncStorage.removeItem("token");

    // Call the signout function from context to update the state
    signout();

    // Navigate to the login screen
    navigate("authFlow");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Settings</Text>
      <Text style={styles.text}>Name: {user.name}</Text>
      <Text style={styles.text}>Email: {user.email}</Text>
      <Text style={styles.text}>Phone: {user.phoneNumber}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default AccountScreen;
