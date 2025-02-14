import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Context } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigate } from "../navigationRef";
import axios from "axios";
import {
  Card,
  Title,
  Paragraph,
  Button,
  Avatar,
  Divider,
} from "react-native-paper";
import { CommonActions } from "@react-navigation/native";
import { useBackHandler } from "../BackButtonHandler";

const AccountScreen = ({ navigation }) => {
  useBackHandler(navigation);

  const { signout } = useContext(Context);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          Alert.alert("Error", "Authentication token missing. Please log in.");
          return;
        }

        const response = await axios.get(
          "http://192.168.144.25:3001/api/v1/student/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUser(response.data.data);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token"); // Clear the authentication token

      // Navigate to 'Signin' screen after clearing the token
      navigate("Signin"); // Using the 'navigate' function to handle the navigation
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.avatarContainer}>
            <Avatar.Image
              size={80}
              source={{ uri: "https://i.pravatar.cc/150?u=" + user?.email }}
            />
            <Title style={styles.name}>
              {user?.firstName} {user?.lastName}
            </Title>
            <Paragraph style={styles.username}>@{user?.username}</Paragraph>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.infoContainer}>
            <Paragraph style={styles.info}>📧 Email: {user?.email}</Paragraph>
            <Paragraph style={styles.info}>
              🏫 Dept: {user?.department}, Year {user?.year}
            </Paragraph>
            <Paragraph style={styles.info}>
              🆔 Roll No: {user?.rollno}
            </Paragraph>
          </View>
        </Card.Content>
      </Card>

      <Button mode="contained" onPress={logout} style={styles.logoutButton}>
        Logout
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f6f9",
    justifyContent: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    padding: 20,
    borderRadius: 15,
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2d3436",
    marginTop: 10,
  },
  username: {
    fontSize: 16,
    color: "#636e72",
  },
  divider: {
    marginVertical: 15,
  },
  infoContainer: {
    marginTop: 10,
  },
  info: {
    fontSize: 16,
    paddingVertical: 5,
    color: "#2d3436",
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: "#ff4757",
    paddingVertical: 8,
    borderRadius: 8,
  },
});

export default AccountScreen;
