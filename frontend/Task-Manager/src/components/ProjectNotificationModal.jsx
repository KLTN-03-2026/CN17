import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import axiosInstance from "../utils/axiosIntance";
import { API_PATHS } from "../utils/apiPaths";
import toast from "react-hot-toast";
import moment from "moment";

const ProjectNotificationModal = ({
    isOpen,
    onClose,
    projectId,
}) => {
    const [notifications, setNotifications] = useState([]);

    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [startAt, setStartAt] = useState("");
    const [endAt, setEndAt] = useState("");

    const [loading, setLoading] = useState(false);

    const getNotifications = async () => {
        try {
            const response = await axiosInstance.get(
                API_PATHS.NOTIFICATIONS.GET_MANAGE_BY_PROJECT(projectId)
            );

            setNotifications(response.data.notifications || []);
        } catch (error) {
            toast.error("Không thể tải thông báo");
        }
    };

    const handleCreateNotification = async () => {
        if (!title || !message || !endAt) {
            toast.error("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        try {
            setLoading(true);

            await axiosInstance.post(
                API_PATHS.NOTIFICATIONS.CREATE,
                {
                    projectId,
                    title,
                    message,
                    startAt,
                    endAt,
                }
            );

            toast.success("Tạo thông báo thành công");

            setTitle("");
            setMessage("");
            setStartAt("");
            setEndAt("");

            getNotifications();
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Tạo thông báo thất bại"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            await axiosInstance.delete(
                API_PATHS.NOTIFICATIONS.DELETE(id)
            );

            toast.success("Đã xóa thông báo");

            getNotifications();
        } catch (error) {
            toast.error("Xóa thất bại");
        }
    };

    useEffect(() => {
        if (isOpen && projectId) {
            getNotifications();
        }
    }, [isOpen, projectId]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Quản lý thông báo"
        >
            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Tiêu đề thông báo"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 outline-none"
                />

                <textarea
                    placeholder="Nội dung thông báo"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full border rounded-lg px-3 py-2 outline-none resize-none"
                />

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-500">
                            Hiển thị từ
                        </label>

                        <input
                            type="datetime-local"
                            value={startAt}
                            onChange={(e) => setStartAt(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-500">
                            Hiển thị đến
                        </label>

                        <input
                            type="datetime-local"
                            value={endAt}
                            onChange={(e) => setEndAt(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 outline-none"
                        />
                    </div>
                </div>

                <button
                    onClick={handleCreateNotification}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                >
                    {loading
                        ? "Đang tạo..."
                        : "Tạo thông báo"}
                </button>

                <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-3">
                        Danh sách thông báo
                    </h3>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 && (
                            <p className="text-sm text-gray-400">
                                Chưa có thông báo
                            </p>
                        )}

                        {notifications.map((item) => (
                            <div
                                key={item._id}
                                className="border rounded-xl p-3 bg-gray-50"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h4 className="font-semibold">
                                            {item.title}
                                        </h4>

                                        <p className="text-sm text-gray-600 mt-1">
                                            {item.message}
                                        </p>

                                        <p className="text-xs text-gray-400 mt-2">
                                            {moment(item.startAt).format(
                                                "DD/MM/YYYY HH:mm"
                                            )}
                                            {" → "}
                                            {moment(item.endAt).format(
                                                "DD/MM/YYYY HH:mm"
                                            )}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() =>
                                            handleDeleteNotification(item._id)
                                        }
                                        className="text-red-500 text-sm"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ProjectNotificationModal;