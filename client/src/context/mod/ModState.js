// Imports
import { useReducer } from "react";
import ModContext from "./modContext";
import modReducer from "./modReducer";
import {
  CLEAR_ERRORS,
} from "../types";
import axios from "axios";
axios.defaults.withCredentials = true;

const ModState = (props) => {
  // Set initial state
  const initialState = {
    error: null,
  };

  // Init Reducer
  const [state, dispatch] = useReducer(modReducer, initialState);

  // Clear Errors
  const clearErrors = () => {
    // Dispatch the action to reducer for CLEAR_ERRORS
    dispatch({
      type: CLEAR_ERRORS,
    });
  };

  return (
    <ModContext.Provider
      // Provide these values to all components wrapped in AdminContext in App.js
      value={{
        error: state.error,
        clearErrors,
      }}
    >
      {props.children}
    </ModContext.Provider>
  );
};

export default ModState;
