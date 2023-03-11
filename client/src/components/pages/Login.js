import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/auth/authContext";
import AlertContext from "../../context/alert/alertContext";

const Login = () => {
  const navigate = useNavigate();
  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;

  const authContext = useContext(AuthContext);
  const { login, isAuthenticated, validate, error, clearErrors } = authContext;
  const [user, setUser] = useState({
    email: "",
    password: ""
  });

  useEffect(() => {
    validate();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }

    if (error) {
      setAlert(error, "error");
    }

    clearErrors();
    // eslint-disable-next-line
  }, [isAuthenticated, error]);

  const onChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  }

  const onSubmit = (e) => {
    e.preventDefault();
    login({
      email: user.email,
      password: user.password
    });
  }


  return (
    <>
      <div className="flex items-center justify-center pt-10">
        <div className="bg-white rounded-lg shadow-xl p-10 w-2/5">
          <h2 className="text-3xl font-bold mb-10 text-center">Login</h2>
          <form>
            <div className="mb-5">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                value={user.email}
                onChange={onChange}
              />
            </div>
            <div className="mb-5">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                name="password"
                type="password"
                placeholder="******************"
                value={user.password}
                onChange={onChange}
              />
            </div>
            <div className="flex items-center justify-center">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
                onClick={onSubmit}
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default Login