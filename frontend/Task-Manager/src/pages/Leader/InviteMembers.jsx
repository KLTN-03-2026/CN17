import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashBoardLayout from "../../components/layout/DashBoardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosIntance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuSearch, LuUserPlus, LuTrash2, LuCheck } from "react-icons/lu";
import toast from "react-hot-toast";
import AvatarGroup from "../../components/AvatarGroup";

const InviteMembers = () => {
    useUserAuth();
    const { projectId } = useParams();

    const [project, setProject]         = useState(null);
    const [searchEmail, setSearchEmail] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [sentInvites, setSentInvites]  = useState([]);
    const [searching, setSearching]      = useState(false);
    const [loadingId, setLoadingId]      = useState(null);

    // Lấy thông tin project + invite đã gửi
    const fetchData = async () => {
        try {
            const [projectRes, inviteRes] = await Promise.all([
                axiosInstance.get(API_PATHS.PROJECTS.GET_PROJECT_BY_ID(projectId)),
                axiosInstance.get(API_PATHS.INVITATIONS.GET_PROJECT_INVITATIONS(projectId)),
            ]);
            setProject(projectRes.data);
            setSentInvites(inviteRes.data || []);
        } catch (error) {
            toast.error("Không thể tải dữ liệu dự án");
        }
    };

    // Tìm kiếm user theo email
    const handleSearch = async () => {
        if (!searchEmail.trim()) return;
        setSearching(true);
        setSearchResults([]);
        try {
            const res = await axiosInstance.get(API_PATHS.INVITATIONS.SEARCH_USERS, {
                params: { email: searchEmail },
            });
            setSearchResults(res.data || []);
            if ((res.data || []).length === 0) {
                toast("Không tìm thấy người dùng nào", { icon: "🔍" });
            }
        } catch (error) {
            toast.error("Tìm kiếm thất bại");
        } finally {
            setSearching(false);
        }
    };

    // Gửi lời mời
    const handleInvite = async (toUserId) => {
        setLoadingId(toUserId);
        try {
            await axiosInstance.post(API_PATHS.INVITATIONS.SEND_INVITATION, {
                projectId,
                toUserId,
            });
            toast.success("Đã gửi lời mời!");
            // Refresh invite list
            const res = await axiosInstance.get(API_PATHS.INVITATIONS.GET_PROJECT_INVITATIONS(projectId));
            setSentInvites(res.data || []);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Gửi lời mời thất bại");
        } finally {
            setLoadingId(null);
        }
    };

    // Kick member
    const handleRemoveMember = async (userId) => {
        if (!window.confirm("Xóa thành viên này khỏi dự án?")) return;
        try {
            const res = await axiosInstance.delete(
                API_PATHS.PROJECTS.REMOVE_MEMBER(projectId, userId)
            );
            setProject(res.data);
            toast.success("Đã xóa thành viên");
        } catch (error) {
            toast.error("Xóa thất bại");
        }
    };

    // Kiểm tra user đã được invite chưa
    const isInvited = (userId) =>
        sentInvites.some(
            (inv) => inv.toUser?._id === userId && inv.status === "pending"
        );

    // Kiểm tra user đã là member chưa
    const isMember = (userId) =>
        project?.members?.some((m) => m._id === userId);

    useEffect(() => {
        fetchData();
    }, [projectId]);

    return (
        <DashBoardLayout activeMenu="Projects">
            <div className="mt-5 max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="card">
                    <h2 className="text-xl font-medium mb-1">
                        Mời thành viên — {project?.name}
                    </h2>
                    <p className="text-xs text-gray-400">
                        Tìm kiếm người dùng theo email và gửi lời mời tham gia dự án
                    </p>
                </div>

                {/* Search */}
                <div className="card">
                    <h5 className="font-medium mb-3">Tìm kiếm người dùng</h5>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            placeholder="Nhập email..."
                            className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-gray-500 bg-white placeholder:text-gray-400"
                        />
                        <button
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 rounded-md cursor-pointer border border-gray-700"
                            onClick={handleSearch}
                            disabled={searching}
                        >
                            <LuSearch />
                            {searching ? "Đang tìm..." : "Tìm"}
                        </button>
                    </div>

                    {/* Search results */}
                    {searchResults.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {searchResults.map((u) => (
                                <div
                                    key={u._id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                                            {u.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">{u.name}</p>
                                            <p className="text-xs text-gray-400">{u.email}</p>
                                        </div>
                                    </div>

                                    {isMember(u._id) ? (
                                        <span className="text-xs text-lime-600 bg-lime-50 border border-lime-200 px-3 py-1 rounded-full flex items-center gap-1">
                                            <LuCheck /> Đã là thành viên
                                        </span>
                                    ) : isInvited(u._id) ? (
                                        <span className="text-xs text-cyan-600 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-full">
                                            Đã mời
                                        </span>
                                    ) : (
                                        <button
                                            className="flex items-center gap-1 text-xs font-medium text-white bg-primary hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 shrink-0"
                                            onClick={() => handleInvite(u._id)}
                                            disabled={loadingId === u._id}
                                        >
                                            <LuUserPlus />
                                            {loadingId === u._id ? "Đang gửi..." : "Mời"}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Lời mời đã gửi */}
                {sentInvites.length > 0 && (
                    <div className="card">
                        <h5 className="font-medium mb-3">Lời mời đã gửi</h5>
                        <div className="space-y-2">
                            {sentInvites.map((inv) => (
                                <div
                                    key={inv._id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium">
                                            {inv.toUser?.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">{inv.toUser?.name}</p>
                                            <p className="text-xs text-gray-400">{inv.toUser?.email}</p>
                                        </div>
                                    </div>
                                    <StatusBadge status={inv.status} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Danh sách thành viên hiện tại */}
                {project?.members?.length > 0 && (
                    <div className="card">
                        <h5 className="font-medium mb-3">
                            Thành viên ({project.members.length})
                        </h5>
                        <div className="space-y-2">
                            {project.members.map((member) => (
                                <div
                                    key={member._id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                                            {member.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">{member.name}</p>
                                            <p className="text-xs text-gray-400">{member.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                        onClick={() => handleRemoveMember(member._id)}
                                    >
                                        <LuTrash2 className="text-sm" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashBoardLayout>
    );
};

const StatusBadge = ({ status }) => {
    const styles = {
        pending:  "text-amber-600 bg-amber-50 border border-amber-200",
        accepted: "text-lime-600 bg-lime-50 border border-lime-200",
        declined: "text-red-500 bg-red-50 border border-red-200",
    };
    const labels = {
        pending:  "Chờ xác nhận",
        accepted: "Đã chấp nhận",
        declined: "Đã từ chối",
    };
    return (
        <span className={`text-[11px] px-2 py-0.5 rounded-full capitalize ${styles[status]}`}>
            {labels[status]}
        </span>
    );
};

export default InviteMembers;