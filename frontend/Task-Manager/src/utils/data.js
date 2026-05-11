import {
    LuLayoutDashboard,
    LuUsers,
    LuClipboardCheck,
    LuFolderOpen,
    LuUserPlus,
    LuBell,
    LuSettings,
    LuLogOut,
} from "react-icons/lu";

// ==========================================
// 1. Sidebar cho Quản trị viên (Admin)
// ==========================================
export const SIDE_MENU_DATA = [
    {
        id: "01",
        label: "Tổng quan",
        icon: LuLayoutDashboard,
        path: "/admin/dashboard",
    },
    {
        id: "02",
        label: "Người dùng",
        icon: LuUsers,
        path: "/admin/users",
    },
    {
        id: "03",
        label: "Dự án hệ thống",
        icon: LuFolderOpen,
        path: "/admin/all-projects",
    },
    {
        id: "04",
        label: "Công việc hệ thống",
        icon: LuClipboardCheck,
        path: "/admin/tasks",
    },
    {
        id: "05",
        label: "Cài đặt",
        icon: LuSettings,
        path: "/settings",
    },
    {
        id: "06",
        label: "Đăng xuất",
        icon: LuLogOut,
        path: "logout",
    },
];

// ==========================================
// 2. Sidebar cho Trưởng nhóm (Leader)
// ==========================================
export const SIDE_MENU_LEADER_DATA = [
    {
        id: "01",
        label: "Tổng quan",
        icon: LuLayoutDashboard,
        path: "/leader/dashboard",
    },
    {
        id: "02",
        label: "Dự án quản lý",
        icon: LuFolderOpen,
        path: "/leader/projects",
    },
    {
        id: "03",
        label: "Cài đặt",
        icon: LuSettings,
        path: "/settings",
    },
    {
        id: "04",
        label: "Đăng xuất",
        icon: LuLogOut,
        path: "logout",
    },
];

// ==========================================
// 3. Sidebar cho Thành viên (User/Member)
// ==========================================
export const SIDE_MENU_USER_DATA = [
    {
        id: "01",
        label: "Tổng quan",
        icon: LuLayoutDashboard,
        path: "/user/dashboard",
    },
    {
        id: "02",
        label: "Công việc của tôi",
        icon: LuClipboardCheck,
        path: "/user/tasks",
    },
    {
        id: "03",
        label: "Lời mời",
        icon: LuBell,
        path: "/user/invitations",
    },
    {
        id: "04",
        label: "Tạo dự án mới",
        icon: LuUserPlus,
        path: "/user/create-project",
    },
    {
        id: "05",
        label: "Cài đặt",
        icon: LuSettings,
        path: "/settings",
    },
    {
        id: "06",
        label: "Đăng xuất",
        icon: LuLogOut,
        path: "logout",
    },
];

// ==========================================
// 4. Dữ liệu bổ trợ cho Tasks (Priority & Status)
// ==========================================

// Mức độ ưu tiên
export const PRIORITY_DATA = [
    { label: "Thấp",      value: "low"    },
    { label: "Trung bình", value: "medium" },
    { label: "Cao",       value: "high"   },
];

// Trạng thái công việc
export const STATUS_DATA = [
    { label: "Chờ xử lý",     value: "pending"     },
    { label: "Đang làm",      value: "in progress" },
    { label: "Hoàn thành",    value: "completed"   },
];