export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
    AUTH: {
        REGISTER:    "/api/auth/register",
        LOGIN:       "/api/auth/login",
        GET_PROFILE: "/api/auth/profile",
        UPDATE_PROFILE: "/api/auth/profile",
    },

    USERS: {
        GET_ALL_USERS:  "/api/users",
        GET_USER_BY_ID: (userId) => `/api/users/${userId}`,
        CREATE_USER:    "/api/users",
        UPDATE_USER:    (userId) => `/api/users/${userId}`,
        DELETE_USER:    (userId) => `/api/users/${userId}`,
    },

    PROJECTS: {
        GET_MY_PROJECTS:    "/api/projects",                                    // leader + member
        GET_ALL_PROJECTS:   "/api/projects/all",                                // admin only
        GET_PROJECT_BY_ID:  (projectId) => `/api/projects/${projectId}`,
        CREATE_PROJECT:     "/api/projects",                                    // member → lên leader
        UPDATE_PROJECT:     (projectId) => `/api/projects/${projectId}`,
        DELETE_PROJECT:     (projectId) => `/api/projects/${projectId}`,
        REMOVE_MEMBER:      (projectId, userId) => `/api/projects/${projectId}/members/${userId}`,
    },

    INVITATIONS: {
        SEARCH_USERS:           "/api/invitations/search",                      // ?email=xxx
        SEND_INVITATION:        "/api/invitations",
        GET_MY_INVITATIONS:     "/api/invitations/my",
        ACCEPT_INVITATION:      (id) => `/api/invitations/${id}/accept`,
        DECLINE_INVITATION:     (id) => `/api/invitations/${id}/decline`,
        GET_PROJECT_INVITATIONS:(projectId) => `/api/invitations/project/${projectId}`,
    },

    TASKS: {
        GET_DASHBOARD_DATA:      "/api/tasks/dashboard-data",       // ?projectId=xxx (leader)
        GET_USER_DASHBOARD_DATA: "/api/tasks/user-dashboard-data",  // ?projectId=xxx (member)
        GET_ALL_TASKS:           "/api/tasks",                       // ?projectId=xxx&status=xxx
        GET_TASK_BY_ID:          (taskId) => `/api/tasks/${taskId}`,
        CREATE_TASK:             "/api/tasks",
        UPDATE_TASK:             (taskId) => `/api/tasks/${taskId}`,
        DELETE_TASK:             (taskId) => `/api/tasks/${taskId}`,
        UPDATE_TASK_STATUS:      (taskId) => `/api/tasks/${taskId}/status`,
        UPDATE_TODO_CHECKLIST:   (taskId) => `/api/tasks/${taskId}/todo`,
    },

    REPORTS: {
        EXPORT_TASKS: "/api/reports/export/tasks", // ?projectId=xxx
        EXPORT_USERS: "/api/reports/export/users",
    },

    IMAGE: {
        UPLOAD_IMAGE: "/api/auth/upload-image",
    },
};