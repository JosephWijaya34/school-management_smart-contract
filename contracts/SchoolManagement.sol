// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

contract SchoolManagement {

    struct Guru {
        address guruAddress;
        string name;
        string assignedMapel;
    }

    struct Murid {
        address muridAddress;
        string name;
    }

    struct MataPelajaran {
        string nama;
        address guruAddress;
        mapping(address => uint) nilaiMurid;
        mapping(address => Murid) muridList;
    }

    address public admin;
    mapping(address => Guru) public gurus;
    mapping(address => Murid) public murids;
    mapping(string => MataPelajaran) public mapels;
    uint256 mapelCount;


    constructor() {
        admin = msg.sender;
        mapelCount = 0;
    }

    event muridDitambahkan(address add);
    event guruDitambahkan(address add);
    event mapelDitambahkan(address add);
    event guruDitambahkanMapel(address add);
    event muridDitambahkanMapel(address add);
    event nilaiDitambahkan(address add);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Maaf anda bukan admin");
        _;
    }

    modifier onlyGuru() {
        require(gurus[msg.sender].guruAddress == msg.sender, "Maaf hanya guru yang bisa mengakses");
        _;
    }

    // modifier hanya untuk murid dan belum terdaftar dengan mapel
    modifier onlyMuridNotRegistered(string memory _mapel, address _murid) {
    Murid memory murid = mapels[_mapel].muridList[_murid];
    require(murid.muridAddress != address(0), "Maaf hanya murid yang belum terdaftar pada mapel yang bisa mengakses");
    _;
}

    // buatkan modifier untuk murid yang terdaftar pada mapel dan hanya bisa mengecek nilai dirinya sendiri
    modifier onlyMurid(string memory _mapel) {
        require(mapels[_mapel].nilaiMurid[msg.sender] > 0, "Maaf hanya murid yang terdaftar pada mapel yang bisa mengakses");
        _;
    }


    // Function

    // Function mendaftarkan guru baru
    function addGuru(address _guruAddress, string memory _name) public onlyAdmin {
        Guru memory guru = Guru(_guruAddress, _name, "Tidak");
        gurus[_guruAddress] = guru;
        emit guruDitambahkan(_guruAddress);
    }

    // Function mendaftarkan mata pelajaran baru
    function addMapel(string memory _nama) public onlyAdmin {
        MataPelajaran storage mapel = mapels[_nama];
        mapel.nama = _nama;
        mapel.guruAddress = address(0); // Inisialisasi dengan address(0)

        emit mapelDitambahkan(msg.sender);
    }

    // Function mendaftarkan murid baru
    function addMurid(address _muridAddress, string memory _name) public onlyAdmin {
        Murid memory murid = Murid(_muridAddress, _name);
        murids[_muridAddress] = murid;
        emit muridDitambahkan(_muridAddress);
    }

    // Function mengassign guru ke mapel
    function assignGuruToMapel(string memory _mapel, address _guruAddress) public onlyAdmin {
        MataPelajaran storage mapel = mapels[_mapel];
        mapel.guruAddress = _guruAddress;
        gurus[_guruAddress].assignedMapel = _mapel;
        emit guruDitambahkanMapel(_guruAddress);
    }
}
