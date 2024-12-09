const validateEditProfileData = (req) => {
  const allowedUpdates = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "photoUrl",
    "about",
    "skills",
  ];
  const isUpdateAllowed = Object.keys(req).every((key) =>
    allowedUpdates.includes(key)
  );
  if (!isUpdateAllowed) {
    throw new Error("Invalid updates");
  }
  return isUpdateAllowed;
};

module.exports = validateEditProfileData;
