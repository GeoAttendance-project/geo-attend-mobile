import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FontAwesome } from "@expo/vector-icons";
import AccountScreen from "./screens/AccountScreen";
import AttendanceDetailScreen from "./screens/AttendanceDetailScreen";
import LoginScreen from "./screens/LoginScreen";
import { Provider as AuthProvider } from "../src/context/AuthContext";
import ResolveAuthScreen from "./screens/ResolveAuthScreen";
import { setNavigator } from "./navigationRef";
import AttendanceHomeScreen from "./screens/AttendanceHomeScreen";
import AttendanceMarkScreen from "./screens/AttendanceMarkScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Authentication Stack
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Signin" component={LoginScreen} />
  </Stack.Navigator>
);

// Attendance Mark Stack
const AttendanceStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="AttendanceHome"
      component={AttendanceHomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen name="AttendanceMark" component={AttendanceMarkScreen} />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTab = () => (
  <Tab.Navigator screenOptions={{ tabBarActiveTintColor: "#3F72AF" }}>
    <Tab.Screen
      name="AttendanceStack"
      component={AttendanceStack}
      options={{
        title: "Mark Attendance",
        tabBarIcon: ({ color }) => (
          <FontAwesome name="check-square" size={24} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="AttendanceDetails"
      component={AttendanceDetailScreen}
      options={{
        title: "Attendance Details",
        tabBarIcon: ({ color }) => (
          <FontAwesome name="list-alt" size={24} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Account"
      component={AccountScreen}
      options={{
        title: "Account",
        tabBarIcon: ({ color }) => (
          <FontAwesome name="gear" size={24} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

// Main App Component
const App = () => {
  return (
    <NavigationContainer
      ref={(navigator) => {
        setNavigator(navigator);
      }}
    >
      <AuthProvider>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="ResolveAuth" component={ResolveAuthScreen} />
          <Stack.Screen name="authFlow" component={AuthStack} />
          <Stack.Screen name="mainFlow" component={MainTab} />
        </Stack.Navigator>
      </AuthProvider>
    </NavigationContainer>
  );
};

export default App;
