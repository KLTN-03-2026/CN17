import React, { useContext, useEffect, useState } from 'react'
import { useUserAuth } from '../../hooks/useUserAuth'
import { UserContext } from '../../context/userContext';
import DashBoardLayout from '../../components/layout/DashBoardLayout';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosIntance';
import { API_PATHS } from '../../utils/apiPaths';
import moment from 'moment';
import { addThouSandsSeparator } from '../../utils/helper';
import InfoCard from '../../components/cards/InfoCard';
import { LuArrowRight } from 'react-icons/lu';
import TaskListTable from '../../components/layout/TaskListTable';
import CustomPieCharts from '../../components/Charts/CustomPieCharts';
import CustomBarCharts from '../../components/Charts/CustomBarCharts';

const COLORS = ["#8D51FF", "#00B8DB", "#7BCE00"];

const UserDashboard = () => {
  useUserAuth();

  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({});
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  const prepareChartData = (data) => {
    const taskDistributionData = data?.taskDistribution || {};
    const taskPriorityLevels = data?.taskPrioritiesLevels || {};

    const taskDistribution = [
      { status: "pending",     count: taskDistributionData?.pending    || 0 },
      { status: "in progress", count: taskDistributionData?.inprogress || 0 },
      { status: "completed",   count: taskDistributionData?.completed  || 0 },
    ];
    setPieChartData(taskDistribution);

    const PriorityLevelsData = [
      { priority: "low",    count: taskPriorityLevels?.low    || 0 },
      { priority: "medium", count: taskPriorityLevels?.medium || 0 },
      { priority: "high",   count: taskPriorityLevels?.high   || 0 },
    ];
    setBarChartData(PriorityLevelsData);
  };

  const getDashboardData = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_USER_REPORTS_DATA);
      if (response.data) {
        setDashboardData(response.data);
        prepareChartData(response.data?.charts || null);
      }
    } catch (error) {
      console.log("Lỗi khi tải dữ liệu người dùng", error);
    }
  };

  const onSeeMore = () => {
    navigate('/user/tasks');
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  return (
    <DashBoardLayout activeMenu="Dashboard">
      <div className="card my-5">
        <div>
          <div className="col-span-3">
            <h2 className="text-xl md:text-2xl">
              Good Morning ! {user?.name}
            </h2>
            <p className="text-xs md:text-[13px] text-gray-400 mt-1.5">
              {moment().format('dddd, MMMM Do YYYY')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5">
          <InfoCard
            label="Total Tasks"
            value={addThouSandsSeparator(dashboardData?.charts?.taskDistribution?.All || 0)}
            color="bg-primary"
          />
          <InfoCard
            label="Pending Tasks"
            value={addThouSandsSeparator(dashboardData?.charts?.taskDistribution?.pending || 0)}
            color="bg-violet-500"
          />
          <InfoCard
            label="In Progress Tasks"
            value={addThouSandsSeparator(dashboardData?.charts?.taskDistribution?.inprogress || 0)}
            color="bg-cyan-500"
          />
          <InfoCard
            label="Completed Tasks"
            value={addThouSandsSeparator(dashboardData?.charts?.taskDistribution?.completed || 0)}
            color="bg-lime-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">
        <div>
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Task Distribution</h5>
            </div>
            <CustomPieCharts data={pieChartData} colors={COLORS} />
          </div>
        </div>

        <div>
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Task Priority Levels</h5>
            </div>
            <CustomBarCharts data={barChartData} colors={COLORS} />
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="text-lg">Recent Tasks</h5>
              <button className="card-btn" onClick={onSeeMore}>
                Xem tất cả <LuArrowRight className="text-base" />
              </button>
            </div>
            <TaskListTable tableData={dashboardData?.recentTasks || []} />
          </div>
        </div>
      </div>
    </DashBoardLayout>
  );
};

export default UserDashboard;