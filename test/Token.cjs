const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Function Testing", function () {
  it("Test addTeacher Function", async function () {
    const [admin, addr2, addr3] = await ethers.getSigners();

    const schoolManagement = await ethers.deployContract("SchoolManagement");

    await expect(
      schoolManagement.addTeacher(addr3.address, "Rey Babi")
    ).to.emit(schoolManagement, "teacherAdded");
  });

  it("Test addStudent Function", async function () {
    const [admin, addr2, addr3] = await ethers.getSigners();

    const schoolManagement = await ethers.deployContract("SchoolManagement");

    await expect(
      schoolManagement.addStudent(addr3.address, "Joseph Babi")
    ).to.emit(schoolManagement, "studentAdded");
  });

  it("Test addMataPelajaran Function", async function () {
    const [admin, addr2, addr3] = await ethers.getSigners();

    const schoolManagement = await ethers.deployContract("SchoolManagement");

    await expect(
      schoolManagement.addMataPelajaran("Joseph Babi", addr3.address)
    ).to.emit(schoolManagement, "mataPelajaranAdded");
  });

  it("Test addStudentPelajaran Function", async function () {
    const [admin, addr2, addr3] = await ethers.getSigners();

    const schoolManagement = await ethers.deployContract("SchoolManagement");

    await expect(
      schoolManagement.addStudentPelajaran(addr3.address, 1)
    ).to.emit(schoolManagement, "studentPelajaranAdded");
  });

  it("Test addScore Function", async function () {
    const [admin, addr2, addr3] = await ethers.getSigners();

    const schoolManagement = await ethers.deployContract("SchoolManagement");

    await expect(schoolManagement.addScore(0, addr3.address, 90)).to.emit(
      schoolManagement,
      "scoreAdded"
    );
  });

  it("Test getStudentScore Function", async function () {
    const [admin, addr2, addr3, addr4] = await ethers.getSigners();
    const SchoolManagement = await ethers.getContractFactory(
      "SchoolManagement"
    );
    const schoolManagement = await SchoolManagement.deploy();
    await schoolManagement.addTeacher(addr2.address, "Teacher Name");
    await schoolManagement.addStudent(addr4.address, "Student Name");
    await schoolManagement.addMataPelajaran("Math", addr2.address);
    await schoolManagement.connect(addr2).addStudentPelajaran(addr3.address, 0);
    await schoolManagement.connect(addr2).addScore(0, addr4.address, 95);
    const score = await schoolManagement.getStudentScore(0, addr3.address);
    expect(score).to.equal(0);
  });

  it("Test getMataPelajaranStudents Function", async function () {
    const [admin, addr2, addr3] = await ethers.getSigners();
    const SchoolManagement = await ethers.getContractFactory(
      "SchoolManagement"
    );
    const schoolManagement = await SchoolManagement.deploy();
    await schoolManagement.addTeacher(addr2.address, "Teacher Name");
    await schoolManagement.addStudent(addr3.address, "Student Name");
    await schoolManagement.addMataPelajaran("Math", addr2.address);
    await schoolManagement.connect(addr2).addStudentPelajaran(addr3.address, 0);
    const students = await schoolManagement.getMataPelajaranStudents(0);
    expect(students).to.include(addr3.address);
  });

  it("Test getStudentMataPelajarans Function", async function () {
    const [admin, addr2, addr3] = await ethers.getSigners();
    const SchoolManagement = await ethers.getContractFactory(
      "SchoolManagement"
    );
    const schoolManagement = await SchoolManagement.deploy();
    await schoolManagement.addTeacher(addr2.address, "Teacher Name");
    await schoolManagement.addStudent(addr3.address, "Student Name");
    await schoolManagement.addMataPelajaran("Math", addr2.address);
    await schoolManagement.addMataPelajaran("Science", addr2.address);
    await schoolManagement.addMataPelajaran("History", addr2.address);
    await schoolManagement.connect(addr2).addStudentPelajaran(addr3.address, 0);
    await schoolManagement.connect(addr2).addStudentPelajaran(addr3.address, 1);
    const studentSubjects = await schoolManagement.getStudentMataPelajarans(
      addr3.address
    );
    const studentSubjectsArray = studentSubjects.map((subject) =>
      Number(subject)
    );
    expect(studentSubjectsArray).to.have.members([0, 1]);
  });
});
