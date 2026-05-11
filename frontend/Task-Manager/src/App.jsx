import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import UserProvider from "./context/userContext";
import PrivateRoute from "./routes/PrivateRoute";

// Public
import LandingPage from "./pages/LandingPage";
import Login       from "./pages/auth/Login";
import SignUp          from "./pages/auth/SignUp";
import ForgotPassword  from "./pages/auth/ForgotPassword";

// Admin
import AdminDashboard from "./pages/Admin/DashBoard";
import ManageUsers    from "./pages/Admin/ManageUsers";
import ManagerTask    from "./pages/Admin/ManagerTask"; // Trang quản lý Task hệ thống
import ManageAllProjects from "./pages/Admin/ManageAllProjects"; // Trang quản lý Dự án hệ thống (Mới)
import AdminCreateTask from "./pages/Admin/CreateTask"; // Admin tạo/sửa task

// Leader
import LeaderDashboard   from "./pages/Leader/LeaderDashboard";
import ManageProject     from "./pages/Leader/ManageProject";
import CreateProject     from "./pages/Leader/CreateProject";
import LeaderTaskManager from "./pages/Leader/LeaderTaskManager";
import LeaderCreateTask  from "./pages/Leader/CreateTask";
import InviteMembers     from "./pages/Leader/InviteMembers";

// Member (folder User)
import UserDashboard      from "./pages/User/UserDashboard";
import MyTask             from "./pages/User/Mytask";
import ViewTaskDetails    from "./pages/User/ViewTaskDetails";
import MyInvitations      from "./pages/User/MyInvitations";
import MemberCreateProject from "./pages/User/CreateProject"; // tạo project -> lên leader

import Settings    from "./pages/Settings";
import BoxChatAI from "./components/BoxChatAI";

const App = () => {
    return (
        <UserProvider>
            <>
                <Router>
                    <Routes>
                        {/* Public */}
                        <Route path="/"       element={<LandingPage />} />
                        <Route path="/login"  element={<Login />} />
                        <Route path="/signup"          element={<SignUp />} />
                        <Route path="/forgot-password"  element={<ForgotPassword />} />

                        {/* Admin */}
                        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                            <Route path="/admin/users"     element={<ManageUsers />} />
                            <Route path="/admin/tasks"     element={<ManagerTask />} />
                            <Route path="/admin/all-projects" element={<ManageAllProjects />} />
                            <Route path="/admin/create-task"  element={<AdminCreateTask />} />
                        </Route>

                        {/* Leader */}
                        <Route element={<PrivateRoute allowedRoles={["leader"]} />}>
                            <Route path="/leader/dashboard"                        element={<LeaderDashboard />} />
                            <Route path="/leader/projects"                         element={<ManageProject />} />
                            <Route path="/leader/projects/create"                  element={<CreateProject />} />
                            <Route path="/leader/projects/:projectId/tasks"        element={<LeaderTaskManager />} />
                            <Route path="/leader/projects/:projectId/tasks/create" element={<LeaderCreateTask />} />
                            <Route path="/leader/projects/:projectId/invite"       element={<InviteMembers />} />
                        </Route>

                        {/* Member */}
                        <Route element={<PrivateRoute allowedRoles={["member"]} />}>
                            <Route path="/user/dashboard"      element={<UserDashboard />} />
                            <Route path="/user/tasks"          element={<MyTask />} />
                            <Route path="/user/tasks/:id"      element={<ViewTaskDetails />} />
                            <Route path="/user/invitations"    element={<MyInvitations />} />
                            <Route path="/user/create-project" element={<MemberCreateProject />} />
                        </Route>

                        {/* Settings — tất cả role đều truy cập được */}
                        <Route element={<PrivateRoute allowedRoles={["admin", "leader", "member"]} />}>
                            <Route path="/settings" element={<Settings />} />
                        </Route>

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    <BoxChatAI />
                </Router>

                <Toaster toastOptions={{ style: { fontSize: "13px" } }} />
            </>
        </UserProvider>
    );
};

export default App;