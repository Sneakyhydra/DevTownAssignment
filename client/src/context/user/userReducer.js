import {
  CLEAR_ERRORS,
} from "../types";

// Change state according to the type of action
const userReducer = (state, action) => {
  switch (action.type) {
    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

export default userReducer;
