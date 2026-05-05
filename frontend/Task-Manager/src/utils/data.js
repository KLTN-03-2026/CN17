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

// Admin — chỉ thống kê + quản lý user
export const SIDE_MENU_DATA = [
    {
        id: "01",
        label: "Dashboard",
        icon: LuLayoutDashboard,
        path: "/admin/dashboard",
    },
    {
        id: "02",
        label: "All Users",
        icon: LuUsers,
        path: "/admin/users",
    },
    {
        id: "03",
        label: "Settings",
        icon: LuSettings,
        path: "/settings",
    },
    {
        id: "04",
        label: "Logout",
        icon: LuLogOut,
        path: "logout",
    },
];

// Leader — quản lý project + task
export const SIDE_MENU_LEADER_DATA = [
    {
        id: "01",
        label: "Dashboard",
        icon: LuLayoutDashboard,
        path: "/leader/dashboard",
    },
    {
        id: "02",
        label: "Projects",
        icon: LuFolderOpen,
        path: "/leader/projects",
    },
    {
        id: "03",
        label: "Settings",
        icon: LuSettings,
        path: "/settings",
    },
    {
        id: "04",
        label: "Logout",
        icon: LuLogOut,
        path: "logout",
    },
];

// Member — xem task + lời mời + tạo project (sẽ lên leader)
export const SIDE_MENU_USER_DATA = [
    {
        id: "01",
        label: "Dashboard",
        icon: LuLayoutDashboard,
        path: "/user/dashboard",
    },
    {
        id: "02",
        label: "My Tasks",
        icon: LuClipboardCheck,
        path: "/user/tasks",
    },
    {
        id: "03",
        label: "Invitations",
        icon: LuBell,
        path: "/user/invitations",
    },
    {
        id: "04",
        label: "Create Project",
        icon: LuUserPlus,
        path: "/user/create-project",
    },
    {
        id: "05",
        label: "Settings",
        icon: LuSettings,
        path: "/settings",
    },
    {
        id: "06",
        label: "Logout",
        icon: LuLogOut,
        path: "logout",
    },
];

export const PRIORITY_DATA = [
    { label: "Low",    value: "low"    },
    { label: "Medium", value: "medium" },
    { label: "High",   value: "high"   },
];

export const STATUS_DATA = [
    { label: "Pending",     value: "pending"     },
    { label: "In Progress", value: "in progress" },
    { label: "Completed",   value: "completed"   },
];