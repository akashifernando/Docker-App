
import React from 'react';
import { Check, Trash2, Edit3 } from '../components/Icons';

const TaskDetails = ({ selectedTask, setShowEditModal, handleDeleteFromDetails }) => {
  const formatTaskDateTime = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  const getCategoryTagStyle = () =>
    "inline-flex items-center px-3 py-1 mr-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-full border border-gray-200";

  return (
    <div className="sticky self-start p-6 bg-white border border-gray-200 rounded-lg shadow-sm w-96 h-fit top-8">
      {selectedTask ? (
        <div>
          <div className="mb-4 text-xs font-medium text-gray-500">Task</div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold">{selectedTask.title}</h2>
            <div className="flex space-x-2">
              <button
                className="p-1 text-gray-500 transition-colors rounded-full hover:text-indigo-600 hover:bg-gray-100"
                onClick={() => setShowEditModal(true)}
              >
                <Edit3 className="w-5 h-5" />
              </button>
              <button
                className="p-1 text-gray-500 transition-colors rounded-full hover:text-red-500 hover:bg-gray-100"
                onClick={() => handleDeleteFromDetails(selectedTask.id || selectedTask._id)}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="mb-6 text-sm text-gray-500">
            {formatTaskDateTime(selectedTask.dueDate)}
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedTask.categories && Array.isArray(selectedTask.categories) ? (
              selectedTask.categories.map((category, index) => (
                <span key={index} className={getCategoryTagStyle()}>
                  {category}
                </span>
              ))
            ) : (
              selectedTask.category && (
                <span className={getCategoryTagStyle()}>
                  {selectedTask.category}
                </span>
              )
            )}
          </div>
          <div className="mb-6">
            <h4 className="mb-2 text-xs font-medium text-gray-500">Description</h4>
            <div className="bg-gray-50 rounded-lg p-3 min-h-[60px] text-gray-800 text-sm border border-gray-200">
              {selectedTask.description || 'No description'}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-20 text-center text-gray-500">
          <Check className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">No Task Selected</h3>
          <p className="text-sm">Select a task from the list to view its details</p>
        </div>
      )}
    </div>
  );
};

export default TaskDetails;