const { expect } = require("chai");

describe("Function Testing", function () {
  //   it("Deployment", async function () {
  //     const [owner] = await ethers.getSigners();

  //     const hardhatToken = await ethers.deployContract("Token");

  //     const ownerBalance = await hardhatToken.balanceOf(owner.address);
  //     expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
  //   });

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
      schoolManagement.addMataPelajaran("Joseph Babi")
    ).to.emit(schoolManagement, "mataPelajaranAdded");
  });

  it("Test addTeacherPelajaran Function", async function () {
    const [admin, addr2, addr3] = await ethers.getSigners();

    const schoolManagement = await ethers.deployContract("SchoolManagement");

    await expect(
      schoolManagement.addTeacherPelajaran(addr3.address, 0)
    ).to.emit(schoolManagement, "teacherPelajaranAdded");
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

    await expect(
      schoolManagement.addScore(0, addr3.address, 90)
    ).to.emit(schoolManagement, "scoreAdded");
  });

  it("Test getStudentScore Function", async function () {
    const [admin, addr2, addr3] = await ethers.getSigners();

    const schoolManagement = await ethers.deployContract("SchoolManagement");

    await expect(
      schoolManagement.getStudentScore(0, addr3.address)
    ).to.emit(schoolManagement, "studentAdded");
  });

  it("Test getMataPelajaranStudents Function", async function () {
    const [admin, addr2, addr3] = await ethers.getSigners();

    const schoolManagement = await ethers.deployContract("SchoolManagement");

    await expect(
      schoolManagement.getMataPelajaranStudents(0)
    ).to.emit(schoolManagement, "studentAdded");
  });
});
