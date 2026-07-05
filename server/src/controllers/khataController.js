const Khata = require('../models/Khata');

// Get all khatas for a user
exports.getKhatas = async (req, res) => {
  try {
    const khatas = await Khata.find({ user: req.userId }).sort({ updatedAt: -1 });
    res.json(khatas);
  } catch (err) {
    console.error('ERROR in getKhatas:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create a new person entry
exports.createKhata = async (req, res) => {
  try {
    const { personName, phoneNumber, partyType, openingBalance, openingBalanceType, gstin, address } = req.body;
    
    const khata = new Khata({
      user: req.userId,
      personName,
      phoneNumber,
      partyType,
      gstin,
      address,
      transactions: []
    });

    // Handle opening balance as initial transaction
    if (openingBalance && openingBalance > 0) {
      khata.transactions.push({
        type: openingBalanceType === 'give' ? 'gave' : 'got',
        amount: Number(openingBalance),
        description: 'Opening Balance',
        date: new Date()
      });
    }

    await khata.save();
    res.status(201).json(khata);
  } catch (err) {
    console.error('ERROR in createKhata:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Add a transaction to a khata
exports.addKhataTransaction = async (req, res) => {
  try {
    const { type, amount, description } = req.body;
    const khata = await Khata.findOne({ _id: req.params.id, user: req.userId });
    
    if (!khata) {
      return res.status(404).json({ message: 'Khata not found' });
    }

    khata.transactions.push({ type, amount, description });
    await khata.save();
    res.json(khata);
  } catch (err) {
    console.error('ERROR in addKhataTransaction:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a khata person
exports.deleteKhata = async (req, res) => {
  try {
    const khata = await Khata.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!khata) return res.status(404).json({ message: 'Khata not found' });
    res.json({ message: 'Khata removed' });
  } catch (err) {
    console.error('ERROR in deleteKhata:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a transaction from a khata
exports.deleteKhataTransaction = async (req, res) => {
  try {
    const khata = await Khata.findOne({ _id: req.params.id, user: req.userId });
    if (!khata) return res.status(404).json({ message: 'Khata not found' });

    khata.transactions = khata.transactions.filter(t => t._id.toString() !== req.params.txId);
    await khata.save();
    res.json(khata);
  } catch (err) {
    console.error('ERROR in deleteKhataTransaction:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
