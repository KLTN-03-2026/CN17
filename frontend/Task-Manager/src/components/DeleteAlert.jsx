import React from 'react'

const DeleteAlert = ({ content, onDelete, onCancel }) => {
  return (
    <div>
      <p className="text-sm">{content}</p>
      <div className="flex justify-end gap-3 mt-6">
        
        {/* Nút Cancel */}
        <button
          type="button"
          className="text-xs md:text-sm font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 cursor-pointer"
          onClick={onCancel}
        >
          Cancel
        </button>

        {/* Nút Delete */}
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 text-xs md:text-sm font-medium text-rose-500 bg-rose-50 border border-rose-100 rounded-lg px-4 py-2 cursor-pointer"
          onClick={onDelete}
        >
          Delete
        </button>

      </div>
    </div>
  );
};

export default DeleteAlert
