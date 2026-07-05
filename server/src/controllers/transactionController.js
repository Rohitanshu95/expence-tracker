const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

const addTransaction = async (req, res) => {
  try {
    console.log("Incoming Transaction Request:", req.body);
    
    if (Array.isArray(req.body)) {
      // Whitelist fields explicitly — never spread the raw request object, or a
      // client could set protected fields like `status`, `_id`, or `createdAt`.
      const transactions = req.body.map(t => ({
        amount: t.amount,
        type: t.type,
        note: t.note,
        date: t.date || Date.now(),
        user: req.userId,
        module: t.moduleId // Map moduleId to module field
      }));

      // Validation for all transactions in array
      for (const t of transactions) {
        if (!t.amount || !t.type || !t.module) {
          return res.status(400).json({ message: "Each transaction must have amount, type, and moduleId." });
        }
      }

      const newTransactions = await Transaction.insertMany(transactions);
      return res.status(201).json(newTransactions);
    }

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
    res.status(500).json({ message: "Error adding transaction" });
  }
};


const getTransactions = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { user: req.userId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const transactions = await Transaction.find(query)
      .populate('module')
      .sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions" });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    await Transaction.findOneAndDelete({ _id: id, user: req.userId });
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting transaction" });
  }
};

const getSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let filter = { user: new mongoose.Types.ObjectId(req.userId) };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    // Use aggregation for summary to be more efficient with filters
    const summaryData = await Transaction.aggregate([
      { $match: filter },
      { $group: {
          _id: null,
          totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
          totalExpense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
      }}
    ]);

    const result = summaryData[0] || { totalIncome: 0, totalExpense: 0 };
    const balance = result.totalIncome - result.totalExpense;

    // Chart data (keep 7 days or use range)
    let chartFilter = { user: new mongoose.Types.ObjectId(req.userId) };
    if (startDate || endDate) {
        chartFilter.date = filter.date;
    } else {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        chartFilter.date = { $gte: sevenDaysAgo };
    }
    
    const chartData = await Transaction.aggregate([
      { $match: chartFilter },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
          expense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
      }},
      { $sort: { "_id": 1 } }
    ]);

    // Category breakdown
    const categoryFilter = { ...filter, type: 'expense' };
    const categoryData = await Transaction.aggregate([
      { $match: categoryFilter },
      { $group: {
          _id: "$module",
          total: { $sum: "$amount" }
      }},
      { $lookup: {
          from: "modules",
          localField: "_id",
          foreignField: "_id",
          as: "moduleInfo"
      }},
      { $unwind: "$moduleInfo" },
      { $project: {
          name: "$moduleInfo.name",
          color: "$moduleInfo.color",
          icon: "$moduleInfo.icon",
          total: 1
      }},
      { $sort: { total: -1 } }
    ]);

    res.status(200).json({
      totalBalance: balance,
      totalIncome: result.totalIncome,
      totalExpense: result.totalExpense,
      chartData: chartData.map(d => ({
        date: d._id,
        income: d.income,
        expense: d.expense
      })),
      categoryData: categoryData
    });

  } catch (error) {
    console.error("Summary Error:", error);
    res.status(500).json({ message: "Error fetching summary" });
  }
};

module.exports = { addTransaction, getTransactions, deleteTransaction, getSummary };
