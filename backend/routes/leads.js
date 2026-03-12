const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', leadController.getAll);
router.get('/:id', leadController.getById);
router.post('/', leadController.create);
router.put('/:id', leadController.update);
router.delete('/:id', leadController.remove);
router.get('/:id/timeline', leadController.getTimeline);

module.exports = router;
