const express = require('express');
const router = express.Router();
const dealController = require('../controllers/dealController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', dealController.getAll);
router.get('/:id', dealController.getById);
router.post('/', dealController.create);
router.put('/:id', dealController.update);

module.exports = router;
