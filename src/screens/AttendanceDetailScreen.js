import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  LayoutAnimation,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useBackHandler } from "../BackButtonHandler";
const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL
const AttendanceDetailScreen = ({ navigation }) => {
  useBackHandler(navigation);

  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAttendance = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Authentication token missing. Please log in.");
        return;
      }

      const response = await axios.get(`${EXPO_PUBLIC_API_URL}/api/v1/student/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formattedData = response.data.data.map((item) => ({
        id: item._id,
        date: new Date(item.markedDate).toISOString().split("T")[0],
        status: "Present", // Assuming all fetched entries are present
      }));

      LayoutAnimation.easeInEaseOut();
      setAttendanceData(formattedData);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch attendance data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAttendance();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance Details</Text>
      <FlatList
        data={attendanceData}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.dateText}>{item.date}</Text>
              <Text style={[styles.statusBadge, item.status === "Present" ? styles.present : styles.absent]}>
                {item.status}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f6f9",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
    color: "#2d3436",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3436",
  },
  statusBadge: {
    fontSize: 16,
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    overflow: "hidden",
  },
  present: {
    backgroundColor: "#4CAF50",
    color: "#fff",
  },
  absent: {
    backgroundColor: "#E53935",
    color: "#fff",
  },
});

export default AttendanceDetailScreen;
