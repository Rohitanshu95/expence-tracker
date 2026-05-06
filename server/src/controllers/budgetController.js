const Budget = require('../models/Budget');

exports.getBudget = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    const budget = await Budget.findOne({ 
      user: req.user._id, 
      month: parseInt(month), 
      year: parseInt(year) 
    });

    res.json(budget || { amount: 0 });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.setBudget = async (req, res) => {
  try {
    const { month, year, amount } = req.body;
    
    if (amount === undefined || amount < 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    let budget = await Budget.findOne({ 
      user: req.user._id, 
      month: parseInt(month), 
      year: parseInt(year) 
    });

    if (budget) {
      budget.amount = amount;
      await budget.save();
    } else {
      budget = await Budget.create({
        user: req.user._id,
        month: parseInt(month),
        year: parseInt(year),
        amount
      });
    }

    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
