const express = require('express');
const { getKhatas, createKhata, addKhataTransaction, deleteKhata, deleteKhataTransaction } = require('../controllers/khataController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getKhatas);
router.post('/', auth, createKhata);
router.post('/:id/transaction', auth, addKhataTransaction);
router.delete('/:id', auth, deleteKhata);
router.delete('/:id/transaction/:txId', auth, deleteKhataTransaction);

module.exports = router;
