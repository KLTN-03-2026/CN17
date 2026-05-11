import React from 'react'
import Progress from '../Progress';  
import AvatarGroup from '../AvatarGroup';
import { LuPaperclip, LuFolder } from 'react-icons/lu'; 
import moment from 'moment';

const TaskCard = ({  
    title,
    description,
    priority,
    status,
    progress,
    createdAt, 
    dueDate,
    assignedTo,
    attachments,
    completedTodoCount,
    todoChecklist,
    projectName, // Nhận thêm tên project để Admin dễ nhìn
    onClick
}) => {

    const currentStatus = status?.toLowerCase();

    const getStatusTagColor = () => {  
        switch (currentStatus) {
            case "in progress":
                return "text-cyan-500 bg-cyan-50 border border-cyan-500/10";   
            case "completed":
                return "text-lime-500 bg-lime-50 border border-lime-500/10";
            default:
                return "text-violet-500 bg-violet-50 border border-violet-500/10";
        }
    };  

    const getPriorityTagColor = () => {  
        switch (priority?.toLowerCase()) {
            case "low":
                return "text-emerald-500 bg-emerald-50 border border-emerald-500/10";
            case "medium":
                return "text-amber-500 bg-amber-50 border border-amber-500/10";
            default:
                return "text-rose-500 bg-rose-50 border border-rose-500/10";
        }
    };  

    return (
        <div
            className="bg-white rounded-xl py-4 shadow-md shadow-gray-100 border border-gray-200/50 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={onClick}
        >
          
            <div className="flex items-center justify-between gap-3 px-4 mb-3">
                <div className="flex gap-2">
                    <div className={`text-[10px] uppercase font-bold ${getStatusTagColor()} px-2 py-0.5 rounded`}>
                        {status}
                    </div>
                    <div className={`text-[10px] uppercase font-bold ${getPriorityTagColor()} px-2 py-0.5 rounded`}>
                        {priority}
                    </div>
                </div>
                
                {/* Hiển thị tên dự án nếu có (Dành cho Admin) */}
                {projectName && (
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium max-w-[100px] truncate">
                        <LuFolder size={12} />
                        {projectName}
                    </div>
                )}
            </div>

            <div className={`px-4 border-l-[3px] ${
                currentStatus === "in progress" ? "border-cyan-500" :
                currentStatus === "completed" ? "border-lime-500" :
                "border-violet-500"
            }`}>
                <p className="text-sm font-bold text-slate-700 line-clamp-1">
                    {title}
                </p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-[18px] min-h-[36px]">
                    {description}
                </p>
                
                <p className="text-[12px] text-gray-500 font-medium mt-3 mb-2">
                    Tiến độ:{" "}
                    <span className="font-bold text-slate-700">
                        {completedTodoCount || 0}/{(todoChecklist?.length) || 0}
                    </span>
                </p>

                <Progress progress={progress} status={status} />
            </div>

            <div className="px-4 mt-4">
                <div className="flex items-center justify-between py-2 border-t border-gray-50">
                    <div>
                        <label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Bắt đầu</label>
                        <p className="text-xs font-semibold text-slate-600">
                            {createdAt ? moment(createdAt).format("DD/MM/YYYY") : "---"}
                        </p>
                    </div>
                    <div className="text-right">
                        <label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Hết hạn</label>
                        <p className="text-xs font-semibold text-slate-600">
                            {dueDate ? moment(dueDate).format("DD/MM/YYYY") : "---"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    {/* An toàn hơn cho AvatarGroup */}
                    <AvatarGroup avatars={assignedTo || []} />

                    {attachments > 0 && (
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                            <LuPaperclip size={14} className="text-slate-400" />
                            <span className="text-[11px] font-bold text-slate-600">{attachments}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskCard;