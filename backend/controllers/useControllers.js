const Task = require("../models/Task");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

//@decs goi tat ca nguoi dung 
//@route get /api/user
//@access private (chi admin moi co quyen truy cap)
const getUsers = async (req, res) => {
    try {
        const users = await User.find({role:"member"}).select("-password");       

        // add task count for each user
        const usersWithTaskCount = await Promise.all(users.map(async (user) => {
            const pendingTasks = await Task.countDocuments({ assignedTo: user._id , status: "pending" });
            const inProgresstTasks = await Task.countDocuments({ assignedTo: user._id , status: "in Progress" });
            const completedTasks = await Task.countDocuments({ assignedTo: user._id , status: "completed" });

        return {
            ...user._doc, // bao gom tat ca thong tin nguoi dung tru password
            pendingTasks , 
            inProgresstTasks ,
            completedTasks , 
        };
        }));
        res.json(usersWithTaskCount);

    } catch (error) {
        res.status(500).json({ message: "Loi server" , error: error.message });
    }
};
//@decs goi thong tin nguoi dung theo id
//@route get /api/user/:id
//@access private 
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "Nguoi dung khong ton tai" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Loi server" , error: error.message });
    }
};


module.exports = {
    getUsers,
    getUserById,
};