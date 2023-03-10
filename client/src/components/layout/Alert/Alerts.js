// Imports
import { useContext } from "react";
import "./Alerts.css";
import AlertContext from "../../../context/alert/alertContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'

const Alerts = () => {
  const alertContext = useContext(AlertContext);

  return (
    alertContext.alerts.length > 0 &&
    alertContext.alerts.map((alert) => (
      <div
        key={alert.id}
        className={`alert alert-${alert.type}`}
        style={{
          margin: "0",
          zIndex: "10000",
          position: "fixed",
          width: "100%",
        }}
      >
        <FontAwesomeIcon icon={faInfoCircle} />
        &nbsp;
        {alert.msg}
      </div>
    ))
  );
};

export default Alerts;
