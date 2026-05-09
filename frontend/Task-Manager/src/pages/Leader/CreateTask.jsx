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

    // Lấy danh sách member của project để hiển thị trong SelectUsers
    const fetchProjectMembers = async () => {
        try {
            const res = await axiosInstance.get(API_PATHS.PROJECTS.GET_PROJECT_BY_ID(projectId));
            // Gộp leader + members để có thể assign
            const leader  = res.data?.leader ? [res.data.leader] : [];
            const members = res.data?.members || [];
            setProjectMembers([...leader, ...members]);
        } catch (error) {
            console.error("Lỗi tải member dự án:", error);
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

            toast.success("Tạo task thành công!");
            clearData();
            navigate(`/leader/projects/${projectId}/tasks`);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Tạo task thất bại");
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

            toast.success("Cập nhật task thành công!");
            navigate(`/leader/projects/${projectId}/tasks`);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Cập nhật thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setError("");
        if (!taskData.title.trim())           return setError("Tiêu đề không được để trống.");
        if (!taskData.description.trim())     return setError("Mô tả không được để trống.");
        if (!taskData.priority)               return setError("Vui lòng chọn độ ưu tiên.");
        if (!taskData.dueDate)                return setError("Vui lòng chọn ngày hết hạn.");
        if (taskData.assignedTo?.length === 0) return setError("Chưa giao task cho thành viên nào.");
        if (taskData.todoChecklist?.length === 0) return setError("Checklist không được để trống.");

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
            console.error("Lỗi tải task:", error);
        }
    };

    const deleteTask = async () => {
        try {
            await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskID));
            setOpenDeleteAlert(false);
            toast.success("Đã xóa task");
            navigate(`/leader/projects/${projectId}/tasks`);
        } catch (error) {
            toast.error("Xóa task thất bại");
        }
    };

    useEffect(() => {
        fetchProjectMembers();
        if (taskID) getTaskDetailsByID();
    }, [taskID, projectId]);

    return (
        <DashBoardLayout activeMenu="Projects">
            <div className="mt-5">
                <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
                    <div className="form-card col-span-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-medium">
                                {taskID ? "Cập nhật Task" : "Tạo Task mới"}
                            </h2>
                            {taskID && (
                                <button
                                    className="flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-rose-300"
                                    onClick={() => setOpenDeleteAlert(true)}
                                >
                                    <LuTrash2 className="text-base" /> Xóa
                                </button>
                            )}
                        </div>

                        <div className="mt-4">
                            <label className="text-xs font-medium text-slate-600">Tiêu đề</label>
                            <input
                                placeholder="Nhập tiêu đề task..."
                                className="form-input"
                                value={taskData.title}
                                onChange={({ target }) => handleInputChange("title", target.value)}
                            />
                        </div>

                        <div className="mt-3">
                            <label className="text-xs font-medium text-slate-600">Mô tả</label>
                            <textarea
                                placeholder="Mô tả chi tiết task..."
                                className="form-input"
                                rows={4}
                                value={taskData.description}
                                onChange={({ target }) => handleInputChange("description", target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-12 gap-4 mt-2">
                            <div className="col-span-6 md:col-span-4">
                                <label className="text-xs font-medium text-slate-600">Độ ưu tiên</label>
                                <SelectDropdown
                                    options={PRIORITY_DATA}
                                    value={taskData.priority}
                                    onChange={(value) => handleInputChange("priority", value)}
                                    placeholder="Chọn độ ưu tiên"
                                />
                            </div>

                            <div className="col-span-6 md:col-span-4">
                                <label className="text-xs font-medium text-slate-600">Ngày hết hạn</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={taskData.dueDate || ""}
                                    onChange={({ target }) => handleInputChange("dueDate", target.value)}
                                />
                            </div>

                            <div className="col-span-12 md:col-span-4">
                                <label className="text-xs font-medium text-slate-600">
                                    Giao cho thành viên
                                </label>
                                {/* Truyền projectMembers để chỉ chọn member trong project */}
                                <SelectUsers
                                    selectedUsers={taskData.assignedTo}
                                    setSelectedUsers={(value) => handleInputChange("assignedTo", value)}
                                    projectMembers={projectMembers}
                                />
                            </div>
                        </div>

                        <div className="mt-3">
                            <label className="text-xs font-medium text-slate-600">TODO Checklist</label>
                            <TodoListInput
                                todoList={taskData.todoChecklist}
                                setTodoList={(value) => handleInputChange("todoChecklist", value)}
                                attachments={taskData.attachments}
                                setAttachments={(value) => handleInputChange("attachments", value)}
                            />
                        </div>

                        {error && (
                            <p className="text-xs font-medium text-red-500 mt-5">{error}</p>
                        )}

                        <div className="flex justify-end mt-7">
                            <button
                                className="add-btn"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading
                                    ? "Đang xử lý..."
                                    : taskID ? "CẬP NHẬT TASK" : "TẠO TASK"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={openDeleteAlert}
                onClose={() => setOpenDeleteAlert(false)}
                title="Xóa Task"
            >
                <DeleteAlert
                    content="Bạn chắc chắn muốn xóa task này?"
                    onDelete={deleteTask}
                    onCancel={() => setOpenDeleteAlert(false)}
                />
            </Modal>
        </DashBoardLayout>
    );
};

export default CreateTask;