// Đường dẫn: frontend/src/components/Cards/UserCard.jsx

import React, { useState } from "react";
import { LuTrash2, LuChevronDown, LuX, LuCalendar, LuMapPin, LuFileText } from "react-icons/lu";
import axiosInstance from "../../utils/axiosIntance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import toast from "react-hot-toast";

const ROLE_STYLES = {
    leader: "bg-violet-100 text-violet-600 border border-violet-200",
    member: "bg-cyan-100 text-cyan-600 border border-cyan-200",
    admin:  "bg-primary/10 text-primary border border-primary/20",
};

const UserCard = ({ userInfo, onUpdate }) => {
    const [showDetail, setShowDetail] = useState(false);
    const [loading, setLoading]       = useState(false);

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (!window.confirm(`Xóa người dùng "${userInfo.name}"?`)) return;
        try {
            await axiosInstance.delete(API_PATHS.USERS.DELETE_USER(userInfo._id));
            toast.success("Đã xóa người dùng");
            onUpdate?.();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Xóa thất bại");
        }
    };

    const handleRoleChange = async (newRole) => {
        setLoading(true);
        try {
            await axiosInstance.put(API_PATHS.USERS.UPDATE_USER(userInfo._id), { role: newRole });
            toast.success(`Đã đổi role thành ${newRole}`);
            onUpdate?.();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Đổi role thất bại");
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý Khóa/Mở khóa tài khoản
    const handleToggleStatus = async () => {
        setLoading(true);
        try {
            // Lưu ý: Bạn cần thêm đường dẫn này vào API_PATHS hoặc viết cứng như sau
            await axiosInstance.patch(`/users/toggle-status/${userInfo._id}`);
            toast.success(`Tài khoản đã được ${userInfo.status === "blocked" ? "mở khóa" : "khóa"}`);
            onUpdate?.();
        } catch (error) {
            toast.error("Cập nhật trạng thái thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div
                className={`user-card p-4 cursor-pointer hover:shadow-md transition-shadow relative ${userInfo.status === "blocked" ? "opacity-70 grayscale-[0.5]" : ""}`}
                onClick={() => setShowDetail(true)}
            >
                {/* Badge trạng thái Khóa hiển thị bên ngoài card */}
                {userInfo.status === "blocked" && (
                    <div className="absolute top-2 right-12 bg-red-500 text-white text-[8px] px-2 py-0.5 rounded-full font-bold uppercase">
                        Đã khóa
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src={userInfo?.profileImageUrl || ""}
                            alt="Avatar"
                            className="w-12 h-12 rounded-full border-2 border-white object-cover bg-gray-200"
                        />
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">{userInfo?.name}</p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${ROLE_STYLES[userInfo?.role] || ROLE_STYLES.member}`}>
                                    {userInfo?.role}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">{userInfo?.email}</p>
                        </div>
                    </div>
                    <button
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={handleDelete}
                    >
                        <LuTrash2 className="text-sm" />
                    </button>
                </div>

                <div className="flex items-center gap-3 mt-4">
                    <StatCard label="Pending"     count={userInfo?.pendingTasks     || 0} status="Pending" />
                    <StatCard label="In Progress" count={userInfo?.inProgressTasks || 0} status="In Progress" />
                    <StatCard label="Completed"   count={userInfo?.completedTasks  || 0} status="Completed" />
                </div>
            </div>

            {/* Modal chi tiết */}
            {showDetail && (
                <div
                    className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowDetail(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center gap-4">
                                <img
                                    src={userInfo?.profileImageUrl || ""}
                                    alt="Avatar"
                                    className="w-16 h-16 rounded-full object-cover bg-gray-200 border-4 border-white shadow"
                                />
                                <div>
                                    <h3 className="font-semibold text-gray-800">{userInfo?.name}</h3>
                                    <p className="text-xs text-gray-400">{userInfo?.email}</p>
                                    <div className="flex gap-2 mt-1">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize inline-block ${ROLE_STYLES[userInfo?.role] || ROLE_STYLES.member}`}>
                                            {userInfo?.role}
                                        </span>
                                        {userInfo.status === "blocked" && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200 font-bold uppercase">
                                                Tài khoản bị khóa
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDetail(false)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                            >
                                <LuX />
                            </button>
                        </div>

                        {/* Thông tin bổ sung */}
                        <div className="space-y-3 mb-5">
                            <InfoRow
                                icon={<LuCalendar className="text-gray-400" />}
                                label="Ngày sinh"
                                value={userInfo?.dateOfBirth
                                    ? moment(userInfo.dateOfBirth).format("DD/MM/YYYY")
                                    : "Chưa cập nhật"}
                            />
                            <InfoRow
                                icon={<LuMapPin className="text-gray-400" />}
                                label="Quê quán"
                                value={userInfo?.hometown || "Chưa cập nhật"}
                            />
                            <InfoRow
                                icon={<LuFileText className="text-gray-400" />}
                                label="Giới thiệu"
                                value={userInfo?.bio || "Chưa cập nhật"}
                            />
                        </div>

                        {/* Task stats */}
                        <div className="flex gap-2 mb-5">
                            <StatCard label="Pending"     count={userInfo?.pendingTasks     || 0} status="Pending" />
                            <StatCard label="In Progress" count={userInfo?.inProgressTasks || 0} status="In Progress" />
                            <StatCard label="Completed"   count={userInfo?.completedTasks  || 0} status="Completed" />
                        </div>

                        {/* Nhóm nút Hành động (Đổi role & Khóa) */}
                        {userInfo?.role !== "admin" && (
                            <div className="border-t border-gray-100 pt-4">
                                <p className="text-xs font-medium text-slate-500 mb-2">Hành động quản trị</p>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    {userInfo?.role !== "leader" && (
                                        <button
                                            className="text-xs font-medium text-violet-600 bg-violet-50 border border-violet-200 px-3 py-2 rounded-lg hover:bg-violet-100 transition-colors disabled:opacity-50"
                                            onClick={() => handleRoleChange("leader")}
                                            disabled={loading}
                                        >
                                            Nâng lên Leader
                                        </button>
                                    )}
                                    {userInfo?.role !== "member" && (
                                        <button
                                            className="text-xs font-medium text-cyan-600 bg-cyan-50 border border-cyan-200 px-3 py-2 rounded-lg hover:bg-cyan-100 transition-colors disabled:opacity-50"
                                            onClick={() => handleRoleChange("member")}
                                            disabled={loading}
                                        >
                                            Hạ xuống Member
                                        </button>
                                    )}
                                    {/* Nút Khóa / Mở khóa mới thêm vào */}
                                    <button
                                        className={`text-xs font-medium px-3 py-2 rounded-lg transition-colors border disabled:opacity-50 ${
                                            userInfo.status === "blocked" 
                                            ? "text-green-600 bg-green-50 border-green-200 hover:bg-green-100" 
                                            : "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100"
                                        }`}
                                        onClick={handleToggleStatus}
                                        disabled={loading}
                                    >
                                        {userInfo.status === "blocked" ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                                    </button>
                                    
                                    <button
                                        className="text-xs font-medium text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                                        onClick={(e) => { setShowDetail(false); handleDelete(e); }}
                                    >
                                        Xóa người dùng
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default UserCard;

const StatCard = ({ label, count, status }) => {
    const getStatusTagColor = () => {
        switch (status) {
            case "In Progress": return "text-cyan-500 bg-gray-50";
            case "Completed":   return "text-indigo-500 bg-gray-50";
            default:            return "text-violet-500 bg-gray-50";
        }
    };
    return (
        <div className={`flex-1 text-[10px] font-medium ${getStatusTagColor()} px-4 py-1 rounded text-center`}>
            <span className="text-[12px] font-semibold block">{count}</span>
            {label}
        </div>
    );
};

const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
            <p className="text-[11px] text-gray-400">{label}</p>
            <p className="text-sm text-gray-700">{value}</p>
        </div>
    </div>
);