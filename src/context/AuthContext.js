import axios from "axios";
import { navigate } from "../navigationRef";
import createDataContext from "./createDataContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL
const authReducer = (state, action) => {
  switch (action.type) {
    case "add_error":
      return { ...state, errorMessage: action.payload };
    case "signin":
      return { errorMessage: "", token: action.payload };
    case "clear_error_message":
      return { ...state, errorMessage: "" };
    case "signout":
      return { token: null, errorMessage: "" };
    default:
      return state;
  }
};
const tryLocalSignin = (dispatch) => async () => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    dispatch({ type: "signin", payload: token });
    navigate("mainFlow");
  } else {
    navigate("authFlow");
  }
};

const clearErrorMessage = (dispatch) => () => {
  dispatch({ type: "clear_error_message" });
};
const signup =
  (dispatch) =>
  async ({ email, password }) => {
    try {
      const response = await axios.post("http:// 192.168.1.7:5000/signup", {
        email,
        password,
      });
      await AsyncStorage.setItem("token", response.data.token);
      dispatch({ type: "signin", payload: response.data.token });
      navigate("mainFlow");
    } catch (err) {
      dispatch({
        type: "add_error",
        payload: "Something went wrong with sign up",
      });
    }
  };

const login =
  (dispatch) =>
  async ({ username, password }) => {
    try {
      const response = await axios.post(`${EXPO_PUBLIC_API_URL}/api/v1/student/auth/login`, {
        username,
        password,
      });
      await AsyncStorage.setItem("token", response.data.token);
      dispatch({ type: "signin", payload: response.data.token });
      navigate("mainFlow");
    } catch (err) {
      console.log(err)
      dispatch({
        type: "add_error",
        payload: "Something went wrong with sign in",
      });
    }
  };

const signout = (dispatch) => async () => {
  await AsyncStorage.removeItem("token");
  dispatch({ type: "signout" });
  navigate("authFlow");
};

export const { Provider, Context } = createDataContext(
  authReducer,
  { login, signout, signup, clearErrorMessage, tryLocalSignin },
  { token: null, errorMessage: "" }
);
