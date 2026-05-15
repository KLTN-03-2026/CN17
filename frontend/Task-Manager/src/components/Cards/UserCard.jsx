import React, { useState } from "react";
import { LuTrash2, LuX, LuCalendar, LuMapPin, LuFileText, LuLock, LuLockOpen } from "react-icons/lu";
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

    // 1. Hàm Xóa người dùng
    const handleDelete = async (e) => {
        e.stopPropagation();
        if (!window.confirm(`Xóa người dùng "${userInfo.name}"?`)) return;
        try {
            await axiosInstance.delete(API_PATHS.USERS.DELETE_USER(userInfo._id));
            toast.success("Đã xóa người dùng");
            onUpdate?.();
            setShowDetail(false);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Xóa thất bại");
        }
    };

    // 2. Hàm đổi Role
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

    // 3. Hàm xử lý Khóa/Mở khóa tài khoản 
    const handleToggleStatus = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.put(`/api/users/status/${userInfo._id}`);
            
            toast.success(response.data.message);
            onUpdate?.(); 
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Cập nhật trạng thái thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div
                className={`user-card p-4 cursor-pointer hover:shadow-md transition-all relative rounded-2xl border border-gray-100 bg-white ${
                    userInfo.status === "blocked" ? "bg-gray-50 opacity-80" : ""
                }`}
                onClick={() => setShowDetail(true)}
            >
                {/* Badge trạng thái Khóa hiển thị bên ngoài card */}
                {userInfo.status === "blocked" && (
                    <div className="absolute top-3 right-12 flex items-center gap-1 bg-red-500 text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase shadow-sm">
                        <LuLock size={10} /> Đã khóa
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src={userInfo?.profileImageUrl || "https://via.placeholder.com/150"}
                            alt="Avatar"
                            className={`w-12 h-12 rounded-full border-2 border-white object-cover bg-gray-200 ${userInfo.status === "blocked" ? "grayscale" : ""}`}
                        />
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-slate-700">{userInfo?.name}</p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${ROLE_STYLES[userInfo?.role] || ROLE_STYLES.member}`}>
                                    {userInfo?.role}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400">{userInfo?.email}</p>
                        </div>
                    </div>
                    <button
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={handleDelete}
                    >
                        <LuTrash2 size={18} />
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
                    className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setShowDetail(false)}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Nút đóng X */}
                        <button
                            onClick={() => setShowDetail(false)}
                            className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                        >
                            <LuX size={20} />
                        </button>

                        {/* Header Modal */}
                        <div className="flex flex-col items-center text-center mb-8">
                            <img
                                src={userInfo?.profileImageUrl || "https://via.placeholder.com/150"}
                                alt="Avatar"
                                className={`w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl mb-4 ${userInfo.status === "blocked" ? "grayscale" : ""}`}
                            />
                            <h3 className="text-xl font-bold text-slate-800">{userInfo?.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">{userInfo?.email}</p>
                            <div className="flex gap-2">
                                <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${ROLE_STYLES[userInfo?.role] || ROLE_STYLES.member}`}>
                                    {userInfo?.role}
                                </span>
                                {userInfo.status === "blocked" && (
                                    <span className="text-xs px-3 py-1 rounded-full bg-red-600 text-white font-bold uppercase animate-pulse">
                                        Bị khóa
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Thông tin bổ sung */}
                        <div className="bg-slate-50 rounded-2xl p-5 space-y-4 mb-6">
                            <InfoRow
                                icon={<LuCalendar className="text-violet-500" />}
                                label="Ngày sinh"
                                value={userInfo?.dateOfBirth ? moment(userInfo.dateOfBirth).format("DD/MM/YYYY") : "Chưa cập nhật"}
                            />
                            <InfoRow
                                icon={<LuMapPin className="text-rose-500" />}
                                label="Quê quán"
                                value={userInfo?.hometown || "Chưa cập nhật"}
                            />
                            <InfoRow
                                icon={<LuFileText className="text-emerald-500" />}
                                label="Giới thiệu"
                                value={userInfo?.bio || "Chưa cập nhật"}
                            />
                        </div>

                        {/* Task stats */}
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <StatCard label="Pending"     count={userInfo?.pendingTasks     || 0} status="Pending" />
                            <StatCard label="In Progress" count={userInfo?.inProgressTasks || 0} status="In Progress" />
                            <StatCard label="Completed"   count={userInfo?.completedTasks  || 0} status="Completed" />
                        </div>

                        {/* Hành động quản trị */}
                        {userInfo?.role !== "admin" && (
                            <div className="border-t border-gray-100 pt-6">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Hành động quản trị</p>
                                
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            className="flex items-center justify-center gap-2 text-xs font-bold text-violet-600 bg-violet-50 border border-violet-100 px-4 py-3 rounded-xl hover:bg-violet-100 transition-all disabled:opacity-50"
                                            onClick={() => handleRoleChange(userInfo.role === "leader" ? "member" : "leader")}
                                            disabled={loading}
                                        >
                                            {userInfo.role === "leader" ? "Hạ xuống Member" : "Nâng lên Leader"}
                                        </button>

                                        <button
                                            className={`flex items-center justify-center gap-2 text-xs font-bold px-4 py-3 rounded-xl transition-all border disabled:opacity-50 ${
                                                userInfo.status === "blocked" 
                                                ? "text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100" 
                                                : "text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-100"
                                            }`}
                                            onClick={handleToggleStatus}
                                            disabled={loading}
                                        >
                                            {userInfo.status === "blocked" ? <><LuLockOpen /> Mở khóa</> : <><LuLock /> Khóa tài khoản</>}
                                        </button>
                                    </div>
                                    {userInfo.status === "blocked" ? (
                                        <button 
                                            onClick={handleToggleStatus}
                                            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                            disabled={loading}  
                                        >
                                            <LuLockOpen size={18} /> MỞ KHÓA
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleDelete}
                                            className="w-full bg-red-50 text-red-600 py-3 rounded-xl text-xs font-bold hover:bg-red-100 transition-all border border-red-100 flex items-center justify-center gap-2"
                                            disabled={loading}
                                        >
                                            <LuTrash2 size={16} /> Xóa người dùng
                                        </button>
                                    )}
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

// Component phụ cho Stats
const StatCard = ({ label, count, status }) => {
    const getStatusTagColor = () => {
        switch (status) {
            case "In Progress": return "text-cyan-600 bg-cyan-50 border border-cyan-100";
            case "Completed":   return "text-indigo-600 bg-indigo-50 border border-indigo-100";
            default:            return "text-violet-600 bg-violet-50 border border-violet-100";
        }
    };
    return (
        <div className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl ${getStatusTagColor()}`}>
            <span className="text-sm font-bold">{count}</span>
            <span className="text-[9px] font-medium uppercase tracking-tight">{label}</span>
        </div>
    );
};

// Component phụ cho hàng thông tin
const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-lg">
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-medium text-slate-700">{value}</p>
        </div>
    </div>
);