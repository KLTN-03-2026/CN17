const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {});
        console.log("Da ket noi den MongoDB");
    } catch (error) {
        console.error("Loi ket noi den MongoDB", error);
        process.exit(1); // thoat ung dung khi ket noi that bai
    }
};

module.exports = connectDB;