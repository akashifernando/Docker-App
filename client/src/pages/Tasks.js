import React, { useState, useEffect } from 'react';
import { Search, Filter, Check, Calendar } from '../components/Icons';
import { getAllTasks, createTask, updateTask, deleteTask } from '../services/api';
import TaskDetails from '../components/TaskDetails';
import TaskForm from '../components/TaskForm';

const Tasks = ({ currentUser }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    loadAllTasks();
  }, []);

  const loadAllTasks = async () => {
    try {
      setLoading(true);
      const response = await getAllTasks();
      if (response.data && response.data.data) {
        setTasks(response.data.data);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };



  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(t => (t.id !== taskId && t._id !== taskId)));
      if (selectedTask && (selectedTask.id === taskId || selectedTask._id === taskId)) {
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      console.log('Updating task with data:', taskData);
      const response = await updateTask(taskData);
      console.log('Update response:', response);

      setShowEditModal(false);

      // Update the selected task with the response data
      if (response.data && response.data.data) {
        setSelectedTask(response.data.data);
      }

      // Reload all tasks to update the list
      await loadAllTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const handleDeleteFromDetails = async (taskId) => {
    await handleDeleteTask(taskId);
    setShowEditModal(false);
    setSelectedTask(null);
  };

  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData);
      setShowCreateModal(false);
      await loadAllTasks(); // Reload all tasks
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task! Check console for details.');
    }
  };

  const handleToggleComplete = async (taskId, currentStatus) => {
    try {
      // Optimistic update could be done here, but let's wait for server for now to be safe
      const response = await updateTask({ id: taskId, completed: !currentStatus });

      if (response.data && response.data.success) {
        const updatedTask = response.data.data;

        // Update list
        setTasks(currentTasks => currentTasks.map(t =>
          (t.id === taskId || t._id === taskId) ? updatedTask : t
        ));

        // Update selected task if it matches
        if (selectedTask && (selectedTask.id === taskId || selectedTask._id === taskId)) {
          setSelectedTask(updatedTask);
        }
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filterOptions = [
    { value: 'all', label: 'All Tasks', count: tasks.length },
    { value: 'pending', label: 'Pending', count: tasks.filter(t => !t.completed).length },
    { value: 'completed', label: 'Completed', count: tasks.filter(t => t.completed).length }
  ];

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex space-x-6">
      {/* Left: Task List */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-gray-600">Manage your daily tasks and stay productive</p>
          </div>  </div>
        <div className="flex items-center w-full px-4 py-3 bg-white border border-indigo-500 rounded-full shadow-md">
          {/*add new task */}
          <div className="flex items-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-lg">Add New Task</span>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="p-2 ml-auto text-indigo-600 bg-indigo-100 rounded-full hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex space-x-1">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === option.value
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button className="p-2 text-gray-400 border border-gray-300 rounded-lg hover:text-gray-600">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Tasks List */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {filteredTasks.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <div
                  key={task.id || task._id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${selectedTask && (selectedTask.id === task.id || selectedTask._id === task._id) ? 'bg-indigo-50' : ''}`}
                  onClick={() => { setSelectedTask(task); setShowEditModal(false); }}
                >
                  <div className="flex items-start justify-between">
                    {/* Checkbox area */}
                    <div className="flex items-center pt-1 pr-3">
                      <input
                        type="checkbox"
                        checked={task.completed || false}
                        onChange={() => handleToggleComplete(task.id || task._id, task.completed)}
                        onClick={(e) => e.stopPropagation()} // Prevent row click
                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded cursor-pointer focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        {task.completed && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      {task.subject && (
                        <p className="mb-2 text-sm text-gray-600 line-clamp-2">
                          {task.subject}
                        </p>
                      )}
                      {task.description && (
                        <p className="mb-2 text-sm text-gray-600 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                        </span>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${task.completed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                      }`}>
                      {task.completed ? 'Completed' : 'Pending'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Check className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">No tasks found</h3>
              <p className="mb-6 text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria' : 'Click "Add Task" to create your first task'}
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Right: Task Details Panel */}
      <TaskDetails
        selectedTask={selectedTask}
        setShowEditModal={setShowEditModal}
        handleDeleteFromDetails={handleDeleteFromDetails}
      />
      {/* TaskForm Modals */}
      {showCreateModal && (
        <TaskForm
          mode="add"
          onSave={handleCreateTask}
          onClose={() => setShowCreateModal(false)}
        />
      )}
      {showEditModal && selectedTask && (
        <TaskForm
          mode="edit"
          initialData={selectedTask}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteFromDetails}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default Tasks;