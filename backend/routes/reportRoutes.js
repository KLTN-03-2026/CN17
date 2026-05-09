const express = require("express");
const { protect, adminOnly, leaderOfProject } = require("../middleware/authMiddleware");
const { exportTasksReport, exportUsersReport, exportProjectMembersReport } = require("../controllers/reportControllers");

const router = express.Router();

// Admin: xuất báo cáo toàn hệ thống
router.get("/export/tasks", protect, adminOnly, exportTasksReport);
router.get("/export/users", protect, adminOnly, exportUsersReport);

// Leader: xuất báo cáo thành viên trong project của mình

router.get("/export/project-members", protect, exportProjectMembersReport);

module.exports = router;