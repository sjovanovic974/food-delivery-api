const Meal = require('./../models/mealModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.aliasTopVegetarian = (req, res, next) => {
  req.query.limit = '3';
  req.query.sort = '-price';
  req.query.isVegetarian = true;
  next();
};

exports.getAllMeals = async (req, res) => {
  try {
    // Executing the Query
    const features = new APIFeatures(Meal.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const meals = await features.query;

    // Sending response
    res.status(200).json({
      status: 'success',
      results: meals.length,
      data: {
        meals
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.getMealStats = async (req, res) => {
  try {
    const stats = await Meal.aggregate([
      // {
      //   $match: { category: 'pizza' }
      // },
      {
        $group: {
          _id: '$isVegetarian',
          numMeals: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: {
          maxPrice: -1
        }
      },
      {
        $addFields: {
          vegetarian: '$_id'
        }
      },
      {
        $project: {
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.getMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        meal
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};

exports.createMeal = async (req, res) => {
  try {
    const newMeal = await Meal.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        meal: newMeal
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error
    });
  }
};

exports.updateMeal = async (req, res) => {
  try {
    const meal = await Meal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        meal
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};

exports.deleteMeal = async (req, res) => {
  try {
    await Meal.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};
