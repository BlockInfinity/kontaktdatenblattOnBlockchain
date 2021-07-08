pragma solidity  ^0.5.2;

import "../dependencies/asn1-decode/contracts/Asn1Decode.sol";
import "../dependencies/SmartMeterSignatureVerification/Verify.sol";
import "./Marktpartner.sol";

contract Register {
    using Asn1Decode for bytes;
    
    uint256 public pk_x;
    uint256 public pk_y;
    
    mapping(string => Marktpartner) public register;
    mapping(address => bool) public marktpartnerCreated;
    
    modifier onlyMarktparnter(Marktpartner _marktpartner) {
        require(marktpartnerCreated[address(_marktpartner)]);
        _;
    }
    
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
    }
    
    function verifyAndRegisterMarktpartner(Marktpartner _marktpartner, bytes memory _certificate) public onlyMarktparnter(_marktpartner) {
        (bool signatureValid, bytes memory certificateContent) = verifyCertificateSignature(_certificate);
        require(signatureValid);
        
        // TODO: Verify whether the certificate contains the Marktpartner's address
        
        // TODO: extract organization's name from certificateContent
        require(register["test"] == Marktpartner(0x0));
        register["test"] = _marktpartner;
        _marktpartner.setCertificate(_certificate);
    }
    
    function createMarktpartner(bytes memory _certificate) public returns(Marktpartner __marktpartner) {
        __marktpartner = createMarktpartner();
        verifyAndRegisterMarktpartner(__marktpartner, _certificate);
    }
    
    
    function verifyCertificateSignature(bytes memory _certificate) internal view returns(bool __signatureValid, bytes memory __certificateContent) {
        uint256 rootSequence = _certificate.root();
        uint256 contentSequence = _certificate.firstChildOf(rootSequence);
        uint256 signatureSchemeSequence = _certificate.nextSiblingOf(contentSequence);
        uint256 signatureBitString = _certificate.nextSiblingOf(signatureSchemeSequence);

        __certificateContent = _certificate.bytesAt(contentSequence);
        
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