import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashBoardLayout from "../../components/layout/DashBoardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosIntance";
import { API_PATHS } from "../../utils/apiPaths";
import TaskCard from "../../components/Cards/TaskCard";
import TaskStatusTabs from "../../components/TaskStatusTabs";
import { LuPlus } from "react-icons/lu";
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
            setTabs([
                { label: "all",         count: summary.all             || 0 },
                { label: "pending",     count: summary.pendingTasks    || 0 },
                { label: "in-progress", count: summary.inProgressTasks || 0 },
                { label: "completed",   count: summary.completedTasks  || 0 },
            ]);
        } catch (error) {
            console.error("Lỗi tải task:", error);
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
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
                    <div>
                        <h2 className="text-xl font-medium">{project?.name || "Tasks"}</h2>
                        {project?.description && (
                            <p className="text-xs text-gray-400 mt-0.5">{project.description}</p>
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
                        <button
                            className="flex items-center gap-1.5 text-sm font-medium text-white bg-primary hover:bg-blue-700 px-4 py-2 rounded-lg cursor-pointer transition-colors"
                            onClick={() =>
                                navigate(`/leader/projects/${projectId}/tasks/create`)
                            }
                        >
                            <LuPlus /> Tạo Task
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
                        <div className="col-span-3 text-center text-gray-400 mt-10">
                            <p className="text-sm mb-3">Dự án chưa có task nào.</p>
                            <button
                                className="flex items-center gap-1.5 text-sm font-medium text-white bg-primary hover:bg-blue-700 px-4 py-2 rounded-lg cursor-pointer transition-colors mt-3"
                                onClick={() =>
                                    navigate(`/leader/projects/${projectId}/tasks/create`)
                                }
                            >
                                Tạo task đầu tiên
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </DashBoardLayout>
    );
};

export default LeaderTaskManager;