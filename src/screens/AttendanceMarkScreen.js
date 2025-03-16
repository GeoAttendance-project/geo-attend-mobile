import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons"; // For location icon
import { API_URL } from "../config";
const AttendanceMarkScreen = () => {
  const [hasLocationPermission, setHasLocationPermission] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const locationSubscription = useRef(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setHasLocationPermission(status === "granted");

        if (status === "granted") {
          const locationData = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          setLocation(locationData.coords);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch location.");
      } finally {
        setLoading(false);
      }
    };

    requestLocationPermission();
  }, []);

  useEffect(() => {
    const startWatchingLocation = async () => {
      if (!hasLocationPermission) return;
  
      try {
        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000, // Update every 5 seconds
            distanceInterval: 5, // Update only if moved 5 meters
          },
          (locationData) => {
            console.log("Location updated:", locationData.coords);
            setLocation(locationData.coords);
          }
        );
      } catch (error) {
        console.log("Error watching location:", error);
      }
    };
  
    startWatchingLocation();
  
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
    };
  }, [hasLocationPermission]);

  const handleMarkAttendance = async () => {
    if (!location) {
      Alert.alert("Error", "Location not available. Try again.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert(
          "Error",
          "Authentication token not found. Please log in again."
        );
        return;
      }

      await axios.post(
        `${API_URL}/api/v1/student/attendance/mark`,
        {
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Success", "Attendance marked successfully!");
    } catch (error) {
      Alert.alert(error.response?.data.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.locationContainer}>
        <Text style={styles.header}>Your Location</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#3498db" style={styles.spinner} />
        ) : hasLocationPermission ? (
          location ? (
            <View style={styles.locationCard}>
              <Ionicons name="location-sharp" size={24} color="black" />
              <Text style={styles.locationText}>
                Latitude: {location.latitude}
              </Text>
              <Text style={styles.locationText}>
                Longitude: {location.longitude}
              </Text>
            </View>
          ) : (
            <Text>Fetching location...</Text>
          )
        ) : (
          <Text style={styles.errorText}>Location permission denied.</Text>
        )}
      </View>

      <Button
        title="Mark Attendance"
        onPress={handleMarkAttendance}
        color="#2ecc71"
        disabled={!location || loading}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f4f6f7", // light background color
  },
  locationContainer: {
    marginBottom: 20,
    alignItems: "center",
    width: "100%",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#34495e",
  },
  locationCard: {
    backgroundColor: "#ecf0f1", // light card background
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bdc3c7",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  locationText: {
    fontSize: 16,
    color: "#2c3e50",
    marginVertical: 5,
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#2ecc71",
  },
  spinner: {
    marginTop: 20,
  },
});

export default AttendanceMarkScreen;
