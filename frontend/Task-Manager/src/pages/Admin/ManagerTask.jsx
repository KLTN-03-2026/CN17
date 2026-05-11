import React, { useEffect, useState, useCallback } from 'react'
import DashBoardLayout from '../../components/layout/DashBoardLayout'
import { useNavigate } from 'react-router-dom';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosIntance';
import { LuFileSpreadsheet, LuLayoutGrid } from 'react-icons/lu';
import TaskStatusTabs from '../../components/TaskStatusTabs';
import TaskCard from '../../components/Cards/TaskCard';
import toast from "react-hot-toast";

const ManagerTask = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getAllTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params: {
          status: filterStatus === "all" ? "" : 
                  filterStatus === "in-progress" ? "in progress" : 
                  filterStatus,
        },
      });
      const tasksFromServer = response.data?.tasks || [];
      const summary = response.data?.summary || {};
      
      setAllTasks(tasksFromServer);
      const statusArray = [
        { label: "Tất cả",    value: "all",         count: summary.all || 0 },
        { label: "Đang chờ",   value: "pending",     count: summary.pendingTasks || 0 },
        { label: "Đang làm",   value: "in-progress", count: summary.inProgressTasks || 0 },
        { label: "Hoàn thành", value: "completed",   count: summary.completedTasks || 0 },
      ];
      setTabs(statusArray);

    } catch (error) {
      console.error("Lỗi:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    getAllTasks();
  }, [getAllTasks]);

  const handleDownloadReport = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_TASKS, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `bao_cao_cong_viec.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Đang tải báo cáo...");
    } catch (error) {
      toast.error("Lỗi xuất file Excel");
    }
  };

  return (
    <DashBoardLayout activeMenu="manager-task">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">
              Quản lý công việc hệ thống
            </h2>
            <p className="text-xs text-gray-400 mt-1">Admin kiểm soát toàn bộ công việc trong hệ thống.</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {tabs?.length > 0 && (
              <TaskStatusTabs
                tabs={tabs}
                activeTab={filterStatus}
                setActiveTab={setFilterStatus}
              />
            )}

            <button
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-md text-sm font-medium"
              onClick={handleDownloadReport}
            >
              <LuFileSpreadsheet className="text-lg" />
              Xuất báo cáo Excel
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
             <p className="text-gray-400 text-sm mt-4">Đang kết nối dữ liệu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTasks.length > 0 ? (
              allTasks.map((item) => (
                <TaskCard
                  key={item._id}
                  title={item.title}
                  description={item.description}
                  priority={item.priority}
                  status={item.status}
                  progress={item.progress}
                  createdAt={item.createdAt}
                  dueDate={item.dueDate}
                  assignedTo={item.assignedTo || []}
                  attachments={item.attachments?.length || 0}
                  completedTodoCount={
                    item.todoChecklist?.filter((t) => t.completed).length || 0
                  }
                  todoChecklist={item.todoChecklist || []}
                  projectName={item.project?.name}
                  onClick={() => navigate(`/admin/create-task`, { state: { taskID: item._id } })}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-sm">
                <LuLayoutGrid size={40} className="text-gray-200 mb-4" />
                <p className="text-gray-400 font-medium">Không có công việc nào để hiển thị.</p>
                <button 
                  onClick={() => setFilterStatus("all")}
                  className="mt-2 text-primary text-sm font-bold hover:underline"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashBoardLayout>
  );
};

export default ManagerTask;