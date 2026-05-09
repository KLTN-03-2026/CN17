require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes       = require("./routes/authRoutes");
const reportRoutes     = require("./routes/reportRoutes");
const userRoutes       = require("./routes/userRoutes");
const taskRoutes       = require("./routes/taskRoutes");
const projectRoutes    = require("./routes/projectRoutes");
const invitationRoutes = require("./routes/invitationRoutes");

const path = require("path");
const { startOverdueCron } = require("./utils/cronJobs");
const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

connectDB();
startOverdueCron();

app.use("/api/auth",        authRoutes);
app.use("/api/reports",     reportRoutes);
app.use("/api/users",       userRoutes);
app.use("/api/tasks",       taskRoutes);
app.use("/api/projects",    projectRoutes);
app.use("/api/invitations", invitationRoutes);

app.use("/upload", express.static(path.join(__dirname, "upload")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server dang chay tren cong ${PORT}`));