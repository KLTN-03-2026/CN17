import React, { useContext, useEffect, useState } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import { UserContext } from "../../context/userContext";
import DashBoardLayout from "../../components/layout/DashBoardLayout";
import axiosInstance from "../../utils/axiosIntance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import 'moment/locale/vi'; // Import tiếng Việt cho moment
import { addThouSandsSeparator } from "../../utils/helper";
import InfoCard from "../../components/Cards/InfoCard";
import UserCard from "../../components/Cards/UserCard";
import { LuUsers, LuFolderOpen, LuFileSpreadsheet } from "react-icons/lu";
import toast from "react-hot-toast";

// Thiết lập moment sử dụng tiếng Việt
moment.locale('vi');

// Việt hóa lời chào
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
};

const DashBoard = () => {
    useUserAuth();
    const { user } = useContext(UserContext);

    const [users, setUsers]       = useState([]);
    const [projects, setProjects] = useState([]);
    const [stats, setStats]       = useState({
        totalUsers: 0, leaders: 0, members: 0, totalProjects: 0,
    });

    const fetchData = async () => {
        try {
            const [usersRes, projectsRes] = await Promise.all([
                axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS),
                axiosInstance.get(API_PATHS.PROJECTS.GET_ALL_PROJECTS),
            ]);

            const allUsers    = usersRes.data    || [];
            const allProjects = projectsRes.data || [];

            setUsers(allUsers);
            setProjects(allProjects);
            setStats({
                totalUsers:    allUsers.length,
                leaders:       allUsers.filter((u) => u.role === "leader").length,
                members:       allUsers.filter((u) => u.role === "member").length,
                totalProjects: allProjects.length,
            });
        } catch (error) {
            console.error("Lỗi tải dữ liệu tổng quan admin:", error);
        }
    };

    const handleDownloadReport = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_USERS, {
                responseType: "blob",
            });
            const url  = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href  = url;
            link.setAttribute("download", "bao_cao_nguoi_dung.xlsx");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Đang tải xuống báo cáo...");
        } catch (error) {
            toast.error("Tải báo cáo thất bại, vui lòng thử lại!");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <DashBoardLayout activeMenu="Dashboard">
            <div className="card my-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                            {getGreeting()}! {user?.name}
                        </h2>
                        <p className="text-xs md:text-[13px] text-gray-400 mt-1.5 capitalize">
                            {moment().format("dddd, [ngày] D [tháng] M, YYYY")}
                        </p>
                    </div>
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg transition-colors shadow-sm text-sm font-medium"
                        onClick={handleDownloadReport}
                    >
                        <LuFileSpreadsheet className="text-lg" />
                        Xuất báo cáo Excel
                    </button>
                </div>

                {/* Thống kê nhanh */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5">
                    <InfoCard
                        label="Tổng người dùng"
                        value={addThouSandsSeparator(stats.totalUsers)}
                        color="bg-primary"
                    />
                    <InfoCard
                        label="Trưởng nhóm (Leader)"
                        value={addThouSandsSeparator(stats.leaders)}
                        color="bg-violet-500"
                    />
                    <InfoCard
                        label="Thành viên"
                        value={addThouSandsSeparator(stats.members)}
                        color="bg-cyan-500"
                    />
                    <InfoCard
                        label="Tổng dự án"
                        value={addThouSandsSeparator(stats.totalProjects)}
                        color="bg-lime-500"
                    />
                </div>
            </div>

            {/* Bảng dự án gần đây */}
            <div className="card my-4">
                <div className="flex items-center gap-2 mb-4 border-b pb-3">
                    <LuFolderOpen className="text-primary text-lg" />
                    <h5 className="font-bold text-slate-700 text-lg">Dự án gần đây</h5>
                </div>
                {projects.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6 italic">Hệ thống chưa có dự án nào</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50/50">
                                    <th className="text-left py-3 px-3 font-bold uppercase tracking-wider">Tên dự án</th>
                                    <th className="text-left py-3 px-3 font-bold uppercase tracking-wider">Trưởng nhóm</th>
                                    <th className="text-left py-3 px-3 font-bold uppercase tracking-wider">Thành viên</th>
                                    <th className="text-left py-3 px-3 font-bold uppercase tracking-wider">Trạng thái</th>
                                    <th className="text-left py-3 px-3 font-bold uppercase tracking-wider">Ngày tạo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.slice(0, 10).map((p) => (
                                    <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                                        <td className="py-3 px-3 font-semibold text-gray-700">{p.name}</td>
                                        <td className="py-3 px-3 text-gray-600">
                                            {p.leader?.name ? (
                                                <span className="bg-violet-50 text-violet-600 px-2 py-0.5 rounded text-xs">
                                                    {p.leader.name}
                                                </span>
                                            ) : "—"}
                                        </td>
                                        <td className="py-3 px-3 text-gray-500 font-medium">{p.members?.length || 0}</td>
                                        <td className="py-3 px-3">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${
                                                p.status === "active"
                                                    ? "text-lime-600 bg-lime-50 border border-lime-200"
                                                    : "text-gray-500 bg-gray-50 border border-gray-200"
                                            }`}>
                                                {p.status === "active" ? "Hoạt động" : "Lưu trữ"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-gray-400 text-xs">
                                            {moment(p.createdAt).format("DD/MM/YYYY")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Danh sách người dùng */}
            <div className="card my-4">
                <div className="flex items-center gap-2 mb-4 border-b pb-3">
                    <LuUsers className="text-primary text-lg" />
                    <h5 className="font-bold text-slate-700 text-lg">Danh sách người dùng ({users.length})</h5>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map((u) => (
                        <UserCard key={u._id} userInfo={u} onUpdate={fetchData} />
                    ))}
                </div>
            </div>
        </DashBoardLayout>
    );
};

export default DashBoard;