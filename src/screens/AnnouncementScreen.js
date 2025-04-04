import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";
import { WebView } from "react-native-webview";

const AnnouncementsScreen = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [webviewLink, setWebviewLink] = useState(null);

  const fetchAnnouncements = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Authentication token not found. Please log in again.");
        return;
      }
      const response = await axios.get(`${API_URL}/api/v1/student/announcement`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.status === "success") {
        setAnnouncements(response.data.data);
      } else {
        setError("Failed to load announcements");
      }
    } catch (err) {
      console.log(err);
      setError("Error fetching announcements");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnnouncements();
  }, []);

  const openAttachment = (link) => {
    setWebviewLink(link);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading announcements...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={announcements}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.content}>{item.content}</Text>

            {item.attachmentLink && (
              <Pressable
                style={styles.attachmentButton}
                onPress={() => openAttachment(item.attachmentLink)}
              >
                <Text style={styles.attachmentText}>View Attachment</Text>
              </Pressable>
            )}

            <Text style={styles.date}>
              {new Date(item.createdAt).toDateString()}
            </Text>
          </View>
        )}
      />

      {/* WebView Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1 }}>
          <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={{ color: "white", fontWeight: "bold" }}>Close</Text>
          </Pressable>
          <WebView source={{ uri: webviewLink }} style={{ flex: 1 }} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F3F7FA",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#555",
    marginTop: 10,
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#222",
  },
  content: {
    fontSize: 16,
    marginBottom: 10,
    color: "#444",
  },
  attachmentButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  attachmentText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  date: {
    fontSize: 14,
    textAlign: "right",
    color: "#666",
    fontStyle: "italic",
  },
  closeButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    alignItems: "center",
  },
});

export default AnnouncementsScreen;
