pragma solidity  ^0.5.2;

/*
License: GPL-3.0
Contact: contact@blockinfinity.com
*/

import "./Register.sol";

contract Marktpartner {
    // Events ERC-725
    event DataChanged(bytes32 indexed key, bytes value);
    event ContractCreated(address indexed contractAddress);
    event OwnerChanged(address indexed ownerAddress);

    // Attributes ERC-725
    address public owner;
    mapping(bytes32 => bytes) public data;
    mapping(bytes32 => bool) reservedDataField;

    // Other attributes
    Register public register;
    bytes public certificate;
    uint64 public validityEndTimestamp;
    bool public verified;
    
    modifier onlyRegister {
        require(msg.sender == address(register));
        _;
    }
    
    constructor(address _owner, Register _register, string memory _companyName) public {
        owner = _owner;
        register = _register;
        data[bytes32("companyName")] = bytes(_companyName);
    
        reservedDataField[bytes32("headquartersAddress")] = true;
        reservedDataField[bytes32("webAddress")] = true;
        reservedDataField[bytes32("vatId")] = true;
        reservedDataField[bytes32("marktpartnerId")] = true;
        reservedDataField[bytes32("sector")] = true;
        reservedDataField[bytes32("marketRole")] = true;
    }
    
    // Modifiers ERC-725
    modifier onlyOwner {
        require(msg.sender == owner || msg.sender == address(this));
        _;
    }
    
    // Functions ERC-725
    function changeOwner(address _owner) public onlyOwner {
        owner = _owner;
        emit OwnerChanged(_owner);
    }
    
    function getData(bytes32 _key) external view returns (bytes memory _value) {
        return data[_key];
    }
    
    function setData(bytes32 _key, bytes calldata _value) external onlyOwner {
        // Don't allow storing data to reserved data fields.
        require(!reservedDataField[_key]);
        
        data[_key] = _value;
        emit DataChanged(_key, _value);
    }
    
    function execute(uint256 _operationType, address _to, uint256 _value, bytes calldata _data) external onlyOwner {
        if(_operationType == 0) {
            (bool success, ) = _to.call.value(_value)(_data);
            if(!success)
                require(false);
            return;
        }
        
        // Copy calldata to memory so it can easily be accessed via assembly.
        bytes memory dataMemory = _data;
        
        if(_operationType == 1) {
            address newContract;
            assembly {
                newContract := create(0, add(dataMemory, 0x20), mload(dataMemory))
            }
            emit ContractCreated(newContract);
            return;
        }
        
        require(false);
    }

    // Other functions
    function setCertificate(bytes memory _certificate, uint64 _validityEndTimestamp) public onlyRegister {
        certificate = _certificate;
        validityEndTimestamp = _validityEndTimestamp;
        verified = true;
    }

    function setCompanyName(string memory _companyName) public onlyRegister {
        require(!verified);
        data[bytes32("companyName")] = bytes(_companyName);
    }
    
    function setContactInformation(string memory _headquartersAddress, string memory _webAddress, string memory _vatId,
    string memory _marktpartnerId, string memory _sector, string memory _marketRole) public onlyOwner {
        data[bytes32("headquartersAddress")] = bytes(_headquartersAddress);
        data[bytes32("webAddress")] = bytes(_webAddress);
        data[bytes32("vatId")] = bytes(_vatId);
        data[bytes32("marktpartnerId")] = bytes(_marktpartnerId);
        data[bytes32("sector")] = bytes(_sector);
        data[bytes32("marketRole")] = bytes(_marketRole);
    }
    
    function getContactInformation() public view returns(string memory __companyName, string memory __headquartersAddress,
    string memory __webAddress, string memory __vatId, string memory __marktpartnerId, string memory __sector, string memory __marketRole) {
        
        __companyName = string(data[bytes32("companyName")]);
        __headquartersAddress = string(data[bytes32("headquartersAddress")]);
        __webAddress = string(data[bytes32("webAddress")]);
        __vatId = string(data[bytes32("vatId")]);
        __marktpartnerId = string(data[bytes32("marktpartnerId")]);
        __sector = string(data[bytes32("sector")]);
        __marketRole = string(data[bytes32("marketRole")]);
    }
    
    function getContactInformationJson() public view returns(string memory __contactInformation) {
        
        __contactInformation = string(abi.encodePacked('{',
        '"companyName":"', data[bytes32("companyName")], '",',
        '"headquartersAddress":"', data[bytes32("headquartersAddress")], '",',
        '"webAddress":"', data[bytes32("webAddress")], '",',
        '"vatId":"', data[bytes32("vatId")], '",',
        '"marktpartnerId":"', data[bytes32("marktpartnerId")], '",',
        '"sector":"', data[bytes32("sector")], '",',
        '"marketRole":"', data[bytes32("marketRole")], '"',
        '}'));
    }
    
    function escape(bytes memory _seq) internal pure returns(bytes memory __result) {
        __result = replace(replace(_seq, '\\', '\\\\'), '"', '\\"');
    }
    
    function replace(bytes memory _seq, bytes1 _keyword, bytes memory _replacement) internal pure returns(bytes memory __result) {
        uint64 occurances = 0;
        for(uint64 i=0; i<_seq.length; i++) {
            if(_seq[i] == _keyword[0]) {
                occurances++;
            }
        }
        
        if(occurances == 0)
            return _seq;
        
        __result = new bytes(_seq.length + occurances*(_replacement.length - 1));
        
        uint64 shift = 0;
        for(uint64 i=0; i<_seq.length; i++) {
            if(_seq[i] != _keyword[0]) {
                __result[i+shift] = _seq[i];
            } else {
                for(uint64 j=0; j<_replacement.length; j++) {
                    __result[i+shift] = _replacement[j];
                    shift++;
                }
            }
        }
    }
}