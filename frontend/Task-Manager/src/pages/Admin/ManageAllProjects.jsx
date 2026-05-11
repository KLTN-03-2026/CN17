import React, { useEffect, useState } from "react";
import DashBoardLayout from "../../components/layout/DashBoardLayout";
import axiosInstance from "../../utils/axiosIntance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuTrash2, LuFolderOpen, LuUsers, LuCalendar, LuInfo } from "react-icons/lu";
import moment from "moment";
import toast from "react-hot-toast";

const ManageAllProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Hàm lấy toàn bộ danh sách dự án
    const fetchAllProjects = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(API_PATHS.PROJECTS.GET_ALL_PROJECTS);
            setProjects(res.data || []);
        } catch (error) {
            console.error("Lỗi tải dự án:", error);
            toast.error("Không thể tải danh sách dự án hệ thống");
        } finally {
            setLoading(false);
        }
    };

    // Hàm xóa dự án
    const handleDeleteProject = async (projectId, projectName) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa dự án "${projectName}"? Tất cả các Task liên quan cũng sẽ bị xóa vĩnh viễn.`)) {
            return;
        }

        try {
            await axiosInstance.delete(API_PATHS.PROJECTS.DELETE_PROJECT(projectId));
            toast.success("Đã xóa dự án thành công");
            fetchAllProjects(); // Tải lại danh sách sau khi xóa
        } catch (error) {
            toast.error(error?.response?.data?.message || "Xóa dự án thất bại");
        }
    };

    useEffect(() => {
        fetchAllProjects();
    }, []);

    return (
        <DashBoardLayout activeMenu="Dự án hệ thống">
            <div className="mt-5 mb-10">
                {/* Header trang */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                            Quản lý dự án hệ thống
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">
                            Admin có quyền xem và dọn dẹp các dự án trên toàn hệ thống.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                        <LuInfo className="text-primary" />
                        <span className="text-sm font-medium text-slate-600">
                            Tổng cộng: <b className="text-primary">{projects.length}</b> dự án
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/50 text-gray-400 text-[11px] uppercase tracking-wider border-b border-gray-100">
                                        <th className="py-4 px-6 text-left font-bold">Dự án</th>
                                        <th className="py-4 px-6 text-left font-bold">Trưởng nhóm</th>
                                        <th className="py-4 px-6 text-center font-bold">Thành viên</th>
                                        <th className="py-4 px-6 text-left font-bold">Ngày tạo</th>
                                        <th className="py-4 px-6 text-center font-bold">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {projects.length > 0 ? (
                                        projects.map((project) => (
                                            <tr key={project._id} className="hover:bg-blue-50/20 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-50 text-primary rounded-lg">
                                                            <LuFolderOpen size={18} />
                                                        </div>
                                                        <span className="font-bold text-slate-700">{project.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {project.leader ? (
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-slate-600 text-xs">{project.leader.name}</span>
                                                            <span className="text-[10px] text-gray-400">{project.leader.email}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-300 italic">N/A</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <div className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-[11px] font-bold text-gray-500">
                                                        <LuUsers size={12} />
                                                        {project.members?.length || 0}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-xs text-gray-400 italic">
                                                    <div className="flex items-center gap-1">
                                                        <LuCalendar size={12} />
                                                        {moment(project.createdAt).format("DD/MM/YYYY")}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex justify-center">
                                                        <button 
                                                            onClick={() => handleDeleteProject(project._id, project.name)}
                                                            className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                                            title="Xóa dự án"
                                                        >
                                                            <LuTrash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="py-10 text-center text-gray-400 italic">
                                                Chưa có dự án nào trong hệ thống.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </DashBoardLayout>
    );
};

export default ManageAllProjects;