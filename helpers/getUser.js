const User = require('../models/user')


exports.getUser = (req, res, next) => {
  const user = User.findOne({_id: id}, (err, user) => {
    if( err || !user){
      return res.status(400).json({
        error: 'User not found'
      })
    } 
    return user
  })
  next()
}


