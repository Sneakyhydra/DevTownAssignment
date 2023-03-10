// Imports
import { useContext } from "react";
import { Navigate } from 'react-router-dom';
import AuthContext from "../../context/auth/authContext";
import AlertContext from "../../context/alert/alertContext";

const PrivateRoute = ({ children }) => {
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;

  const authContext = useContext(AuthContext);
  const { isAuthenticated, loading } = authContext;

  // If user is authenticated, render children
  if (isAuthenticated && !loading) {
    return children;
  }

  setAlert("Please login first", "error");
  return <Navigate to='/login' />;
};

export default PrivateRoute;
