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
// console.log("Smart contract initialized", RC);

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

app.get("/register-teacher", function (request, response) {
  response.render("registerTeacher", {});
});

app.get("/register-student", function (request, response) {
  response.render("registerStudent", {});
});

app.post("/auth", async (request, response) => {
  var addr = request.body.address;

  try {
    let tx = await RC.getTeacher(addr);
    let tx2 = await RC.getStudent(addr);
    console.log(tx);
    if (tx == true) {
      response.cookie("addr", addr);
      response.redirect("/teacher-dashboard");
    } else if (tx2 == true) {
      response.cookie("addr", addr);
      response.redirect("/student-dashboard");
    } else {
      response.send();
    }
  } catch (err) {
    response.redirect("/login");
    console.log(err);
  }
});

// route untuk menambahkan guru
app.post("/register-teacher", async (request, response) => {
  const addr = request.body.address;
  const name = request.body.name;

  try {
    let tx = await RC.addTeacher(addr, name);
    console.log(tx);

    const teachers = await prisma.teacher.findMany();
    const students = await prisma.student.findMany();

    let isRegistered = false;

    teachers.forEach((teacher) => {
      if (teacher.address === addr) {
        console.log("address sudah terdaftar sebagai Guru");
        isRegistered = true;
      }
    });

    students.forEach((student) => {
      if (student.address === addr) {
        console.log("address sudah terdaftar sebagai murid");
        isRegistered = true;
      }
    });

    if (isRegistered) {
      response.redirect("/");
      return; // Stop further execution
    }

    await axios.post("http://localhost:3000/teachers", {
      address: addr,
      name: name,
    });

    console.log("Data guru berhasil disisipkan");
    response.redirect("/");
  } catch (err) {
    response.redirect("/register-teacher");
    console.log(err);
  }
});

// route untuk menambahkan siswa
app.post("/register-student", async (request, response) => {
  var addr = request.body.address;
  var name = request.body.name;
  try {
    let tx = await RC.addStudent(addr, name);
    console.log(tx);
    // Simpan data student ke database

    const teachers = await prisma.teacher.findMany();
    const students = await prisma.student.findMany();

    let isRegistered = false;

    teachers.forEach((teacher) => {
      if (teacher.address === addr) {
        console.log("address sudah terdaftar sebagai Guru");
        isRegistered = true;
      }
    });

    students.forEach((student) => {
      if (student.address === addr) {
        console.log("address sudah terdaftar sebagai murid");
        isRegistered = true;
      }
    });

    if (isRegistered) {
      response.redirect("/");
      return; // Stop further execution
    }

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
    response.redirect("/register-student");
    // response.render("registerStudent");
    console.log(err);
  }
});

// admin dashboard
app.get("/admin-dashboard", async (request, response) => {
  // let teachers = await RC.getTeachers();
  let teachers = await prisma.teacher.findMany();
  let pelajarans = await prisma.mataPelajaran.findMany();
  let students = await prisma.student.findMany();
  response.render("manage", {
    teachers: teachers.length ? teachers : [],
    subjects: pelajarans.length ? pelajarans : [],
    students: students.length ? students : [],
  });
});

// teacher dashboard
app.get("/teacher-dashboard", async (request, response) => {
  let pelajarans = await prisma.mataPelajaran.findMany();
  let students = await prisma.student.findMany();
  response.render("teacher-dashboard", {
    subjects: pelajarans.length ? pelajarans : [],
    students: students.length ? students : [],
  });
});

//student dashboard
app.get("/student-dashboard", async (request, response) => {
  const addr = request.cookies.addr;

  try {
    let studentSubjectIds = await RC.getStudentMataPelajarans(addr);
    console.log("Student Subject IDs: ", studentSubjectIds);

    let subjects = [];
    if (studentSubjectIds.length > 0) {
      subjects = await prisma.mataPelajaran.findMany({
        where: {
          id: { in: studentSubjectIds.map((id) => id.toString()) },
        },
      });
    }

    response.render("student-dashboard", {
      subjects: subjects.length ? subjects : [],
    });
  } catch (error) {
    console.error("Error fetching student dashboard data:", error);
    response.status(500).send("Internal server error");
  }
});

app.get("/subject/:id", async (request, response) => {
  const subjectId = request.params.id;
  let subject = await prisma.mataPelajaran.findUnique({
    where: {
      id: subjectId,
    },
  });

  let students = await prisma.studentSubjects.findMany({
    where: {
      subjectId: subjectId,
    },
  });

  response.render("subject-detail", {
    subject: subject,
    students: students.length ? students : [],
  });
});

app.post("/add-student-to-subject", async (request, response) => {

  const studentAddress = request.body.studentAddress;
  const subjectId = request.body.mataPelajaranId;

  try {
    // Call the smart contract function to add a student to a subject
    let tx = await RC.addStudentPelajaran(studentAddress, subjectId);
    console.log(tx);

    // Optionally, you can also store this relationship in your Prisma database
    await prisma.studentSubjects.create({
      data: {
        studentId: studentAddress,
        subjectId: subjectId.toString(),
      },
    });

    response.redirect("/student-dashboard");
  } catch (error) {
    console.error("Error adding student to subject:", error);
    response.status(500).send("Internal server error");
  }
});

app.post("/create-subject", async (request, response) => {
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
    response.redirect("/teacher-dashboard");
  } catch (err) {
    response.redirect("/teacher-dashboard");
    console.log(err);
  }
});

app.listen(8000, async (request, response) => {
  console.log("I'm listening on port 8000");
});
