import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashBoardLayout from "../../components/layout/DashBoardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import { UserContext } from "../../context/userContext";
import axiosInstance from "../../utils/axiosIntance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import 'moment/locale/vi'; // Import tiếng Việt cho moment
import { addThouSandsSeparator } from "../../utils/helper";
import InfoCard from "../../components/Cards/InfoCard";
import CustomPieCharts from "../../components/Charts/CustomPieCharts";
import CustomBarCharts from "../../components/Charts/CustomBarCharts";
import TaskListTable from "../../components/layout/TaskListTable";
import { LuArrowRight, LuFolderOpen } from "react-icons/lu";

// Thiết lập moment sử dụng tiếng Việt
moment.locale('vi');

const COLORS = ["#8D51FF", "#00B8DB", "#7BCE00"];

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
};

const LeaderDashboard = () => {
    useUserAuth();
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const [projects, setProjects]       = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [dashboardData, setDashboardData]     = useState({});
    const [pieChartData, setPieChartData]       = useState([]);
    const [barChartData, setBarChartData]       = useState([]);
    const [loading, setLoading]                 = useState(false);

    const prepareChartData = (charts) => {
        const taskDistributionData = charts?.taskDistribution || {};
        const priorityDistribution = charts?.priorityDistribution || {};

        // Việt hóa nhãn trạng thái trong biểu đồ tròn
        setPieChartData([
            { status: "Chờ xử lý",    count: taskDistributionData?.pending     || 0 },
            { status: "Đang làm",     count: taskDistributionData?.inprogress  || 0 },
            { status: "Hoàn thành",   count: taskDistributionData?.completed   || 0 },
        ]);

        // Việt hóa nhãn mức độ ưu tiên trong biểu đồ cột
        setBarChartData([
            { priority: "Thấp",    count: priorityDistribution?.low    || 0 },
            { priority: "Trung bình", count: priorityDistribution?.medium || 0 },
            { priority: "Cao",   count: priorityDistribution?.high   || 0 },
        ]);
    };

    const fetchProjects = async () => {
        try {
            const res = await axiosInstance.get(API_PATHS.PROJECTS.GET_MY_PROJECTS);
            const myProjects = (res.data || []).filter(
                (p) => p.leader?._id === user?._id || p.leader === user?._id
            );
            setProjects(myProjects);
            if (myProjects.length > 0) {
                setSelectedProject(myProjects[0]);
            }
        } catch (error) {
            console.error("Lỗi tải dự án:", error);
        }
    };

    const fetchDashboardData = async (projectId) => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(API_PATHS.TASKS.GET_DASHBOARD_DATA, {
                params: { projectId },
            });
            if (res.data) {
                setDashboardData(res.data);
                prepareChartData(res.data?.charts || {});
            }
        } catch (error) {
            console.error("Lỗi tải dữ liệu bảng điều khiển:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchProjects();
    }, [user]);

    useEffect(() => {
        if (selectedProject) fetchDashboardData(selectedProject._id);
    }, [selectedProject]);

    return (
        <DashBoardLayout activeMenu="Dashboard">
            <div className="card my-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl md:text-2xl">
                            {getGreeting()}! {user?.name}
                        </h2>
                        <p className="text-xs md:text-[13px] text-gray-400 mt-1.5 capitalize">
                            {moment().format("dddd, [ngày] D [tháng] M, YYYY")}
                        </p>
                    </div>

                    {/* Bộ chọn dự án */}
                    {projects.length > 1 && (
                        <div className="flex items-center gap-2">
                            <LuFolderOpen className="text-gray-400 shrink-0" />
                            <select
                                className="form-input text-sm py-1.5 pr-8"
                                value={selectedProject?._id || ""}
                                onChange={(e) => {
                                    const p = projects.find((p) => p._id === e.target.value);
                                    setSelectedProject(p);
                                }}
                            >
                                {projects.map((p) => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Khi chưa có project */}
                {projects.length === 0 && !loading && (
                    <div className="text-center py-8 text-gray-400">
                        <p className="text-sm mb-3">Bạn chưa quản lý dự án nào.</p>
                        <button
                            className="btn-primary"
                            onClick={() => navigate("/leader/projects/create")}
                        >
                            Tạo dự án đầu tiên
                        </button>
                    </div>
                )}

                {selectedProject && (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5">
                        <InfoCard
                            label="Tổng công việc"
                            value={addThouSandsSeparator(dashboardData?.statistics?.totalTasks || 0)}
                            color="bg-primary"
                        />
                        <InfoCard
                            label="Chờ xử lý"
                            value={addThouSandsSeparator(dashboardData?.statistics?.pendingTasks || 0)}
                            color="bg-violet-500"
                        />
                        <InfoCard
                            label="Đang thực hiện"
                            value={addThouSandsSeparator(dashboardData?.statistics?.inProgressTasks || 0)}
                            color="bg-cyan-500"
                        />
                        <InfoCard
                            label="Đã hoàn thành"
                            value={addThouSandsSeparator(dashboardData?.statistics?.completedTasks || 0)}
                            color="bg-lime-500"
                        />
                    </div>
                )}
            </div>

            {selectedProject && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">
                    <div className="card">
                        <h5 className="font-medium text-slate-700">Phân bổ công việc</h5>
                        <CustomPieCharts data={pieChartData} colors={COLORS} />
                    </div>

                    <div className="card">
                        <h5 className="font-medium text-slate-700">Mức độ ưu tiên</h5>
                        <CustomBarCharts data={barChartData} colors={COLORS} />
                    </div>

                    <div className="md:col-span-2">
                        <div className="card">
                            <div className="flex items-center justify-between mb-4">
                                <h5 className="text-lg font-medium">Công việc gần đây</h5>
                                <button
                                    className="card-btn flex items-center gap-1 text-primary hover:underline text-sm"
                                    onClick={() =>
                                        navigate(`/leader/projects/${selectedProject._id}/tasks`)
                                    }
                                >
                                    Xem tất cả <LuArrowRight className="text-base" />
                                </button>
                            </div>
                            <TaskListTable tableData={dashboardData?.recentTasks || []} />
                        </div>
                    </div>
                </div>
            )}
        </DashBoardLayout>
    );
};

export default LeaderDashboard;