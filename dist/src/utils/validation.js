"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEditProfileData = void 0;
const validateEditProfileData = (body) => {
    const allowedUpdates = [
        "firstName",
        "lastName",
        "age",
        "gender",
        "photoUrl",
        "about",
        "skills",
    ];
    const isUpdateAllowed = Object.keys(body).every((key) => allowedUpdates.includes(key));
    if (!isUpdateAllowed) {
        throw new Error("Invalid updates");
    }
    return isUpdateAllowed;
};
exports.validateEditProfileData = validateEditProfileData;
exports.default = exports.validateEditProfileData;
