import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashBoardLayout from "../../components/layout/DashBoardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosIntance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuSearch, LuUserPlus, LuTrash2, LuCheck } from "react-icons/lu";
import toast from "react-hot-toast";

const InviteMembers = () => {
    useUserAuth();
    const { projectId } = useParams();

    const [project, setProject]         = useState(null);
    const [searchEmail, setSearchEmail] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [sentInvites, setSentInvites]  = useState([]);
    const [searching, setSearching]      = useState(false);
    const [loadingId, setLoadingId]      = useState(null);

    // Lấy thông tin dự án và danh sách lời mời đã gửi
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

    // Tìm kiếm người dùng theo email
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
                toast("Không tìm thấy người dùng nào phù hợp", { icon: "🔍" });
            }
        } catch (error) {
            toast.error("Quá trình tìm kiếm thất bại");
        } finally {
            setSearching(false);
        }
    };

    // Gửi lời mời tham gia dự án
    const handleInvite = async (toUserId) => {
        setLoadingId(toUserId);
        try {
            await axiosInstance.post(API_PATHS.INVITATIONS.SEND_INVITATION, {
                projectId,
                toUserId,
            });
            toast.success("Đã gửi lời mời thành công!");
            // Cập nhật lại danh sách lời mời
            const res = await axiosInstance.get(API_PATHS.INVITATIONS.GET_PROJECT_INVITATIONS(projectId));
            setSentInvites(res.data || []);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Gửi lời mời thất bại");
        } finally {
            setLoadingId(null);
        }
    };

    // Xóa thành viên khỏi dự án
    const handleRemoveMember = async (userId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa thành viên này khỏi dự án?")) return;
        try {
            const res = await axiosInstance.delete(
                API_PATHS.PROJECTS.REMOVE_MEMBER(projectId, userId)
            );
            setProject(res.data);
            toast.success("Đã xóa thành viên thành công");
        } catch (error) {
            toast.error("Xóa thành viên thất bại");
        }
    };

    // Kiểm tra xem người dùng đã được mời chưa
    const isInvited = (userId) =>
        sentInvites.some(
            (inv) => inv.toUser?._id === userId && inv.status === "pending"
        );

    // Kiểm tra xem người dùng đã là thành viên chưa
    const isMember = (userId) =>
        project?.members?.some((m) => m._id === userId);

    useEffect(() => {
        fetchData();
    }, [projectId]);

    return (
        <DashBoardLayout activeMenu="Projects">
            <div className="mt-5 max-w-3xl mx-auto space-y-6">

                {/* Tiêu đề dự án */}
                <div className="card shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800 mb-1">
                        Quản lý thành viên — {project?.name}
                    </h2>
                    <p className="text-xs text-gray-500">
                        Tìm kiếm đồng nghiệp qua địa chỉ email để mời họ vào dự án của bạn.
                    </p>
                </div>

                {/* Khu vực tìm kiếm */}
                <div className="card shadow-sm">
                    <h5 className="font-semibold text-slate-700 mb-4">Tìm kiếm người dùng</h5>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            placeholder="Nhập chính xác địa chỉ email..."
                            className="flex-1 text-sm border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all bg-gray-50/50"
                        />
                        <button
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50"
                            onClick={handleSearch}
                            disabled={searching}
                        >
                            <LuSearch className="text-lg" />
                            {searching ? "Đang tìm..." : "Tìm kiếm"}
                        </button>
                    </div>

                    {/* Kết quả tìm kiếm */}
                    {searchResults.length > 0 && (
                        <div className="mt-6 space-y-3 border-t pt-5">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Kết quả tìm kiếm</p>
                            {searchResults.map((u) => (
                                <div
                                    key={u._id}
                                    className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-primary/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/5">
                                            {u.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{u.name}</p>
                                            <p className="text-xs text-gray-500">{u.email}</p>
                                        </div>
                                    </div>

                                    {isMember(u._id) ? (
                                        <span className="text-[11px] font-bold text-lime-600 bg-lime-50 border border-lime-100 px-3 py-1.5 rounded-full flex items-center gap-1">
                                            <LuCheck /> Đã tham gia
                                        </span>
                                    ) : isInvited(u._id) ? (
                                        <span className="text-[11px] font-bold text-cyan-600 bg-cyan-50 border border-cyan-100 px-3 py-1.5 rounded-full">
                                            Đã gửi lời mời
                                        </span>
                                    ) : (
                                        <button
                                            className="flex items-center gap-1.5 text-xs font-bold text-white bg-primary hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50"
                                            onClick={() => handleInvite(u._id)}
                                            disabled={loadingId === u._id}
                                        >
                                            <LuUserPlus className="text-base" />
                                            {loadingId === u._id ? "Đang gửi..." : "Mời tham gia"}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Lời mời đã gửi */}
                {sentInvites.length > 0 && (
                    <div className="card shadow-sm border-amber-100">
                        <h5 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                            Lời mời đang chờ phản hồi
                            <span className="bg-amber-100 text-amber-600 text-[10px] px-2 py-0.5 rounded-full">
                                {sentInvites.filter(i => i.status === 'pending').length}
                            </span>
                        </h5>
                        <div className="space-y-2">
                            {sentInvites.map((inv) => (
                                <div
                                    key={inv._id}
                                    className="flex items-center justify-between p-3 bg-gray-50/50 border border-gray-100 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                                            {inv.toUser?.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700">{inv.toUser?.name}</p>
                                            <p className="text-[11px] text-gray-400">{inv.toUser?.email}</p>
                                        </div>
                                    </div>
                                    <StatusBadge status={inv.status} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Danh sách thành viên hiện tại */}
                <div className="card shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h5 className="font-semibold text-slate-700">
                            Thành viên dự án ({project?.members?.length || 0})
                        </h5>
                    </div>
                    <div className="space-y-2">
                        {project?.members?.length > 0 ? (
                            project.members.map((member) => (
                                <div
                                    key={member._id}
                                    className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-primary/5 flex items-center justify-center text-primary text-sm font-bold border border-primary/10">
                                            {member.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{member.name}</p>
                                            <p className="text-[11px] text-gray-400">{member.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Xóa khỏi dự án"
                                        onClick={() => handleRemoveMember(member._id)}
                                    >
                                        <LuTrash2 className="text-base" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-4 text-xs text-gray-400 italic">Dự án chưa có thành viên nào tham gia.</p>
                        )}
                    </div>
                </div>
            </div>
        </DashBoardLayout>
    );
};

// Component con hiển thị nhãn trạng thái
const StatusBadge = ({ status }) => {
    const styles = {
        pending:  "text-amber-600 bg-amber-50 border border-amber-200",
        accepted: "text-lime-600 bg-lime-50 border border-lime-200",
        declined: "text-red-500 bg-red-50 border border-red-200",
    };
    const labels = {
        pending:  "Đang chờ",
        accepted: "Đã đồng ý",
        declined: "Đã từ chối",
    };
    return (
        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tight ${styles[status]}`}>
            {labels[status]}
        </span>
    );
};

export default InviteMembers;