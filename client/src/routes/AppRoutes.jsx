import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import WorkerDashboard from "../pages/WorkerDashboard.jsx";
import AdminDashboard from "../pages/AdminDashboard.jsx";
import Analytics from "../pages/Analytics.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/worker" replace />} />
      <Route path="/worker" element={<WorkerDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/analytics" element={<Analytics />} />
    </Routes>
  );
}