import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashBoardLayout from "../../components/layout/DashBoardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosIntance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import 'moment/locale/vi'; // Sử dụng ngôn ngữ tiếng Việt cho thời gian
import { LuPlus, LuUsers, LuClipboardList, LuTrash2 } from "react-icons/lu";
import toast from "react-hot-toast";

// Việt hóa các style và nhãn trạng thái
const STATUS_STYLES = {
    active:    { class: "text-lime-600 bg-lime-50 border border-lime-200", label: "Đang hoạt động" },
    completed: { class: "text-blue-600 bg-blue-50 border border-blue-200", label: "Đã hoàn thành" },
    archived:  { class: "text-gray-500 bg-gray-50 border border-gray-200", label: "Đã lưu trữ" },
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
        // Việt hóa câu hỏi xác nhận
        if (!window.confirm("Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa dự án này?")) return;
        
        try {
            await axiosInstance.delete(API_PATHS.PROJECTS.DELETE_PROJECT(projectId));
            toast.success("Xóa dự án thành công");
            setProjects((prev) => prev.filter((p) => p._id !== projectId));
        } catch (error) {
            toast.error(error?.response?.data?.message || "Xóa dự án thất bại");
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    return (
        <DashBoardLayout activeMenu="Projects">
            <div className="mt-5">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-slate-800">Quản lý dự án</h2>
                    <button
                        className="flex items-center gap-1.5 text-sm font-medium text-white bg-primary hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm transition-all active:scale-95"
                        onClick={() => navigate("/leader/projects/create")}
                    >
                        <LuPlus className="text-lg" /> Khởi tạo dự án
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-9 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : projects.length === 0 ? (
                    <div className="card text-center py-16 bg-gray-50/50 border-dashed border-2 border-gray-200">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LuClipboardList className="text-3xl text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">Bạn chưa quản lý dự án nào.</p>
                        <p className="text-xs text-gray-400 mt-1">Hãy bắt đầu bằng cách tạo một dự án mới để quản lý công việc.</p>
                        <button
                            className="btn-primary mt-6 px-6"
                            onClick={() => navigate("/leader/projects/create")}
                        >
                            Tạo dự án đầu tiên
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {projects.map((project) => (
                            <div key={project._id} className="card hover:shadow-lg transition-all border border-gray-100 group">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-bold text-slate-800 text-base line-clamp-1 flex-1 mr-2 group-hover:text-primary transition-colors">
                                        {project.name}
                                    </h3>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide shrink-0 ${STATUS_STYLES[project.status]?.class || STATUS_STYLES.active.class}`}>
                                        {STATUS_STYLES[project.status]?.label || "Đang hoạt động"}
                                    </span>
                                </div>

                                {project.description && (
                                    <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                                        {project.description}
                                    </p>
                                )}

                                <div className="flex items-center justify-between text-[11px] text-gray-400 mb-5 pb-4 border-b border-gray-50">
                                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                        <LuUsers className="text-sm" />
                                        <span className="font-medium text-gray-600">{project.members?.length || 0}</span> thành viên
                                    </span>
                                    <span className="italic">Ngày tạo: {moment(project.createdAt).format("DD/MM/YYYY")}</span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        className="btn-secondary flex items-center gap-1.5 flex-1 justify-center text-xs py-2 hover:bg-primary hover:text-white hover:border-primary transition-all"
                                        onClick={() => navigate(`/leader/projects/${project._id}/tasks`)}
                                    >
                                        <LuClipboardList className="text-sm" /> Công việc
                                    </button>
                                    <button
                                        className="btn-secondary flex items-center gap-1.5 flex-1 justify-center text-xs py-2 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all"
                                        onClick={() => navigate(`/leader/projects/${project._id}/invite`)}
                                    >
                                        <LuUsers className="text-sm" /> Mời họp
                                    </button>
                                    <button
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                                        title="Xóa dự án"
                                        onClick={() => handleDelete(project._id)}
                                    >
                                        <LuTrash2 className="text-lg" />
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