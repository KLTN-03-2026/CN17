import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashBoardLayout from "../../components/layout/DashBoardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosIntance";
import { API_PATHS } from "../../utils/apiPaths";
import TaskCard from "../../components/Cards/TaskCard";
import TaskStatusTabs from "../../components/TaskStatusTabs";
import { LuFolderOpen } from "react-icons/lu";

const MyTasks = () => {
    useUserAuth();
    const navigate = useNavigate();

    const [projects, setProjects]               = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [allTasks, setAllTasks]               = useState([]);
    const [tabs, setTabs]                       = useState([]);
    const [filterStatus, setFilterStatus]       = useState("all");

    const fetchProjects = async () => {
        try {
            const res = await axiosInstance.get(API_PATHS.PROJECTS.GET_MY_PROJECTS);
            setProjects(res.data || []);
            if ((res.data || []).length > 0) setSelectedProject(res.data[0]);
        } catch (error) {
            console.error("Lỗi tải dự án:", error);
        }
    };

    const fetchTasks = useCallback(async () => {
        if (!selectedProject) return;

        try {
            const status =
                filterStatus === "all"         ? "" :
                filterStatus === "in-progress" ? "in progress" :
                filterStatus;

            const [tasksRes, summaryRes] = await Promise.all([
                axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
                    params: { projectId: selectedProject._id, status },
                }),
                axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
                    params: { projectId: selectedProject._id, status: "" },
                }),
            ]);

            setAllTasks(tasksRes.data?.tasks || []);

            const summary = summaryRes.data?.summary || {};
            
            // Việt hóa nhãn các Tabs
            setTabs([
                { label: "Tất cả",       value: "all",         count: summary.all             || 0 },
                { label: "Đang chờ",     value: "pending",     count: summary.pendingTasks    || 0 },
                { label: "Đang làm",     value: "in-progress", count: summary.inProgressTasks || 0 },
                { label: "Hoàn thành",   value: "completed",   count: summary.completedTasks  || 0 },
            ]);
        } catch (error) {
            console.error("Lỗi tải công việc:", error);
        }
    }, [selectedProject, filterStatus]);

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    return (
        <DashBoardLayout activeMenu="My Tasks">
            <div className="my-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
                    <h2 className="text-xl font-medium">Công việc của tôi</h2>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Bộ chọn dự án */}
                        {projects.length > 1 && (
                            <div className="flex items-center gap-2">
                                <LuFolderOpen className="text-gray-400 shrink-0 text-sm" />
                                <select
                                    className="form-input text-sm py-1.5 pr-8"
                                    value={selectedProject?._id || ""}
                                    onChange={(e) => {
                                        const p = projects.find((p) => p._id === e.target.value);
                                        setSelectedProject(p);
                                        setFilterStatus("all");
                                    }}
                                >
                                    {projects.map((p) => (
                                        <option key={p._id} value={p._id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {tabs?.some((t) => t.count > 0) && (
                            <TaskStatusTabs
                                tabs={tabs}
                                activeTab={filterStatus}
                                setActiveTab={setFilterStatus}
                            />
                        )}
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
                                onClick={() => navigate(`/user/tasks/${item._id}`)}
                            />
                        ))
                    ) : (
                        <div className="col-span-3 text-center text-gray-400 mt-10">
                            {selectedProject
                                ? "Không có công việc nào trong dự án này."
                                : "Bạn chưa tham gia dự án nào."}
                        </div>
                    )}
                </div>
            </div>
        </DashBoardLayout>
    );
};

export default MyTasks;