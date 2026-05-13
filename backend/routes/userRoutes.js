const express = require("express");
const router = express.Router();


const { 
    getUsers, 
    getUserById, 
    updateUser, 
    deleteUser, 
    toggleUserStatus 
} = require("../controllers/useControllers");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect);
router.use(adminOnly);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.put("/status/:id", toggleUserStatus);

module.exports = router;