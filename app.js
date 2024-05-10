// const fs = require('fs')
require('dotenv').config()
require("./DB/connection");
const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const session = require('express-session')
const flash = require("connect-flash");
const path = require('path')
const {upload} = require('./multer')

const app = express();

const userRoute = require("./routes/userRoute");

const corsOp = {
  origin: "http://localhost:5173",
  methods: "GET, POST, PUT, PATCH, DELETE, HEAD",
  credential: true,
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors(corsOp));
app.use(express.json());
app.use(flash());
app.use(session({
  secret: 'lets do it', // Secret key jo session ko encrypt karta hai
  resave: false,
  saveUninitialized: false
}));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));


app.get("/signup",userRoute.getUserRegistration);
app.post("/signup",userRoute.userRegistration);

app.get("/", userRoute.getUserLogin);
app.post("/", userRoute.userLogin);
app.get("/home", userRoute.getUserDashboard);
// app.post("/home", userRoute.getUserDashboard);


app.get('/create-employee',userRoute.getCreateEmployeeHandler)
app.post('/create-employee',upload.single("file"),userRoute.createEmployeeHandler)


app.get('/employee-list',userRoute.getEmployeeListHandler)

app.get('/employee/edit/:id',userRoute.employeeEditHandler)
app.post('/employee/edit/:id',upload.single("file"),userRoute.editEmployeeHandler)
app.get('/employee/delete/:id',userRoute.employeeDeleteHandler)




app.listen(4000, () => {
  console.log("sever listining on 4000");
});
