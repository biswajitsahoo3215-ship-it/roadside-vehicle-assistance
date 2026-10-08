import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import RequestAssistance from "./pages/RequestAssistance";
import ServiceHistory from "./pages/ServiceHistory";
import PartnerDashboard from "./pages/PartnerDashboard";
import PartnerProfile from "./pages/PartnerProfile";
import LiveTracking from "./pages/LiveTracking";
import RateService from "./pages/RateService";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public Routes */}

          <Route
            path="/"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* Customer Routes */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "user",
                  "partner",
                  "admin"
                ]}
              >
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vehicles"
            element={
              <ProtectedRoute
                allowedRoles={["user"]}
              >
                <Vehicles />
              </ProtectedRoute>
            }
          />

          <Route
            path="/request-assistance"
            element={
              <ProtectedRoute
                allowedRoles={["user"]}
              >
                <RequestAssistance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/service-history"
            element={
              <ProtectedRoute
                allowedRoles={["user"]}
              >
                <ServiceHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/live-tracking"
            element={
              <ProtectedRoute
                allowedRoles={["user"]}
              >
                <LiveTracking />
              </ProtectedRoute>
            }
          />

          <Route
            path="/rate-service"
            element={
              <ProtectedRoute
                allowedRoles={["user"]}
              >
                <RateService />
              </ProtectedRoute>
            }
          />

          {/* Partner Routes */}

          <Route
            path="/partner-profile"
            element={
              <ProtectedRoute
                allowedRoles={["partner"]}
              >
                <PartnerProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/partner-dashboard"
            element={
              <ProtectedRoute
                allowedRoles={["partner"]}
              >
                <PartnerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute
                allowedRoles={["admin"]}
              >
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Unknown Route */}

          <Route
            path="*"
            element={<Login />}
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;