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
    let tx3 = await RC.getAdmin(addr);
    console.log(tx);
    console.log(tx2);
    if (tx == true) {
      response.cookie("address", addr, { maxAge: 900000, httpOnly: true });
      console.log(`Teacher with ${addr}`);
      response.redirect("/teacher-dashboard");
    } else if (tx2 == true) {
      response.cookie("address", addr, { maxAge: 900000, httpOnly: true });
      console.log(`Student with ${addr}`);
      response.redirect("/student-dashboard");
    } else if (tx3 == true) {
      response.cookie("address", addr, { maxAge: 900000, httpOnly: true });
      console.log(`Admin with ${addr}`);
      response.redirect("/admin-dashboard");
    } else {
      response.redirect("/login");
    }
  } catch (err) {
    console.log(err);
    response.redirect("/login");
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
  const teacherAddr = request.cookies.address;

  try {
    // Find the subjects assigned to this teacher
    const pelajarans = await prisma.mataPelajaran.findMany({
      where: {
        teacherAddress: teacherAddr,
      },
    });

    // Check if there are subjects assigned to the teacher
    if (!pelajarans || pelajarans.length === 0) {
      return response.status(404).json({ error: "No subjects found for this teacher" });
    }
    
    // Find all students
    const students = await prisma.student.findMany();

    // Fetch scores for each subject
    const subjectsWithScores = await Promise.all(pelajarans.map(async (subject) => {
      try {
        const scores = await prisma.studentScore.findMany({
          where: {
            subjectId: subject.id,
          },
          include: {
            student: true, // Include student details
          },
        });

        const scoresWithDetails = scores.map((score) => ({
          student: score.student.name,
          subject: subject.name,
          score: score.score,
        }));

        return {
          subjectName: subject.name,
          scoresWithDetails,
        };
      } catch (err) {
        console.error(`Error fetching scores for subject ID ${subject.id}:`, err);
        return {
          subjectName: subject.name,
          scoresWithDetails: [],
        };
      }
    }));

    response.render("teacher-dashboard", {
      subjects: pelajarans,
      students,
      subjectsWithScores,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    response.status(500).json({ error: "Internal Server Error" });
  }
});


//student dashboard
app.get("/student-dashboard", async (request, response) => {
  const addr = request.cookies.address;
  console.log("Student address: ", addr);
  try {
    const student = await prisma.student.findUnique({
      where: { address: addr },
    });
    if (!student) {
      response.status(404).send("Student not found in database");
      return;
    }
    console.log("Student: ", student.name);
    const studentSubjects = await prisma.studentSubjects.findMany({
      where: { studentId: student.id },
    });
    const listSubjectPromises = studentSubjects.map(async (sub) => {
      const subject = await prisma.mataPelajaran.findUnique({
        where: { id: sub.subjectId },
      });
      const score = await prisma.studentScore.findFirst({
        where: {
          studentId: student.id,
          subjectId: sub.subjectId,
        },
      });
      return {
        ...subject,
        score: score ? score.score : "N/A",
      };
    });
    const listSubject = await Promise.all(listSubjectPromises);
    listSubject.forEach((subject) => {
      console.log("List of subjects: ", subject.name, "Score: ", subject.score);
    });
    response.render("student-dashboard", {
      subjects: listSubject.length ? listSubject : [],
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

    // get the student and subject data from the database
    let student = await prisma.student.findUnique({
      where: {
        address: studentAddress,
      },
    });

    // Optionally, you can also store this relationship in your Prisma database
    await prisma.studentSubjects.create({
      data: {
        studentId: student.id,
        subjectId: Number(subjectId),
      },
    });

    response.redirect("/admin-dashboard");
  } catch (error) {
    console.error("Error adding student to subject:", error);
    response.status(500).send("Internal server error");
  }
});

//create subject
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
    response.redirect("/admin-dashboard");
  } catch (err) {
    response.redirect("/admin-dashboard");
    console.log(err);
  }
});

// create score
app.post("/scores", async (request, response) => {
  var mataPelajaranId = request.body.mataPelajaranId;
  var score = request.body.score;
  var studentId = request.body.studentAddress;

  console.log(studentId);
  console.log(mataPelajaranId);
  console.log(score);

  try {
    // Fetch student address from the database using studentId
    const student = await prisma.student.findUnique({
      where: {
        id: studentId,
      },
    });
    if (!student) {
      console.error("Student not found");
      return response.status(404).json({ error: "Student not found" });
    }
    const studentAddress = student.address;
    console.log(studentAddress);

    let tx = await RC.addScore(mataPelajaranId, studentAddress, score);
    console.log(tx);

    // Simpan data skor ke database
    try {
      const result = await prisma.studentScore.create({
        data: {
          studentId: studentId,
          subjectId: parseInt(mataPelajaranId),
          score: parseInt(score),
        },
      });
      console.log("Data skor berhasil disisipkan:", result);
    } catch (dbError) {
      console.error("Error inserting score data into database:", dbError);
      return response.status(500).json({ error: "Internal Server Error" });
    }

    response.redirect("/teacher-dashboard");
  } catch (err) {
    console.error("Error handling request:", err);
    response.status(500).redirect("/teacher-dashboard");
  }
});

app.listen(8000, async (request, response) => {
  console.log("I'm listening on port 8000");
});
