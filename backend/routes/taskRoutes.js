const express = require("express");
const {protect , adminOnly} = require("../middleware/authMiddleware");
const { getDashboardData, getUserDashboardData , getTasks , getTaskById , createTask , updateTask, deleteTask , updateTaskStatus , updateTaskChecklist } = require("../controllers/taskControllers");

const router = express.Router();

// quan li task router

router.get("/dashboard-data" , protect , getDashboardData); 
router.get("/user-dashboard-data" , protect , getUserDashboardData); 
router.get("/", protect , getTasks); // lay danh sach tat ca task 
router.get("/:id", protect, getTaskById); // lay thong tin chi tiet cua task theo id
router.post("/" , protect , adminOnly,createTask); // tao task moi (chi admin moi dc tao)
router.put("/:id", protect, updateTask); // cap nhat thong tin task 
router.delete("/:id", protect, adminOnly, deleteTask); // xoa task 
router.put("/:id/status", protect, updateTaskStatus); // cap nhat trang thai task
router.put("/:id/todo", protect, updateTaskChecklist); // cap nhat cong viec con trong task

module.exports = router;