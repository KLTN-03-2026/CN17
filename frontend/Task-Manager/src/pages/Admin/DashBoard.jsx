import React, { useContext, useEffect, useState } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import { UserContext } from "../../context/userContext";
import DashBoardLayout from "../../components/layout/DashBoardLayout";
import axiosInstance from "../../utils/axiosIntance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import "moment/locale/vi";
import { addThouSandsSeparator } from "../../utils/helper";
import InfoCard from "../../components/Cards/InfoCard";
import {
    LuUsers,
    LuFolderOpen,
    LuFileSpreadsheet,
    LuTrendingUp
} from "react-icons/lu";

import toast from "react-hot-toast";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

moment.locale("vi");

const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";

    return "Chào buổi tối";
};

// Tooltip đẹp hơn
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-4 ring-1 ring-black/5">
                <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2 text-sm">
                    {label}
                </p>

                <div className="flex items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                        <span className="text-slate-500 text-xs font-medium">
                            Project:
                        </span>
                    </div>

                    <span className="font-bold text-slate-900 text-xs">
                        {payload[0].value}
                    </span>
                </div>
            </div>
        );
    }

    return null;
};

const DashBoard = () => {
    useUserAuth();

    const { user } = useContext(UserContext);

    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [chartData, setChartData] = useState([]);

    const [stats, setStats] = useState({
        totalUsers: 0,
        leaders: 0,
        members: 0,
        totalProjects: 0,
    });

    const fetchData = async () => {
        try {
            const [usersRes, projectsRes] = await Promise.all([
                axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS),
                axiosInstance.get(API_PATHS.PROJECTS.GET_ALL_PROJECTS),
            ]);

            const allUsers = usersRes.data || [];
            const allProjects = projectsRes.data || [];

            setUsers(allUsers);
            setProjects(allProjects);

            // Stats
            setStats({
                totalUsers: allUsers.length,
                leaders: allUsers.filter((u) => u.role === "leader").length,
                members: allUsers.filter((u) => u.role === "member").length,
                totalProjects: allProjects.length,
            });

            // =========================
            // THỐNG KÊ PROJECT THEO THÁNG
            // =========================

            const groupedProjects = {};

            allProjects.forEach((project) => {
                const createdDate = moment(project.createdAt);

                const monthKey = createdDate.format("MM/YYYY");

                if (!groupedProjects[monthKey]) {
                    groupedProjects[monthKey] = 0;
                }

                groupedProjects[monthKey] += 1;
            });

            const monthlyData = Object.keys(groupedProjects).map((month) => ({
                month,
                totalProjects: groupedProjects[month],
            }));

            // Sắp xếp theo thời gian
            monthlyData.sort(
                (a, b) =>
                    moment(a.month, "MM/YYYY") -
                    moment(b.month, "MM/YYYY")
            );

            setChartData(monthlyData);

        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        }
    };

    const handleDownloadReport = async () => {
        try {
            const response = await axiosInstance.get(
                API_PATHS.REPORTS.EXPORT_USERS,
                {
                    responseType: "blob",
                }
            );

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = document.createElement("a");

            link.href = url;

            link.setAttribute(
                "download",
                `bao_cao_taskmanager.xlsx`
            );

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            window.URL.revokeObjectURL(url);

            toast.success("Đang tải xuống báo cáo...");
        } catch (error) {
            toast.error("Tải báo cáo thất bại!");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <DashBoardLayout activeMenu="Dashboard">

            {/* HEADER */}
            <div className="my-6 space-y-6">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                            {getGreeting()},{" "}
                            <span className="text-indigo-600 font-extrabold">
                                {user?.name}
                            </span>
                        </h2>

                        <p className="text-slate-400 text-sm mt-1 uppercase tracking-wider font-medium italic">
                            {moment().format("dddd, D MMMM YYYY")}
                        </p>
                    </div>

                    <button
                        onClick={handleDownloadReport}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg font-semibold text-sm"
                    >
                        <LuFileSpreadsheet className="text-lg" />
                        Xuất dữ liệu Excel
                    </button>

                </div>

                {/* INFO CARD */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    <InfoCard
                        label="Tổng nhân sự"
                        value={addThouSandsSeparator(stats.totalUsers)}
                        color="bg-indigo-600"
                    />

                    <InfoCard
                        label="Quản lý/Leader"
                        value={addThouSandsSeparator(stats.leaders)}
                        color="bg-violet-600"
                    />

                    <InfoCard
                        label="Thành viên"
                        value={addThouSandsSeparator(stats.members)}
                        color="bg-sky-600"
                    />

                    <InfoCard
                        label="Dự án hệ thống"
                        value={addThouSandsSeparator(stats.totalProjects)}
                        color="bg-emerald-600"
                    />

                </div>
            </div>

            {/* BIỂU ĐỒ */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm my-6">

                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">

                    <div className="flex items-center gap-3">

                        <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 text-xl">
                            <LuTrendingUp />
                        </div>

                        <h5 className="font-extrabold text-slate-700 text-lg">
                            Thống kê số lượng dự án theo tháng
                        </h5>

                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                        <span className="text-[11px] font-bold text-slate-500 uppercase">
                            Project được tạo
                        </span>
                    </div>

                </div>

                {/* Chart */}
                <div className="w-full h-[380px]">

                    {chartData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 italic">
                            Đang tải dữ liệu...
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">

                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 20,
                                    right: 20,
                                    left: 0,
                                    bottom: 10,
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#f1f5f9"
                                />

                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: "#64748b",
                                        fontSize: 12,
                                        fontWeight: 600,
                                    }}
                                />

                                <YAxis
                                    allowDecimals={false}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: "#94a3b8",
                                        fontSize: 11,
                                    }}
                                />

                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ fill: "#f8fafc" }}
                                />

                                <Bar
                                    dataKey="totalProjects"
                                    name="Số lượng project"
                                    fill="#6366f1"
                                    radius={[8, 8, 0, 0]}
                                    barSize={45}
                                />

                            </BarChart>

                        </ResponsiveContainer>
                    )}

                </div>
            </div>

            {/* BOTTOM */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">

                {/* PROJECT TABLE */}
                <div className="xl:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">

                    <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-5">

                        <LuFolderOpen className="text-indigo-500 text-xl" />

                        <h5 className="font-extrabold text-slate-700 text-lg">
                            Dự án mới cập nhật
                        </h5>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full text-left">

                            <thead>
                                <tr className="text-[11px] text-slate-400 uppercase tracking-widest">
                                    <th className="pb-4 font-bold">
                                        Tên dự án
                                    </th>

                                    <th className="pb-4 font-bold text-center">
                                        Thành viên
                                    </th>

                                    <th className="pb-4 font-bold">
                                        Trạng thái
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-50">

                                {projects.slice(0, 8).map((p) => (
                                    <tr
                                        key={p._id}
                                        className="hover:bg-slate-50 transition-colors"
                                    >

                                        <td className="py-4 font-bold text-slate-700 text-sm">
                                            {p.name}
                                        </td>

                                        <td className="py-4 text-center text-slate-500 font-bold">
                                            {p.members?.length || 0}
                                        </td>

                                        <td className="py-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    p.status === "active"
                                                        ? "bg-emerald-50 text-emerald-600"
                                                        : "bg-slate-100 text-slate-400"
                                                }`}
                                            >
                                                {p.status === "active"
                                                    ? "Hoạt động"
                                                    : "Lưu trữ"}
                                            </span>
                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>

                {/* USERS */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">

                    <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-5">

                        <LuUsers className="text-indigo-500 text-xl" />

                        <h5 className="font-extrabold text-slate-700 text-lg">
                            Đội ngũ ({users.length})
                        </h5>

                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">

                        {users.map((u) => (
                            <div
                                key={u._id}
                                className="flex items-center gap-4 p-2 rounded-xl hover:bg-slate-50 transition-all border border-transparent"
                            >

                                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                    {u.name.charAt(0)}
                                </div>

                                <div className="flex-1 min-w-0">

                                    <h6 className="text-sm font-bold text-slate-700 truncate">
                                        {u.name}
                                    </h6>

                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {u.role}
                                    </p>

                                </div>

                            </div>
                        ))}

                    </div>

                </div>

            </div>

            {/* CUSTOM SCROLLBAR */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 8px;
                    width: 6px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f8fafc;
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>

        </DashBoardLayout>
    );
};

export default DashBoard;