import React from "react"
import UI_IMG from "../../assets/images/auth-image.jpg"

const AuthLayout = ({ children }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      
      {/* Bên trái */}
      <div className="w-[60vw] h-full px-12 pt-8 pb-12 overflow-y-auto">
        <h2 className="text-lg font-medium text-black">Task Manager</h2>
        {children}
      </div>

      {/* Bên phải */}
      <div className="flex w-[40vw] h-full bg-blue-500 items-center justify-center overflow-hidden p-8">
        <img 
          src={UI_IMG} 
          alt="auth"
          className="max-w-full max-h-full object-contain"
        />
      </div>

    </div>
  )
}

export default AuthLayout