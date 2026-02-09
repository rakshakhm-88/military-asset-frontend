import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Purchases from './components/Purchases';
import Transfers from './components/Transfers';
import Assignments from './components/Assignments';
import Expenditures from './components/Expenditures';
import AuditLogs from './components/AuditLogs';
import './styles/App.css';

const Navigation = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <h1>Military Asset Management</h1>
            </div>
            <div className="nav-links">
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/purchases">Purchases</Link>
                <Link to="/transfers">Transfers</Link>
                <Link to="/assignments">Assignments</Link>
                <Link to="/expenditures">Expenditures</Link>
                {user?.role === 'admin' && <Link to="/audit">Audit Logs</Link>}
            </div>
            <div className="nav-user">
                <span>{user?.full_name}</span>
                <button onClick={logout} className="btn-logout">Logout</button>
            </div>
        </nav>
    );
};

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="loading-screen">Loading...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppContent = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Router>
            {isAuthenticated && <Navigation />}
            <div className={isAuthenticated ? "main-content" : ""}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/purchases" element={<PrivateRoute><Purchases /></PrivateRoute>} />
                    <Route path="/transfers" element={<PrivateRoute><Transfers /></PrivateRoute>} />
                    <Route path="/assignments" element={<PrivateRoute><Assignments /></PrivateRoute>} />
                    <Route path="/expenditures" element={<PrivateRoute><Expenditures /></PrivateRoute>} />
                    <Route path="/audit" element={<PrivateRoute><AuditLogs /></PrivateRoute>} />
                    <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
                </Routes>
            </div>
        </Router>
    );
};

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
