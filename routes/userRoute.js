const userModel = require("../models/userModel");
const employeeModel = require("../models/employeeModel");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const flash = require("connect-flash");
const { log } = require("console");

function verifyToken(token) {
  // const token = req.cookies['authAdToken'];
  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  const userId = decoded.userId;
  return userId;
}

async function userRegistration(req, res) {
  console.log(req.body);
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      req.flash("emsg", "Email already exists");
      res.redirect("/signup");
    }

    const newUser = new userModel({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });

    let user = await newUser.save();
    console.log(user);
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "10d",
    });
    console.log(token);
    res.cookie("UserToken", token, {
      maxAge: 10 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    console.log(user);

    // res.status(201).json({ message: "User created successfully" });
    res.redirect("/home");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function userLogin(req, res) {
  console.log(req.body);
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      req.flash("emsg", "Invalid email or password");
      return res.redirect("/");
    }

    const isValidPassword = user.password === password;
    if (!isValidPassword) {
      req.flash("emsg", "Invalid email or password");
      return res.redirect("/");
    }

    console.log(user);

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "10d",
    });
    console.log(token);

    res.cookie("UserToken", token, {
      maxAge: 10 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    // res.status(200).json({ message: "Login successful!" });
    res.redirect("/home");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function createEmployeeHandler(req, res) {
  console.log("employee creation");
  try {
    const { name, email, phone, designation, gender, course } = req.body;
    console.log(req.file);
    const newEmployee = new employeeModel({
      name,
      email,
      phone,
      designation,
      gender,
      course,
      file: req.file.filename,
    });

    let employee = await newEmployee.save();
    console.log(employee);
    req.flash("smsg", "Employee creation success !");
    res.redirect("/create-employee");
  } catch (error) {
    req.flash("emsg", "Employee creation failed !");
    res.redirect("/create-employee");
  }
}

async function employeeDeleteHandler(req, res) {
  console.log("employee deletion ");
  try {
    let employee = await employeeModel.findById(req.params.id);
    console.log(employee);

    if (employee.file !== "") {
      fs.unlink("./public/assets/" + employee.file, (err) => {
        if (err) {
          console.log("Error removing file");
        }
      });
    }

    await employeeModel.findByIdAndDelete(req.params.id);
    res.redirect("/employee-list");
  } catch (err) {
    req.flash("emsg", "employee deletion fialed !");
    res.redirect("/employee-list");
  }
}

async function employeeEditHandler(req, res) {
  try {
    const user = await employeeModel.findById(req.params.id);
    let emsg = req.flash("emsg");
    let smsg = req.flash("smsg");
    res.render("editEmployee", { user, emsg, smsg });
  } catch (error) {
    console.error("Error fetching user details:", error);
    req.flash("emsg", "Internal server error");
    return res.redirect("/");
  }
}

async function editEmployeeHandler(req, res) {
  console.log("employee ediite... ");
  try {
    let employee = await employeeModel.findById(req.params.id);
    console.log(employee);
 
    const { name, email, phone, designation, gender, course } = req.body;
    employee.name = name;
    employee.email = email;
    employee.phone = phone;
    employee.designation = designation;
    employee.gender = gender;
    employee.course = course;
    console.log();
    if (req.file !== undefined) {
      if (employee.file !== "") {
        fs.unlink("./public/assets/" + employee.file, (err) => {
          if (err) {
            console.log("Error removing file");
          }
        });
      }
    }


    await employee.save();
    req.flash("smsg", "employee updation success");
    res.redirect(`/employee/edit/${req.params.id}`);
  } catch (err) {
    console.log("somee error in edit");
    req.flash("emsg", "employee updation fialed !");
    res.redirect(`/employee/edit/${req.params.id}`);
  }
}

// all get users here

async function getUserDashboard(req, res) {
  try {
    const token = req.cookies["UserToken"];
    const user = await userModel.findById(verifyToken(token));

    if (!user) {
      req.flash("emsg", "User Not Found !");
      return res.redirect("/");
    }
    let emsg = req.flash("emsg");
    let smsg = req.flash("smsg");
    res.render("home", { user, emsg, smsg });
  } catch (error) {
    console.error("Error fetching user details:", error);
    req.flash("emsg", "Internal server error");
    return res.redirect("/");
  }
}

async function getUserLogin(req, res) {
  let emsg = req.flash("emsg");
  res.render("login", { emsg });
}
async function getUserRegistration(req, res) {
  let emsg = req.flash("emsg");
  res.render("signup", { emsg });
}

async function getCreateEmployeeHandler(req, res) {
  try {
    const token = req.cookies["UserToken"];
    const user = await userModel.findById(verifyToken(token));
    let emsg = req.flash("emsg");
    let smsg = req.flash("smsg");
    res.render("createEmployee", { user, emsg, smsg });
  } catch (error) {
    console.error("Error fetching user details:", error);
    req.flash("emsg", "Internal server error");
    return res.redirect("/");
  }
}

async function getEmployeeListHandler(req, res) {
  try {
    const token = req.cookies["UserToken"];
    const user = await userModel.findById(verifyToken(token));

    let allEmployees = await employeeModel.find();

    let emsg = req.flash("emsg");
    let smsg = req.flash("smsg");
    res.render("employeeList", { user, allEmployees, emsg, smsg });
  } catch (error) {
    console.error("Error fetching user details:", error);
    req.flash("emsg", "Internal server error");
    return res.redirect("/");
  }
}

module.exports = {
  userRegistration,
  userLogin,
  getUserDashboard,
  createEmployeeHandler,
  employeeDeleteHandler,
  employeeEditHandler,
  editEmployeeHandler,

  getUserLogin,
  getUserRegistration,
  getCreateEmployeeHandler,
  getEmployeeListHandler,
};
