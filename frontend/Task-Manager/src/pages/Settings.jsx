import React, { useContext, useEffect, useState } from "react";
import DashBoardLayout from "../components/layout/DashBoardLayout";
import { useUserAuth } from "../hooks/useUserAuth";
import { UserContext } from "../context/userContext";
import axiosInstance from "../utils/axiosIntance";
import { API_PATHS } from "../utils/apiPaths";
import moment from "moment";
import toast from "react-hot-toast";
import { LuCamera } from "react-icons/lu";

const Settings = () => {
    useUserAuth();
    const { user, updateUser } = useContext(UserContext);

    const [form, setForm] = useState({
        name:            "",
        profileImageUrl: "",
        dateOfBirth:     "",
        hometown:        "",
        bio:             "",
        password:        "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({
                name:            user.name            || "",
                profileImageUrl: user.profileImageUrl || "",
                dateOfBirth:     user.dateOfBirth
                    ? moment(user.dateOfBirth).format("YYYY-MM-DD")
                    : "",
                hometown:        user.hometown || "",
                bio:             user.bio      || "",
                password:        "",
                confirmPassword: "",
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Upload ảnh đại diện
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        setImageUploading(true);
        try {
            const res = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const newImageUrl = res.data.imageUrl;
            setForm((prev) => ({ ...prev, profileImageUrl: newImageUrl }));

            // Lưu luôn vào DB sau khi upload
            const updateRes = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, {
                name: form.name,
                profileImageUrl: newImageUrl,
                dateOfBirth: form.dateOfBirth || null,
                hometown: form.hometown,
                bio: form.bio,
            });
            updateUser({ ...updateRes.data, token: updateRes.data.token || localStorage.getItem("token") });
            toast.success("Cập nhật ảnh đại diện thành công!");
        } catch (error) {
            toast.error("Tải ảnh thất bại");
        } finally {
            setImageUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim()) {
            toast.error("Tên không được để trống");
            return;
        }
        if (form.password && form.password !== form.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name:            form.name,
                profileImageUrl: form.profileImageUrl,
                dateOfBirth:     form.dateOfBirth || null,
                hometown:        form.hometown,
                bio:             form.bio,
            };
            if (form.password) payload.password = form.password;

            const res = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, payload);

            // Cập nhật context
            updateUser({ ...res.data, token: res.data.token || localStorage.getItem("token") });

            toast.success("Cập nhật thông tin thành công!");
            setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
        } catch (error) {
            toast.error(error?.response?.data?.message || "Cập nhật thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashBoardLayout activeMenu="Settings">
            <div className="mt-5 max-w-2xl mx-auto">
                <div className="form-card">
                    <h2 className="text-xl font-medium mb-6">Chỉnh sửa thông tin cá nhân</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Avatar */}
                        <div className="flex flex-col items-center gap-3 mb-6">
                            <div className="relative">
                                <img
                                    src={form.profileImageUrl || ""}
                                    alt="avatar"
                                    className="w-24 h-24 rounded-full object-cover bg-gray-200 border-4 border-white shadow-md"
                                />
                                <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-blue-700 transition-colors">
                                    <LuCamera className="text-white text-sm" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>
                            {imageUploading && (
                                <p className="text-xs text-gray-400">Đang tải ảnh...</p>
                            )}
                        </div>

                        {/* Tên */}
                        <div>
                            <label className="text-xs font-medium text-slate-600 block mb-1">
                                Tên hiển thị <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="form-input w-full"
                                placeholder="Nhập tên..."
                            />
                        </div>

                        {/* Email - readonly */}
                        <div>
                            <label className="text-xs font-medium text-slate-600 block mb-1">
                                Email <span className="text-gray-400 font-normal">(không thể thay đổi)</span>
                            </label>
                            <input
                                type="email"
                                value={user?.email || ""}
                                disabled
                                className="form-input w-full bg-gray-50 text-gray-400 cursor-not-allowed"
                            />
                        </div>

                        {/* Ngày sinh + Quê quán */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-600 block mb-1">
                                    Ngày sinh
                                </label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={form.dateOfBirth}
                                    onChange={handleChange}
                                    className="form-input w-full"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600 block mb-1">
                                    Quê quán
                                </label>
                                <input
                                    type="text"
                                    name="hometown"
                                    value={form.hometown}
                                    onChange={handleChange}
                                    className="form-input w-full"
                                    placeholder="Nhập quê quán..."
                                />
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="text-xs font-medium text-slate-600 block mb-1">
                                Giới thiệu bản thân
                            </label>
                            <textarea
                                name="bio"
                                value={form.bio}
                                onChange={handleChange}
                                rows={3}
                                className="form-input w-full resize-none"
                                placeholder="Viết vài dòng về bản thân..."
                            />
                        </div>

                        {/* Đổi mật khẩu */}
                        <div className="border-t border-gray-100 pt-4">
                            <p className="text-xs font-medium text-slate-500 mb-3">
                                Đổi mật khẩu <span className="font-normal">(để trống nếu không muốn đổi)</span>
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-slate-600 block mb-1">
                                        Mật khẩu mới
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        className="form-input w-full"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600 block mb-1">
                                        Xác nhận mật khẩu
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        className="form-input w-full"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={loading || imageUploading}
                                className="flex items-center gap-2 text-sm font-medium text-white bg-primary hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashBoardLayout>
    );
};

export default Settings;