pragma solidity  ^0.5.2;

import "./Register.sol";

contract Marktpartner {
    address public owner;
    Register public register;
    
    bytes public certificate;
    bool public verified;
    
    modifier onlyRegister {
        require(msg.sender == address(register));
        _;
    }
    
    constructor(address _owner, Register _register) public {
        owner = _owner;
        register = _register;
    }
    
    function setCertificate(bytes memory _certificate) public onlyRegister {
        certificate = _certificate;
        verified = true;
    }
    
    // TODO: Implement ERC-725 and use key store for certificate data in reserved keys (owner cannot write to them)
}