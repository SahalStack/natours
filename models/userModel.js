const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'A user must have an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email address'],
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    // minlength: [8, 'A password must have more than or equal to 8 characters'],
    select: false, // Do not return password in queries
  },
  confirmPassword: {
    type: String,
    required: [true, 'A user must confirm the password'],
    validate: {
      //This is only Works for the CREATE AND Save
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the Same!',
    },
  },
  passwordChangedAt: Date,
  photo: {
    type: String,
    default: 'default.jpg',
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  // Hash the password
  if (!this.isModified('password')) return next();

  //hash the password with the cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //delete the passwordconfirm
  this.confirmPassword = undefined; // Remove confirmPassword
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// Add a custom method to userSchema to check if passwords match
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  //false means not changed
  return false;
};

//method to generate and store a password reset token
userSchema.methods.createPasswordResetToken = function () {
  // 1. Create a random reset token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // 2. Hash the token and store it in the database for verification
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 3. Set token expiry time (10 minutes from now)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
