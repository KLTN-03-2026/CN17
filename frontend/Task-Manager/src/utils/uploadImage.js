import { API_PATHS } from "./apiPaths";
import axiosInstance  from "./axiosIntance";

const uploadImage = async (imageFile) => {
    const formData = new FormData();
    // append image file to from data
    formData.append("image", imageFile);

    try {
        const response = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData, {
            headers: {
                "Content-Type": "multipart/form-data", // set header for file upload

            },
        });
        return response.data; 
    } catch (error) {
        console.error("lỗi khi tải ảnh lên " , error);
        throw Error;
        
    }
};
export default uploadImage;