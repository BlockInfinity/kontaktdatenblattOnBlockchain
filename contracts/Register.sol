pragma solidity  ^0.5.2;

/*
License: GPL-3.0
Contact: contact@blockinfinity.com
*/

import "../dependencies/asn1-decode/contracts/Asn1Decode.sol";
import "../dependencies/SmartMeterSignatureVerification/Verify.sol";
import "../dependencies/ethereum-datetime/contracts/DateTime.sol";
import "./Marktpartner.sol";

contract Register {
    using Asn1Decode for bytes;
    
    uint256 public pk_x;
    uint256 public pk_y;
    
    mapping(string => Marktpartner) public register;
    mapping(address => bool) public marktpartnerCreated;
    address[] internal marktpartnerCreatedAddresses;
    
    event MarktpartnerCreation(Marktpartner _marktpartner, string _name);
    event MarktpartnerCompanyNameUpdate(Marktpartner _marktpartner, string _name);
    event MarktpartnerVerification(Marktpartner _marktpartner, string _name);
    
    modifier onlyMarktpartner(Marktpartner _marktpartner) {
        require(marktpartnerCreated[address(_marktpartner)]);
        _;
    }
    
    uint8 constant asciiValue0 = 48;
    
    /**
     * Use:
     * pk_x = 0x686A332A465F38F17CC6541CB939CE1237CF8C2EFC1A28D8DD93191CCDD760BC
     * pk_y = 0x48CEC4C40D2C0EBB7F1626C77FC8BD8573948600658BF6B8DFFBB2559A5EA8B7
     * 
     */
    constructor(uint256 _pk_x, uint256 _pk_y) public {
        pk_x = _pk_x;
        pk_y = _pk_y;
    }
    
    
    function createMarktpartner(string memory _companyName) public returns(Marktpartner __marktpartner) {
        require(register[_companyName] == Marktpartner(0x0));
        __marktpartner = new Marktpartner(msg.sender, this, _companyName);
        register[_companyName] = __marktpartner;
        marktpartnerCreated[address(__marktpartner)] = true;
        marktpartnerCreatedAddresses.push(address(__marktpartner));
        emit MarktpartnerCreation(__marktpartner, _companyName);
    }
    
    function setCompanyName(Marktpartner _marktpartner, string memory _oldCompanyName, string memory _newCompanyName) public onlyMarktpartner(_marktpartner) {
        require(register[_oldCompanyName] == _marktpartner);
        require(register[_newCompanyName] == Marktpartner(0x0));
        register[_oldCompanyName] = Marktpartner(0x0);
        register[_newCompanyName] = _marktpartner;
        _marktpartner.setCompanyName(_newCompanyName);
        emit MarktpartnerCompanyNameUpdate(_marktpartner, _newCompanyName);
    }

    function verifyAndRegisterMarktpartner(Marktpartner _marktpartner, bytes memory _certificate) public onlyMarktpartner(_marktpartner) {
        bool signatureValid = verifyCertificateSignature(_certificate);
        require(signatureValid);
        
        // TODO: Verify whether the certificate contains the Marktpartner's address
        
        // Verify timestamps
        uint256 rootSequence = _certificate.root();
        uint256 contentSequence = _certificate.firstChildOf(rootSequence);
        uint256 validitySequence = _certificate.nextSiblingOf(_certificate.nextSiblingOf(_certificate.nextSiblingOf(_certificate.nextSiblingOf(_certificate.firstChildOf(contentSequence)))));
        uint256 subjectSequence = _certificate.nextSiblingOf(validitySequence);
        uint256 validityStartTime = _certificate.firstChildOf(validitySequence);
        uint256 validityEndTime = _certificate.nextSiblingOf(validityStartTime);
        bytes memory validityStart = _certificate.bytesAt(validityStartTime);
        bytes memory validityEnd = _certificate.bytesAt(validityEndTime);
        uint64 validityEndTimestamp = time2Timestamp(validityEnd);
        require(time2Timestamp(validityStart) <= now);
        require(validityEndTimestamp >= now);
        
        // Extract organization's name
        string memory name = verifyAndRegisterMarktpartner_organizationName(_certificate, subjectSequence);
        
        require(register[name] == _marktpartner);
        _marktpartner.setCertificate(_certificate, validityEndTimestamp);
        emit MarktpartnerVerification(_marktpartner, name);
    }
    
    function verifyAndRegisterMarktpartner_organizationName(bytes memory _certificate, uint256 _subjectSequence) internal pure returns(string memory __name) {
        // TODO: Choose the right entry, not just the 3rd one.
        uint256 nameSet = _certificate.firstChildOf(_subjectSequence);
        nameSet = _certificate.nextSiblingOf(nameSet);
        nameSet = _certificate.nextSiblingOf(nameSet);
        uint256 nameSequence = _certificate.firstChildOf(nameSet);
        uint256 nameObjectId = _certificate.firstChildOf(nameSequence);
        uint256 namePrintableString = _certificate.nextSiblingOf(nameObjectId);
        __name = string(_certificate.bytesAt(namePrintableString));
    }
    
    function createMarktpartner(string memory _companyName, bytes memory _certificate) public returns(Marktpartner __marktpartner) {
        __marktpartner = createMarktpartner(_companyName);
        verifyAndRegisterMarktpartner(__marktpartner, _certificate);
    }
    
    function getMarktpartnerCreatedAddresses() public view returns (address[] memory) {
        return marktpartnerCreatedAddresses;
    }
    
    function verifyCertificateSignature(bytes memory _certificate) internal view returns(bool __signatureValid) {
        uint256 rootSequence = _certificate.root();
        uint256 contentSequence = _certificate.firstChildOf(rootSequence);
        uint256 signatureSchemeSequence = _certificate.nextSiblingOf(contentSequence);
        uint256 signatureBitString = _certificate.nextSiblingOf(signatureSchemeSequence);
        
        // The content sequnce including its container needs to be used for computing the hash.
        bytes32 contentHash = sha256(_certificate.allBytesAt(contentSequence));
        bytes memory signatureScheme = _certificate.bytesAt(signatureSchemeSequence);
        bytes memory signature = _certificate.bitstringAt(signatureBitString);
        
        uint256 signatureRoot = signature.root();
        uint256 signatureInt1 = signature.firstChildOf(signatureRoot);
        uint256 signatureInt2 = signature.nextSiblingOf(signatureInt1);
        
        bytes memory signatureI1 = signature.bytesAt(signatureInt1);
        bytes memory signatureI2 = signature.bytesAt(signatureInt2);
        require(signatureI1.length >= 32);
        require(signatureI2.length >= 32);
        
        uint256 r = toUint256(signatureI1, signatureI1.length - 32);
        uint256 s = toUint256(signatureI2, signatureI2.length - 32);
        __signatureValid = Verify.isValidSignatureForHash(pk_x, pk_y, r, s, uint256(contentHash));
    }
    
    function time2Timestamp(bytes memory _time) internal pure returns(uint64 __timestamp) {
        // TODO: Implement 15 bytes time too
        require(_time.length == 13);

        uint256 time = time2Uint256(_time);
        uint16 yearHexDec = uint16(time >> (11*8));
        uint16 year = 10*(((yearHexDec & 0xff00) >> 8) - asciiValue0) + (yearHexDec & 0x00ff - asciiValue0);
        
        if(year >= 50)
            year += 1900;
        else
            year += 2000;
        
        uint16 monthHexDec = uint16(time >> (9*8));
        uint8 month = uint8(10*(((monthHexDec & 0xff00) >> 8) - asciiValue0) + (monthHexDec & 0x00ff - asciiValue0));

        uint16 dayHexDec = uint16(time >> (7*8));
        uint8 day = uint8(10*(((dayHexDec & 0xff00) >> 8) - asciiValue0) + (dayHexDec & 0x00ff - asciiValue0));
        
        uint16 hourHexDec = uint16(time >> (5*8));
        uint8 hour = uint8(10*(((hourHexDec & 0xff00) >> 8) - asciiValue0) + (hourHexDec & 0x00ff - asciiValue0));
        
        uint16 minuteHexDec = uint16(time >> (3*8));
        uint8 minute = uint8(10*(((minuteHexDec & 0xff00) >> 8) - asciiValue0) + (minuteHexDec & 0x00ff - asciiValue0));

        uint16 secondHexDec = uint16(time >> (1*8));
        uint8 second = uint8(10*(((secondHexDec & 0xff00) >> 8) - asciiValue0) + (secondHexDec & 0x00ff - asciiValue0));
        
        uint8 z = uint8(time >> (0*8));
        require(z == 90);
        
        __timestamp = uint64(DateTime.toTimestamp(year, month, day, hour, minute, second));
    }
    
    function time2Uint256(bytes memory _time) internal pure returns(uint256 __time) {
        bytes memory time32 = new bytes(32);
        for(uint8 i = 0; i < 13; i++) {
            time32[31-i] = _time[12-i];
        }

        __time = toUint256(time32, 0);
    }
    
    
    // Stolen from: https://github.com/GNSPS/solidity-bytes-utils/blob/master/contracts/BytesLib.sol
    function toUint256(bytes memory _bytes, uint256 _start) internal pure returns (uint256) {
        require(_bytes.length >= (_start + 32), "Read out of bounds");
        uint256 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x20), _start))
        }

        return tempUint;
    }
}