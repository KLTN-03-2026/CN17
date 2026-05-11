import React, { useEffect, useState } from 'react'
import DashBoardLayout from '../../components/layout/DashBoardLayout'
import axiosInstance from "../../utils/axiosIntance";
import { API_PATHS } from '../../utils/apiPaths';
import { LuFileSpreadsheet } from 'react-icons/lu';
import UserCard from '../../components/Cards/UserCard';
import toast from 'react-hot-toast';

const ManageUsers = () => { 
  const [allUsers, setAllUsers] = useState([]);

  const getAllUsers = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      if (response.data?.length > 0) {
        setAllUsers(response.data);
      } else {
        setAllUsers([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
      toast.error("Không thể tải danh sách người dùng");
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_USERS, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      // Đổi tên file tải về sang tiếng Việt
      link.setAttribute("download", "danh_sach_nguoi_dung.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Đang tải xuống báo cáo...");
    } catch (error) {
      toast.error("Tải xuống thất bại, vui lòng thử lại!");
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []); 

  return (
    <DashBoardLayout activeMenu="All Users">
      <div className="mt-5 mb-10">
        <div className="flex md:flex-row flex-col md:items-center justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">
            Quản lý người dùng
          </h2>
          <button 
            className="flex items-center justify-center gap-2 px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg transition-colors shadow-sm text-sm font-medium" 
            onClick={handleDownloadReport}
          >
            <LuFileSpreadsheet className="text-lg" /> 
            Xuất báo cáo Excel
          </button>
        </div>

        {allUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {allUsers.map((user) => (
              <UserCard
                key={user._id}
                userInfo={user}
                onUpdate={getAllUsers}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 mt-6">
            <p className="text-gray-500">Hiện chưa có người dùng nào trong hệ thống.</p>
          </div>
        )}
      </div>
    </DashBoardLayout>
  );
};

export default ManageUsers;