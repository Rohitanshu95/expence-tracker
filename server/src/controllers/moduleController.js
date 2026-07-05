const Module = require('../models/Module');

const createModule = async (req, res) => {
  try {
    const { name, type, icon, color, budget } = req.body;
    const newModule = new Module({
      name,
      type,
      icon,
      color,
      budget,
      user: req.userId
    });
    await newModule.save();
    res.status(201).json(newModule);
  } catch (error) {
    res.status(500).json({ message: "Error creating module" });
  }
};

const getModules = async (req, res) => {
  try {
    let modules = await Module.find({ user: req.userId });
    
    // If user has no modules, create default ones
    if (modules.length === 0) {
      const defaultModules = [
        { name: 'Food', type: 'expense', icon: 'Utensils', color: '#ef4444' },
        { name: 'Transport', type: 'expense', icon: 'Car', color: '#3b82f6' },
        { name: 'Salary', type: 'income', icon: 'Wallet', color: '#10b981' },
        { name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#f59e0b' },
        { name: 'Housing', type: 'expense', icon: 'Home', color: '#6366f1' },
        { name: 'Entertainment', type: 'expense', icon: 'Film', color: '#ec4899' },
        { name: 'Health', type: 'expense', icon: 'Heart', color: '#f43f5e' },
        { name: 'Utilities', type: 'expense', icon: 'Zap', color: '#eab308' },
        { name: 'Investment', type: 'income', icon: 'TrendingUp', color: '#8b5cf6' },
        { name: 'Other', type: 'expense', icon: 'Tag', color: '#94a3b8' }
      ];
      modules = await Module.insertMany(defaultModules.map(m => ({ ...m, user: req.userId })));
    } else if (!modules.find(m => m.name === 'Other')) {
      // Ensure 'Other' category exists even if user has other modules
      const otherModule = new Module({
        name: 'Other',
        type: 'expense',
        icon: 'Tag',
        color: '#94a3b8',
        user: req.userId
      });
      await otherModule.save();
      modules.push(otherModule);
    }
    
    res.status(200).json(modules);
  } catch (error) {
    res.status(500).json({ message: "Error fetching modules" });
  }
};

const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;
    await Module.findOneAndDelete({ _id: id, user: req.userId });
    res.status(200).json({ message: "Module deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting module" });
  }
};

module.exports = { createModule, getModules, deleteModule };
