import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashBoardLayout from "../../components/layout/DashBoardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosIntance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import { LuPlus, LuUsers, LuClipboardList, LuTrash2 } from "react-icons/lu";
import toast from "react-hot-toast";

const STATUS_STYLES = {
    active:   "text-lime-600 bg-lime-50 border border-lime-200",
    completed:"text-blue-600 bg-blue-50 border border-blue-200",
    archived: "text-gray-500 bg-gray-50 border border-gray-200",
};

const ManageProject = () => {
    useUserAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        try {
            const res = await axiosInstance.get(API_PATHS.PROJECTS.GET_MY_PROJECTS);
            setProjects(res.data || []);
        } catch (error) {
            toast.error("Không thể tải danh sách dự án");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (projectId) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa dự án này?")) return;
        try {
            await axiosInstance.delete(API_PATHS.PROJECTS.DELETE_PROJECT(projectId));
            toast.success("Đã xóa dự án");
            setProjects((prev) => prev.filter((p) => p._id !== projectId));
        } catch (error) {
            toast.error(error?.response?.data?.message || "Xóa thất bại");
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    return (
        <DashBoardLayout activeMenu="Projects">
            <div className="mt-5">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-medium">Dự án của tôi</h2>
                    <button
                        className="flex items-center gap-1.5 text-sm font-medium text-white bg-primary hover:bg-blue-700 px-4 py-2 rounded-lg cursor-pointer transition-colors"
                        onClick={() => navigate("/leader/projects/create")}
                    >
                        <LuPlus className="text-base" /> Tạo dự án
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : projects.length === 0 ? (
                    <div className="card text-center py-16 text-gray-400">
                        <p className="text-sm">Bạn chưa có dự án nào.</p>
                        <button
                            className="btn-primary mt-4"
                            onClick={() => navigate("/leader/projects/create")}
                        >
                            Tạo dự án đầu tiên
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {projects.map((project) => (
                            <div key={project._id} className="card hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-medium text-gray-800 text-sm line-clamp-1 flex-1 mr-2">
                                        {project.name}
                                    </h3>
                                    <span className={`text-[11px] px-2 py-0.5 rounded capitalize shrink-0 ${STATUS_STYLES[project.status]}`}>
                                        {project.status}
                                    </span>
                                </div>

                                {project.description && (
                                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                                        {project.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                                    <span className="flex items-center gap-1">
                                        <LuUsers className="text-sm" />
                                        {project.members?.length || 0} thành viên
                                    </span>
                                    <span>{moment(project.createdAt).format("DD/MM/YYYY")}</span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        className="btn-secondary flex items-center gap-1 flex-1 justify-center text-xs"
                                        onClick={() => navigate(`/leader/projects/${project._id}/tasks`)}
                                    >
                                        <LuClipboardList /> Tasks
                                    </button>
                                    <button
                                        className="btn-secondary flex items-center gap-1 flex-1 justify-center text-xs"
                                        onClick={() => navigate(`/leader/projects/${project._id}/invite`)}
                                    >
                                        <LuUsers /> Mời
                                    </button>
                                    <button
                                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                        onClick={() => handleDelete(project._id)}
                                    >
                                        <LuTrash2 />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashBoardLayout>
    );
};

export default ManageProject;