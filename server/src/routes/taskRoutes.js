const express = require('express');
const router = express.Router();
const { getAllMyTasks, getTaskById, createTask, updateTask, deleteTask, getMyTasksByCompletionStatus } = require('../controllers/taskController');
const authMiddleware = require('../utility/authMiddleware');

router.use(authMiddleware);

router.get('/', getAllMyTasks);
router.post('/', createTask);
router.get('/status', getMyTasksByCompletionStatus); // Must be before /:id
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
