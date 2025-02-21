import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet, Alert, ActivityIndicator, ImageBackground } from "react-native";
import { Context } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigate } from "../navigationRef";
import axios from "axios";
import { Card, Title, Paragraph, Button, Avatar, Divider } from "react-native-paper";
import { useBackHandler } from "../BackButtonHandler";
const EXPO_PUBLIC_API_URL= process.env.EXPO_PUBLIC_API_URL
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

        const response = await axios.get(`${EXPO_PUBLIC_API_URL}/api/v1/student/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

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
      await AsyncStorage.removeItem("token");
      navigate("Signin");
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
    <ImageBackground
      source={{ uri: "https://source.unsplash.com/random/800x600?nature" }}
      style={styles.background}
      blurRadius={5}
    >
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.avatarContainer}>
              <Avatar.Image
                size={90}
                source={{ uri: user?.avatar || "https://icons.veryicon.com/png/o/miscellaneous/common-icons-31/default-avatar-2.png" }}
                style={styles.avatar}
              />
              <Title style={styles.name}>{user?.name}</Title>
              <Paragraph style={styles.rollNo}>@{user?.name}</Paragraph>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.infoContainer}>
              <Paragraph style={styles.info}>📧 Email: {user?.email}</Paragraph>
              <Paragraph style={styles.info}>🏫 Dept: {user?.department}, Year {user?.year}</Paragraph>
              <Paragraph style={styles.info}>🆔 Exam No: {user?.examNo}</Paragraph>
            </View>
          </Card.Content>
        </Card>

        <Button mode="contained" onPress={logout} style={styles.logoutButton} labelStyle={styles.logoutText}>
          Logout
        </Button>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    padding: 20,
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
    backgroundColor: "rgba(255, 255, 255, 0.95)",
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
  avatar: {
    backgroundColor: "#e0e0e0",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2d3436",
    marginTop: 10,
  },
  rollNo: {
    fontSize: 16,
    color: "#636e72",
  },
  divider: {
    marginVertical: 15,
    backgroundColor: "#ddd",
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
    alignSelf: "center",
    width: "80%",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AccountScreen;
