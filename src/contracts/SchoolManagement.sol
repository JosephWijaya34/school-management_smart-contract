// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

contract SchoolManagement {
    struct Teacher {
        string name;
    }

    struct Student {
        string name;
    }

    struct MataPelajaran {
        string name;
        address teacherAddress;
        address[] listStudent;
        mapping(address => uint) studentScores;
    }

    address public admin;

    mapping(address => Teacher) public teachers;
    mapping(address => Student) public students;
    mapping(uint => MataPelajaran) public matapelajarans;
    mapping(address => bool) public listAdmin;
    mapping(address => bool) public listTeacher;
    mapping(address => bool) public listStudent;

    uint public teacherCounter;
    uint public studentCounter;
    uint public mataPelajaranCounter;

    constructor() {
        // set satu admin
        admin = msg.sender;
        listAdmin[msg.sender] = true;
    }

    event teacherAdded(address _teacherAddress, string teacherName);
    event studentAdded(address _studentAddress, string studentName);
    event mataPelajaranAdded(string namaMataPelajaran);
    event teacherPelajaranAdded(
        address _teacherAddress,
        string namaMataPelajaran
    );
    event studentPelajaranAdded(
        address _studentAddress,
        string namaMataPelajaran
    );
    event scoreAdded(
        address _studentAddress,
        string namaMataPelajaran,
        uint score
    );

    modifier newTeacher(address _teacher) {
        require(
            listTeacher[_teacher] == false,
            "teacher address already registered"
        );
        _;
    }

    modifier newStudent(address _student) {
        require(
            listStudent[_student] == false,
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

    modifier studentExist(address _student) {
        require(listStudent[_student] == true, "student does not exist");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier onlyAuthorized() {
        require(
            listTeacher[msg.sender] == true || listAdmin[msg.sender] == true,
            "Address is not a teacher / admin"
        );
        _;
    }

    modifier onlyStudent() {
        require(listStudent[msg.sender], "Address is not a student");
        _;
    }

    function addTeacher(
        address addr,
        string memory _name
    ) public newTeacher(addr) onlyAdmin {
        teachers[addr] = Teacher(_name);
        listTeacher[addr] = true;
        teacherCounter++;

        emit teacherAdded(addr, _name);
    }

    function addStudent(
        address addr,
        string memory _name
    ) public newStudent(addr) onlyAuthorized {
        students[addr] = Student(_name);
        listStudent[addr] = true;
        studentCounter++;

        emit studentAdded(addr, _name);
    }

    function addMataPelajaran(string memory _name) public {
        // matapelajarans[mataPelajaranCounter].id = mataPelajaranCounter;
        matapelajarans[mataPelajaranCounter].name = _name;
        mataPelajaranCounter++;

        emit mataPelajaranAdded(_name);
    }

    function addTeacherPelajaran(
        address addr,
        uint _matapelajaranID
    ) public onlyAdmin {
        matapelajarans[_matapelajaranID].teacherAddress = addr;

        emit teacherPelajaranAdded(addr, matapelajarans[_matapelajaranID].name);
    }

    function addStudentPelajaran(
        address addr,
        uint _matapelajaranID
    ) public onlyAuthorized {
        require(
            msg.sender == matapelajarans[_matapelajaranID].teacherAddress ||
            listAdmin[msg.sender],
            "Address is not authorized"
        );
        matapelajarans[_matapelajaranID].listStudent.push(addr);

        emit studentPelajaranAdded(addr, matapelajarans[_matapelajaranID].name);
    }

    function addScore(
        uint _matapelajaranID,
        address addr,
        uint _score
    ) public onlyAuthorized {
        require(
            msg.sender == matapelajarans[_matapelajaranID].teacherAddress ||
            listAdmin[msg.sender],
            "Address is not authorized"
        );
        matapelajarans[_matapelajaranID].studentScores[addr] = _score;

        emit scoreAdded(addr, matapelajarans[_matapelajaranID].name, _score);
    }

    function getStudentScore(
        uint _matapelajaranID,
        address addr
    )
        public
        view
        mataPelajaranExist(_matapelajaranID)
        studentExist(addr)
        returns (uint)
    {
        require(
            msg.sender == addr ||
                listAdmin[msg.sender] ||
                listTeacher[msg.sender],
            "Address is not authorized"
        );
        return matapelajarans[_matapelajaranID].studentScores[addr];
    }

    function getMataPelajaranStudents(
        uint _matapelajaranID
    )
        public
        view
        mataPelajaranExist(_matapelajaranID)
        onlyAuthorized
        returns (address[] memory)
    {
        return matapelajarans[_matapelajaranID].listStudent;
    }
}
