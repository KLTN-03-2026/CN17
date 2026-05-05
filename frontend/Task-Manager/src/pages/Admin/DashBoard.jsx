import React, { useContext, useEffect, useState } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import { UserContext } from "../../context/userContext";
import DashBoardLayout from "../../components/layout/DashBoardLayout";
import axiosInstance from "../../utils/axiosIntance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import { addThouSandsSeparator } from "../../utils/helper";
import InfoCard from "../../components/Cards/InfoCard";
import UserCard from "../../components/Cards/UserCard";
import { LuUsers, LuFolderOpen, LuFileSpreadsheet } from "react-icons/lu";
import toast from "react-hot-toast";

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
            console.error("Lỗi tải dashboard admin:", error);
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
            link.setAttribute("download", "users_report.xlsx");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
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
                        <h2 className="text-xl md:text-2xl">
                            Good Morning! {user?.name}
                        </h2>
                        <p className="text-xs md:text-[13px] text-gray-400 mt-1.5">
                            {moment().format("dddd, MMMM Do YYYY")}
                        </p>
                    </div>
                    <button
                        className="flex items-center gap-2 download-btn"
                        onClick={handleDownloadReport}
                    >
                        <LuFileSpreadsheet className="text-lg" />
                        Download Report
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5">
                    <InfoCard
                        label="Total Users"
                        value={addThouSandsSeparator(stats.totalUsers)}
                        color="bg-primary"
                    />
                    <InfoCard
                        label="Leaders"
                        value={addThouSandsSeparator(stats.leaders)}
                        color="bg-violet-500"
                    />
                    <InfoCard
                        label="Members"
                        value={addThouSandsSeparator(stats.members)}
                        color="bg-cyan-500"
                    />
                    <InfoCard
                        label="Total Projects"
                        value={addThouSandsSeparator(stats.totalProjects)}
                        color="bg-lime-500"
                    />
                </div>
            </div>

            {/* Recent projects */}
            <div className="card my-4">
                <div className="flex items-center gap-2 mb-4">
                    <LuFolderOpen className="text-gray-400" />
                    <h5 className="font-medium">Dự án gần đây</h5>
                </div>
                {projects.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">Chưa có dự án nào</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-gray-400 border-b border-gray-100">
                                    <th className="text-left py-2 px-3 font-medium">Tên dự án</th>
                                    <th className="text-left py-2 px-3 font-medium">Leader</th>
                                    <th className="text-left py-2 px-3 font-medium">Thành viên</th>
                                    <th className="text-left py-2 px-3 font-medium">Trạng thái</th>
                                    <th className="text-left py-2 px-3 font-medium">Ngày tạo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.slice(0, 10).map((p) => (
                                    <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="py-2 px-3 font-medium text-gray-700">{p.name}</td>
                                        <td className="py-2 px-3 text-gray-500">{p.leader?.name || "—"}</td>
                                        <td className="py-2 px-3 text-gray-500">{p.members?.length || 0}</td>
                                        <td className="py-2 px-3">
                                            <span className={`text-[11px] px-2 py-0.5 rounded capitalize ${
                                                p.status === "active"
                                                    ? "text-lime-600 bg-lime-50 border border-lime-200"
                                                    : "text-gray-500 bg-gray-50 border border-gray-200"
                                            }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 text-gray-400 text-xs">
                                            {moment(p.createdAt).format("DD/MM/YYYY")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Team members */}
            <div className="card my-4">
                <div className="flex items-center gap-2 mb-4">
                    <LuUsers className="text-gray-400" />
                    <h5 className="font-medium">Người dùng ({users.length})</h5>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {users.map((u) => (
                        <UserCard key={u._id} userInfo={u} />
                    ))}
                </div>
            </div>
        </DashBoardLayout>
    );
};

export default DashBoard;