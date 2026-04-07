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
 // request intercreptor
 axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("token");
        if(accessToken) {
            config.headers.authorization = `Bearer ${accessToken}`;

        }
        return config ;
    } ,
    (error) =>{
        return Promise.reject(error);
    }
);
    //response intercreptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response ;
    } ,
    (error) => {

    // handle common error globally
    if (error.response) {
          if (error.response.status === 401) {
        // redirect to login page 
        window.location.href ="/login" ; 
    }  else if (error.response.status === 500) {
        console.error("lỗi sever . chúc bạn may mắn lần sau ");
    }
    } else if (error.code === "ECONNABORTED"){
        console.error(" hết thời gian yêu cầu , vui lòng thử lại ");
    }
    return Promise.reject (error) ;
    } 
); 
export default axiosInstance ;
