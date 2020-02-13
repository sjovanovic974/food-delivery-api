const mongoose = require('mongoose');
const slugify = require('slugify');

const mealSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A meal must have a name!'],
      trim: true,
      unique: true,
      maxlength: [50, 'A meal name must have less or equal to 50 characters!'],
      minlength: [2, 'A meal name must have more or equal to 2 characters!']
    },
    slug: String,
    description: {
      type: String,
      trim: true,
      required: [true, 'A meal must have a description!'],
      maxlength: [
        200,
        'A meal description must have less or equal to 200 characters!'
      ],
      minlength: [
        10,
        'A meal description must have more or equal to 10 characters!'
      ]
    },
    price: {
      type: Number,
      required: [true, 'A meal must have a price!'],
      min: [1, 'Price must be equal or bigger than 1!']
    },
    deliveryTime: {
      type: Number,
      min: [5, 'Minimal delivery time is 5 minutes!'],
      max: [45, 'Maximal delivery time is 45 minutes!']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message:
          'Discount price ({VALUE}) should be lesser than the regular price!'
      }
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    image: {
      type: String,
      default: 'pizza.jpg'
    },
    isVegetarian: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      enum: {
        values: ['small', 'regular', 'large'],
        message: 'Size can be either: small, regular or large!'
      }
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

mealSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

mealSchema.virtual('cheap').get(function() {
  return this.price <= 4;
});

const Meal = mongoose.model('Meal', mealSchema);

module.exports = Meal;
