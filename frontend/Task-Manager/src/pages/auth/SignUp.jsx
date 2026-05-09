import React, { useContext, useState } from 'react'
import AuthLayout from '../../components/layout/AuthLayout'
import { validateEmail } from '../../utils/helper';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import Input from '../../components/Inputs/Input';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosIntance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import uploadImage from '../../utils/uploadImage';

const SignUp = () => {
  const [profilePic, setProfilePic]               = useState(null);
  const [fullName, setFullName]                   = useState("");
  const [email, setEmail]                         = useState("");
  const [password, setPassword]                   = useState("");
  const [adminInviteToken, setAdminInviteToken]   = useState("");
  const [showTokenField, setShowTokenField]       = useState(false);
  const [error, setError]                         = useState(null);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!fullName) {
      setError("Vui lòng nhập đầy đủ họ tên");
      return;
    }
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
      let profileImageUrl = "";
      if (profilePic) {
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes.imageUrl || "";
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName,
        email,
        password,
        profileImageUrl,
        adminInviteToken,
      });

      const { token, role } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);

        if (role === "admin")       navigate("/admin/dashboard");
        else if (role === "leader") navigate("/leader/dashboard");
        else                        navigate("/user/dashboard");
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Có lỗi xảy ra, vui lòng thử lại sau");
      }
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black">Create an Account</h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-6">
          Hãy tham gia cùng chúng tôi bằng cách điền thông tin bên dưới
        </p>

        <form onSubmit={handleSignup}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Full Name"
              placeholder="Nguyễn Văn A"
              type="text"
            />
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

            {/* Token field — chỉ hiện khi bấm vào link */}
            {showTokenField ? (
              <Input
                value={adminInviteToken}
                onChange={({ target }) => setAdminInviteToken(target.value)}
                label="Mã Admin Token"
                placeholder="Nhập mã token"
                type="password"
              />
            ) : (
              <div className="flex items-end pb-1">
                <button
                  type="button"
                  className="text-xs text-slate-400 hover:text-primary underline"
                  onClick={() => setShowTokenField(true)}
                >
                  Bạn có mã Admin Token?
                </button>
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-xs mt-1 mb-2">{error}</p>
          )}

          <button type="submit" className="btn-primary">
            SIGN UP
          </button>

          <p className="text-[13px] text-slate-800 mt-3">
            Bạn đã có tài khoản?{" "}
            <Link className="font-medium text-primary underline" to="/login">
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignUp;