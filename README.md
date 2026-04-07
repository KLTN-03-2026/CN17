# Hệ thống Quản lý Công việc và Tác vụ Trực tuyến dùng node.js và react

Dự án Khóa luận Tốt nghiệp - Nhóm CN17 - Nguyễn Thanh Tùng - 28211100224 - Giảng viên hướng dẫn : Phạm Phú Khương 

##  Giới thiệu
Hệ thống hỗ trợ quản lý công việc, phân công tác vụ và theo dõi tiến độ dành cho các nhóm làm việc.

## 🛠 Công nghệ sử dụng
- **Frontend:** ReactJS + Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB 
- **Công cụ khác:** Axios, JWT, Postman

##  Cấu trúc thư mục
- `/backend`: Chứa mã nguồn server, API và kết nối database.
- `/frontend`: Chứa mã nguồn giao diện người dùng (ReactJS+vite).

##  Hướng dẫn cài đặt & Chạy dự án

### 1. Yêu cầu hệ thống
- Đã cài đặt [Node.js](https://nodejs.org/) (thầy cô cứ cài phiên bản mới nhất của node.js , phiên bản em đang dùng là v22.18.0 )

### 2. Cài đặt Backend
```bash
cd backend
npm install
# Tạo file .env và cấu hình PORT, MONGO_URI...
npm run dev ( hoặc thầy cô có thể dùng npm start )
```

### 3. Cài đặt Frontend 
```bash
cd frontend/Task-Manager
npm install
npm run dev
```
