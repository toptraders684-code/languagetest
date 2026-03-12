const express = require('express');
const router = express.Router();
const followupController = require('../controllers/followupController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', followupController.getAll);
router.post('/', followupController.create);
router.put('/:id', followupController.update);

module.exports = router;
