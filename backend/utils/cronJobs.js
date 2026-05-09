const cron = require("node-cron");
const Task = require("../models/Task");

// Chạy mỗi ngày lúc 00:01 — tự động mark task quá hạn
const startOverdueCron = () => {
    cron.schedule("1 0 * * *", async () => {
        try {
            const result = await Task.updateMany(
                {
                    dueDate: { $lt: new Date() },
                    status:  { $in: ["pending", "in progress"] },
                },
                { $set: { status: "overdue" } }
            );
            console.log(`[CRON] Đã mark ${result.modifiedCount} task thành overdue`);
        } catch (error) {
            console.error("[CRON] Lỗi khi cập nhật task overdue:", error.message);
        }
    });
    console.log("[CRON] Overdue task cron job đã khởi động");
};

module.exports = { startOverdueCron };