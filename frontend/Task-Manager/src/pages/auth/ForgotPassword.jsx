import React, { useState } from "react";
import AuthLayout from "../../components/layout/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosIntance";
import { API_PATHS } from "../../utils/apiPaths";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập mật khẩu mới
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Bước 1: kiểm tra email có tồn tại không
  const handleCheckEmail = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Vui lòng nhập email hợp lệ");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Gọi thử API reset với mật khẩu giả để check email tồn tại
      // Dùng GET profile trick
      await axiosInstance.post(API_PATHS.AUTH.RESET_PASSWORD, {
        email,
        newPassword: "__check__",
      });
    } catch (err) {
      const msg = err?.response?.data?.message || "";
      if (msg === "Email không tồn tại trong hệ thống") {
        setError("Email này chưa được đăng ký trong hệ thống");
        setLoading(false);
        return;
      }
      // Các lỗi khác 
    }
    setLoading(false);
    setStep(2);
  };

  // Bước 2: đặt lại mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await axiosInstance.post(API_PATHS.AUTH.RESET_PASSWORD, { email, newPassword });
      navigate("/login", { state: { message: "Đặt lại mật khẩu thành công! Hãy đăng nhập." } });
    } catch (err) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">

        {step === 1 ? (
          <>
            <h3 className="text-xl font-semibold text-black">Quên mật khẩu</h3>
            <p className="text-xs text-slate-700 mt-[5px] mb-6">
              Nhập email đã đăng ký để tiến hành đặt lại mật khẩu
            </p>

            <form onSubmit={handleCheckEmail}>
              <Input
                value={email}
                onChange={({ target }) => setEmail(target.value)}
                label="Email Address"
                placeholder="thanhtung@example.com"
                type="text"
              />

              {error && <p className="text-red-500 text-xs mt-1 mb-2">{error}</p>}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Đang kiểm tra..." : "Tiếp tục"}
              </button>

              <p className="text-[13px] text-slate-800 mt-3">
                Nhớ mật khẩu rồi?{" "}
                <Link className="font-medium text-primary underline" to="/login">
                  Đăng nhập
                </Link>
              </p>
            </form>
          </>
        ) : (
          <>
            <h3 className="text-xl font-semibold text-black">Đặt lại mật khẩu</h3>
            <p className="text-xs text-slate-700 mt-[5px] mb-6">
              Nhập mật khẩu mới cho tài khoản <span className="font-medium text-primary">{email}</span>
            </p>

            <form onSubmit={handleResetPassword}>
              <Input
                value={newPassword}
                onChange={({ target }) => setNewPassword(target.value)}
                label="Mật khẩu mới"
                placeholder="Tối thiểu 6 ký tự"
                type="password"
              />
              <Input
                value={confirmPassword}
                onChange={({ target }) => setConfirmPassword(target.value)}
                label="Xác nhận mật khẩu"
                placeholder="Nhập lại mật khẩu mới"
                type="password"
              />

              {error && <p className="text-red-500 text-xs mt-1 mb-2">{error}</p>}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
              </button>

              <p className="text-[13px] text-slate-800 mt-3">
                <button
                  type="button"
                  className="font-medium text-primary underline"
                  onClick={() => { setStep(1); setError(""); }}
                >
                  ← Quay lại
                </button>
              </p>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;