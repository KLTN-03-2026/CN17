import React, { useContext, useState } from "react";
import AuthLayout from "../../components/layout/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosIntance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  
  const {updateUser} = useContext(UserContext);
  const navigate = useNavigate();
 // handle login form submit
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Vui lòng nhập email hợp lệ");
      return;
    }

    if(!password) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }
    setError("");

    // login API call
    try {
      const response = await axiosInstance.post (API_PATHS.AUTH.LOGIN, {
        email ,
        password ,
      });
      const { token  , role} = response.data;
        if (token) {
          localStorage.setItem("token", token);
          updateUser(response.data)
          //redirect based on role
          if (role === "admin") {
            navigate("/admin/dashboard");
        } else {
          navigate ("/user/dashboard") ;
        }
      }
    } catch (error) {
      if (error.response && error.response.data.message){
        setError ( error.response.data.message);

      } else {
        setError ("Có lỗi xảy ra, vui lòng thử lại sau")
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
          {error && (
            <p className="text-red-500 text-xs mt-1 mb-2">{error}</p>
          )}

     
          <button type="submit" className="btn-primary">
            Đăng nhập
          </button>
          <p className="text-[13px] text-slate-800 mt-3">
              Bạn không có tài khoản ??????? {" "}
          <Link className="font-medium text-primary underline" to = "/signup">
            Đăng ký
          </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;