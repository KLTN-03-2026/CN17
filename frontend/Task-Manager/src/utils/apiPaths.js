export const BASE_URL = "http://localhost:8000";

// utils/apiPaths.js
export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register", // Đăng ký người dùng mới (Admin hoặc Thành viên)
    LOGIN: "/api/auth/login", // Xác thực người dùng và trả về mã JWT token
    GET_PROFILE: "/api/auth/profile", // Lấy thông tin chi tiết của người dùng đang đăng nhập
  },

  USERS: {
    GET_ALL_USERS: "/api/users", // Lấy danh sách tất cả người dùng (Chỉ dành cho Admin)
    GET_USER_BY_ID: (userId) => `/api/users/${userId}`, // Lấy thông tin người dùng theo ID
    CREATE_USER: "/api/users", // Tạo người dùng mới (Chỉ dành cho Admin)
    UPDATE_USER: (userId) => `/api/users/${userId}`, // Cập nhật thông tin người dùng
    DELETE_USER: (userId) => `/api/users/${userId}`, // Xóa một người dùng
  },

  TASKS: {
    GET_REPORTS_DATA: "/api/tasks/dashboard-data", // Lấy dữ liệu cho bảng điều khiển (Dashboard)
    GET_USER_REPORTS_DATA: "/api/tasks/user-dashboard-data", // Lấy dữ liệu Dashboard cho người dùng
    GET_ALL_TASKS: "/api/tasks", // Lấy tất cả công việc (Admin: tất cả, User: chỉ công việc được giao)
    GET_TASK_BY_ID: (taskId) => `/api/tasks/${taskId}`, // Lấy thông tin công việc theo ID
    CREATE_TASK: "/api/tasks", // Tạo công việc mới (Chỉ dành cho Admin)
    UPDATE_TASK: (taskId) => `/api/tasks/${taskId}`, // Cập nhật chi tiết công việc
    DELETE_TASK: (taskId) => `/api/tasks/${taskId}`, // Xóa một công việc (Chỉ dành cho Admin)

    UPDATE_TASK_STATUS: (taskId) => `/api/tasks/${taskId}/status`, // Cập nhật trạng thái công việc
    UPDATE_TODO_CHECKLIST: (taskId) => `/api/tasks/${taskId}/todo`, // Cập nhật danh sách việc cần làm (todo checklist)
  },

  REPORTS: {
    EXPORT_TASKS: "/api/reports/export/tasks", // Tải xuống báo cáo tất cả công việc (Excel/PDF)
    EXPORT_USERS: "/api/reports/export/users", // Tải xuống báo cáo công việc của người dùng
  },

  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image", // Tải lên hình ảnh
  },
};