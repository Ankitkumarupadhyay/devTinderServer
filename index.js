// const { adminAuth, userAuth } = require("./middleware/adminAuthenticate");
const express = require("express");
const connectDB = require("./src/config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // replace with your domain name
    credentials: true, // enable set cookies from server to client
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  })
);

const authRouter = require("./src/routes/auth");
const connectionRequestRouter = require("./src/routes/connectionRequest");
const profileRouter = require("./src/routes/profile");
const userRouter = require("./src/routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", connectionRequestRouter);
app.use("/", userRouter);
app.get("/", (req, res) => {
  res.send("Welcome");
});

const PORT = process.env.PORT || 7777;

connectDB()
  .then(() => {
    console.log("Database connected succesfully");
    app.listen(PORT, () => {
      console.log("Server is listening on port " + PORT);
    });
  })
  .catch((err) => {
    console.error("Some error occured");
  });

// // Find an user from databse
// app.get("/user", async (req, res) => {
//   const userEmail = req.body.emailId;
//   try {
//     const user = await User.find({ emailId: userEmail });
//     if (user.length === 0) {
//       res.status(404).send("User not found");
//     } else {
//       res.send(user);
//     }
//   } catch (err) {
//     res.status(400).send("Some error occured");
//   }
// });

// // Delete an user from databse
// app.delete("/user", async (req, res) => {
//   const userId = req.body.userId;
//   try {
//     const user = await User.findByIdAndDelete(userId);
//     res.send("User deleted succesfully");
//   } catch (err) {
//     res.status(400).send("User not deleted succcesfully");
//   }
// });

// // Get data of all user from databse
// app.get("/feed", async (req, res) => {
//   try {
//     const users = await User.find({});
//     res.send(users);
//   } catch (err) {
//     res.status(400).send("Some error occured");
//   }
// });

// Update data of an user
// app.patch("/user/:userId", async (req, res) => {
//   const userId = req.params?.userId;
//   // console.log(req.body);
//   const value = req.body;

//   try {
//     const ALLOWED_UPDATES = ["gender", "photoUrl", "about", "skills", "age"];

//     const isUpdateAllowed = Object.keys(value).every((k) =>
//       ALLOWED_UPDATES.includes(k)
//     );
//     if (!isUpdateAllowed) {
//       throw new Error("Update not allowed");
//     }

//     if (value?.skills.length > 10) {
//       throw new Error("Skills can't be more than 10");
//     }

//     const user = await User.findByIdAndUpdate(userId, value, {
//       returnDocument: "after",
//     });
//     res.send("User updated succesfully");
//   } catch (err) {
//     res.status(400).send("User not updated succcesfully : " + err);
//     // console.log(err)
//   }
// });

// app.use("/getSecretData", (req, res) => {
//   res.send("This is a secret data....");
// });
// app.use("/test", (req, res) => {
//   res.send("test data....");
// });
// app.use("/hello", (req, res) => {
//   res.send("hello hello hello data....");
// });

// app.get("/user", (req, res) => {
//   console.log(req.query);
//   res.send({ firstName: "Ankit", lastName: "Upadhyay" });
// });

//making routes dynamic byusing params

// app.get("/user/:id/:name", (req, res) => {
//   console.log(req.params);
//   res.send({ firstName: "Ankit", lastName: "Upadhyay" });
// });

// app.post("/user", (req, res) => {
//   res.send("Data saved to DB");
// });
// app.delete("/user", (req, res) => {
//   res.send("Data deleted from DB");
// });

// app.use("/", (req, res) => {
//   res.send("This is a dashboard....");
// });

// app.use(
//   "/user",
//   (req, res, next) => {

//     console.log("This is response of route 1");
//     // res.send("Response!!!");
//     // console.log("Response 2 send");
//     next();
//   },
//   (req, res) => {
//     console.log("This is response of route handler 2");
//     res.send("Response 2");
//     console.log("Response 2 send");
//   }
// );

// middleware ----

// app.use("/admin", adminAuth);

// app.use("/admin/getAllData", (req, res) => {
//   console.log("Data send");
//   res.send("Users data");
// });
// app.use("/admin/deleteUser", (req, res) => {
//   console.log("User deleted from db");
//   res.send("User deleted from db");
// });
// app.use("/user", userAuth, (req, res) => {
//   console.log("User's data");
//   res.send("User's data");
// });

// app.use("/user", (req, res ) => {
//   throw new Error("abcd")
//   res.send("Data is being sent");
// });
// app.use("/", (err ,req, res ,next) => {
//  if(err){
//   res.status(500).send("Something went wrong")
//  }
// });

// Advanced Routing ----
// 1. /ab?c => means b is optional , api will match routes having /abc and /ac also
// 2. /ab+c => means a and c is fixed in start and last ,but we have multiple b in between , /ac,/abc,/abbc,/abbbc .
// 3. /ab*cd => means ab and cd is fixed in start and last, & we can have anything between these two.

// mongodb+srv://ankitupadhyay4519:5vacK5344gBY0BrN@namastenode.xrfjt.mongodb.net/
