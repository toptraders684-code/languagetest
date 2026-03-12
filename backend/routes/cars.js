const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticate);

router.get('/', carController.getAll);
router.get('/:id', carController.getById);
router.post('/', authorize('admin', 'manager'), upload.array('images', 10), carController.create);
router.put('/:id', authorize('admin', 'manager'), upload.array('images', 10), carController.update);
router.delete('/:id', authorize('admin'), carController.remove);

module.exports = router;
