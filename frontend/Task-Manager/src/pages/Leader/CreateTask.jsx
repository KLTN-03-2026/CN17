import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import DashBoardLayout from "../../components/layout/DashBoardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import { PRIORITY_DATA } from "../../utils/data";
import axiosInstance from "../../utils/axiosIntance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import moment from "moment";
import { LuTrash2 } from "react-icons/lu";
import SelectDropdown from "../../components/Inputs/SelectDropdown";
import SelectUsers from "../../components/Inputs/SelectUsers";
import TodoListInput from "../../components/Inputs/TodoListInput";
import DeleteAlert from "../../components/DeleteAlert";
import Modal from "../../components/Modal";

const CreateTask = () => {
    useUserAuth();
    const location    = useLocation();
    const navigate    = useNavigate();
    const { projectId } = useParams();
    const { taskID }  = location.state || {};

    const [taskData, setTaskData] = useState({
        title:         "",
        description:   "",
        priority:      "",
        dueDate:       null,
        assignedTo:    [],
        todoChecklist: [],
        attachments:   [],
    });

    const [projectMembers, setProjectMembers] = useState([]);
    const [currentTask, setCurrentTask]       = useState(null);
    const [loading, setLoading]               = useState(false);
    const [error, setError]                   = useState("");
    const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

    const handleInputChange = (key, value) => {
        setTaskData((prev) => ({ ...prev, [key]: value }));
    };

    const clearData = () => {
        setTaskData({
            title: "", description: "", priority: "",
            dueDate: null, assignedTo: [], todoChecklist: [], attachments: [],
        });
    };

    // Lấy danh sách thành viên dự án để giao việc
    const fetchProjectMembers = async () => {
        try {
            const res = await axiosInstance.get(API_PATHS.PROJECTS.GET_PROJECT_BY_ID(projectId));
            const leader  = res.data?.leader ? [res.data.leader] : [];
            const members = res.data?.members || [];
            setProjectMembers([...leader, ...members]);
        } catch (error) {
            console.error("Lỗi tải danh sách thành viên:", error);
        }
    };

    const createTask = async () => {
        setLoading(true);
        try {
            const todolist = taskData.todoChecklist?.map((item) => ({
                text: item, completed: false,
            }));

            await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, {
                ...taskData,
                projectId,
                dueDate:       new Date(taskData.dueDate).toISOString(),
                todoChecklist: todolist,
            });

            toast.success("Tạo công việc thành công!");
            clearData();
            navigate(`/leader/projects/${projectId}/tasks`);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Tạo công việc thất bại");
        } finally {
            setLoading(false);
        }
    };

    const updateTask = async () => {
        setLoading(true);
        try {
            const todolist = taskData.todoChecklist?.map((item) => {
                const prev = currentTask?.todoChecklist || [];
                const matched = prev.find((t) => t.text === item);
                return { text: item, completed: matched ? matched.completed : false };
            });

            await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK(taskID), {
                ...taskData,
                dueDate:       new Date(taskData.dueDate).toISOString(),
                todoChecklist: todolist,
            });

            toast.success("Cập nhật công việc thành công!");
            navigate(`/leader/projects/${projectId}/tasks`);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Cập nhật thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setError("");
        if (!taskData.title.trim())           return setError("Vui lòng nhập tiêu đề công việc.");
        if (!taskData.description.trim())     return setError("Vui lòng nhập mô tả chi tiết.");
        if (!taskData.priority)               return setError("Vui lòng chọn mức độ ưu tiên.");
        if (!taskData.dueDate)                return setError("Vui lòng thiết lập ngày hạn chót.");
        if (taskData.assignedTo?.length === 0) return setError("Vui lòng giao việc cho ít nhất một thành viên.");
        if (taskData.todoChecklist?.length === 0) return setError("Vui lòng thêm ít nhất một đầu mục công việc (Checklist).");

        if (taskID) { updateTask(); return; }
        createTask();
    };

    const getTaskDetailsByID = async () => {
        try {
            const res = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(taskID));
            if (res.data) {
                const info = res.data;
                setCurrentTask(info);
                setTaskData({
                    title:         info.title,
                    description:   info.description,
                    priority:      info.priority,
                    dueDate:       info.dueDate ? moment(info.dueDate).format("YYYY-MM-DD") : null,
                    assignedTo:    info.assignedTo?.map((u) => u._id) || [],
                    todoChecklist: info.todoChecklist?.map((u) => u.text) || [],
                    attachments:   info.attachments || [],
                });
            }
        } catch (error) {
            console.error("Lỗi tải chi tiết công việc:", error);
        }
    };

    const deleteTask = async () => {
        try {
            await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskID));
            setOpenDeleteAlert(false);
            toast.success("Đã xóa công việc");
            navigate(`/leader/projects/${projectId}/tasks`);
        } catch (error) {
            toast.error("Xóa công việc thất bại");
        }
    };

    useEffect(() => {
        fetchProjectMembers();
        if (taskID) getTaskDetailsByID();
    }, [taskID, projectId]);

    return (
        <DashBoardLayout activeMenu="Projects">
            <div className="mt-5">
                <div className="grid grid-cols-1 md:grid-cols-4 mt-4 gap-6">
                    <div className="form-card col-span-1 md:col-span-3 shadow-sm">
                        <div className="flex items-center justify-between border-b pb-4 mb-6">
                            <h2 className="text-xl font-bold text-slate-800">
                                {taskID ? "Cập nhật công việc" : "Khởi tạo công việc mới"}
                            </h2>
                            {taskID && (
                                <button
                                    className="flex items-center gap-1.5 text-[13px] font-bold text-rose-600 bg-rose-50 rounded-lg px-3 py-1.5 border border-rose-100 hover:bg-rose-100 transition-colors"
                                    onClick={() => setOpenDeleteAlert(true)}
                                >
                                    <LuTrash2 className="text-base" /> Xóa công việc
                                </button>
                            )}
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Tiêu đề</label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: Thiết kế giao diện trang chủ..."
                                    className="form-input w-full border-gray-200 focus:border-primary transition-all"
                                    value={taskData.title}
                                    onChange={({ target }) => handleInputChange("title", target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Mô tả chi tiết</label>
                                <textarea
                                    placeholder="Nội dung yêu cầu cụ thể cho công việc này..."
                                    className="form-input w-full border-gray-200 focus:border-primary transition-all resize-none"
                                    rows={4}
                                    value={taskData.description}
                                    onChange={({ target }) => handleInputChange("description", target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-12 md:col-span-4">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Mức độ ưu tiên</label>
                                    <SelectDropdown
                                        options={PRIORITY_DATA}
                                        value={taskData.priority}
                                        onChange={(value) => handleInputChange("priority", value)}
                                        placeholder="Chọn mức độ"
                                    />
                                </div>

                                <div className="col-span-12 md:col-span-4">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Hạn chót (Due Date)</label>
                                    <input
                                        type="date"
                                        className="form-input w-full border-gray-200 focus:border-primary transition-all"
                                        value={taskData.dueDate || ""}
                                        onChange={({ target }) => handleInputChange("dueDate", target.value)}
                                    />
                                </div>

                                <div className="col-span-12 md:col-span-4">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                                        Người thực hiện
                                    </label>
                                    <SelectUsers
                                        selectedUsers={taskData.assignedTo}
                                        setSelectedUsers={(value) => handleInputChange("assignedTo", value)}
                                        projectMembers={projectMembers}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Danh sách đầu việc (Checklist)</label>
                                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                    <TodoListInput
                                        todoList={taskData.todoChecklist}
                                        setTodoList={(value) => handleInputChange("todoChecklist", value)}
                                        attachments={taskData.attachments}
                                        setAttachments={(value) => handleInputChange("attachments", value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 p-3 rounded-lg mt-6">
                                <p className="text-xs font-semibold text-red-600 flex items-center gap-2">
                                    lỗi  {error}
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end mt-10">
                            <button
                                className="add-btn px-8 py-3 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading
                                    ? "Đang xử lý..."
                                    : taskID ? "LƯU THAY ĐỔI" : "KHỞI TẠO CÔNG VIỆC"}
                            </button>
                        </div>
                    </div>

                    <div className="hidden md:block col-span-1">
                        
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <h4 className="text-sm font-bold text-blue-800 mb-2">💡 Mẹo nhỏ</h4>
                            <p className="text-xs text-blue-600 leading-relaxed">
                                Hãy chia nhỏ công việc thành các bước trong Checklist để thành viên dễ dàng theo dõi và hoàn thành đúng hạn.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={openDeleteAlert}
                onClose={() => setOpenDeleteAlert(false)}
                title="Xác nhận xóa công việc"
            >
                <DeleteAlert
                    content="Hành động này sẽ xóa vĩnh viễn công việc hiện tại. Bạn có chắc chắn muốn tiếp tục?"
                    onDelete={deleteTask}
                    onCancel={() => setOpenDeleteAlert(false)}
                />
            </Modal>
        </DashBoardLayout>
    );
};

export default CreateTask;