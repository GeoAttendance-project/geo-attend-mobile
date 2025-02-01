import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const AttendanceDetailScreen = () => {
  // Dummy data for attendance details
  const attendanceData = [
    { id: "1", date: "2024-12-01", status: "Present" },
    { id: "2", date: "2024-12-02", status: "Absent" },
    { id: "3", date: "2024-12-03", status: "Present" },
    { id: "4", date: "2024-12-04", status: "Present" },
    { id: "5", date: "2024-12-05", status: "Absent" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance Details</Text>
      <FlatList
        data={attendanceData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.text}>Date: {item.date}</Text>
            <Text style={styles.text}>Status: {item.status}</Text>
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
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  text: {
    fontSize: 18,
  },
});

export default AttendanceDetailScreen;
