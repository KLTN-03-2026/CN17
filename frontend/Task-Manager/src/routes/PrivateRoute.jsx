import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../context/userContext";

const PrivateRoute = ({ allowedRoles }) => {
    const { user, loading } = useContext(UserContext);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === "admin")  return <Navigate to="/admin/dashboard"  replace />;
        if (user.role === "leader") return <Navigate to="/leader/dashboard" replace />;
        if (user.role === "member") return <Navigate to="/user/dashboard"   replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;