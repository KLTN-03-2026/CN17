import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashBoardLayout from "../../components/layout/DashBoardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosIntance";
import { API_PATHS } from "../../utils/apiPaths";
import TaskCard from "../../components/Cards/TaskCard";
import TaskStatusTabs from "../../components/TaskStatusTabs";
import { LuPlus, LuFileSpreadsheet } from "react-icons/lu";
import toast from "react-hot-toast";

const LeaderTaskManager = () => {
    useUserAuth();
    const { projectId } = useParams();
    const navigate      = useNavigate();

    const [project, setProject]           = useState(null);
    const [allTasks, setAllTasks]         = useState([]);
    const [tabs, setTabs]                 = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");

    const fetchProjectInfo = async () => {
        try {
            const res = await axiosInstance.get(API_PATHS.PROJECTS.GET_PROJECT_BY_ID(projectId));
            setProject(res.data);
        } catch (error) {
            toast.error("Không thể tải thông tin dự án");
        }
    };

    const fetchTasks = useCallback(async () => {
        try {
            const status =
                filterStatus === "all"         ? "" :
                filterStatus === "in-progress" ? "in progress" :
                filterStatus;

            const [tasksRes, summaryRes] = await Promise.all([
                axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
                    params: { projectId, status },
                }),
                axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
                    params: { projectId, status: "" },
                }),
            ]);

            setAllTasks(tasksRes.data?.tasks || []);

            const summary = summaryRes.data?.summary || {};
            
            // Việt hóa nhãn các Tabs cho Leader
            setTabs([
                { label: "Tất cả",       value: "all",         count: summary.all             || 0 },
                { label: "Chờ xử lý",     value: "pending",     count: summary.pendingTasks    || 0 },
                { label: "Đang làm",     value: "in-progress", count: summary.inProgressTasks || 0 },
                { label: "Hoàn thành",   value: "completed",   count: summary.completedTasks  || 0 },
            ]);
        } catch (error) {
            console.error("Lỗi tải danh sách công việc:", error);
        }
    }, [projectId, filterStatus]);

    useEffect(() => {
        fetchProjectInfo();
    }, [projectId]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    return (
        <DashBoardLayout activeMenu="Projects">
            <div className="my-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{project?.name || "Danh sách công việc"}</h2>
                        {project?.description && (
                            <p className="text-xs text-gray-500 mt-1 italic">{project.description}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {tabs?.some((t) => t.count > 0) && (
                            <TaskStatusTabs
                                tabs={tabs}
                                activeTab={filterStatus}
                                setActiveTab={setFilterStatus}
                            />
                        )}
                        
                        {/* Nút Xuất Báo Cáo */}
                        <button
                            className="flex items-center gap-1.5 text-sm font-medium text-lime-900 bg-lime-100 hover:bg-lime-200 px-3 py-2 rounded border border-lime-200 transition-all active:scale-95"
                            onClick={async () => {
                                try {
                                    const res = await axiosInstance.get(
                                        API_PATHS.REPORTS.EXPORT_PROJECT_MEMBERS,
                                        { params: { projectId }, responseType: "blob" }
                                    );
                                    const url  = window.URL.createObjectURL(new Blob([res.data]));
                                    const link = document.createElement("a");
                                    link.href  = url;
                                    link.setAttribute("download", `bao-cao-thanh-vien-${project?.name || 'du-an'}.xlsx`);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.parentNode.removeChild(link);
                                    window.URL.revokeObjectURL(url);
                                    toast.success("Đã tải xuống báo cáo thành viên");
                                } catch (err) {
                                    toast.error("Xuất báo cáo thất bại");
                                }
                            }}
                        >
                            <LuFileSpreadsheet className="text-base" /> Xuất báo cáo
                        </button>

                        {/* Nút Tạo Task */}
                        <button
                            className="flex items-center gap-1.5 text-sm font-medium text-white bg-primary hover:bg-blue-700 px-4 py-2 rounded-lg shadow-md transition-all active:scale-95"
                            onClick={() =>
                                navigate(`/leader/projects/${projectId}/tasks/create`)
                            }
                        >
                            <LuPlus className="text-lg" /> Tạo công việc
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {allTasks.length > 0 ? (
                        allTasks.map((item) => (
                            <TaskCard
                                key={item._id}
                                title={item.title}
                                description={item.description}
                                priority={item.priority}
                                status={item.status}
                                progress={item.progress}
                                createAt={item.createdAt}
                                dueDate={item.dueDate}
                                assignedTo={item.assignedTo?.map((u) => u.profileImageUrl)}
                                attachments={item.attachments?.length || 0}
                                completedTodoCount={
                                    item.todoChecklist?.filter((t) => t.completed).length || 0
                                }
                                todoChecklist={item.todoChecklist || []}
                                onClick={() =>
                                    navigate(
                                        `/leader/projects/${projectId}/tasks/create`,
                                        { state: { taskID: item._id } }
                                    )
                                }
                            />
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-500 font-medium mb-4">Dự án hiện chưa có công việc nào.</p>
                            <button
                                className="inline-flex items-center gap-2 text-sm font-medium text-white bg-primary hover:bg-blue-700 px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-blue-100"
                                onClick={() =>
                                    navigate(`/leader/projects/${projectId}/tasks/create`)
                                }
                            >
                                <LuPlus /> Tạo công việc đầu tiên
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </DashBoardLayout>
    );
};

export default LeaderTaskManager;