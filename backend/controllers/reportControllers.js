const Task    = require("../models/Task");
const User    = require("../models/User");
const Project = require("../models/Project");
const excelJS = require("exceljs");

// @desc    Xuất báo cáo task (admin: tất cả, leader: project của mình)
// @route   GET /api/reports/export/tasks?projectId=xxx
const exportTasksReport = async (req, res) => {
    try {
        const { projectId } = req.query;
        let filter = {};

        if (projectId) {
            const project = await Project.findById(projectId);
            if (!project) return res.status(404).json({ message: "Không tìm thấy project" });
            if (project.leader.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: "Chỉ leader mới được xuất báo cáo project này" });
            }
            filter.project = projectId;
        }

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
                .map((u) => `${u.name} (${u.email})`).join(", ");
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

// @desc    Xuất báo cáo user (admin: toàn hệ thống)
// @route   GET /api/reports/export/users
const exportUsersReport = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: "admin" } })
            .select("name email role _id").lean();
        const userTasks = await Task.find().populate("assignedTo", "name email _id");

        const userTaskMap = {};
        users.forEach((user) => {
            userTaskMap[user._id] = {
                name: user.name, email: user.email, role: user.role,
                taskCount: 0, pendingTasks: 0, inProgressTasks: 0, completedTasks: 0,
            };
        });
        userTasks.forEach((task) => {
            task.assignedTo?.forEach((u) => {
                if (userTaskMap[u._id]) {
                    userTaskMap[u._id].taskCount += 1;
                    if      (task.status === "pending")     userTaskMap[u._id].pendingTasks    += 1;
                    else if (task.status === "in progress") userTaskMap[u._id].inProgressTasks += 1;
                    else if (task.status === "completed")   userTaskMap[u._id].completedTasks  += 1;
                }
            });
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
        Object.values(userTaskMap).forEach((u) => worksheet.addRow(u));

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", 'attachment; filename="users_report.xlsx"');
        return workbook.xlsx.write(res).then(() => res.end());
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xuất báo cáo người dùng", error: error.message });
    }
};

// @desc    Leader xuất báo cáo thành viên trong project của mình
// @route   GET /api/reports/export/project-members?projectId=xxx
const exportProjectMembersReport = async (req, res) => {
    try {
        const { projectId } = req.query;
        if (!projectId) return res.status(400).json({ message: "Thiếu projectId" });

        const project = await Project.findById(projectId)
            .populate("leader",  "name email _id")
            .populate("members", "name email _id");
        if (!project) return res.status(404).json({ message: "Không tìm thấy project" });

        if (project.leader._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Chỉ leader mới được xuất báo cáo này" });
        }

        // Gộp leader + members
        const allMembers = [project.leader, ...project.members];

        // Lấy task trong project
        const tasks = await Task.find({ project: projectId })
            .populate("assignedTo", "_id");

        // Tính stats cho từng member
        const memberMap = {};
        allMembers.forEach((u) => {
            memberMap[u._id.toString()] = {
                name:            u.name,
                email:           u.email,
                role:            u._id.toString() === project.leader._id.toString() ? "Leader" : "Member",
                taskCount:       0,
                pendingTasks:    0,
                inProgressTasks: 0,
                completedTasks:  0,
            };
        });

        tasks.forEach((task) => {
            task.assignedTo?.forEach((u) => {
                const id = u._id.toString();
                if (memberMap[id]) {
                    memberMap[id].taskCount += 1;
                    if      (task.status === "pending")     memberMap[id].pendingTasks    += 1;
                    else if (task.status === "in progress") memberMap[id].inProgressTasks += 1;
                    else if (task.status === "completed")   memberMap[id].completedTasks  += 1;
                }
            });
        });

        const workbook  = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("Project Members Report");

        worksheet.columns = [
            { header: "Tên",                  key: "name",            width: 30 },
            { header: "Email",                key: "email",           width: 40 },
            { header: "Vai trò",              key: "role",            width: 15 },
            { header: "Tổng Task được giao",  key: "taskCount",       width: 20 },
            { header: "Pending",              key: "pendingTasks",    width: 15 },
            { header: "In Progress",          key: "inProgressTasks", width: 15 },
            { header: "Completed",            key: "completedTasks",  width: 15 },
        ];

        // Thêm tên project vào header
        worksheet.insertRow(1, [`Báo cáo thành viên dự án: ${project.name}`]);
        worksheet.mergeCells("A1:G1");
        worksheet.getCell("A1").font = { bold: true, size: 13 };
        worksheet.getCell("A1").alignment = { horizontal: "center" };

        Object.values(memberMap).forEach((m) => worksheet.addRow(m));

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="project-members-${projectId}.xlsx"`);
        return workbook.xlsx.write(res).then(() => res.end());
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xuất báo cáo thành viên", error: error.message });
    }
};

module.exports = { exportTasksReport, exportUsersReport, exportProjectMembersReport };