const express = require('express');
const { getCanteenStatus, logMeal, deleteMeal, renewPass } = require('../controllers/canteenController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/status', auth, getCanteenStatus);
router.post('/log', auth, logMeal);
router.delete('/log/:mealId', auth, deleteMeal);
router.post('/renew', auth, renewPass);

module.exports = router;
