const adminAuth = (req, res, next) => {
  console.log("Verifing admin");
  const token = "xyz";
  const isAdminAuthorised = token === "xyz";
  if (!isAdminAuthorised) {
    res.status(401).send("Admin not verified");
  } else {
    next();
  }
};
const userAuth = (req, res, next) => {
  console.log("Verifing user");
  const token = "xyz";
  const isAdminAuthorised = token === "xyz";
  if (!isAdminAuthorised) {
    res.status(401).send("User not verified");
  } else {
    next();
  }
};

module.exports = {
  adminAuth,
  // userAuth,
};
