const express = require('express');
const { createModule, getModules, deleteModule } = require('../controllers/moduleController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getModules);
router.post('/', auth, createModule);
router.delete('/:id', auth, deleteModule);

module.exports = router;
