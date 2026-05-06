const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

const addTransaction = async (req, res) => {
  try {
    console.log("Incoming Transaction Request:", req.body);
    const { amount, date, note, type, moduleId } = req.body;
    
    // Basic validation
    if (!amount || !type || !moduleId) {
      return res.status(400).json({ message: "Missing required fields: amount, type, and moduleId are required." });
    }

    const newTransaction = new Transaction({
      amount,
      date: date || Date.now(),
      note,
      type,
      module: moduleId,
      user: req.userId
    });

    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error("Add Transaction Error:", error);
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

const getSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.userId });
    
    const summary = transactions.reduce((acc, curr) => {
      if (curr.type === 'income') {
        acc.income += curr.amount;
      } else {
        acc.expense += curr.amount;
      }
      return acc;
    }, { income: 0, expense: 0 });

    const balance = summary.income - summary.expense;

    // Get last 7 days for chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const chartData = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.userId), date: { $gte: sevenDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
          expense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
      }},
      { $sort: { "_id": 1 } }
    ]);

    res.status(200).json({
      totalBalance: balance,
      totalIncome: summary.income,
      totalExpense: summary.expense,
      chartData: chartData.map(d => ({
        date: d._id,
        income: d.income,
        expense: d.expense
      }))
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching summary", error: error.message });
  }
};

module.exports = { addTransaction, getTransactions, deleteTransaction, getSummary };
