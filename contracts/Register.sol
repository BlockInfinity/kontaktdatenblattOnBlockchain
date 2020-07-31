pragma solidity  ^0.5.2;

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
    
    event MarktpartnerCreation(Marktpartner _marktpartner);
    event Time(uint256 a, uint256 b);
    event ProtoTime(uint16 yyyy, uint8 mm, uint8 dd, uint8 hh, uint8 minmin, uint8 ss, uint8 z);
    event SingleNumber(uint256 _number);
    
    modifier onlyMarktparnter(Marktpartner _marktpartner) {
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
    
    
    function createMarktpartner() public returns(Marktpartner __marktpartner) {
        __marktpartner = new Marktpartner(msg.sender, this);
        marktpartnerCreated[address(__marktpartner)] = true;
        emit MarktpartnerCreation(__marktpartner);
    }
    
    function verifyAndRegisterMarktpartner(Marktpartner _marktpartner, bytes memory _certificate) public onlyMarktparnter(_marktpartner) {
        bool signatureValid = verifyCertificateSignature(_certificate);
        require(signatureValid);
        
        // TODO: Verify whether the certificate contains the Marktpartner's address
        
        // TODO: extract organization's name from certificateContent
        // Verify timestamps
        uint256 rootSequence = _certificate.root();
        uint256 contentSequence = _certificate.firstChildOf(rootSequence);
        uint256 validitySequence = _certificate.nextSiblingOf(_certificate.nextSiblingOf(_certificate.nextSiblingOf(_certificate.nextSiblingOf(_certificate.firstChildOf(contentSequence)))));
        uint256 subjectSequence = _certificate.nextSiblingOf(validitySequence);
        uint256 validityStartTime = _certificate.firstChildOf(validitySequence);
        uint256 validityEndTime = _certificate.nextSiblingOf(validityStartTime);
        bytes memory validityStart = _certificate.bytesAt(validityStartTime);
        bytes memory validityEnd = _certificate.bytesAt(validityEndTime);
        require(time2Timestamp(validityStart) <= now);
        require(time2Timestamp(validityEnd) >= now);
        
        require(register["test"] == Marktpartner(0x0));
        register["test"] = _marktpartner;
        _marktpartner.setCertificate(_certificate);
    }
    
    function createMarktpartner(bytes memory _certificate) public returns(Marktpartner __marktpartner) {
        __marktpartner = createMarktpartner();
        verifyAndRegisterMarktpartner(__marktpartner, _certificate);
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
    
    function time2Timestamp(bytes memory _time) internal returns(uint64 __timestamp) {
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
        
        uint16 zHexDec = uint16(time >> (0*8));
        uint8 z = uint8(10*(((zHexDec & 0xff00) >> 8) - asciiValue0) + (zHexDec & 0x00ff - asciiValue0));
        
        __timestamp = uint64(DateTime.toTimestamp(year, month, day, hour, minute, second));
    }
    
    function time2Uint256(bytes memory _time) internal returns(uint256 __time) {
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