const express = require("express");
const router  = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
    getDashboardData,
    getUserDashboardData,
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
} = require("../controllers/taskController");

// Dashboard
router.get("/dashboard-data",      protect, getDashboardData);
router.get("/user-dashboard-data", protect, getUserDashboardData);

// CRUD task
router.get("/",    protect, getTasks);
router.get("/:id", protect, getTaskById);
router.post("/",   protect, createTask);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

// Cập nhật trạng thái & checklist
router.put("/:id/status", protect, updateTaskStatus);
router.put("/:id/todo",   protect, updateTaskChecklist);

module.exports = router;