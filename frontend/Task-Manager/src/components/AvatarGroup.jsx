import React from 'react'

const AvatarGroup = ({ avatars = [], maxVisible = 3 }) => {
    // Địa chỉ base của Server
    const API_BASE_URL = "http://localhost:8000"; 

    return (
        <div className="flex items-center">
            {avatars.slice(0, maxVisible).map((user, index) => {
                //  Lấy chuỗi path ảnh từ object hoặc string
                const rawPath = user?.profileImageUrl || (typeof user === 'string' ? user : "");


                const imageUrl = rawPath 
                    ? (rawPath.startsWith('http') 
                        ? rawPath  
                        : `${API_BASE_URL}/${rawPath}`) 
                    : `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=random`; // Ảnh mặc định theo tên nếu trống

                return (
                    <div 
                        key={index} 
                        className="relative group"
                    >
                        <img
                            src={imageUrl}
                            alt={user?.name || "User"}
                            // onError: Nếu link ảnh chết (404), tự động đổi sang ảnh placeholder để không bị lỗi icon vỡ
                            onError={(e) => { e.target.src = "https://via.placeholder.com/150" }}
                            className="w-8 h-8 rounded-full border-2 border-white -ml-2.5 first:ml-0 object-cover shadow-sm transition-transform group-hover:scale-110 group-hover:z-10"
                        />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                            {user?.name || "Thành viên"}
                        </span>
                    </div>
                );
            })}

            {avatars.length > maxVisible && (
                <div className="w-8 h-8 flex items-center justify-center bg-slate-100 text-[10px] font-bold text-slate-500 rounded-full border-2 border-white -ml-2.5 shadow-sm">
                    +{avatars.length - maxVisible}
                </div>
            )}
        </div>
    )
}

export default AvatarGroup