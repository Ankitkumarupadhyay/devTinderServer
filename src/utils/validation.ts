export const validateEditProfileData = (
  body: Record<string, string | number | string[] | undefined>
): boolean => {
  const allowedUpdates = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "photoUrl",
    "about",
    "skills",
  ];
  const isUpdateAllowed = Object.keys(body).every((key) =>
    allowedUpdates.includes(key)
  );
  if (!isUpdateAllowed) {
    throw new Error("Invalid updates");
  }
  return isUpdateAllowed;
};

export default validateEditProfileData;
