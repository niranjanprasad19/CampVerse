import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clubs from './pages/Clubs';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Placements from './pages/Placements';
import JobDetails from './pages/JobDetails';
import Profile from './pages/Profile';
import AppLayout from './layouts/AppLayout';
import Onboarding from './pages/Onboarding';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  // In a real app we would check auth state, but for the MVP skeleton logic:
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Loading...</div>;
  }

  // Note: currentUser might be null initially while loading. AuthContext handles loading state.
  // However, since we wrapped everything in AuthProvider which handles !loading, strictly checking currentUser here is safe *after* loading.
  if (!currentUser) return <Navigate to="/login" />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />

        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="clubs" element={<Clubs />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventDetails />} />
          <Route path="placements" element={<Placements />} />
          <Route path="placements/:id" element={<JobDetails />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
