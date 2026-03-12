const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', authorize('admin', 'manager'), userController.getAll);
router.get('/:id', authorize('admin', 'manager'), userController.getById);
router.post('/', authorize('admin'), userController.create);
router.put('/:id', authorize('admin'), userController.update);
router.delete('/:id', authorize('admin'), userController.remove);

module.exports = router;
