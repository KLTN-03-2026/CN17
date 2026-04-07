
const Task = require("../models/Task");

// @desc    Lay danh sach tat ca task
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};

        // 1. Phân quyền truy cập dữ liệu
        if (req.user.role !== "admin") {
            filter.assignedTo = req.user._id;
        }

        // 2. Lọc theo status nếu có trong query
        if (status) {
            filter.status = status;
        }

        // 3. Lấy danh sách tasks
        let tasks = await Task.find(filter)
            .populate("assignedTo", "name email profileImageUrl")
            .lean(); // Dùng .lean() để tăng tốc độ và lấy object JS thuần

        // 4. Tính toán số checklist đã hoàn thành
        const tasksWithCount = tasks.map((task) => {
            const completedCount = task.todoChecklist 
                ? task.todoChecklist.filter((item) => item.completed).length 
                : 0;

            return {
                ...task,
                completedChecklistCount: completedCount,
            };
        });

        // 5. Tối ưu Summary bằng cách sử dụng Aggregate (Chỉ quét DB 1 lần)
        const summaryFilter = req.user.role === "admin" ? {} : { assignedTo: req.user._id };
        const stats = await Task.aggregate([
            { $match: summaryFilter },
            {
                $group: {
                    _id: null,
                    all: { $sum: 1 },
                    pendingTasks: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                    inProgressTasks: { $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] } },
                    completedTasks: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } }
                }
            }
        ]);

        const summary = stats.length > 0 ? stats[0] : { all: 0, pendingTasks: 0, inProgressTasks: 0, completedTasks: 0 };
        delete summary._id; // Xóa field _id không cần thiết

        res.json({
            tasks: tasksWithCount,
            summary
        });

    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};
// @desc    Lay thong tin chi tiet cua task theo id
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        if (!task) {
            return res.status(404).json({ message: "Task không tồn tại" });
        }
        res.json(task);
    } catch (error) {
         res.status(500).json({ message: "Loi server" , error: error.message});
    }
};

// @desc    Tao task moi
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
    try {
        const { 
            title, 
            description, 
            priority,
            dueDate,
            assignedTo,
            attachments,
            todoChecklist,
         } = req.body;

         if(!Array.isArray(assignedTo)){
            return res.status(400).json({ message: "assignedTo phải là 1 mảng các ID người dùng " });
         }

         const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            createBy : req.user._id,
            attachments,
            todoChecklist,
         });
            res.status(201).json({ message: "Task được tạo thành công", task });
    } catch (error) {
         res.status(500).json({ message: "Loi server" , error: error.message});
    }
};

// @desc    Cap nhat thong tin task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task không tồn tại" });
        }

        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.priority = req.body.priority || task.priority;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.attachments = req.body.attachments || task.attachments;
        task.todoChecklist = req.body.todoChecklist || task.todoChecklist;

        if (req.body.assignedTo) {
            if (!Array.isArray(req.body.assignedTo)) {
                return res.status(400).json({ message: "assignedTo phải là 1 mảng các ID người dùng " });
            }
            task.assignedTo = req.body.assignedTo;
        }

        const updateTask = await task.save();
        res.json({ message: "Task được cập nhật thành công", updateTask });
    } catch (error) {
         res.status(500).json({ message: "Loi server" , error: error.message});
    }
};

// @desc    Xoa task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) { 
            return res.status(404).json({ message: "Task không tồn tại" });
        }

        await task.deleteOne();
        res.json({ message: "Task được xóa thành công" });

    } catch (error) {
         res.status(500).json({ message: "Loi server" , error: error.message});
    }
};

// @desc    Cap nhat trang thai task
// @route   PUT /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task không tồn tại" });
        }
        //  kiểm tra xem phải admin không , không thì nhót 
        const isAssigned = task.assignedTo.some(userId => userId.toString() === req.user._id.toString());

        if (!isAssigned && req.user.role !== "admin") {
            return res.status(403).json({ message: "Bạn không có quyền cập nhật trạng thái của task này" });
        }
        task.status = req.body.status || task.status;
        if (task.status === "completed") {
            task.todoChecklist.forEach(item => item.completed = true);
            task.progress= 100;
        }
         
        const updatedTask = await task.save();
        res.json({ message: "Trạng thái task được cập nhật thành công", task: updatedTask });
    } catch (error) {
         res.status(500).json({ message: "Loi server" , error: error.message});
    }
};

// @desc    Cap nhat cong viec con trong task
// @route   PUT /api/tasks/:id/todo
// @access  Private
const updateTaskChecklist = async (req, res) => {
    try {
        const { todoChecklist } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task không tồn tại" });
        }

        if (!task.assignedTo.includes(req.user._id) && req.user.role !== "admin") {
            return res.status(403).json({ message: "Bạn không có quyền cập nhật checklist của task này" });
        }

        task.todoChecklist = todoChecklist; // Cập nhật toàn bộ checklist mới

        // Tính toán lại tiến độ dựa trên checklist
        const completedCount = todoChecklist.filter(item => item.completed).length;
        const totalItem = todoChecklist.length;
        task.progress = totalItem > 0 ? Math.round((completedCount / totalItem) * 100) : 0;
        // tu dong cap nhat trang thai task khi checklist hoan thanh
        if (task.progress === 100) {
            task.status = "completed";
        } else if (task.progress > 0) {
            task.status = "in progress";
        } else {
            task.status = "pending";
        }
        
        await task.save();
        const updatedTask = await Task.findById(req.params.id).populate(
            "assignedTo",
             "name email profileImageUrl");
        res.json({ message: "Checklist task được cập nhật thành công", task: updatedTask });
    } catch (error) {
         res.status(500).json({ message: "Loi server" , error: error.message});
    }
};

// @desc    Lay du lieu cho dashboard tong quan
// @route   GET /api/tasks/dashboard-data
// @access  Private
const getDashboardData = async (req, res) => {
    try {
        const totalTasks = await Task.countDocuments();
        const pendingTasks = await Task.countDocuments({ status: "pending" });
        const completedTasks = await Task.countDocuments({ status: "completed" });
        const overdueTasks = await Task.countDocuments({ 
            dueDate: { $lt: new Date() }, 
            status: { $ne: "completed" } 
        });

        // đảm bảo các trạng thái đều có
        const taskStatuses = ["pending", "in progress", "completed"];
        const taskDistributionRaw = await Task.aggregate([ 
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const taskDistribution = taskStatuses.reduce((acc, status) => {
            const formattedKey = status.replace(/\s+/g, ""); // xóa khoảng trắng
            acc[formattedKey] = taskDistributionRaw.find((item) => item._id === status)?.count || 0;
            return acc;
        }, {});
        taskDistribution["All"] = totalTasks;

        // bao gồm tất cả cấp độ ưu tiên
        const taskPriorities = ["low", "medium", "high"];
        const priorityDistributionRaw = await Task.aggregate([
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 }
                }
            }
        ]);

        const priorityDistribution = taskPriorities.reduce((acc, priority) => {
            acc[priority] = priorityDistributionRaw.find((item) => item._id === priority)?.count || 0;
            return acc;
        }, {});

        const recentTasks = await Task.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("title status priority dueDate createdAt");

        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts: {
                taskDistribution,
                priorityDistribution,
            },
            recentTasks,
        });
    } catch (error) {
        res.status(500).json({ message: "Loi server", error: error.message });
    }
};
// @desc    Lay du lieu cho dashboard cua nguoi dung
// @route   GET /api/tasks/user-dashboard-data
// @access  Private
const getUserDashboardData = async (req, res) => {
    try {
        const userId = req.user._id;
        const totalTasks = await Task.countDocuments({ assignedTo: userId });
        const pendingTasks = await Task.countDocuments({ assignedTo: userId, status: "pending" });
        const completedTasks = await Task.countDocuments({ assignedTo: userId, status: "completed" });
        const overdueTasks = await Task.countDocuments({ 
            assignedTo: userId,
            dueDate: { $lt: new Date() }, 
            status: { $ne: "completed" } 
        });
        // task distribution boi vi trang thai 
        const taskStatuses = ["pending", "in progress", "completed"];
        const taskDistributionRaw = await Task.aggregate([
            { $match: { assignedTo: userId } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);
        const taskDistribution = taskStatuses.reduce((acc, status) => {
            const formattedKey = status.replace(/\s+/g, ""); // xóa khoảng trắng
            acc[formattedKey] = taskDistributionRaw.find((item) => item._id === status)?.count || 0;
            return acc;
        }, {});
        taskDistribution["All"] = totalTasks;

        // task duoc phan bo theo do uu tien
        const taskPriorities = ["low", "medium", "high"];
        const taskPriotitiesLevelsRaw = await Task.aggregate([
            { $match: { assignedTo: userId } },
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 }
                }
            }
        ]);
        const taskPrioritiesLevels = taskPriorities.reduce((acc, priority) => {
            acc[priority] = taskPriotitiesLevelsRaw.find((item) => item._id === priority)?.count || 0;
            return acc;
        }, {});
        
        const recentTasks = await Task.find({ assignedTo: userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("title status priority dueDate createdAt");

        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts: {
                taskDistribution,
                taskPrioritiesLevels,
            },
            recentTasks,
        });
    } catch (error) {
         res.status(500).json({ message: "Loi server" , error: error.message});
    }
};


module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask, 
    updateTaskStatus,
    updateTaskChecklist,
    getDashboardData,
    getUserDashboardData,
};