import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import CarsPage from './pages/Cars/CarsPage';
import LeadsPage from './pages/Leads/LeadsPage';
import TestDrivesPage from './pages/TestDrives/TestDrivesPage';
import DealsPage from './pages/Deals/DealsPage';
import FollowupsPage from './pages/Followups/FollowupsPage';
import ReportsPage from './pages/Reports/ReportsPage';
import UsersPage from './pages/Users/UsersPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/cars" element={<CarsPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/testdrives" element={<TestDrivesPage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/followups" element={<FollowupsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
