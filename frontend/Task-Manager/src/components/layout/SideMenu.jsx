import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../../context/userContext";
import {
    SIDE_MENU_DATA,
    SIDE_MENU_LEADER_DATA,
    SIDE_MENU_USER_DATA,
} from "../../utils/data";
import { useNavigate } from "react-router-dom";


const ROLE_BADGE = {
    admin:  { label: "Admin",  className: "bg-primary" },
    leader: { label: "Leader", className: "bg-violet-500" },
    member: { label: "Member", className: "bg-cyan-500" },
};

const SideMenu = ({ activeMenu }) => {
    const { user, clearUser } = useContext(UserContext);
    const [sideMenuData, setSideMenuData] = useState([]);
    const navigate = useNavigate();

    const handleClick = (route) => {
        if (route === "logout") {
            handleLogout();
            return;
        }
        navigate(route);
    };

    const handleLogout = () => {
        localStorage.clear();
        clearUser();
        navigate("/login");
    };

    useEffect(() => {
        if (!user) return;

        if (user.role === "admin")       setSideMenuData(SIDE_MENU_DATA);
        else if (user.role === "leader") setSideMenuData(SIDE_MENU_LEADER_DATA);
        else                             setSideMenuData(SIDE_MENU_USER_DATA);
    }, [user]);

    const badge = ROLE_BADGE[user?.role] || ROLE_BADGE.member;

    return (
        <div className="w-52 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 sticky top-[61px] z-20">
            <div className="flex flex-col items-center justify-center mb-4 pt-5">
                <div className="relative">
                    <img
                        src={user?.profileImageUrl || ""}
                        alt="profile"
                        className="w-14 h-14 bg-slate-400 rounded-full object-cover shadow-sm border border-gray-100"
                    />
                </div>

              
                <div className={`text-[10px] font-bold text-white ${badge.className} px-3 py-0.5 rounded mt-1 uppercase tracking-wider`}>
                    {badge.label}
                </div>

                <h5 className="text-gray-950 font-semibold leading-6 mt-3">
                    {user?.name || ""}
                </h5>
                <p className="text-[12px] text-gray-500 truncate w-40 text-center">
                    {user?.email || ""}
                </p>
            </div>

            <div className="mt-2 border-t border-gray-50 pt-2">
                {sideMenuData.map((item, index) => (
                    <button
                        key={`menu_${index}`}
                        className={`w-full flex items-center gap-3 text-[13px] font-medium transition-all duration-200 ${
                            activeMenu === item.label
                                ? "text-primary bg-blue-50/80 border-r-4 border-primary"
                                : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                        } py-2.5 px-6 mb-1 cursor-pointer`}
                        onClick={() => handleClick(item.path)}
                    >
                        <item.icon className="text-lg" />
                     
                        <span className="truncate">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SideMenu;