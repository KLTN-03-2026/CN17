const express = require("express");
const router  = express.Router();

const { protect } = require("../middleware/authMiddleware");


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

// Dashboard — leader xem theo project, member xem task của mình
router.get("/dashboard-data",      protect, getDashboardData);
router.get("/user-dashboard-data", protect, getUserDashboardData);

// CRUD task
router.get("/",    protect, getTasks);           // leader: tất cả task trong project | member: task của mình
router.get("/:id", protect, getTaskById);        // leader hoặc member được giao
router.post("/",   protect, createTask);         // chỉ leader (kiểm tra trong controller)
router.put("/:id", protect, updateTask);         // chỉ leader (kiểm tra trong controller)
router.delete("/:id", protect, deleteTask);      // chỉ leader (kiểm tra trong controller)

// Cập nhật trạng thái & checklist — leader hoặc member được giao
router.put("/:id/status", protect, updateTaskStatus);
router.put("/:id/todo",   protect, updateTaskChecklist);

module.exports = router;