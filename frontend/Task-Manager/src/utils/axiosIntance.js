import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout : 10000,
    headers : {
        "content-type" : "application/json",
        Accept         : "application/json"
    } ,
}) ;

// Request Interceptor: Gửi kèm token trong mỗi yêu cầu
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("token");
        if(accessToken) {
            config.headers.authorization = `Bearer ${accessToken}`;
        }
        return config ;
    } ,
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Xử lý kết quả trả về và bắt lỗi hệ thống
axiosInstance.interceptors.response.use(
    (response) => {
        return response ;
    } ,
    (error) => {
        // Xử lý các lỗi chung toàn hệ thống
        if (error.response) {
            // TRƯỜNG HỢP 401: Token hết hạn HOẶC Tài khoản bị Admin khóa 
            if (error.response.status === 401) {
                console.warn("Tài khoản bị khóa hoặc phiên đăng nhập hết hạn. Đang đăng xuất...");
                localStorage.clear();               
                // Đẩy người dùng về trang login ngay lập tức
                window.location.href = "/login"; 
            } 
            
            // Lỗi 500
            else if (error.response.status === 500) {
                console.error("Lỗi Server. Chúc bạn may mắn lần sau!");
            }
        } 
        
        // Lỗi Timeout: Mạng yếu hoặc Server quá tải
        else if (error.code === "ECONNABORTED"){
            console.error("Hết thời gian yêu cầu, vui lòng thử lại!");
        }
        
        return Promise.reject(error);
    } 
); 

export default axiosInstance;