const loginCheck = () => {
  return (req, res, next) => {
    // check if the user is logged in 
    if (req.isAuthenticated()) {
      next();
    } else {
      res.redirect('/login');
    }
  }
}

module.exports = {
  loginCheck
}