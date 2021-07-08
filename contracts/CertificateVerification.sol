pragma solidity  ^0.5.2;

import "../dependencies/asn1-decode/contracts/Asn1Decode.sol";
import "../dependencies/SmartMeterSignatureVerification/Verify.sol";

contract CertificateVerification {
    using Asn1Decode for bytes;
    bytes public certificate;
    bytes public content;
    bytes public contentInclContainer;
    bytes32 public contentHash;
    bytes public signatureScheme;
    bytes public signature;
    bytes public signatureI1;
    bytes public signatureI2;
    
    uint256 public pk_x = 0x686A332A465F38F17CC6541CB939CE1237CF8C2EFC1A28D8DD93191CCDD760BC;
    uint256 public pk_y = 0x48CEC4C40D2C0EBB7F1626C77FC8BD8573948600658BF6B8DFFBB2559A5EA8B7;
    uint256 public r;
    uint256 public s;
    
    bool public verified;
    
    constructor(bytes memory _certificate) public {
        certificate = _certificate;
        doStuff();
    }
    
    function doStuff() public {
        uint256 rootSequence = certificate.root();
        uint256 contentSequence = certificate.firstChildOf(rootSequence);
        uint256 signatureSchemeSequence = certificate.nextSiblingOf(contentSequence);
        uint256 signatureBitString = certificate.nextSiblingOf(signatureSchemeSequence);

        content = certificate.bytesAt(contentSequence);
        contentInclContainer = certificate.allBytesAt(contentSequence);
        contentHash = sha256(contentInclContainer);
        signatureScheme = certificate.bytesAt(signatureSchemeSequence);
        signature = certificate.bitstringAt(signatureBitString);
        
        uint256 signatureRoot = signature.root();
        uint256 signatureInt1 = signature.firstChildOf(signatureRoot);
        uint256 signatureInt2 = signature.nextSiblingOf(signatureInt1);
        
        signatureI1 = signature.bytesAt(signatureInt1);
        signatureI2 = signature.bytesAt(signatureInt2);
        require(signatureI1.length >= 32);
        require(signatureI2.length >= 32);
        
        r = toUint256(signatureI1, signatureI1.length - 32);
        s = toUint256(signatureI2, signatureI2.length - 32);
    }
    
    function performVerification() public {
        // Date check
        
        
        // Signature equality check
        
        // Signature validation
        verified = Verify.isValidSignatureForHash(pk_x, pk_y, r, s, uint256(contentHash));
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