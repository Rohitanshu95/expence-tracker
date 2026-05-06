const Transaction = require('../models/Transaction');

const addTransaction = async (req, res) => {
  try {
    const { amount, date, note, type, moduleId } = req.body;
    
    const newTransaction = new Transaction({
      amount,
      date: date || Date.now(), // Historical support: use provided date or current
      note,
      type,
      module: moduleId,
      user: req.userId
    });

    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(500).json({ message: "Error adding transaction", error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.userId })
      .populate('module')
      .sort({ date: -1 }); // Newest first
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions", error: error.message });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    await Transaction.findOneAndDelete({ _id: id, user: req.userId });
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting transaction", error: error.message });
  }
};

module.exports = { addTransaction, getTransactions, deleteTransaction };
