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
            // 1. Tạo project -> backend tự nâng role lên leader
            await axiosInstance.post(API_PATHS.PROJECTS.CREATE_PROJECT, form);

            toast.success("Tạo dự án thành công! Bạn đã trở thành Leader 🎉");

            // 2. Fetch lại profile để lấy role mới (leader)
            const profileRes = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);

            // 3. Cập nhật context với role mới
            updateUser({ ...profileRes.data, token: localStorage.getItem("token") });

            // 4. Redirect sang leader dashboard
            navigate("/leader/dashboard");

        } catch (error) {
            toast.error(error?.response?.data?.message || "Tạo dự án thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashBoardLayout activeMenu="Create Project">
            <div className="mt-5">
                <div className="form-card max-w-2xl mx-auto">
                    <h2 className="text-xl font-medium mb-1">Tạo dự án mới</h2>
                    <p className="text-xs text-gray-400 mb-6">
                        Sau khi tạo, bạn sẽ trở thành <span className="text-violet-500 font-medium">Leader</span> của dự án và có thể quản lý task, mời thành viên.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-xs font-medium text-slate-600 block mb-1">
                                Tên dự án <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Nhập tên dự án..."
                                className="form-input w-full"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-slate-600 block mb-1">
                                Mô tả
                            </label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Mô tả ngắn về dự án..."
                                rows={4}
                                className="form-input w-full resize-none"
                            />
                        </div>

                        {error && (
                            <p className="text-red-500 text-xs">{error}</p>
                        )}

                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                            <p className="text-xs text-amber-700">
                                ! Sau khi tạo dự án, role của bạn sẽ đổi thành <strong>Leader</strong>. Bạn sẽ được chuyển sang trang quản lý Leader.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => navigate("/user/dashboard")}
                                className="btn-secondary flex-1"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex-1"
                            >
                                {loading ? "Đang tạo..." : "Tạo dự án"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashBoardLayout>
    );
};

export default CreateProject;