import React, { useState, useEffect } from 'react'
import DashBoardLayout from '../../components/layout/DashBoardLayout'
import { PRIORITY_DATA } from "../../utils/data"; 
import axiosInstance from "../../utils/axiosIntance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from 'react-router-dom';
import moment from "moment";
import { LuTrash2 } from "react-icons/lu";
import SelectDropdown from '../../components/Inputs/SelectDropdown';
import SelectUsers from '../../components/Inputs/SelectUsers';
import TodoListInput from '../../components/Inputs/TodoListInput'; 
import DeleteAlert from '../../components/DeleteAlert';
import Modal from '../../components/Modal';

const CreateTask = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const { taskID } = location.state || {};

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "",
    dueDate: null,
    assignedTo: [],
    todoChecklist: [],
    attachments: [],
  });

  const [currentTask, setCurrentTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  const handleInputChange = (key, value) => {
    setTaskData((prevData) => ({ ...prevData, [key]: value }));
  };

  const clearData = () => {
    setTaskData({
      title: "",
      description: "",
      priority: "",
      dueDate: null,
      assignedTo: [],
      todoChecklist: [],
      attachments: [],
    });
  };

  // Tạo công việc mới
  const createTask = async () => {
    setLoading(true);
    try {
      const todolist = taskData.todoChecklist?.map((item) => ({
        text: item,
        completed: false,
      }));

      await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, {
        ...taskData,
        dueDate: new Date(taskData.dueDate).toISOString(),
        todoChecklist: todolist,
      });

      toast.success("Đã tạo công việc thành công");
      clearData();
      navigate('/admin/tasks');
    } catch (error) {   
      console.error("Lỗi khi tạo công việc:", error);
      toast.error("Không thể tạo công việc. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật công việc
  const updateTask = async () => {
    setLoading(true);
    try {
      const todolist = taskData.todoChecklist?.map((item) => {
        const prevTodoChecklist = currentTask?.todoChecklist || [];
        const matchedTask = prevTodoChecklist.find((task) => task.text === item);
        return {
          text: item,
          completed: matchedTask ? matchedTask.completed : false,
        };
      });
      await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TASK(taskID),
        {
          ...taskData,
          dueDate: new Date(taskData.dueDate).toISOString(),
          todoChecklist: todolist,
        }
      );
      toast.success("Cập nhật công việc thành công");
      navigate('/admin/tasks');
    } catch (error) {
      console.error("Lỗi khi cập nhật công việc:", error);
      toast.error("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!taskData.title.trim()) {
      setError("Vui lòng nhập tiêu đề công việc.");
      return;
    }
    if (!taskData.description.trim()) {
      setError("Vui lòng nhập mô tả công việc.");
      return;
    }
    if (!taskData.priority) {
      setError("Vui lòng chọn mức độ ưu tiên.");
      return;
    }
    if (!taskData.dueDate) {
      setError("Vui lòng chọn ngày hạn chót.");
      return;
    }
    if (taskData.assignedTo?.length === 0) {
      setError("Vui lòng giao việc cho ít nhất một thành viên.");
      return;
    }
    if (taskData.todoChecklist?.length === 0) {
      setError("Danh sách Checklist không được để trống.");
      return;
    }
    if (taskID) {
      updateTask();
      return;
    }
    createTask();
  };

  // Lấy chi tiết công việc theo ID
  const getTaskDetailsByID = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_TASK_BY_ID(taskID)
      );

      if (response.data) {
        const taskInfo = response.data;
        setCurrentTask(taskInfo);

        setTaskData((prevState) => ({
          ...prevState,
          title: taskInfo.title,
          description: taskInfo.description,
          priority: taskInfo.priority,
          dueDate: taskInfo.dueDate
            ? moment(taskInfo.dueDate).format("YYYY-MM-DD")
            : null,
          assignedTo: taskInfo?.assignedTo?.map((item) => item?._id) || [],
          todoChecklist:
            taskInfo?.todoChecklist?.map((item) => item?.text) || [],
          attachments: taskInfo?.attachments || [],
        }));
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin công việc", error);
    }
  };

  // Xóa công việc
  const deleteTask = async () => {
    try {
      await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskID));
      setOpenDeleteAlert(false);
      toast.success("Đã xóa công việc thành công");
      navigate('/admin/tasks');
    } catch (error){
      console.error("Có lỗi khi xóa công việc" , 
        error.response?.data?.message || error.message
      );
      toast.error("Xóa công việc thất bại");
    }
  };

  useEffect(() => {
    if (taskID) {
      getTaskDetailsByID();
    }
  }, [taskID]);

  return (
    <DashBoardLayout activeMenu="Create Task">
      <div className="mt-5">
        <div className="grid grid-cols-1 md:grid-cols-4 mt-4 gap-6">
          <div className="form-card col-span-1 md:col-span-3 shadow-sm">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {taskID ? "Cập nhật công việc" : "Tạo công việc mới"}
              </h2>
              {taskID && (
                <button
                  className="flex items-center gap-1.5 text-[13px] font-bold text-rose-600 bg-rose-50 rounded-lg px-3 py-1.5 border border-rose-100 hover:bg-rose-100 transition-colors cursor-pointer"
                  onClick={() => setOpenDeleteAlert(true)}
                >
                  <LuTrash2 className="text-base" /> Xóa
                </button>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Tiêu đề công việc</label>
                <input
                  placeholder="Ví dụ: Triển khai hạ tầng máy chủ..."
                  className="form-input w-full border-gray-200 focus:border-primary transition-all"
                  value={taskData.title}
                  onChange={({ target }) => handleInputChange("title", target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Mô tả</label>
                <textarea
                  placeholder="Nhập mô tả chi tiết các yêu cầu..."
                  className="form-input w-full border-gray-200 focus:border-primary transition-all resize-none"
                  rows={4}
                  value={taskData.description}
                  onChange={({ target }) => handleInputChange("description", target.value)}
                />
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Độ ưu tiên</label>
                  <SelectDropdown
                    options={PRIORITY_DATA}
                    value={taskData.priority}
                    onChange={(value) => handleInputChange("priority", value)}
                    placeholder="Chọn mức độ"
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Hạn chót</label>
                  <input
                    className="form-input w-full border-gray-200 focus:border-primary transition-all"
                    value={taskData.dueDate || ""}
                    onChange={({ target }) => handleInputChange("dueDate", target.value)}
                    type="date"
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Giao cho thành viên</label>
                  <SelectUsers
                    selectedUsers={taskData.assignedTo}
                    setSelectedUsers={(value) => handleInputChange("assignedTo", value)}
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
                  ⚠️ {error}
                </p>
              </div>
            )}

            <div className="flex justify-end mt-10">
              <button
                className="add-btn px-10 py-3 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading 
                  ? "ĐANG XỬ LÝ..." 
                  : taskID ? "CẬP NHẬT CÔNG VIỆC" : "TẠO CÔNG VIỆC"}
              </button>
            </div>

          </div>
        </div>
      </div>

      <Modal
        isOpen={openDeleteAlert}
        onClose={() => setOpenDeleteAlert(false)}
        title="Xác nhận xóa"
      >
        <DeleteAlert
          content="Bạn có chắc chắn muốn xóa công việc này không? Hành động này không thể hoàn tác."
          onDelete={() => deleteTask()}
          onCancel={() => setOpenDeleteAlert(false)}
        />
      </Modal>

    </DashBoardLayout>
  );
};

export default CreateTask;