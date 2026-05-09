"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = void 0;
const adminAuth = (req, res, next) => {
    console.log("Verifing admin");
    const token = "xyz";
    const isAdminAuthorised = token === "xyz";
    if (!isAdminAuthorised) {
        res.status(401).send("Admin not verified");
    }
    else {
        next();
    }
};
exports.adminAuth = adminAuth;
