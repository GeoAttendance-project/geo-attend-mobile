import React, { useState, useEffect } from "react";
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
  Dimensions,
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import { Ionicons } from "@expo/vector-icons";
import { useBackHandler } from "../BackButtonHandler";
import { API_URL } from "../config";

const { width, height } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  useBackHandler(navigation);

  const [attendanceMarked, setAttendanceMarked] = useState({
    morning: false,
    afternoon: false,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAttendance, setMarkingAttendance] = useState({
    morning: false,
    afternoon: false,
  });
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [attendanceTime, setAttendanceTime] = useState({
    isMorning: false,
    isAfternoon: false,
  });
  const [userLocation, setUserLocation] = useState(null);
  const [attendanceLocation, setAttendanceLocation] = useState(null);
  const [attendanceLocationRadius, setAttendanceLocationRadius] = useState(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    checkAttendanceStatus();
    getLiveLocation();
  }, []);

  const getLiveLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to mark attendance."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.log("Error fetching live location:", error);
      Alert.alert("Error", "Failed to fetch live location.");
    }
  };

  const checkAttendanceStatus = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/v1/student/attendance/status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAttendanceMarked(response.data.attendance);
      setAttendanceTime({
        isMorning: response.data.isMorningTime,
        isAfternoon: response.data.isAfternoonTime,
      });
      setAttendanceLocation({
        latitude: response.data.attendanceLocationLatitude,
        longitude: response.data.attendanceLocationLongitude,
      });
      setAttendanceLocationRadius(response.data.radius);
    } catch (error) {
      console.log("Error fetching attendance status:", error);
      Alert.alert("Failed", error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getDeviceId = async () => {
    let deviceId = await AsyncStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = uuidv4();
      await AsyncStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
  };

  const handleMarkAttendance = async (session) => {
    try {
      setMarkingAttendance((prev) => ({ ...prev, [session]: true }));
      const token = await AsyncStorage.getItem("token");

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
        timeout: 10000,
      });

      const deviceId = await getDeviceId();

      const response = await axios.post(
        `${API_URL}/api/v1/student/attendance/mark`,
        {
          session,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          deviceId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setAttendanceMarked((prev) => ({ ...prev, [session]: true }));
        await checkAttendanceStatus();
      } else {
        Alert.alert(
          "Success",
          response.data.message || "Failed to mark attendance"
        );
      }
    } catch (error) {
      console.log("Error marking attendance:", error);
      Alert.alert(
        "Oops!",
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setMarkingAttendance((prev) => ({ ...prev, [session]: false }));
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={checkAttendanceStatus}
        />
      }
    >
      <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
        <Image
          source={{
            uri: "https://i0.wp.com/csice.edu.in/wp-content/uploads/2024/01/csice-logo-main-3.png",
          }}
          style={styles.image}
          accessibilityLabel="College Logo"
        />
      </Animated.View>
      <View style={styles.mapContainer}>
        {userLocation && attendanceLocation ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: attendanceLocation.latitude,
              longitude: attendanceLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            followsUserLocation={true}
          >
            <Marker
              coordinate={{
                latitude: attendanceLocation.latitude,
                longitude: attendanceLocation.longitude,
              }}
              title="Attendance Location"
              pinColor="blue"
            />
            <Circle
              center={{
                latitude: attendanceLocation.latitude,
                longitude: attendanceLocation.longitude,
              }}
              radius={attendanceLocationRadius}
              strokeColor="rgba(255, 0, 0, 0.5)"
              fillColor="rgba(255, 0, 0, 0.2)"
            />
          </MapView>
        ) : (
          <ActivityIndicator size="large" color="#6C63FF" />
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.header}>Attendance Status</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#6C63FF" />
        ) : (
          <View style={styles.statusContainer}>
            <Ionicons
              name={
                attendanceMarked.morning && attendanceMarked.afternoon
                  ? "checkmark-circle"
                  : "time-outline"
              }
              size={60}
              color={
                attendanceMarked.morning && attendanceMarked.afternoon
                  ? "#127a72"
                  : "#FF6584"
              }
            />
            <Text style={styles.statusText}>
              {attendanceMarked.morning && attendanceMarked.afternoon
                ? "Attendance Marked for Both Sessions"
                : "Pending Attendance"}
            </Text>
          </View>
        )}
      </View>

      {["morning", "afternoon"].map((session) => (
        <TouchableOpacity
          key={session}
          style={[
            styles.button,
            (!attendanceTime[
              `is${session.charAt(0).toUpperCase() + session.slice(1)}`
            ] ||
              attendanceMarked[session]) &&
              styles.disabledButton,
          ]}
          onPress={() => handleMarkAttendance(session)}
          disabled={
            !attendanceTime[
              `is${session.charAt(0).toUpperCase() + session.slice(1)}`
            ] ||
            attendanceMarked[session] ||
            markingAttendance[session]
          }
          accessibilityRole="button"
          accessibilityLabel={`Mark ${session} Attendance`}
        >
          {markingAttendance[session] ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {attendanceMarked[session]
                ? `${
                    session.charAt(0).toUpperCase() + session.slice(1)
                  } Attendance Marked`
                : `Mark ${
                    session.charAt(0).toUpperCase() + session.slice(1)
                  } Attendance`}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    padding: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  image: {
    width: width * 0.8,
    height: 150,
    resizeMode: "contain",
  },
  mapContainer: {
    width: "100%",
    height: height * 0.3,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 25,
  },
  map: {
    flex: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    alignItems: "center",
    width: "100%",
    marginBottom: 25,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E3A59",
    marginBottom: 15,
    textAlign: "center",
  },
  statusContainer: {
    alignItems: "center",
    marginTop: 15,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A5568",
    marginTop: 10,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#127a72",
    padding: 20,
    borderRadius: 15,
    width: "100%",
    alignItems: "center",
    shadowColor: "#127a72",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: "#CBD5E0",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default HomeScreen;