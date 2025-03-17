import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  Image,
  Text,
  RefreshControl,
} from "react-native";
import { Context } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  Card,
  Title,
  Paragraph,
  Button,
  Divider,
  TextInput,
} from "react-native-paper";
import * as Device from "expo-device";
import { LinearGradient } from "expo-linear-gradient";
import avatraIcon from "../../assets/avatar.png";
import { API_URL } from "../config";
import { navigate } from "../navigationRef";

const AccountScreen = ({ navigation }) => {
  const { signout } = useContext(Context);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deviceId, setDeviceId] = useState(null);
  const [reason, setReason] = useState("");
  const [deviceChangeStatus, setDeviceChangeStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Authentication token missing. Please log in.");
        return;
      }

      const response = await axios.get(`${API_URL}/api/v1/student/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data.data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch profile data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeviceId = async () => {
    try {
      const id = Device.osInternalBuildId || Device.deviceName || "Unknown";
      setDeviceId(id);
    } catch (error) {
      console.log("Error fetching device ID:", error);
    }
  };

  const fetchDeviceChangeStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Authentication token missing. Please log in.");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/v1/student/device-change/status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDeviceChangeStatus(response.data.status);
    } catch (error) {
      console.log("Error fetching device change status:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await fetchProfile();
    await fetchDeviceId();
    await fetchDeviceChangeStatus();
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData().then(() => setRefreshing(false));
  }, []);

  const requestDeviceChange = async () => {
    if (!reason.trim()) {
      Alert.alert("Error", "Please provide a reason for the device change.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Authentication token missing. Please log in.");
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/v1/student/device-change`,
        {
          studentId: user?._id,
          newDeviceId: deviceId,
          reason,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert("Success", response.data.message);
      setDeviceChangeStatus("PENDING"); // Update UI state after request
      setReason(""); // Reset the reason input
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      navigate("Signin");
    } catch (error) {
      console.log("Logout Error:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={{ uri: "https://source.unsplash.com/random/800x600?nature" }}
      style={styles.background}
      blurRadius={5}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <LinearGradient
          colors={["#6C63FF", "#8E85FF"]}
          style={styles.gradientCard}
        >
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.avatarContainer}>
                <Image size={100} source={avatraIcon} style={styles.avatar} />
                <Title style={styles.name}>{user?.name}</Title>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.infoContainer}>
                <Paragraph style={styles.info}>
                  📧 Email: {user?.email}
                </Paragraph>
                <Paragraph style={styles.info}>
                  🏫 Dept: {user?.department}, Year {user?.year}
                </Paragraph>
                <Paragraph style={styles.info}>
                  🆔 Exam No: {user?.examNo}
                </Paragraph>
              </View>
            </Card.Content>
          </Card>
        </LinearGradient>

        {deviceChangeStatus === "PENDING" ? (
          <View style={styles.pendingContainer}>
            <Text style={styles.pendingText}>
              🔄 Device change request is pending...
            </Text>
          </View>
        ) : (
          <View style={styles.deviceChangeContainer}>
            <TextInput
              label="Reason for Device Change"
              value={reason}
              onChangeText={setReason}
              style={styles.input}
              mode="outlined"
              theme={{ colors: { primary: "#127a72", background: "#FFFFFF" } }}
            />
            <Button
              mode="contained"
              onPress={requestDeviceChange}
              style={styles.changeButton}
              labelStyle={styles.buttonText}
            >
              Request Device Change
            </Button>
          </View>
        )}

        <Button
          mode="contained"
          onPress={logout}
          style={styles.logoutButton}
          labelStyle={styles.buttonText}
        >
          Logout
        </Button>
      </ScrollView>
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
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  gradientCard: {
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  card: {
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2E3A59",
  },
  divider: {
    marginVertical: 12,
    backgroundColor: "#E0E0E0",
  },
  infoContainer: {
    marginTop: 8,
  },
  info: {
    fontSize: 16,
    color: "#444",
    marginBottom: 8,
  },
  pendingContainer: {
    backgroundColor: "rgba(255, 165, 0, 0.1)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  pendingText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFA500",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  changeButton: {
    backgroundColor: "#127a72",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  logoutButton: {
    backgroundColor: "#FF4757",
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#FF4757",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF", // White background during loading
  },
});

export default AccountScreen;