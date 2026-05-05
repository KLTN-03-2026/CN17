const Task    = require("../models/Task");
const User    = require("../models/User");
const Project = require("../models/Project");
const excelJS = require("exceljs");

// @desc    Xuất báo cáo task của 1 project dưới dạng Excel
// @route   GET /api/reports/export/tasks?projectId=xxx
// @access  Private — Leader của project đó
const exportTasksReport = async (req, res) => {
    try {
        const { projectId } = req.query;

        let filter = {};

        if (projectId) {
            // Leader chỉ export được project của mình
            const project = await Project.findById(projectId);
            if (!project) {
                return res.status(404).json({ message: "Không tìm thấy project" });
            }
            if (project.leader.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: "Chỉ leader mới được xuất báo cáo project này" });
            }
            filter.project = projectId;
        }
        // Nếu không có projectId — admin gọi thì lấy tất cả

        const tasks = await Task.find(filter)
            .populate("assignedTo", "name email")
            .populate("project", "name");

        const workbook  = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("Tasks Report");

        worksheet.columns = [
            { header: "Task ID",     key: "_id",         width: 25 },
            { header: "Project",     key: "project",     width: 25 },
            { header: "Title",       key: "title",       width: 30 },
            { header: "Description", key: "description", width: 50 },
            { header: "Priority",    key: "priority",    width: 15 },
            { header: "Status",      key: "status",      width: 20 },
            { header: "Due Date",    key: "dueDate",     width: 20 },
            { header: "Assigned To", key: "assignedTo",  width: 40 },
        ];

        tasks.forEach((task) => {
            const assignedTo = task.assignedTo
                .map((user) => `${user.name} (${user.email})`)
                .join(", ");

            worksheet.addRow({
                _id:         task._id,
                project:     task.project?.name || "N/A",
                title:       task.title,
                description: task.description,
                priority:    task.priority,
                status:      task.status,
                dueDate:     task.dueDate ? task.dueDate.toISOString().split("T")[0] : "N/A",
                assignedTo:  assignedTo || "Unassigned",
            });
        });

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", 'attachment; filename="tasks-report.xlsx"');

        return workbook.xlsx.write(res).then(() => res.end());
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xuất báo cáo công việc", error: error.message });
    }
};

// @desc    Xuất báo cáo người dùng (admin xem thống kê toàn hệ thống)
// @route   GET /api/reports/export/users
// @access  Private/Admin
const exportUsersReport = async (req, res) => {
    try {
        // Admin xem tất cả user (trừ admin khác)
        const users = await User.find({ role: { $ne: "admin" } })
            .select("name email role _id")
            .lean();

        const userTasks = await Task.find().populate("assignedTo", "name email _id");

        const userTaskMap = {};
        users.forEach((user) => {
            userTaskMap[user._id] = {
                name:            user.name,
                email:           user.email,
                role:            user.role,
                taskCount:       0,
                pendingTasks:    0,
                inProgressTasks: 0,
                completedTasks:  0,
            };
        });

        userTasks.forEach((task) => {
            if (task.assignedTo) {
                task.assignedTo.forEach((assignedUser) => {
                    if (userTaskMap[assignedUser._id]) {
                        userTaskMap[assignedUser._id].taskCount += 1;
                        if      (task.status === "pending")     userTaskMap[assignedUser._id].pendingTasks    += 1;
                        else if (task.status === "in progress") userTaskMap[assignedUser._id].inProgressTasks += 1;
                        else if (task.status === "completed")   userTaskMap[assignedUser._id].completedTasks  += 1;
                    }
                });
            }
        });

        const workbook  = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("User Task Report");

        worksheet.columns = [
            { header: "User Name",            key: "name",            width: 30 },
            { header: "Email",                key: "email",           width: 40 },
            { header: "Role",                 key: "role",            width: 15 },
            { header: "Total Assigned Tasks", key: "taskCount",       width: 20 },
            { header: "Pending Tasks",        key: "pendingTasks",    width: 20 },
            { header: "In Progress Tasks",    key: "inProgressTasks", width: 20 },
            { header: "Completed Tasks",      key: "completedTasks",  width: 20 },
        ];

        Object.values(userTaskMap).forEach((user) => worksheet.addRow(user));

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", 'attachment; filename="users_report.xlsx"');

        return workbook.xlsx.write(res).then(() => res.end());
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xuất báo cáo người dùng", error: error.message });
    }
};

module.exports = {
    exportTasksReport,
    exportUsersReport,
};