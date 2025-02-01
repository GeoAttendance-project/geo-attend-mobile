import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // To use icons
import moment from "moment"; // To format the date and time
import axios from "axios"; // Ensure axios is installed

const AttendanceHomeScreen = () => {
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const navigation = useNavigation();

  // Format the current date and time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment().format("dddd, MMMM Do YYYY, h:mm:ss A"));
    }, 1000); // Update every second

    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  // Check if attendance is marked for today
  useEffect(() => {
    const checkAttendanceStatus = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://192.168.1.3:3001/api/v1/student/attendance/check", // API call to check attendance status
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${yourToken}`, // Add the correct token if needed
            },
          }
        );

        if (response.data.status === "success") {
          setAttendanceMarked(response.data.marked);
          setStatusMessage(
            response.data.marked
              ? "Attendance Marked!"
              : "Attendance Not Marked Yet"
          );
        } else {
          setStatusMessage("Error checking attendance status");
        }
      } catch (error) {
        setStatusMessage("Error checking attendance status");
      } finally {
        setLoading(false);
      }
    };

    checkAttendanceStatus();
  }, []);

  // Handle Mark Attendance button press
  const handleMarkAttendance = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://192.168.1.3:3001/api/v1/student/attendance/mark", // API call to mark attendance
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${yourToken}`, // Add the correct token if needed
          },
        }
      );

      if (response.data.status === "success") {
        setAttendanceMarked(true);
        setStatusMessage("Attendance Marked!");
      } else {
        setStatusMessage("Error marking attendance");
      }
    } catch (error) {
      setStatusMessage("Error marking attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance Management</Text>
      <Ionicons
        name="checkmark-circle"
        size={50}
        color="#2ecc71"
        style={styles.icon}
      />

      <Text style={styles.dateTime}>{currentTime}</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#3498db"
          style={styles.spinner}
        />
      ) : (
        <Text style={styles.status}>{statusMessage}</Text>
      )}

      <Button
        title={loading ? "Marking Attendance..." : "Mark Attendance"}
        onPress={handleMarkAttendance} // Trigger marking attendance
        color={loading ? "#f39c12" : "#3498db"}
        disabled={loading || attendanceMarked}
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
    backgroundColor: "#ecf0f1", // Light background for the home screen
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2c3e50",
  },
  icon: {
    marginBottom: 30,
  },
  dateTime: {
    fontSize: 18,
    color: "#34495e",
    marginBottom: 20,
  },
  button: {
    width: "80%",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#3498db",
  },
  status: {
    marginTop: 20,
    fontSize: 18,
    color: "green",
  },
  spinner: {
    marginTop: 20,
  },
});

export default AttendanceHomeScreen;
