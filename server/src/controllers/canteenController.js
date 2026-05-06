const Canteen = require('../models/Canteen');

const getCanteenStatus = async (req, res) => {
  try {
    let canteen = await Canteen.findOne({ user: req.userId });
    
    if (!canteen) {
      canteen = new Canteen({ user: req.userId });
      await canteen.save();
    }
    
    res.status(200).json(canteen);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching canteen status', error: error.message });
  }
};

const logMeal = async (req, res) => {
  try {
    const { mealType } = req.body; 
    const canteen = await Canteen.findOne({ user: req.userId });

    if (!canteen) return res.status(404).json({ message: 'Canteen pass not found' });

    // Check if a meal of the same type was already logged TODAY
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const alreadyLoggedToday = canteen.history.find(meal => 
      meal.mealType === mealType && 
      meal.date >= today && 
      meal.date < tomorrow
    );

    if (alreadyLoggedToday) {
      return res.status(400).json({ message: `You have already logged ${mealType} for today!` });
    }

    if (mealType === 'lunch') {
      if (canteen.lunchRemaining <= 0) return res.status(400).json({ message: 'No lunch meals left! Please renew.' });
      canteen.lunchRemaining -= 1;
    } else if (mealType === 'dinner') {
      if (canteen.dinnerRemaining <= 0) return res.status(400).json({ message: 'No dinner meals left! Please renew.' });
      canteen.dinnerRemaining -= 1;
    } else {
      return res.status(400).json({ message: 'Invalid meal type' });
    }

    canteen.history.unshift({ mealType, date: new Date() });
    
    await canteen.save();
    res.status(200).json(canteen);
  } catch (error) {
    res.status(500).json({ message: 'Error logging meal', error: error.message });
  }
};

const deleteMeal = async (req, res) => {
  try {
    const { mealId } = req.params;
    const canteen = await Canteen.findOne({ user: req.userId });

    if (!canteen) return res.status(404).json({ message: 'Canteen pass not found' });

    const mealIndex = canteen.history.findIndex(m => m._id.toString() === mealId);
    if (mealIndex === -1) return res.status(404).json({ message: 'Meal log not found' });

    const mealType = canteen.history[mealIndex].mealType;

    // Restore the count
    if (mealType === 'lunch') {
      canteen.lunchRemaining += 1;
    } else if (mealType === 'dinner') {
      canteen.dinnerRemaining += 1;
    }

    // Remove from history
    canteen.history.splice(mealIndex, 1);

    await canteen.save();
    res.status(200).json(canteen);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting meal', error: error.message });
  }
};

const renewPass = async (req, res) => {
  try {
    const canteen = await Canteen.findOne({ user: req.userId });
    
    if (!canteen) {
      const newCanteen = new Canteen({ user: req.userId });
      await newCanteen.save();
      return res.status(200).json(newCanteen);
    }

    const archiveData = {
      label: `Pass #${canteen.archives.length + 1}`,
      lunchUsed: canteen.totalLunch - canteen.lunchRemaining,
      dinnerUsed: canteen.totalDinner - canteen.dinnerRemaining,
      startDate: canteen.lastRenewed,
      endDate: new Date(),
      history: [...canteen.history]
    };

    canteen.archives.unshift(archiveData);
    
    if (canteen.archives.length > 12) canteen.archives.pop();

    canteen.lunchRemaining = 30;
    canteen.dinnerRemaining = 30;
    canteen.history = []; 
    canteen.lastRenewed = new Date();
    
    await canteen.save();
    res.status(200).json(canteen);
  } catch (error) {
    res.status(500).json({ message: 'Error renewing pass', error: error.message });
  }
};

module.exports = { getCanteenStatus, logMeal, deleteMeal, renewPass };
