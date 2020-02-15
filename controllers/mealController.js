const Meal = require('./../models/mealModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.aliasTopVegetarian = (req, res, next) => {
  req.query.limit = '3';
  req.query.sort = '-price';
  req.query.isVegetarian = true;
  next();
};

exports.getAllMeals = catchAsync(async (req, res, next) => {
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
});

exports.getMealStats = catchAsync(async (req, res, next) => {
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
});

exports.getMeal = catchAsync(async (req, res, next) => {
  const meal = await Meal.findById(req.params.id);

  if (!meal) {
    return next(new AppError('No meal found with this ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      meal
    }
  });
});

exports.createMeal = catchAsync(async (req, res, next) => {
  const newMeal = await Meal.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      meal: newMeal
    }
  });
});

exports.updateMeal = catchAsync(async (req, res, next) => {
  const meal = await Meal.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!meal) {
    return next(new AppError('No meal found with this ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      meal
    }
  });
});

exports.deleteMeal = catchAsync(async (req, res, next) => {
  const meal = await Meal.findByIdAndDelete(req.params.id);

  if (!meal) {
    return next(new AppError('No meal found with this ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
