const mongoose = require("mongoose");
const Task    = require("../models/Task");
const Project = require("../models/Project");

// ─── Helper: kiểm tra user có phải leader của project chứa task không ─────────
const isLeaderOfTask = async (task, userId) => {
    const project = await Project.findById(task.project);
    if (!project) return false;
    return project.leader.toString() === userId.toString();
};

// ─── Lấy danh sách task theo project ─────────────────────────────────────────
// GET /api/tasks
const getTasks = async (req, res) => {
    try {
        const { status, projectId } = req.query;
        const isAdmin = req.user.role === "admin";
        let filter = {};

        // 1. Xử lý Logic lọc Project
        if (projectId) {
            const project = await Project.findById(projectId);
            if (!project) return res.status(404).json({ message: "Không tìm thấy project" });

            const isLeader = project.leader.toString() === req.user._id.toString();
            const isMember = project.members.map((id) => id.toString()).includes(req.user._id.toString());

            if (!isAdmin && !isLeader && !isMember) {
                return res.status(403).json({ message: "Bạn không có quyền truy cập dự án này" });
            }

            filter.project = new mongoose.Types.ObjectId(projectId);
            if (!isAdmin && !isLeader) {
                filter.assignedTo = req.user._id;
            }
        } else if (!isAdmin) {
            return res.status(400).json({ message: "Thiếu projectId" });
        }

        // 2. Lọc theo trạng thái
        if (status && status.trim() !== "") {
            filter.status = status;
        }

        // 3. Lấy danh sách Task
        let tasks = await Task.find(filter)
            .populate("assignedTo", "name email profileImageUrl")
            .populate("createdBy", "name email")
            .populate("project", "name") 
            .sort({ createdAt: -1 })
            .lean();

        const tasksWithCount = tasks.map((task) => {
            const completedCount = task.todoChecklist
                ? task.todoChecklist.filter((item) => item.completed).length
                : 0;
            return { ...task, completedChecklistCount: completedCount };
        });

        // 4. Summary stats - Sửa filter để Admin thấy tổng số
        // Nếu không có projectId, aggregateFilter phải để rỗng để đếm toàn hệ thống
        const aggregateFilter = projectId ? { project: new mongoose.Types.ObjectId(projectId) } : {};
        
        // Nếu là Member thường trong 1 project, chỉ đếm task của họ
        if (projectId && filter.assignedTo) {
            aggregateFilter.assignedTo = new mongoose.Types.ObjectId(filter.assignedTo);
        }

        const stats = await Task.aggregate([
            { $match: aggregateFilter },
            {
                $group: {
                    _id: null,
                    all: { $sum: 1 },
                    pendingTasks:    { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                    inProgressTasks: { $sum: { $cond: [{ $eq: ["$status", "in progress"] }, 1, 0] } },
                    completedTasks:  { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
                },
            },
        ]);

        const summary = stats.length > 0 ? stats[0] : { all: 0, pendingTasks: 0, inProgressTasks: 0, completedTasks: 0 };
        delete summary._id;

        res.json({ tasks: tasksWithCount, summary });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// ─── Lấy chi tiết 1 task ──────────────────────────────────────────────────────
// GET /api/tasks/:id
// @access  Member được giao hoặc Leader của project
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate("assignedTo", "name email profileImageUrl")
            .populate("createdBy", "name email");

        if (!task) {
            return res.status(404).json({ message: "Task không tồn tại" });
        }

        const project = await Project.findById(task.project);
        const isLeader = project?.leader.toString() === req.user._id.toString();
        const isAssigned = task.assignedTo.some(
            (u) => u._id.toString() === req.user._id.toString()
        );

        if (!isLeader && !isAssigned) {
            return res.status(403).json({ message: "Bạn không có quyền xem task này" });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// ─── Tạo task mới ─────────────────────────────────────────────────────────────
// POST /api/tasks
// @access  Leader của project (body: projectId bắt buộc)
const createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate, assignedTo, attachments, todoChecklist, projectId } = req.body;

        if (!projectId) {
            return res.status(400).json({ message: "Thiếu projectId" });
        }

        if (!Array.isArray(assignedTo)) {
            return res.status(400).json({ message: "assignedTo phải là 1 mảng các ID người dùng" });
        }

        // Kiểm tra leader của project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Không tìm thấy project" });
        }
        if (project.leader.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Chỉ leader mới được tạo task" });
        }

        // assignedTo phải là member hoặc chính leader của project
        const validMembers = [
            project.leader.toString(),
            ...project.members.map((id) => id.toString()),
        ];
        const invalidUsers = assignedTo.filter((id) => !validMembers.includes(id.toString()));
        if (invalidUsers.length > 0) {
            return res.status(400).json({
                message: "Một số người dùng không thuộc project này",
                invalidUsers,
            });
        }

        // Validate dueDate không được là ngày quá khứ
        if (dueDate) {
            const due = new Date(dueDate);
            due.setHours(0, 0, 0, 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (due < today) {
                return res.status(400).json({ message: "Ngày hết hạn không được là ngày trong quá khứ" });
            }
        }

        const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            createdBy: req.user._id,
            attachments,
            todoChecklist,
            project: projectId,
        });

        res.status(201).json({ message: "Task được tạo thành công", task });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};
// PUT /api/tasks/:id
// @access  Admin HOẶC Leader của project chứa task đó
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: "Công việc không tồn tại" });
        }

        // Kiểm tra quyền: Admin hoặc Leader của project
        const isAdmin = req.user.role === "admin";
        const isLeader = await isLeaderOfTask(task, req.user._id);

        if (!isAdmin && !isLeader) {
            return res.status(403).json({ 
                message: "Bạn không có quyền chỉnh sửa công việc này. Chỉ Quản trị viên hoặc Trưởng nhóm mới có quyền." 
            });
        }

        // Cập nhật các trường thông tin cơ bản
        task.title       = req.body.title       || task.title;
        task.description = req.body.description || task.description;
        task.priority    = req.body.priority    || task.priority;
        task.status      = req.body.status      || task.status; 

        // Validate và cập nhật dueDate 
        if (req.body.dueDate) {
            const due = new Date(req.body.dueDate);
            due.setHours(0, 0, 0, 0);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (due < today) {
                return res.status(400).json({ message: "Ngày hết hạn không được ở trong quá khứ" });
            }
            task.dueDate = req.body.dueDate;
        }

        // Cập nhật danh sách đính kèm và checklist
        if (req.body.attachments) {
            task.attachments = req.body.attachments;
        }
        
        if (req.body.todoChecklist) {
            task.todoChecklist = req.body.todoChecklist;
            
            // Tự động tính toán lại progress dựa trên checklist mới
            const total = req.body.todoChecklist.length;
            const completed = req.body.todoChecklist.filter(item => item.completed).length;
            task.progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        }

        // Cập nhật người được giao 
        if (req.body.assignedTo) {
            if (!Array.isArray(req.body.assignedTo)) {
                return res.status(400).json({ message: "assignedTo phải là một mảng ID người dùng" });
            }
            task.assignedTo = req.body.assignedTo;
        }

        const updatedTask = await task.save();

        // Populate lại dữ liệu để trả về Frontend hiển thị luôn
        const populatedTask = await Task.findById(updatedTask._id)
            .populate("assignedTo", "name email profileImageUrl")
            .populate("createdBy", "name email")
            .populate("project", "name");

        res.json({ 
            message: "Cập nhật công việc thành công", 
            task: populatedTask 
        });

    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống khi cập nhật công việc", error: error.message });
    }
};
// DELETE /api/tasks/:id
// @access  Leader của project chứa task đó
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task không tồn tại" });

        const isAdmin = req.user.role === "admin";
        const leader = await isLeaderOfTask(task, req.user._id);

        // Admin HOẶC Leader dự án mới được xóa
        if (!isAdmin && !leader) {
            return res.status(403).json({ message: "Bạn không có quyền xóa task này" });
        }

        await task.deleteOne();
        res.json({ message: "Task được xóa thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};
// ─── Cập nhật trạng thái task ─────────────────────────────────────────────────
// PUT /api/tasks/:id/status
// @access  Member được giao task hoặc Leader
const updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task không tồn tại" });
        }

        const project = await Project.findById(task.project);
        const isLeader   = project?.leader.toString() === req.user._id.toString();
        const isAssigned = task.assignedTo.some(
            (userId) => userId.toString() === req.user._id.toString()
        );

        if (!isLeader && !isAssigned) {
            return res.status(403).json({ message: "Bạn không có quyền cập nhật trạng thái của task này" });
        }

        // Task quá hạn - chỉ leader mới được thay đổi
        if (task.status === "overdue" && !isLeader) {
            return res.status(403).json({ message: "Task đã quá hạn, chỉ leader mới có thể thay đổi" });
        }

        task.status = req.body.status || task.status;

        if (task.status === "completed") {
            task.todoChecklist.forEach((item) => (item.completed = true));
            task.progress = 100;
        }

        const updatedTask = await task.save();
        res.json({ message: "Trạng thái task được cập nhật thành công", task: updatedTask });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// ─── Cập nhật checklist ───────────────────────────────────────────────────────
// PUT /api/tasks/:id/todo
// @access  Member được giao task hoặc Leader
const updateTaskChecklist = async (req, res) => {
    try {
        const { todoChecklist } = req.body;
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task không tồn tại" });
        }

        const project = await Project.findById(task.project);
        const isLeader   = project?.leader.toString() === req.user._id.toString();
        const isAssigned = task.assignedTo.some(
            (userId) => userId.toString() === req.user._id.toString()
        );

        if (!isLeader && !isAssigned) {
            return res.status(403).json({ message: "Bạn không có quyền cập nhật checklist của task này" });
        }

        // Task quá hạn - chỉ leader mới được cập nhật checklist
        if (task.status === "overdue" && !isLeader) {
            return res.status(403).json({ message: "Task đã quá hạn, chỉ leader mới có thể thay đổi" });
        }

        task.todoChecklist = todoChecklist;

        const completedCount = todoChecklist.filter((item) => item.completed).length;
        const totalItem      = todoChecklist.length;
        task.progress = totalItem > 0 ? Math.round((completedCount / totalItem) * 100) : 0;

        if (task.progress === 100)      task.status = "completed";
        else if (task.progress > 0)     task.status = "in progress";
        else                            task.status = "pending";

        await task.save();

        const updatedTask = await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );
        res.json({ message: "Checklist task được cập nhật thành công", task: updatedTask });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// ─── Dashboard của Leader (theo project) ──────────────────────────────────────
// GET /api/tasks/dashboard-data?projectId=xxx
// @access  Leader của project
const getDashboardData = async (req, res) => {
    try {
        const { projectId } = req.query;
        if (!projectId) {
            return res.status(400).json({ message: "Thiếu projectId" });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Không tìm thấy project" });
        }
        if (project.leader.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Chỉ leader mới xem được dashboard này" });
        }

        const matchFilter = { project: project._id };

        const totalTasks     = await Task.countDocuments(matchFilter);
        const pendingTasks   = await Task.countDocuments({ ...matchFilter, status: "pending" });
        const completedTasks = await Task.countDocuments({ ...matchFilter, status: "completed" });
        const overdueTasks   = await Task.countDocuments({
            ...matchFilter,
            dueDate: { $lt: new Date() },
            status:  { $ne: "completed" },
        });

        const taskStatuses = ["pending", "in progress", "completed"];
        const taskDistributionRaw = await Task.aggregate([
            { $match: matchFilter },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        const taskDistribution = taskStatuses.reduce((acc, status) => {
            const key = status.replace(/\s+/g, "");
            acc[key] = taskDistributionRaw.find((i) => i._id === status)?.count || 0;
            return acc;
        }, {});
        taskDistribution["All"] = totalTasks;

        const taskPriorities = ["low", "medium", "high"];
        const priorityDistributionRaw = await Task.aggregate([
            { $match: matchFilter },
            { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]);
        const priorityDistribution = taskPriorities.reduce((acc, priority) => {
            acc[priority] = priorityDistributionRaw.find((i) => i._id === priority)?.count || 0;
            return acc;
        }, {});

        const recentTasks = await Task.find(matchFilter)
            .sort({ createdAt: -1 })
            .limit(10)
            .select("title status priority dueDate createdAt");

        res.status(200).json({
            statistics: { totalTasks, pendingTasks, completedTasks, overdueTasks },
            charts: { taskDistribution, priorityDistribution },
            recentTasks,
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// ─── Dashboard của Member (task được giao trong 1 project) ────────────────────
// GET /api/tasks/user-dashboard-data?projectId=xxx
// @access  Member hoặc Leader của project
const getUserDashboardData = async (req, res) => {
    try {
        const { projectId } = req.query;
        if (!projectId) {
            return res.status(400).json({ message: "Thiếu projectId" });
        }

        const userId      = req.user._id;
        const projectObjId = new mongoose.Types.ObjectId(projectId);
        const matchFilter = { project: projectObjId, assignedTo: userId };

        const totalTasks     = await Task.countDocuments(matchFilter);
        const pendingTasks   = await Task.countDocuments({ ...matchFilter, status: "pending" });
        const completedTasks = await Task.countDocuments({ ...matchFilter, status: "completed" });
        const overdueTasks   = await Task.countDocuments({
            ...matchFilter,
            dueDate: { $lt: new Date() },
            status:  { $ne: "completed" },
        });

        const taskStatuses = ["pending", "in progress", "completed"];
        const taskDistributionRaw = await Task.aggregate([
            { $match: matchFilter },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        const taskDistribution = taskStatuses.reduce((acc, status) => {
            const key = status.replace(/\s+/g, "");
            acc[key] = taskDistributionRaw.find((i) => i._id === status)?.count || 0;
            return acc;
        }, {});
        taskDistribution["All"] = totalTasks;

        const taskPriorities = ["low", "medium", "high"];
        const taskPrioritiesRaw = await Task.aggregate([
            { $match: matchFilter },
            { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]);
        const taskPrioritiesLevels = taskPriorities.reduce((acc, priority) => {
            acc[priority] = taskPrioritiesRaw.find((i) => i._id === priority)?.count || 0;
            return acc;
        }, {});

        const recentTasks = await Task.find(matchFilter)
            .sort({ createdAt: -1 })
            .limit(10)
            .select("title status priority dueDate createdAt");

        res.status(200).json({
            statistics: { totalTasks, pendingTasks, completedTasks, overdueTasks },
            charts: { taskDistribution, taskPrioritiesLevels },
            recentTasks,
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
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