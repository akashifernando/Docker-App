import React, { useState, useEffect } from 'react';
const SUBJECT_OPTIONS = [
  'logic design',
  'QA',
  'web development',
  'Machine Learning',
  'HDL',
  'Maths',
  'Network',
];

const TaskForm = ({
  initialData = {},
  onSave,
  onUpdate,
  onDelete,
  onClose,
  mode = 'add', // add || edit
}) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  // Map backend 'subject' to local state
  const [subject, setSubject] = useState(initialData.subject || initialData.category || '');
  const [dueDate, setDueDate] = useState(
    initialData.dueDate ? new Date(initialData.dueDate).toISOString().slice(0, 16) : ''
  );

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      // Map backend 'subject' to local state
      setSubject(initialData.subject || initialData.category || '');
      setDueDate(
        initialData.dueDate ? new Date(initialData.dueDate).toISOString().slice(0, 16) : ''
      );
    }
  }, [initialData, mode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    //stop browser default form submission behavior
    // control flow using React, Axios instead of triggering a page reload.
    // Convert date string to LocalDate format
    const formatDateForBackend = (dateString) => {
      if (!dateString) return null;
      return new Date(dateString).toISOString().split('T')[0];
    };

    const taskData = {
      title,
      description,
      subject, // Send as 'subject' to match backend
      completed: initialData.completed || false,
      dueDate: formatDateForBackend(dueDate)
    };

    if (mode === 'add') {
      onSave && onSave(taskData);
    } else {
      // For edit mode, include the task ID
      onUpdate && onUpdate({
        ...taskData,
        id: initialData.id || initialData._id
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <form
        className="relative w-full max-w-xl p-8 bg-white shadow-xl rounded-2xl"
        onSubmit={handleSubmit}
      >
        <button
          type="button"
          className="absolute text-2xl text-gray-400 top-4 right-4 hover:text-gray-600"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="flex flex-col items-center mb-6">
          <span className="mb-2 text-3xl">📝</span>
          <h2 className="text-2xl font-bold">{mode === 'add' ? 'New Task' : 'Edit Task'}</h2>
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-lg font-semibold">Title</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-lg font-semibold">Details</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div className="flex mb-4 space-x-4">
          <div className="flex-1">
            <label className="block mb-1 text-lg font-semibold">Subject</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            >
              <option value="">Select Subject</option>
              {SUBJECT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-lg font-semibold">Due Date</label>
            <input
              type="datetime-local"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex justify-between mt-8">
          {mode === 'edit' && (
            <button
              type="button"
              className="px-8 py-2 mr-2 text-lg font-bold text-white rounded-lg bg-gradient-to-r from-purple-400 to-blue-400"
              onClick={() => onDelete && onDelete(initialData.id || initialData._id)}
            >
              DELETE
            </button>
          )}
          {mode === 'edit' && (
            <button
              type="submit"
              className="px-8 py-2 mr-2 text-lg font-bold text-white rounded-lg bg-gradient-to-r from-purple-400 to-blue-400"
            >
              Update
            </button>
          )}
          {mode === 'add' && (
            <button
              type="submit"
              className="px-8 py-2 ml-auto text-lg font-bold text-white rounded-lg bg-gradient-to-r from-purple-400 to-blue-400"
            >
              Save
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
