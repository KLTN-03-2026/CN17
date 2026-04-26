import React, { useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import BoxChatAI from "./components/BoxChatAI";
// Auth
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";

// Admin
import DashBoard from "./pages/Admin/DashBoard";
import ManagerTask from "./pages/Admin/ManagerTask";
import CreateTask from "./pages/Admin/CreateTask";
import ManageUsers from "./pages/Admin/ManageUsers";

// User
import UserDashboard from "./pages/User/UserDashboard";
import Mytask from "./pages/User/Mytask";
import TaskDetails from "./pages/User/ViewTaskDetails";

// Routes
import PrivateRoute from "./routes/PrivateRoute";
import UserProvider, { UserContext } from './context/userContext';
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <UserProvider>
      <>
        <div>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />

              {/* Admin routes */}
              <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
                <Route path="/admin/dashboard" element={<DashBoard />} />
                <Route path="/admin/tasks" element={<ManagerTask />} />
                <Route path="/admin/create-task" element={<CreateTask />} />
                <Route path="/admin/users" element={<ManageUsers />} />
              </Route>

              {/* User routes */}
              <Route element={<PrivateRoute allowedRoles={["user"]} />}>
                <Route path="/user/dashboard" element={<UserDashboard />} />
                <Route path="/user/tasks" element={<Mytask />} />
                <Route path="/user/task-details/:id" element={<TaskDetails />} />
              </Route>

              {/* Fallback - redirect unknown routes to landing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <BoxChatAI />
          </Router>
        </div>

        <Toaster toastOptions={{
          className: "",
          style: {
            fontSize: "13px"
          },
        }} />
      </>
    </UserProvider>
  );
};

export default App;