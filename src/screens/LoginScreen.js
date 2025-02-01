import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { Context as AuthContext } from "../context/AuthContext";

const LoginScreen = () => {
  const { login, clearErrorMessage, state } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    console.log("CLICKED");
    clearErrorMessage();
    try {
      await login({ username, password });
    } catch (error) {
      Alert.alert(
        "Error",
        state.errorMessage || "An error occurd during login"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome back! Glad to See You</Text>
      <Text style={styles.subtitle}>Attendance Student Login</Text>

      <Image
        source={{
          uri: "https://img.freepik.com/free-vector/people-navigating-map-using-gps-flat-illustration_74855-19634.jpg",
        }}
        style={styles.image}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  image: {
    width: 250,
    height: 150,
    resizeMode: "contain",
    marginBottom: 20,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  loginButton: {
    backgroundColor: "black",
    width: "100%",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    marginTop: 10,
  },
  loginText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  forgotPassword: {
    marginTop: 10,
    color: "#888",
    fontSize: 14,
  },
});

export default LoginScreen;
