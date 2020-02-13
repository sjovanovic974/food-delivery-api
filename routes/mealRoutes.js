const express = require('express');
const mealController = require('./../controllers/mealController');

const router = express.Router();

router
  .route('/top-3-vegetarian')
  .get(mealController.aliasTopVegetarian, mealController.getAllMeals);

router.route('/meal-stats').get(mealController.getMealStats);

router
  .route('/')
  .get(mealController.getAllMeals)
  .post(mealController.createMeal);

router
  .route('/:id')
  .get(mealController.getMeal)
  .patch(mealController.updateMeal)
  .delete(mealController.deleteMeal);

module.exports = router;
