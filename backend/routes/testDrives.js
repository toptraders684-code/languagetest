const express = require('express');
const router = express.Router();
const testDriveController = require('../controllers/testDriveController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', testDriveController.getAll);
router.get('/:id', testDriveController.getById);
router.post('/', testDriveController.create);
router.put('/:id', testDriveController.update);

module.exports = router;
