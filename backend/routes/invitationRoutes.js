const express = require("express");
const router  = express.Router();

const {
    searchUsers,
    sendInvitation,
    getMyInvitations,
    acceptInvitation,
    declineInvitation,
    getProjectInvitations,
} = require("../controllers/invitationController");

const { protect, leaderOfProject } = require("../middleware/authMiddleware");

// Tất cả route đều cần đăng nhập 
router.use(protect);

// Tìm kiếm user theo email để mời 
router.get("/search", searchUsers);

// Gửi lời mời (leader dùng)
router.post("/", sendInvitation);

// Member xem lời mời đang chờ của mình
router.get("/my", getMyInvitations);

// Member accept hoặc decline
router.patch("/:id/accept",  acceptInvitation);
router.patch("/:id/decline", declineInvitation);

// Leader xem tất cả invite đã gửi cho project
// leaderOfProject dùng req.params.projectId nên đặt đúng param name
router.get("/project/:projectId", leaderOfProject, getProjectInvitations);

module.exports = router;