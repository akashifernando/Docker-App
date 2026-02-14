import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, TrendingUp } from '../components/Icons';
import { format, parseISO } from 'date-fns';
import TaskCard from '../components/TaskCard';
import StatCard from '../components/StatCard';
import CalendarWidget from '../components/CalendarWidget';
import progress from '../progress.png';
import TaskForm from '../components/TaskForm';
import img from '../image1.png';
import { getAllTasks, createTask, updateTask } from '../services/api';

const Dashboard = ({ currentUser }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  //fetches tasks when the component loads or when the user changes.
  useEffect(() => {
    loadAllTasks();
  }, [currentUser]);



  const loadAllTasks = async () => {
    try {
      setLoading(true);
      const response = await getAllTasks();
      console.log(response)
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

  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData);////sends a new task to the backend 
      setShowCreateModal(false);//closes the modal
      await loadAllTasks();//reloads the task 
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };
  //updates the task completion status 

  const handleToggleComplete = async (taskId, currentStatus) => {
    try {
      const response = await updateTask({ id: taskId, completed: !currentStatus })
      if (response.status === 200) {
        setTasks(tasks.map(task =>
          (task.id === taskId || task._id === taskId) ? { ...task, completed: !currentStatus } : task
        ));
      }
    } catch (error) {
      console.error('Error updating task:', error);
      console.error('Error details:', error.response?.data);

    }

  };


  const nextTask = tasks.length > 0 ? tasks[0] : null;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Welcome Card */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900"></h2>
                <h3 className="mt-1 text-xl text-gray-600">Here's your next task</h3>
                {nextTask ? (
                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-900">{nextTask.title}</div>
                    <div className="text-sm text-gray-500">
                      Due: {nextTask.dueDate ? format(parseISO(nextTask.dueDate), 'MMM dd, yyyy') : 'No due date'}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-gray-500">No tasks available</div>
                )}
              </div>
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-20 bg-gray-100 rounded-lg h-50">
                  <img src={img} alt="Logo" className="object-contain h-50 w-100" />
                </div>
              </div>
            </div>
          </div>
          <div
            onClick={() => setShowCreateModal(true)}
            className="flex items-center w-full px-4 py-3 transition-colors bg-white border border-indigo-500 rounded-full shadow-md cursor-pointer hover:bg-indigo-50"
          >
            <div className="flex items-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-lg">Add New Task</span>
            </div>
            <button className="p-2 ml-auto text-indigo-600 bg-indigo-100 rounded-full hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          {/* Task List */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">All Tasks</h3>
            </div>
            <div className="space-y-4">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    handleToggleComplete={handleToggleComplete}
                    isHighlighted={task.completed}
                  />
                ))
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No tasks found</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <img src={progress} alt="Progress" className="object-contain h-50 w-100" />
          </div>
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          <CalendarWidget />
          <div className="space-y-4">
            <StatCard
              title="Total Tasks"
              value={tasks.length}
              color="bg-indigo-100 text-indigo-600"
              icon={CheckCircle}
            />
            <StatCard
              title="Completed"
              value={tasks.filter(task => task.completed).length}
              color="bg-green-100 text-green-600"
              icon={TrendingUp}
            />

            <StatCard
              title="Pending"
              value={tasks.filter(task => !task.completed).length}
              color="bg-red-100 text-red-600"
              icon={Clock}
            />

            <StatCard
              title="In Progress"
              value={tasks.filter(task => !task.completed).length}
              color="bg-teal-100 text-teal-600"
              icon={Clock}
            />
          </div>
        </div>
        {showCreateModal && (
          <TaskForm
            mode="add"
            onSave={handleCreateTask}
            onClose={() => setShowCreateModal(false)}//close modal cancels 
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
//useEffect fetch all tasks from the backend when component loads
// tasks stored in state using useState
//task creation and completion toggling with API calls using Axios.