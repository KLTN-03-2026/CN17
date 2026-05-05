const express = require("express");
const router  = express.Router();

const {
    createProject,
    getMyProjects,
    getProjectById,
    updateProject,
    deleteProject,
    removeMember,
    getAllProjects,
} = require("../controllers/projectController");

const { protect, adminOnly, leaderOfProject, memberOfProject } = require("../middleware/authMiddleware");

// Tất cả route đều cần đăng nhập 
router.use(protect);

// Tạo project -> member tạo sẽ thành leader
router.post("/", createProject);

// Lấy project của user hiện tại (leader hoặc member)
router.get("/", getMyProjects);

// Admin xem tất cả project
router.get("/all", adminOnly, getAllProjects);

// Chi tiết project — phải là thành viên hoặc leader
router.get("/:projectId", memberOfProject, getProjectById);

// Sửa / xóa project — chỉ leader của project đó
router.put("/:projectId",                   leaderOfProject, updateProject);
router.delete("/:projectId",                leaderOfProject, deleteProject);

// Kick member — chỉ leader của project đó
router.delete("/:projectId/members/:userId", leaderOfProject, removeMember);

module.exports = router;