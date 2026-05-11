import React from 'react'

const TaskStatusTabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="my-2">
      <div className="flex">
        {tabs.map((tab) => {
          // Dùng value nếu có (ManagerTask), fallback về label (LeaderTaskManager)
          const tabKey   = tab.value ?? tab.label;
          const isActive = activeTab === tabKey;

          return (
            <button
              key={tabKey}
              className={`relative px-3 md:px-4 py-2 text-sm font-medium ${
                isActive ? "text-primary" : "text-gray-500 hover:text-gray-700"
              } cursor-pointer`}
              onClick={() => setActiveTab(tabKey)}
            >
              <div className="flex items-center">
                <span className="text-xs capitalize">{tab.label}</span>
                <span
                  className={`text-xs ml-2 px-2 py-0.5 rounded-full ${
                    isActive ? "bg-primary text-white" : "bg-gray-200/70 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              </div>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TaskStatusTabs;