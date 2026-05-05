import React, { useEffect, useState } from 'react';
import { LuUser } from 'react-icons/lu';
import Modal from '../Modal';
import AvatarGroup from '../AvatarGroup';

// projectMembers: danh sách member của project 
// nếu không truyền thì hiện trống
const SelectUsers = ({ selectedUsers, setSelectedUsers, projectMembers = [] }) => {
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [tempSelectedUsers, setTempSelectedUsers] = useState([]);
  const [search, setSearch]                 = useState("");

  const filteredUsers = projectMembers.filter(
    (user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUserSelection = (userID) => {
    setTempSelectedUsers((prev) =>
      prev.includes(userID)
        ? prev.filter((id) => id !== userID)
        : [...prev, userID]
    );
  };

  const handleAssign = () => {
    setSelectedUsers(tempSelectedUsers);
    setIsModalOpen(false);
  };

  const handleOpen = () => {
    setTempSelectedUsers(selectedUsers || []);
    setSearch("");
    setIsModalOpen(true);
  };

  const selectedUserAvatars = projectMembers
    .filter((user) => selectedUsers.includes(user._id))
    .map((user) => user.profileImageUrl);

  useEffect(() => {
    if (selectedUsers.length === 0) {
      setTempSelectedUsers([]);
    }
  }, [selectedUsers]);

  return (
    <div className="space-y-4 mt-2">
      {selectedUserAvatars.length === 0 ? (
        <button className="card-btn" onClick={handleOpen}>
          <LuUser className="text-sm" /> Chọn thành viên
        </button>
      ) : (
        <div className="cursor-pointer" onClick={handleOpen}>
          <AvatarGroup avatars={selectedUserAvatars} maxVisible={3} />
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Chọn thành viên"
      >
        {/* Ô tìm kiếm */}
        <div className="mb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-gray-500 bg-white placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-1 h-[50vh] overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">
              {projectMembers.length === 0
                ? "Dự án chưa có thành viên nào. Hãy mời thành viên trước."
                : "Không tìm thấy người dùng."}
            </p>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-4 p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer rounded-lg"
                onClick={() => toggleUserSelection(user._id)}
              >
                <img
                  src={user.profileImageUrl || ""}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover bg-gray-200"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{user.name}</p>
                  <p className="text-[12px] text-gray-400">{user.email}</p>
                </div>
                <input
                  type="checkbox"
                  checked={tempSelectedUsers.includes(user._id)}
                  onChange={() => toggleUserSelection(user._id)}
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none"
                />
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button className="card-btn" onClick={() => setIsModalOpen(false)}>
            Hủy
          </button>
          <button className="card-btn-fill" onClick={handleAssign}>
            Xác nhận
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SelectUsers;