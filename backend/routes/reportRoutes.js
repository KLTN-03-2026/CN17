const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { exportTasksReport, exportUsersReport } = require("../controllers/reportControllers");
const router = express.Router();
router.get("/export/tasks", protect, adminOnly, exportTasksReport) ; // endpoint để xuất báo cáo công việc dưới dạng execl/PDF
router.get("/export/users", protect, adminOnly, exportUsersReport); // endpoint để xuất báo cáo người dùng dưới dạng execl/PDF

module.exports = router;