import React from 'react';

const TaskCard = ({ task, isHighlighted, handleToggleComplete }) => {

  return (
    <div
      className={`
        flex items-center justify-between p-4 mb-4 rounded-lg shadow-sm border 
        ${isHighlighted ? 'bg-indigo-100 border-indigo-200' : 'bg-white border-gray-200'}
        transition-colors duration-200
      `}
    >
      <div className="flex items-center w-full">
        <input
          type="checkbox"
          checked={task.completed || false}
          onChange={() => handleToggleComplete(task.id || task._id, task.completed)}
          className="w-5 h-5 mr-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>

        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-600">{task.dueDate}</p>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;