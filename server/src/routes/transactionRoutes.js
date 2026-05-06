const express = require('express');
const { addTransaction, getTransactions, deleteTransaction } = require('../controllers/transactionController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getTransactions);
router.post('/', auth, addTransaction);
router.delete('/:id', auth, deleteTransaction);

module.exports = router;
