import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import "./index.css";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";

// Lazy loaded pages
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CitizenDashboard = lazy(() => import("./pages/CitizenDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const PollingBoothFinder = lazy(() => import("./pages/PollingBoothFinder"));
const Chat = lazy(() => import("./pages/Chat"));
const Eligibility = lazy(() => import("./pages/Eligibility"));
const DigiLocker = lazy(() => import("./pages/DigiLocker"));
const Timeline = lazy(() => import("./pages/Timeline"));
const Documents = lazy(() => import("./pages/Documents"));
const Myths = lazy(() => import("./pages/Myths"));
const Wizard = lazy(() => import("./pages/Wizard"));

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Navbar />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/eligibility" element={<ProtectedRoute><Eligibility /></ProtectedRoute>} />
              <Route path="/digilocker" element={<ProtectedRoute><DigiLocker /></ProtectedRoute>} />
              <Route path="/digilocker/consent" element={<ProtectedRoute><DigiLocker /></ProtectedRoute>} />
              <Route path="/timeline" element={<ProtectedRoute><Timeline /></ProtectedRoute>} />
              <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
              <Route path="/myths" element={<ProtectedRoute><Myths /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/citizen-dashboard" element={<ProtectedRoute><CitizenDashboard /></ProtectedRoute>} />
              <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/booth-finder" element={<ProtectedRoute><PollingBoothFinder /></ProtectedRoute>} />
              <Route path="/wizard" element={<ProtectedRoute><Wizard /></ProtectedRoute>} />
            </Routes>
          </Suspense>
          <Footer />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
