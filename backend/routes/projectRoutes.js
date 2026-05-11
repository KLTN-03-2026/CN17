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

const { 
    protect, 
    adminOnly, 
    leaderOfProject, 
    memberOfProject 
} = require("../middleware/authMiddleware");


router.use(protect);
router.post("/", createProject);
router.get("/", getMyProjects);
router.get("/all", adminOnly, getAllProjects);
router.get("/:projectId", memberOfProject, getProjectById);
router.put("/:projectId", leaderOfProject, updateProject);
router.delete("/:projectId", leaderOfProject, deleteProject);
router.delete("/:projectId/members/:userId", leaderOfProject, removeMember);

module.exports = router;