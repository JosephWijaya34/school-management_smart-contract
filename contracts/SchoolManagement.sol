// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

contract SchoolManagement {
    struct Admin {
        string name;
    }

    struct Teacher {
        string name;
    }

    struct Student {
        string name;
    }

    struct MataPelajaran {
        string name;
        uint teacherID;
    }

    mapping(address => Teacher) public teachers;
    mapping(address => Student) public students;
    mapping(uint => MataPelajaran) public matapelajarans;

    //testing
    uint public adminCounter;
    uint public teacherCounter;
    uint public studentCounter;
    uint public mataPelajaranCounter;
    address public assigner;

    constructor() {
        addAdmin(assigner, "Joseph Ganteng");
    }

    event adminAdded(address _adminAddress, string adminName);
    event teacherAdded(address _teacherAddress, string teacherName);
    event studentAdded(address _studentAddress, string studentName);
    event mataPelajaranAdded(string namaMataPelajaran);

    modifier newAdmin(address _admin) {
        require(
            admins[_admin].exist == false,
            "admin address already registered"
        );
        _;
    }

    modifier newTeacher(address _teacher) {
        require(
            teachers[_teacher].exist == false,
            "teacher address already registered"
        );
        _;
    }

    modifier newStudent(address _student) {
        require(
            students[_student].exist == false,
            "student address already registered"
        );
        _;
    }

    modifier mataPelajaranExist(uint _matapelajaran) {
        require(
            _matapelajaran < mataPelajaranCounter,
            "mata pelajaran does not exist"
        );
        _;
    }

    modifier studentExist(uint _studentID) {
        require(_studentID < studentCounter, "student does not exist");
        _;
    }

    modifier onlyAdmin() {
        require(listAdmin[msg.sender], "Address is not an admin");
        _;
    }

    modifier onlyAuthorized() {
        require(
            listTeacher[msg.sender] || listAdmin[msg.sender],
            "Address is not a teacher / admin"
        );
        _;
    }

    modifier onlyStudent() {
        require(listStudent[msg.sender], "Address is not a student");
        _;
    }

    function addAdmin(address addr, string memory _name) public newAdmin(addr) {
        admins[addr] = Admin(adminCounter, _name, true);
        listAdmin[msg.sender] = true;
        adminCounter++;

        emit adminAdded(addr, _name);
    }

    function addTeacher(
        address addr,
        string memory _name
    ) public newTeacher(addr) onlyAdmin {
        teachers[addr] = Teacher(teacherCounter, _name, true);
        listTeacher[msg.sender] = true;
        teacherCounter++;

        emit teacherAdded(addr, _name);
    }

    function addStudent(
        address addr,
        string memory _name
    ) public newStudent(addr) onlyAuthorized {
        students[addr] = Student(studentCounter, _name, true);
        listStudent[msg.sender] = true;
        studentCounter++;

        emit studentAdded(addr, _name);
    }

    function addMataPelajaran(string memory _name) public {
        matapelajarans[mataPelajaranCounter].id = mataPelajaranCounter;
        matapelajarans[mataPelajaranCounter].name = _name;
        mataPelajaranCounter++;
    }

    function addTeacherPelajaran(
        address addr,
        uint _matapelajaranID
    ) public onlyAdmin {
        matapelajarans[_matapelajaranID].teacherID = teachers[addr].id;
    }

    function addStudentPelajaran(
        uint _studentID,
        uint _matapelajaranID
    ) public onlyAuthorized {
        require(
            teachers[msg.sender].id ==
                matapelajarans[_matapelajaranID].teacherID ||
                listAdmin[msg.sender],
            "Address is not authorized"
        );
        matapelajarans[_matapelajaranID].studentID.push(_studentID);
    }

    function addScore(
        uint _matapelajaranID,
        uint _studentID,
        uint _score
    ) public onlyAuthorized {
        require(
            teachers[msg.sender].id ==
                matapelajarans[_matapelajaranID].teacherID ||
                listAdmin[msg.sender],
            "Address is not authorized"
        );
        matapelajarans[_matapelajaranID].studentScores[_studentID] = _score;
    }

    function getStudentScore(
        uint _matapelajaranID,
        uint _studentID
    )
        public
        view
        mataPelajaranExist(_matapelajaranID)
        studentExist(_studentID)
        returns (uint)
    {
        require(
            students[msg.sender].id == _studentID ||
                listAdmin[msg.sender] ||
                listTeacher[msg.sender],
            "Address is not authorized"
        );
        return matapelajarans[_matapelajaranID].studentScores[_studentID];
    }

    function getMataPelajaranStudents(
        uint _matapelajaranID
    )
        public
        view
        mataPelajaranExist(_matapelajaranID)
        onlyAuthorized
        returns (uint[] memory)
    {
        return matapelajarans[_matapelajaranID].studentID;
    }
}
