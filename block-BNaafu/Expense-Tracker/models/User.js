var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

// var userSchema = new Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     username: { type: String, required: true, unique: true },
//     photo: { type: String, required: true },
//   },
//   { timestamps: true }
// );

// const userSchema = new Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true }, // dont give unique: true here if you want to allow users to sign up with the same email address using different OAuth providers. Else it will fail saying dupicate entry in DB
//     username: { type: String, required: true },
//     photo: { type: String, default: '/images/default-photo.jpg' }, // Default or placeholder photo
//     password: {
//       type: String,
//       required: function () {
//         return (
//           this.isModified('password') || (this.password && !this.oauthId) // Ensure password is required only for local email/password login
//         );
//       },
//     },
//     oauthId: { type: String }, // Unique identifier from the OAuth provider. But the unique: true was removed - the case if users have accounts with the same OAuth provider but on different platforms (e.g., Google and GitHub)
//     accessToken: { type: String }, // Token obtained during OAuth authentication
//   },
//   { timestamps: true }
// );

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true }, // dont keep unique true for email, as an OAUth login might have the same email as local login user.
    username: { type: String, required: true },
    photo: { type: String },
    password: { type: String }, // For local login
    isVerified: { type: Boolean, default: false }, // For email verification
    verificationToken: { type: String }, // For email verification
    logins: [
      {
        method: { type: String, required: true }, // 'local', 'github', 'google', etc.
        oauthId: { type: String }, // Unique identifier from the OAuth provider
        accessToken: { type: String }, // Token obtained during OAuth authentication
      },
    ],
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
