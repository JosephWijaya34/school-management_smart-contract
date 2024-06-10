import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client';


dotenv.config();

const app = express();
const PORT = process.env.PORT;
const prisma = new PrismaClient();

// library bawaan express untuk baca body
app.use(express.json());

app.get("/api",(req, res)=>{
    res.send("latihan restful api pertama menggunakan exrpress.js");
});

// Endpoint untuk menambahkan guru
app.post('/teachers', async (req, res) => {
    const { address, name } = req.body;
  
    try {
      const teacher = await prisma.teacher.create({
        data: {
          address,
          name,
        },
      });
      res.json(teacher);
    } catch (error) {
      res.status(400).json({ error: 'Teacher already registered or other error' });
    }
});
  
  // Endpoint untuk menambahkan siswa
app.post('/students', async (req, res) => {
    const { address, name } = req.body;
  
    try {
      const student = await prisma.student.create({
        data: {
          address,
          name,
        },
      });
      res.json(student);
    } catch (error) {
      res.status(400).json({ error: 'Student already registered or other error' });
    }
});
  
// Endpoint untuk menambahkan mata pelajaran
app.post('/matapelajarans', async (req, res) => {
    const { name, teacherAddress } = req.body;
  
    try {
      const mataPelajaran = await prisma.mataPelajaran.create({
        data: {
          name,
          teacher: {
            connect: { address: teacherAddress },
          },
        },
      });
      res.json(mataPelajaran);
    } catch (error) {
      res.status(400).json({ error: 'Error adding mata pelajaran' });
    }
});
  
// Endpoint untuk menambahkan siswa ke mata pelajaran
app.post('/studentpelajarans', async (req, res) => {
    const { studentAddress, mataPelajaranId } = req.body;
  
    try {
      const studentSubject = await prisma.studentSubjects.create({
        data: {
          student: {
            connect: { address: studentAddress },
          },
          subject: {
            connect: { id: mataPelajaranId },
          },
        },
      });
      res.json(studentSubject);
    } catch (error) {
      res.status(400).json({ error: 'Error adding student to mata pelajaran' });
    }
});
  
  // Endpoint untuk menambahkan skor siswa
app.post('/scores', async (req, res) => {
    const { studentAddress, mataPelajaranId, score } = req.body;
  
    try {
      const studentScore = await prisma.studentScore.create({
        data: {
          score,
          student: {
            connect: { address: studentAddress },
          },
          subject: {
            connect: { id: mataPelajaranId },
          },
        },
      });
      res.json(studentScore);
    } catch (error) {
      res.status(400).json({ error: 'Error adding score' });
    }
});
  
// Endpoint untuk mendapatkan skor siswa
app.get('/studentScores', async (req, res) => {
    const { studentAddress, mataPelajaranId } = req.query;
  
    try {
      const studentScore = await prisma.studentScore.findUnique({
        where: {
          studentId_subjectId: {
            studentId: studentAddress,
            subjectId: mataPelajaranId,
          },
        },
      });
      res.json(studentScore);
    } catch (error) {
      res.status(400).json({ error: 'Error getting student score' });
    }
});
  
// Endpoint untuk mendapatkan daftar siswa dalam mata pelajaran
app.get('/matapelajaranstudents', async (req, res) => {
    const { mataPelajaranId } = req.query;
  
    try {
      const students = await prisma.studentSubjects.findMany({
        where: {
          subjectId: mataPelajaranId,
        },
        include: {
          student: true,
        },
      });
      res.json(students.map(ss => ss.student));
    } catch (error) {
      res.status(400).json({ error: 'Error getting mata pelajaran students' });
    }
});

// Endpoint untuk mendapatkan daftar mata pelajaran seorang siswa
app.get('/studentSubjects', async (req, res) => {
  const { studentId } = req.query;
  
  try {
    const subjects = await prisma.studentSubjects.findMany({
      where: {
        studentId: studentId,
      },
      include: {
        subject: true,
      },
    });

    if (subjects.length === 0) {
      return res.status(404).json({ error: 'No subjects found for the given studentId' });
    }

    res.json(subjects.map(ss => ss.subject));
  } catch (error) {
    console.error('Error getting student subjects:', error);
    res.status(500).json({ error: 'An error occurred while getting student subjects' });
  }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});