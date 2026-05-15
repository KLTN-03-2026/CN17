import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosIntance";
import { API_PATHS, BASE_URL } from "../../utils/apiPaths";
import DashBoardLayout from "../../components/layout/DashBoardLayout";
import AvatarGroup from "../../components/AvatarGroup";
import moment from "moment";
import "moment/locale/vi";
import {
  LuSquareArrowOutUpRight,
  LuPlus,
  LuTrash2,
  LuCircleDot,
  LuCircle,
  LuUpload,
} from "react-icons/lu";
import { useUserAuth } from "../../hooks/useUserAuth";
import toast from "react-hot-toast";

moment.locale("vi");

const ViewTaskDetails = () => {
  useUserAuth();

  const { id } = useParams();

  const [task, setTask] = useState(null);
  const [newSubTask, setNewSubTask] = useState("");
  const [adding, setAdding] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [uploading, setUploading] = useState(false);

  const getStatusLabel = (status) => {
    switch (status) {
      case "in progress":
        return "Đang thực hiện";
      case "completed":
        return "Hoàn thành";
      case "overdue":
        return "Quá hạn";
      default:
        return "Chờ xử lý";
    }
  };

  const getStatusTagColor = (status) => {
    switch (status) {
      case "in progress":
        return "text-cyan-500 bg-cyan-50 border border-cyan-500/10";
      case "completed":
        return "text-lime-500 bg-lime-50 border border-lime-500/20";
      case "overdue":
        return "text-red-500 bg-red-50 border border-red-200";
      default:
        return "text-violet-500 bg-violet-50 border border-violet-500/10";
    }
  };

  const getTaskDetailsByID = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_TASK_BY_ID(id)
      );

      if (response.data) {
        setTask(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết công việc:", error);
      toast.error("Không thể tải chi tiết công việc");
    }
  };

  const updateTodoChecklist = async (index) => {
    if (task?.status === "overdue") {
      toast.error("Công việc đã quá hạn, không thể cập nhật");
      return;
    }

    const todoChecklist = [...(task?.todoChecklist || [])];

    if (todoChecklist[index]) {
      todoChecklist[index].completed = !todoChecklist[index].completed;

      try {
        const response = await axiosInstance.put(
          API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(id),
          { todoChecklist }
        );

        if (response.status === 200) {
          setTask(response.data?.task || task);
        } else {
          todoChecklist[index].completed = !todoChecklist[index].completed;
        }
      } catch (error) {
        todoChecklist[index].completed = !todoChecklist[index].completed;
        toast.error("Cập nhật thất bại");
      }
    }
  };

  const handleAddSubTask = async () => {
    if (!newSubTask.trim()) return;

    if (task?.status === "overdue") {
      toast.error("Công việc đã quá hạn, không thể thêm công việc con");
      return;
    }

    setAdding(true);

    try {
      const todoChecklist = [
        ...(task?.todoChecklist || []),
        {
          text: newSubTask.trim(),
          completed: false,
        },
      ];

      const response = await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(id),
        { todoChecklist }
      );

      if (response.status === 200) {
        setTask(response.data?.task || task);
        setNewSubTask("");
        setShowInput(false);
        toast.success("Đã thêm công việc con!");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Thêm thất bại");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteSubTask = async (index) => {
    if (task?.status === "overdue") {
      toast.error("Công việc đã quá hạn, không thể xóa");
      return;
    }

    try {
      const todoChecklist = task?.todoChecklist?.filter((_, i) => i !== index);

      const response = await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(id),
        { todoChecklist }
      );

      if (response.status === 200) {
        setTask(response.data?.task || task);
        toast.success("Đã xóa công việc con");
      }
    } catch (error) {
      toast.error("Xóa thất bại");
    }
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosInstance.post(
        `/api/tasks/${id}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setTask(response.data.task);
        toast.success("Tải file lên thành công");
      }
    } catch (error) {
      console.error("Upload file error:", error);

      toast.error(
        error?.response?.data?.message || "Upload file thất bại"
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const openAttachment = (file) => {
    if (!file?.fileUrl) return;

    window.open(`${BASE_URL}${file.fileUrl}`, "_blank");
  };

  useEffect(() => {
    if (id) {
      getTaskDetailsByID();
    }
  }, [id]);

  const totalSub = task?.todoChecklist?.length || 0;

  const completedSub =
    task?.todoChecklist?.filter((i) => i.completed).length || 0;

  const progress =
    totalSub > 0 ? Math.round((completedSub / totalSub) * 100) : 0;

  return (
    <DashBoardLayout activeMenu="My Tasks">
      <div className="mt-5">
        {task && (
          <div className="grid grid-cols-1 md:grid-cols-4 mt-4 gap-4">
            <div className="form-card col-span-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm md:text-xl font-medium">
                  {task?.title}
                </h2>

                <div
                  className={`text-[11px] md:text-[13px] font-medium ${getStatusTagColor(
                    task?.status
                  )} px-4 py-0.5 rounded`}
                >
                  {getStatusLabel(task?.status)}
                </div>
              </div>

              <div className="mt-4">
                <InfoBox label="Mô tả" value={task?.description} />
              </div>

              <div className="grid grid-cols-12 gap-4 mt-4">
                <div className="col-span-6 md:col-span-4">
                  <InfoBox
                    label="Mức độ ưu tiên"
                    value={
                      task?.priority === "high"
                        ? "Cao"
                        : task?.priority === "medium"
                        ? "Trung bình"
                        : "Thấp"
                    }
                  />
                </div>

                <div className="col-span-6 md:col-span-4">
                  <InfoBox
                    label="Hạn chót"
                    value={
                      task?.dueDate
                        ? moment(task?.dueDate).format("DD [Tháng] MM, YYYY")
                        : "Chưa thiết lập"
                    }
                  />
                </div>

                <div className="col-span-6 md:col-span-4">
                  <label className="text-xs font-medium text-slate-500">
                    Người thực hiện
                  </label>

                  <AvatarGroup
                    avatars={
                      task?.assignedTo?.map(
                        (item) => item?.profileImageUrl
                      ) || []
                    }
                    maxVisible={5}
                  />
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-medium text-slate-500">
                    Tài liệu đính kèm
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-primary bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                    <LuUpload className="text-sm" />

                    {uploading ? "Đang tải..." : "Tải file"}

                    <input
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
                      onChange={handleUploadFile}
                      disabled={uploading}
                    />
                  </label>
                </div>

                {task?.attachments?.length > 0 ? (
                  <div>
                    {task.attachments.map((file, index) => (
                      <Attachment
                        key={`file_${file?._id || index}`}
                        file={file}
                        index={index}
                        onClick={() => openAttachment(file)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-3 py-3">
                    Chưa có tài liệu đính kèm.
                  </p>
                )}
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-slate-500">
                      Công việc con
                    </label>

                    {totalSub > 0 && (
                      <span className="text-xs text-gray-400">
                        {completedSub}/{totalSub} hoàn thành
                      </span>
                    )}
                  </div>

                  {task?.status !== "overdue" && (
                    <button
                      className="flex items-center gap-1 text-xs font-medium text-primary bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                      onClick={() => setShowInput((v) => !v)}
                    >
                      <LuPlus className="text-sm" />
                      Thêm việc con
                    </button>
                  )}
                </div>

                {totalSub > 0 && (
                  <div className="mb-3">
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <p className="text-[10px] text-gray-400 mt-1 text-right">
                      Tiến độ: {progress}%
                    </p>
                  </div>
                )}

                {showInput && (
                  <div className="flex items-center gap-2 mb-3 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                    <input
                      type="text"
                      value={newSubTask}
                      onChange={(e) => setNewSubTask(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAddSubTask()
                      }
                      placeholder="Nhập tên công việc con..."
                      className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
                      autoFocus
                    />

                    <button
                      className="text-xs font-medium text-white bg-primary px-3 py-1.5 rounded-lg disabled:opacity-50"
                      onClick={handleAddSubTask}
                      disabled={adding || !newSubTask.trim()}
                    >
                      {adding ? "Đang lưu..." : "Thêm"}
                    </button>

                    <button
                      className="text-xs text-gray-400 hover:text-gray-600"
                      onClick={() => {
                        setShowInput(false);
                        setNewSubTask("");
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                )}

                {task?.todoChecklist?.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">
                    Chưa có công việc con nào. Nhấn "+ Thêm việc con" để bắt đầu.
                  </p>
                )}

                {task?.todoChecklist?.map((item, index) => (
                  <div
                    key={`todo_${index}`}
                    className="group flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <button
                      onClick={() => updateTodoChecklist(index)}
                      className="shrink-0 text-lg"
                    >
                      {item.completed ? (
                        <LuCircleDot className="text-lime-500" />
                      ) : (
                        <LuCircle className="text-gray-300 hover:text-primary transition-colors" />
                      )}
                    </button>

                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-[10px] text-gray-300 font-semibold shrink-0">
                        {index < 9 ? `0${index + 1}` : index + 1}
                      </span>

                      <p
                        className={`text-[13px] ${
                          item.completed
                            ? "line-through text-slate-400"
                            : "text-gray-800"
                        }`}
                      >
                        {item.text}
                      </p>
                    </div>

                    {task?.status !== "overdue" && (
                      <button
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
                        onClick={() => handleDeleteSubTask(index)}
                      >
                        <LuTrash2 className="text-sm" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashBoardLayout>
  );
};

export default ViewTaskDetails;

const InfoBox = ({ label, value }) => (
  <div className="mb-2">
    <label className="text-xs font-medium text-slate-500">
      {label}
    </label>

    <p className="text-[12px] md:text-[13px] font-medium text-gray-700 mt-0.5">
      {value || "Trống"}
    </p>
  </div>
);

const Attachment = ({ file, index, onClick }) => {
  const fileSize = file?.fileSize
    ? `${(file.fileSize / 1024).toFixed(1)} KB`
    : "";

  return (
    <div
      className="flex justify-between bg-gray-50 border border-gray-100 px-3 py-2 rounded-md mb-2 mt-2 cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={onClick}
    >
      <div className="flex-1 flex items-center gap-3 overflow-hidden">
        <span className="text-xs text-gray-400 font-semibold mr-2 shrink-0">
          {index < 9 ? `0${index + 1}` : index + 1}
        </span>

        <div className="overflow-hidden">
          <p className="text-xs text-blue-600 truncate font-medium">
            {file?.originalName || file?.fileName || "Tệp đính kèm"}
          </p>

          {fileSize && (
            <p className="text-[10px] text-gray-400">
              {fileSize}
            </p>
          )}
        </div>
      </div>

      <LuSquareArrowOutUpRight className="text-gray-400 shrink-0" />
    </div>
  );
};