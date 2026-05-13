import React, { useContext, useState } from "react";
import AuthLayout from "../../components/layout/AuthLayout";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosIntance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";
import toast from "react-hot-toast"; 

const Login = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState(null);

  const { updateUser } = useContext(UserContext);
  const navigate  = useNavigate();
  const location = useLocation();

  const successMsg = location.state?.message || null;

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Vui lòng nhập email hợp lệ");
      return;
    }
    if (!password) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }
    setError("");

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, { email, password });
      const { token, role } = response.data;
      
      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);
        
        toast.success("Chào mừng bạn trở lại!"); // Thông báo đăng nhập thành công
        
        if (role === "admin")      navigate("/admin/dashboard");
        else if (role === "leader") navigate("/leader/dashboard");
        else                        navigate("/user/dashboard");
      }
    } catch (error) {

      if (error.response && error.response.data.message) {
        const message = error.response.data.message;
        setError(message);
        

        toast.error(message, {
          duration: 5000, 
          position: "top-center",
        });
      } else {
        setError("Có lỗi xảy ra, vui lòng thử lại sau");
        toast.error("Hệ thống đang bận, thử lại sau nhé bro!");
      }
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black">Welcome Back</h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-6">
          Hãy nhập thông tin của bạn để tiến hành đăng nhập
        </p>

        {successMsg && (
          <p className="text-green-600 text-xs bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
            {successMsg}
          </p>
        )}

        <form onSubmit={handleLogin}>
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            placeholder="thanhtung@example.com"
            type="text"
          />
          <Input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Password"
            placeholder="Nhập mật khẩu"
            type="password"
          />

          <div className="flex justify-end mb-1">
            <Link className="text-xs text-primary hover:underline" to="/forgot-password">
              Quên mật khẩu?
            </Link>
          </div>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-2 mb-3">
               <p className="text-red-600 text-[11px] font-medium">{error}</p>
            </div>
          )}

          <button type="submit" className="btn-primary">
            Đăng nhập
          </button>

          <p className="text-[13px] text-slate-800 mt-3">
            Bạn không có tài khoản?{" "}
            <Link className="font-medium text-primary underline" to="/signup">
              Đăng ký
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;