const { expect } = require("chai");

describe("School Management Contract", function () {

//   it("Deployment", async function () {
//     const [owner] = await ethers.getSigners();

//     const hardhatToken = await ethers.deployContract("Token");

//     const ownerBalance = await hardhatToken.balanceOf(owner.address);
//     expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
//   });

  it("Test addTeacher Function", async function () {
    const [admin, addr2, addr3] = await ethers.getSigners();

    const schoolManagement = await ethers.deployContract("SchoolManagement");

    await expect(schoolManagement.addTeacher(addr3.address, "Rey Babi")).to.emit(schoolManagement, "teacherAdded")
    });
});