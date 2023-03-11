// Imports
import { useReducer } from "react";
import AuthContext from "./authContext";
import authReducer from "./authReducer";
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_ERRORS,
  VALID_FAIL,
  VALID_SUCCESS,
} from "../types";
import axios from "axios";

axios.defaults.withCredentials = true;

const AuthState = (props) => {
  // Set initial state
  const initialState = {
    isAuthenticated: false,
    user: null,
    error: null,
    token: false,
  };

  // Init Reducer
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load User
  const loadUser = async () => {
    try {
      // Make a get request at localhost:5000/api/auth
      const res = await axios.get("/api/auth");

      // Dispatch the action to reducer for USER_LOADED
      dispatch({ type: USER_LOADED, payload: res.data });
    } catch (err) {
      if (err.response.status === 401) {
        console.log("This is the desired behaviour");
      }
      // Dispatch the action to reducer for AUTH_ERROR
      dispatch({ type: AUTH_ERROR });
    }
  };

  // Register User
  const registerUser = async (formData) => {
    // Set header of the input data
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      // Make a post request at localhost:5000/api/users/user
      const res = await axios.post("api/users/user", formData, config);

      // Dispatch the action to reducer for REGISTER_SUCCESS
      dispatch({
        type: REGISTER_SUCCESS,
        payload: res.data,
      });

      // Load the user after successful registration
      loadUser();
    } catch (err) {
      // Dispatch the action to reducer for REGISTER_FAIL
      dispatch({
        type: REGISTER_FAIL,
        payload: err.response.data.errors[0].msg,
      });
    }
  };

  // Register Moderator
  const registerMod = async (formData) => {
    // Set header of the input data
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      // Add role to formData
      formData.role = "moderator";

      // Make a post request at localhost:5000/api/users/moderator
      const res = await axios.post("api/users/moderator", formData, config);

      // Dispatch the action to reducer for REGISTER_SUCCESS
      dispatch({
        type: REGISTER_SUCCESS,
        payload: res.data,
      });

      // Load the user after successful registration
      loadUser();
    } catch (err) {
      // Dispatch the action to reducer for REGISTER_FAIL
      dispatch({
        type: REGISTER_FAIL,
        payload: err.response.data.errors[0].msg,
      });
    }
  };

  // Login User
  const login = async (formData) => {
    // Set header of the input data
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      // Make a post request at localhost:5000/api/auth
      const res = await axios.post("api/auth", formData, config);

      // Dispatch the action to reducer for LOGIN_SUCCESS
      dispatch({
        type: LOGIN_SUCCESS,
        payload: res.data,
      });

      // Load the user after successful login
      loadUser();
    } catch (err) {
      // Dispatch the action to reducer for LOGIN_FAIL
      console.log(err)
      dispatch({
        type: LOGIN_FAIL,
        payload: err.response.data.errors[0].msg,
      });
    }
  };

  // Logout
  const logout = async () => {
    try {
      await axios.delete("/api/auth");

      // Dispatch the action to reducer for LOGOUT
      dispatch({ type: LOGOUT });
    } catch (err) {
      console.log(err);
    }
  };

  // Validate user
  const validate = async () => {
    try {
      const res = await axios.get("/api/auth/check");
      if (res.data === "Valid") {
        dispatch({
          type: VALID_SUCCESS,
        });
      }
    } catch (err) {
      dispatch({
        type: VALID_FAIL,
      });
    }
  };

  // Clear Errors
  const clearErrors = () => {
    // Dispatch the action to reducer for CLEAR_ERRORS
    dispatch({
      type: CLEAR_ERRORS,
    });
  };

  return (
    <AuthContext.Provider
      // Provide these values to all components wrapped in AuthContext in App.js
      value={{
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        error: state.error,
        token: state.token,
        registerUser,
        registerMod,
        login,
        loadUser,
        logout,
        clearErrors,
        validate,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthState;
