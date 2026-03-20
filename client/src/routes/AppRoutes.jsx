import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Onboarding from "../pages/Onboarding.jsx";
import WorkerDashboard from "../pages/WorkerDashboard.jsx";
import PolicyDashboard from "../pages/PolicyDashboard.jsx";
import AdminDashboard from "../pages/AdminDashboard.jsx";
import Analytics from "../pages/Analytics.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/onboarding" replace />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/worker" element={<WorkerDashboard />} />
      <Route path="/policy" element={<PolicyDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/analytics" element={<Analytics />} />
    </Routes>
  );
}