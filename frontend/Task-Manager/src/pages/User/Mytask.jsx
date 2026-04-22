import React, { useEffect, useState, useCallback } from 'react'
import DashBoardLayout from '../../components/layout/DashBoardLayout'
import { useNavigate } from 'react-router-dom';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosIntance';
import TaskStatusTabs from '../../components/TaskStatusTabs';
import TaskCard from '../../components/Cards/TaskCard';

const Mytask = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

  const getAllTasks = useCallback(async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params: {
          status: filterStatus === "all" ? "" :
                  filterStatus === "in-progress" ? "in progress" :
                  filterStatus,
        },
      });

      setAllTasks(response.data?.tasks?.length > 0 ? response.data.tasks : []);

      const summaryResponse = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params: { status: "" },
      });

      const summary = summaryResponse.data?.summary || {};

      const statusArray = [
        { label: "all",         count: summary.all || 0 },
        { label: "pending",     count: summary.pendingTasks || 0 },
        { label: "in-progress", count: summary.inProgressTasks || 0 },
        { label: "completed",   count: summary.completedTasks || 0 },
      ];

      setTabs(statusArray);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, [filterStatus]);

  const handleClick = (taskData) => {
    navigate(`/user/task-details/${taskData._id}`); 
  };

  useEffect(() => {
    getAllTasks();
  }, [getAllTasks]);

  return (
    <DashBoardLayout activeMenu="My Tasks"> 
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">

          <h2 className="text-xl md:text-xl font-medium">
            My Tasks
          </h2>

          <div className="flex items-center gap-3">
            {tabs?.some(t => t.count > 0) && (
              <TaskStatusTabs
                tabs={tabs}
                activeTab={filterStatus}
                setActiveTab={setFilterStatus}
              />
            )}
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {allTasks?.length > 0 ? (
            allTasks.map((item) => (
              <TaskCard
                key={item._id}
                title={item.title}
                description={item.description}
                priority={item.priority}
                status={item.status}
                progress={item.progress}
                createAt={item.createdAt}
                dueDate={item.dueDate}
                assignedTo={item.assignedTo?.map((u) => u.profileImageUrl)}
                attachments={item.attachments?.length || 0}
                completedTodoCount={
                  item.todoChecklist?.filter((t) => t.completed).length || 0
                }
                todoChecklist={item.todoChecklist || []}
                onClick={() => handleClick(item)}
              />
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-400 mt-10">
              Không có task nào.
            </div>
          )}
        </div>

      </div>
    </DashBoardLayout>
  );
};

export default Mytask;