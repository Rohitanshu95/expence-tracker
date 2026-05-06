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
    res.status(500).json({ message: "Error creating module", error: error.message });
  }
};

const getModules = async (req, res) => {
  try {
    const modules = await Module.find({ user: req.userId });
    res.status(200).json(modules);
  } catch (error) {
    res.status(500).json({ message: "Error fetching modules", error: error.message });
  }
};

const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;
    await Module.findOneAndDelete({ _id: id, user: req.userId });
    res.status(200).json({ message: "Module deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting module", error: error.message });
  }
};

module.exports = { createModule, getModules, deleteModule };
