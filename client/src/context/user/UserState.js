// Imports
import { useReducer } from "react";
import UserContext from "./userContext";
import userReducer from "./userReducer";
import {
  CLEAR_ERRORS,
} from "../types";
import axios from "axios";
axios.defaults.withCredentials = true;

const UserState = (props) => {
  // Set initial state
  const initialState = {
    error: null,
  };

  // Init Reducer
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Clear Errors
  const clearErrors = () => {
    // Dispatch the action to reducer for CLEAR_ERRORS
    dispatch({
      type: CLEAR_ERRORS,
    });
  };

  return (
    <UserContext.Provider
      // Provide these values to all components wrapped in CounContext in App.js
      value={{
        error: state.error,
        clearErrors,
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};

export default UserState;
