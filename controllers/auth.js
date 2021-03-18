const User = require('../models/user')
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt')
const _ = require('lodash')
const { sendEmailWithNodemailer } = require("../helpers/email");
 
exports.signup = (req, res) => {
  const { name, email, password } = req.body;
 
  User.findOne({ email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        error: "Email is taken",
      });
    }
 
    const token = jwt.sign(
      { name, email, password },
      process.env.JWT_ACCOUNT_ACTIVATION,
      { expiresIn: "1m" }
    );
 
    const emailData = {
      from: "dmbrusky@gmail.com", // MAKE SURE THIS EMAIL IS YOUR GMAIL FOR WHICH YOU GENERATED APP PASSWORD
      to: email, // WHO SHOULD BE RECEIVING THIS EMAIL? IT SHOULD BE THE USER EMAIL (VALID EMAIL ADDRESS) WHO IS TRYING TO SIGNUP
      subject: "ACCOUNT ACTIVATION LINK",
      html: `
                <h1>Please use the following link to activate your account</h1>
                <a href="http://localhost:3000/auth/activate/${token}">http://localhost:8000/auth/activate/${token}</a>
                <hr />
                <p>This email may contain sensitive information</p>
                <p>http://localhost:3000</p>
            `,
    };
 
    sendEmailWithNodemailer(req, res, emailData);

  });
};


exports.accountActivation = (req, res) => {
  const { token } = req.body;

  if (token) {
      jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function(err, decoded) {
          if (err) {
              console.log('JWT VERIFY IN ACCOUNT ACTIVATION ERROR', err);
              return res.status(401).json({
                  error: 'Expired link. Signup again'
              });
          }

          const { name, email, password } = jwt.decode(token);

          const user = new User({ name, email, password });

          user.save((err, user) => {
              if (err) {
                  console.log('SAVE USER IN ACCOUNT ACTIVATION ERROR', err);
                  return res.status(401).json({
                      error: 'Error saving user in database. Try signup again'
                  });
              }
              return res.json({
                  message: 'Signup success. Please signin.'
              });
          });
      });
  } else {
      return res.json({
          message: 'Something went wrong. Try again.'
      });
  }
};

exports.signin = (req, res) => {
  const { email, password } = req.body;
  
  
  // check if user exist
  User.findOne({ email }).exec((err, user) => {
     
      if (err || !user) {
          return res.status(400).json({
              error: 'User with that email does not exist. Please signup'
          });
      }

      // authenticate
      if (!user.authenticate(password)) {
          return res.status(400).json({
              error: 'Email and password do not match'
          });
      }
      // generate a token and send to client
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '100m' });
      console.log('user signin token', token)
      const { _id, name, email, role } = user;

      return res.json({
          token,
          user: { _id, name, email, role }
      });
  });
};
console.log(process.env.JWT_SECRET)
exports.requireSignin = expressJwt({
    
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256']
})

exports.adminMiddleware = (req, res, next) => {
    console.log('req.user', req.user)
    User.findById({_id: req.user._id}).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        if(user.role !== 'admin'){
            return res.status(400).json({
                error: 'Admin resource. Access denied'
            });
        }

        req.profile = user
        next()
    })
}

exports.forgotPassword = (req, res) => {
    const {email} = req.body

    User.findOne({email}, (err, user) => {
        if(err || !user) {
            return res.status(400).json({
                error: 'User with that email does not exist'
            })
        }

        const token = jwt.sign(
            { _id: user._id, name: user.name},
            process.env.JWT_RESET_PASSWORD,
            { expiresIn: "10m" }
          );
       
          const emailData = {
            from: "dmbrusky@gmail.com", // MAKE SURE THIS EMAIL IS YOUR GMAIL FOR WHICH YOU GENERATED APP PASSWORD
            to: email, // WHO SHOULD BE RECEIVING THIS EMAIL? IT SHOULD BE THE USER EMAIL (VALID EMAIL ADDRESS) WHO IS TRYING TO SIGNUP
            subject: "PASSWORD RESET LINK",
            html: `
                      <h1>Please use the following link to reset your password</h1>
                      <a href="http://localhost:3000/auth/password/reset/${token}">http://localhost:8000/auth/activate/${token}</a>
                      <hr />
                      <p>This email may contain sensitive information</p>
                      <p>http://localhost:3000</p>
                  `,
          };

          return user.updateOne({ resetPasswordLink: token }, (err, success) => {
              if(err){
                  console.log('Reset Password Link Error', err)
                  return res.status(400).json({
                      error: 'Database connection error on user password forgot request'
                  })
              } else {
                sendEmailWithNodemailer(req, res, emailData);
              }
          })
       
          

    })
}

exports. resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword} = req.body

    if(resetPasswordLink) {
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function(err, decoded) {
            if(err) {
                return res.status(400).json({
                    error: 'Expired link. Try again. '
                })
            }
            User.findOne({resetPasswordLink}, (err, user) => {
                if(err || !user){
                    return res.status(400).json({
                        error: 'Something went wrong. Try later'
                    })
                } 

                const updatedFields = {
                    password: newPassword,
                    resetPasswordLink: ''
                }

                user = _.extend(user, updatedFields)
                user.save((err, result) => {
                    if(err) {
                        return res.status(400).json({
                            error: 'Error reseting user password'
                        })
                    }
                    res.json({
                        message: 'Great you can login with your new password'
                    })
                })
            })
        })
    }
}