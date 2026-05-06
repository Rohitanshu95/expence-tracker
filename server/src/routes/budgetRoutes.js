const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const auth = require('../middleware/auth');

router.use(auth); // All budget routes require auth

router.get('/', budgetController.getBudget);
router.post('/', budgetController.setBudget);

module.exports = router;
