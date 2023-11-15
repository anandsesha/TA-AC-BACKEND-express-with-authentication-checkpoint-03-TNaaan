var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    photo: { type: String, required: true },
  },
  { timestamps: true }
);

userSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    console.log(this, `inside pre-save hook`);
    bcrypt.hash(this.password, 10, (err, hashed) => {
      if (err) return next(err);
      console.log(hashed);
      this.password = hashed; // put the hashed passwd into existing string passwrod '123456'
      return next();
    });
  } else {
    next();
  }
});

/*
  in line -> return next(); above,
  Using next(); without return: 
  If you use next(); without return, it will continue executing the code after 
  the bcrypt.hash callback, even if there was an error during hashing. 
  This means that the subsequent code could be executed even when there's an error,
  potentially leading to unexpected behavior or bugs.
  */

userSchema.methods.verifyPassword = function (password, cb) {
  bcrypt.compare(password, this.password, (err, result) => {
    return cb(err, result);
  });
};

var User = mongoose.model('User', userSchema);

module.exports = User;
