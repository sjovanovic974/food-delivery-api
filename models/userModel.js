const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, 'Please, provide your username!'],
    trim: true,
    unique: true,
    maxlength: [20, 'A username must have less or equal to 20 characters!'],
    minlength: [2, 'A username must have more or equal to 2 characters!']
  },
  firstName: {
    type: String,
    required: [true, 'Please, provide your first name!'],
    trim: true,
    maxlength: [20, 'A first name must have less or equal to 20 characters!'],
    minlength: [2, 'A first name must have more or equal to 2 characters!']
  },
  lastName: {
    type: String,
    required: [true, 'Please, provide your last name!'],
    trim: true,
    maxlength: [20, 'A last name must have less or equal to 20 characters!'],
    minlength: [2, 'A last name must have more or equal to 2 characters!']
  },
  email: {
    unique: true,
    type: String,
    required: [true, 'Please, provide your email!'],
    lowercase: true,
    validate: [validator.isEmail, 'Please, provide a valid email!']
  },
  address: {
    type: String,
    required: [true, 'Please, provide your address!'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please, provide your phone number!'],
    validate: {
      validator: function(val) {
        const regexObj = /((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{3,4}/;
        return regexObj.test(val);
      },
      message: 'Please, provide your phone number! ({VALUE}) is invalid format!'
    }
  },
  photo: {
    type: String,
    default: 'user.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please, provide your password!'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please, confirm your password!'],
    validate: {
      validator: function(val) {
        return val === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
