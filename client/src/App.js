import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/routing/PrivateRoute';

import Alerts from "./components/layout/Alert/Alerts";

// States
import AlertState from './context/alert/AlertState';
import AuthState from './context/auth/AuthState';
import ModState from './context/mod/ModState';
import UserState from './context/user/UserState';

// Pages
import Home from './components/pages/Home';
import Dashboard from './components/pages/Dashboard';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import NotFound from './components/pages/NotFound';

const App = () => {
  return (
    <AuthState>
      <AlertState>
        <ModState>
          <UserState>
            <Router>
              <Alerts />
              <Routes>
                <Route exact path='/' element={<Home />} />
                <Route
                  exact
                  path='/dashboard'
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route exact path='/login' element={<Login />} />
                <Route exact path='/register' element={<Register />} />
                <Route path='*' element={<NotFound />} />
              </Routes>
            </Router>
          </UserState>
        </ModState>
      </AlertState>
    </AuthState>
  );
}

export default App;
