import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  RefreshControl,
  Animated,
} from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useBackHandler } from "../BackButtonHandler";

const HomeScreen = ({ navigation }) => {
  useBackHandler(navigation);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastMarkedTime, setLastMarkedTime] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    checkAttendanceStatus();
  }, []);

  const checkAttendanceStatus = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(
        "http://192.168.142.25:3001/api/v1/student/attendance/status",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAttendanceMarked(response.data.marked);
      setLastMarkedTime(response.data.timestamp || null);
    } catch (error) {
      console.error("Error checking attendance status:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    checkAttendanceStatus().then(() => setRefreshing(false));
  }, []);

  const handleMarkAttendance = async () => {
    if (attendanceMarked) {
      Alert.alert("Already Marked", "You have already marked your attendance today.");
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required to mark attendance.");
        return;
      }
      const locationData = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        "http://192.168.142.25:3001/api/v1/student/attendance/mark",
        {
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
          timestamp: new Date().toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAttendanceMarked(true);
      setLastMarkedTime(new Date().toISOString());
      Alert.alert("Success", "Attendance marked successfully!");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.response?.data?.message || "Failed to mark attendance.");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}> 
        <Image source={{ uri: "https://i0.wp.com/csice.edu.in/wp-content/uploads/2024/01/csice-logo-main-3.png" }} style={styles.image} />
      </Animated.View>

      <View style={styles.card}>
        <Text style={styles.header}>Attendance Status</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#3498db" />
        ) : (
          <View style={styles.statusContainer}>
            <Ionicons name={attendanceMarked ? "checkmark-circle" : "time-outline"} size={60} color={attendanceMarked ? "#27ae60" : "#f39c12"} />
            <Text style={styles.statusText}>{attendanceMarked ? "Attendance Marked" : "Pending"}</Text>
            {lastMarkedTime && <Text style={styles.timestamp}>Last Marked: {new Date(lastMarkedTime).toLocaleTimeString()}</Text>}
          </View>
        )}
      </View>

      <TouchableOpacity style={[styles.button, attendanceMarked && styles.disabledButton]} onPress={handleMarkAttendance} disabled={attendanceMarked}>
        <Text style={styles.buttonText}>{attendanceMarked ? "Attendance Marked" : "Mark Attendance"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ecf0f1",
    padding: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 250,
    height: 150,
    resizeMode: "contain",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: "center",
    width: "90%",
    marginBottom: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#34495e",
    marginBottom: 10,
  },
  statusContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 5,
  },
  timestamp: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 5,
  },
  button: {
    backgroundColor: "#27ae60",
    padding: 15,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#95a5a6",
  },
});

export default HomeScreen;
