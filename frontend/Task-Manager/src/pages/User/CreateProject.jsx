import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DashBoardLayout from "../../components/layout/DashBoardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import { UserContext } from "../../context/userContext";
import axiosInstance from "../../utils/axiosIntance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";

const CreateProject = () => {
    useUserAuth();
    const navigate    = useNavigate();
    const { updateUser } = useContext(UserContext);

    const [form, setForm]       = useState({ name: "", description: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setError("Tên dự án không được để trống");
            return;
        }

        setLoading(true);
        try {
            // 1. Tạo dự án -> backend tự động nâng quyền lên leader
            await axiosInstance.post(API_PATHS.PROJECTS.CREATE_PROJECT, form);

            toast.success("Khởi tạo dự án thành công! Chào mừng tân Trưởng nhóm (Leader) 🎉");

            // 2. Tải lại hồ sơ để lấy vai trò mới (leader)
            const profileRes = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);

            // 3. Cập nhật context với vai trò mới
            updateUser({ ...profileRes.data, token: localStorage.getItem("token") });

            // 4. Chuyển hướng sang bảng điều khiển dành cho Leader
            navigate("/leader/dashboard");

        } catch (error) {
            toast.error(error?.response?.data?.message || "Quá trình tạo dự án thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashBoardLayout activeMenu="Create Project">
            <div className="mt-5">
                <div className="form-card max-w-2xl mx-auto shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-1">Khởi tạo dự án mới</h2>
                    <p className="text-xs text-gray-400 mb-6">
                        Sau khi khởi tạo, bạn sẽ giữ vai trò <span className="text-violet-600 font-bold">Trưởng nhóm (Leader)</span>, có toàn quyền quản lý công việc và mời thành viên tham gia.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                                Tên dự án <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Ví dụ: Phát triển ứng dụng Web Mobile..."
                                className="form-input w-full border-gray-200 focus:border-violet-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                                Mô tả dự án
                            </label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Tóm tắt mục tiêu hoặc nội dung chính của dự án này..."
                                rows={4}
                                className="form-input w-full resize-none border-gray-200 focus:border-violet-500 transition-all"
                            />
                        </div>

                        {error && (
                            <p className="text-red-500 text-xs font-medium bg-red-50 p-2 rounded border border-red-100">{error}</p>
                        )}

                        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                            <p className="text-[11px] text-blue-700 leading-relaxed">
                                <strong>Lưu ý:</strong> Hệ thống sẽ tự động cập nhật tài khoản của bạn lên quyền <strong>Leader</strong> ngay sau khi dự án được xác nhận tạo thành công.
                            </p>
                        </div>

                        <div className="flex gap-4 pt-2">
                            <button
                                type="button"
                                onClick={() => navigate("/user/dashboard")}
                                className="btn-secondary flex-1 py-2.5 font-medium border-gray-300 text-gray-600 hover:bg-gray-50"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex-1 py-2.5 font-medium shadow-md shadow-violet-200"
                            >
                                {loading ? "Đang xử lý..." : "Xác nhận tạo dự án"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashBoardLayout>
    );
};

export default CreateProject;