import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('planner_user');
    const token = localStorage.getItem('planner_token');
    if (stored && token) setUser(JSON.parse(stored));
  }, []);

  function handleLogin(userData, token) {
    localStorage.setItem('planner_user', JSON.stringify(userData));
    localStorage.setItem('planner_token', token);
    setUser(userData);
  }

  function handleLogout() {
    localStorage.removeItem('planner_user');
    localStorage.removeItem('planner_token');
    setUser(null);
  }

  return user
    ? <Dashboard user={user} onLogout={handleLogout} />
    : <Auth onLogin={handleLogin} />;
}
