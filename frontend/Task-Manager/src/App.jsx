import React, { useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";

// Auth
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";

// Admin
import DashBoard from "./pages/Admin/DashBoard";
import ManagerTask from "./pages/Admin/ManagerTask";
import CreateTask from "./pages/Admin/CreateTask";
import ManagerUse from "./pages/Admin/ManagerUse";

// User
import UserDashboard from "./pages/User/UserDashboard";
import Mytask from "./pages/User/Mytask";
import TaskDetails from "./pages/User/ViewTaskDetails";

// Routes
import PrivateRoute from "./routes/PrivateRoute";
import UserProvider, { UserContext } from './context/userContext';

const App = () => {
  return (
    <UserProvider>
    <div>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Admin routes */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<DashBoard />} />
            <Route path="/admin/tasks" element={<ManagerTask />} />
            <Route path="/admin/create-task" element={<CreateTask />} />
            <Route path="/admin/users" element={<ManagerUse />} />
          </Route>

          {/* User routes */}
          <Route element={<PrivateRoute allowedRoles={["user"]} />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/tasks" element={<Mytask />} />
            <Route path="/user/task-details/:id" element={<TaskDetails />} />
          </Route>

          {/* default route */}
          <Route Path="/" element={<Root />} />
        </Routes>
      </Router>
    </div>
    </UserProvider>
  );
};

export default App;

const Root = () =>{
  const {user , loading} = useContext (UserContext);
  if(loading) return<Outlet/>

  if (!user) {
    return <Navigate to = "/login" />

  }
  return user.role === "admin" ?  <Navigate to = "/admin/dashboard" /> : <Navigate to = "/user/dashboard" />
} ; 