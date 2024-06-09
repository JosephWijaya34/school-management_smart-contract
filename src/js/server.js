import express from "express";
import * as tools from "./tools.mjs";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RC = await tools.constructSmartContract();
//console.log(RC);
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/static", express.static("src"));
app.use(cookieParser());

// set the view engine to ejs
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (request, response) {
  response.render("home");
});

app.get("/home", function (request, response) {
  response.render("home");
});

app.get("/login", function (request, response) {
  response.render("login");
});

app.get("/createTeacher", function (request, response) {
  response.render("registerTeacher", {});
});

app.get("/createStudent", function (request, response) {
  response.render("registerStudent", {});
});

app.post('/auth', async (request, response) => {
  var addr = request.body.address;
  // var pwd = request.body.password;

  try {
      RC.getTeacher(addr).then(function(res) {
          console.log(res);
          if(res == true) {
              response.cookie('addr', addr);
              response.redirect('/manageSubject');
          } else {
              response.send();
          }
      });
  } catch(err) {
      console.log(err);
  }
});

app.post("/createTeacher", async (request, response) => {
  var addr = request.body.address;
  var name = request.body.name;
  try {
    let tx = await RC.addTeacher(addr, name);
    console.log(tx);

    axios
      .post("http://localhost:3000/teachers", {
        address: addr,
        name: name,
      })
      .then((response) => {
        console.log("Data guru berhasil disisipkan:", response.data);
      })
      .catch((error) => {
        console.error("Error memanggil endpoint:", error);
      });

    response.redirect("/");
  } catch (err) {
    response.redirect("/createTeacher");
    // response.render("registerTeacher");
    console.log(err);
  }
});

app.post("/createStudent", async (request, response) => {
  var addr = request.body.address;
  var name = request.body.name;
  try {
    let tx = await RC.addStudent(addr, name);
    console.log(tx);
    // Simpan data student ke database
    axios
      .post("http://localhost:3000/students", {
        address: addr,
        name: name,
      })
      .then((response) => {
        console.log("Data murid berhasil disisipkan:", response.data);
      })
      .catch((error) => {
        console.error("Error memanggil endpoint:", error);
      });
    response.redirect("/");
  } catch (err) {
    response.redirect("/createStudent");
    // response.render("registerStudent");
    console.log(err);
  }
});

app.get("/manageSubject", async (request, response) => {
  // let teachers = await RC.getTeachers();
  let teachers = await prisma.teacher.findMany();
  let pelajarans = await prisma.mataPelajaran.findMany();
  let murids = await prisma.student.findMany();
  response.render("manage", { teachers: teachers.length ? teachers : [], subjects: pelajarans.length ? pelajarans : [], students: murids.length ? murids : [] });
});

app.post("/createSubject", async (request, response) => {
  var name = request.body.subjectName;
  var teacherAddress = request.body.teacherAddress;
  console.log(name);
  console.log(teacherAddress);
  try {
    let tx = await RC.addMataPelajaran(name, teacherAddress);
    console.log(tx);
    // Simpan data mata pelajaran ke database
    axios
      .post("http://localhost:3000/matapelajarans", {
        name: name,
        teacherAddress: teacherAddress,
      })
      .then((response) => {
        console.log("Data mata pelajaran berhasil disisipkan:", response.data);
      })
      .catch((error) => {
        console.error("Error memanggil endpoint:", error);
      });
    response.redirect("/manageSubject");
  } catch (err) {
    response.redirect("/manageSubject");
    console.log(err);
  }
});

// app.get("/login", function (request, response) {
//   var addr = request.body.address;
//   let tx = RC.checkTeachers(addr);
//   response.render("pages/login", {});
// })

// app.post('/auth', async (request, response) => {
//     var addr = request.body.address;
//     var pwd = request.body.password;

//     try {
//         RC.getVoter(addr).then(function(res) {
//             console.log(res);
//             if(res == true) {
//                 response.cookie('addr', addr);
//                 response.redirect('/voting');
//             } else {
//                 response.send();
//             }
//         });
//     } catch(err) {
//         console.log(err);
//     }
// });

// app.get('/voting', async (request, response)=> {
//     let candidateCounter = await RC.candCounter();
//     var _addr = request.cookies.addr
//     var _candObj = [];
//     for(let i=1; i <= candidateCounter; i++) {
//         let _candidates = await RC.candidates(i);
//         _candObj[i-1] = {id:_candidates['id'],name:_candidates['name'],voteCount:_candidates['voteCount']};
//     }
//     response.render('pages/voting', {
//         candList:_candObj,
//         addr: _addr
//     });
// });

// app.post('/vote', async function (request, response) {
//     console.log(request.body);
//     var candId = request.body.candSelect;
//     var addr = request.body.accountAddress;
//     try {
//         let tx = await RC.vote(candId, addr);
//         console.log(tx);
//         response.redirect('/voting');
//     } catch(err) {
//         console.log(err);
//     }
// });

app.listen(3000, async (request, response) => {
  console.log("I'm listening on port 3000");
});
