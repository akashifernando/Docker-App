const Task = require('../models/Task');
const Response = require('../utility/Response');

exports.createTask = async (req, res) => {
    // Spring Boot: @Valid @RequestBody TaskRequest
    // TaskRequest: title, description, completed, subject, dueDate
    const { title, description, completed, subject, dueDate } = req.body;
    console.log('Create Task Request Body:', req.body);
    console.log('User ID:', req.user.userId);

    try {
        const newTask = new Task({
            title,
            description,
            completed: completed || false, // Default to false if not provided, just like generic boolean
            subject,
            dueDate,
            user: req.user.userId,
        });
        const task = await newTask.save();
        // Return: ResponseEntity.ok(taskService.createTask(taskRequest))
        res.json(Response.ok(task, "Task created successfully"));
    } catch (err) {
        console.error(err.message);
        res.status(500).json(Response.error(500, 'Server Error'));
    }
};

exports.updateTask = async (req, res) => {
    // Spring Boot: updateTask(@RequestBody TaskRequest taskRequest)
    // Here we usually get ID from URL in MERN, but check api.js: user uses api.put(`/api/tasks/${data.id}`, data)
    // So ID is in params.
    const { title, description, completed, subject, dueDate } = req.body;

    const taskFields = {};
    if (title) taskFields.title = title;
    if (description) taskFields.description = description;
    if (completed !== undefined) taskFields.completed = completed;
    if (subject) taskFields.subject = subject;
    if (dueDate) taskFields.dueDate = dueDate;
    taskFields.updatedAt = Date.now();

    try {
        let task = await Task.findById(req.params.id);
        if (!task) return res.status(200).json(Response.error(404, 'Task not found'));

        if (task.user.toString() !== req.user.userId) {
            return res.status(200).json(Response.error(401, 'Not authorized'));
        }

        task = await Task.findByIdAndUpdate(req.params.id, { $set: taskFields }, { new: true });
        res.json(Response.ok(task, "Task updated successfully"));
    } catch (err) {
        console.error(err.message);
        res.status(500).json(Response.error(500, 'Server Error'));
    }
};

exports.getAllMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.userId }).sort({ createdAt: -1 });
        res.json(Response.ok(tasks));
    } catch (err) {
        console.error(err.message);
        res.status(500).json(Response.error(500, 'Server Error'));
    }
};

exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(200).json(Response.error(404, 'Task not found'));

        if (task.user.toString() !== req.user.userId) {
            return res.status(200).json(Response.error(401, 'Not authorized'));
        }
        res.json(Response.ok(task));
    } catch (err) {
        console.error(err.message);
        res.status(500).json(Response.error(500, 'Server Error'));
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(200).json(Response.error(404, 'Task not found'));

        if (task.user.toString() !== req.user.userId) {
            return res.status(200).json(Response.error(401, 'Not authorized'));
        }

        await Task.findByIdAndDelete(req.params.id);
        res.json(Response.ok(null, 'Task removed'));
    } catch (err) {
        console.error(err.message);
        res.status(500).json(Response.error(500, 'Server Error'));
    }
};

exports.getMyTasksByCompletionStatus = async (req, res) => {
    // Spring Boot: @RequestParam boolean completed
    const completed = req.query.completed === 'true'; // Parse query param
    try {
        const tasks = await Task.find({ user: req.user.userId, completed: completed }).sort({ createdAt: -1 });
        res.json(Response.ok(tasks));
    } catch (err) {
        console.error(err.message);
        res.status(500).json(Response.error(500, 'Server Error'));
    }
};
