import React, { useEffect, useState } from "react";
import DashBoardLayout from "../../components/layout/DashBoardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosIntance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuCheck, LuX, LuInbox } from "react-icons/lu";
import moment from "moment";
import 'moment/locale/vi'; // Import ngôn ngữ tiếng Việt cho moment
import toast from "react-hot-toast";

// Thiết lập moment sử dụng tiếng Việt
moment.locale('vi');

const MyInvitations = () => {
    useUserAuth();
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [loadingId, setLoadingId]     = useState(null);

    const fetchInvitations = async () => {
        try {
            const res = await axiosInstance.get(API_PATHS.INVITATIONS.GET_MY_INVITATIONS);
            setInvitations(res.data || []);
        } catch (error) {
            toast.error("Không thể tải danh sách lời mời");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        setLoadingId(id);
        try {
            await axiosInstance.patch(API_PATHS.INVITATIONS.ACCEPT_INVITATION(id));
            toast.success("Đã chấp nhận lời mời! Bạn đã tham gia dự án.");
            setInvitations((prev) => prev.filter((inv) => inv._id !== id));
        } catch (error) {
            toast.error(error?.response?.data?.message || "Thao tác thất bại");
        } finally {
            setLoadingId(null);
        }
    };

    const handleDecline = async (id) => {
        setLoadingId(id);
        try {
            await axiosInstance.patch(API_PATHS.INVITATIONS.DECLINE_INVITATION(id));
            toast("Đã từ chối lời mời");
            setInvitations((prev) => prev.filter((inv) => inv._id !== id));
        } catch (error) {
            toast.error(error?.response?.data?.message || "Thao tác thất bại");
        } finally {
            setLoadingId(null);
        }
    };

    useEffect(() => {
        fetchInvitations();
    }, []);

    return (
        <DashBoardLayout activeMenu="Invitations">
            <div className="mt-5">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-medium">Lời mời tham gia dự án</h2>
                    {invitations.length > 0 && (
                        <span className="text-xs bg-primary text-white px-2.5 py-1 rounded-full font-medium">
                            {invitations.length} lời mời mới
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : invitations.length === 0 ? (
                    <div className="card text-center py-16 text-gray-400">
                        <LuInbox className="text-4xl mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">Hộp thư trống. Không có lời mời nào đang chờ.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {invitations.map((inv) => (
                            <div key={inv._id} className="card border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between gap-4">
                                    {/* Thông tin dự án */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] uppercase tracking-wider bg-violet-100 text-violet-600 px-2 py-0.5 rounded font-bold">
                                                Dự án
                                            </span>
                                            <h3 className="font-semibold text-gray-800 text-sm">
                                                {inv.project?.name}
                                            </h3>
                                        </div>

                                        {inv.project?.description && (
                                            <p className="text-xs text-gray-500 mb-2 line-clamp-2 italic">
                                                "{inv.project.description}"
                                            </p>
                                        )}

                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold border border-primary/20">
                                                {inv.fromUser?.name?.[0]?.toUpperCase()}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                <span className="font-semibold text-gray-700">{inv.fromUser?.name}</span>
                                                {" "}đã mời bạn •{" "}
                                                <span className="text-gray-400">
                                                    {moment(inv.createdAt).fromNow()}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Hành động */}
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors border border-gray-200 hover:border-red-100 disabled:opacity-50"
                                            onClick={() => handleDecline(inv._id)}
                                            disabled={loadingId === inv._id}
                                        >
                                            <LuX />
                                            Từ chối
                                        </button>
                                        <button
                                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-lime-500 text-white hover:bg-lime-600 shadow-sm shadow-lime-200 transition-colors disabled:opacity-50"
                                            onClick={() => handleAccept(inv._id)}
                                            disabled={loadingId === inv._id}
                                        >
                                            <LuCheck />
                                            {loadingId === inv._id ? "Đang xử lý..." : "Chấp nhận"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashBoardLayout>
    );
};

export default MyInvitations;