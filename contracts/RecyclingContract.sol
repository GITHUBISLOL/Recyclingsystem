// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract RecyclingContract {
    address public NEA;

    enum RecyclingStatus {Rejected, Recheck, Approved}

    struct RecyclingItem {
        uint256 Id;                 
        string itemId;              
        string recyclerName;    
        string materialType;
        uint256 weight;
        uint256 binNumber;
        string location;           
        RecyclingStatus status;
        address submittedBy;
    }

    mapping(uint256 => RecyclingItem) public items; 
    uint256 public itemCount;

    mapping(uint256 => string) public binLocations;

    // Leaderboard Data
    mapping(string => uint256) public userTotalWeights;
    string[] public recyclerList;
    mapping(string => bool) private hasRecycled;

    // Event to record submission timestamp
    event ItemSubmitted(uint256 indexed Id, uint256 timestamp);

    modifier onlyNEA() {
        require(msg.sender == NEA, "Only NEA can perform this action");
        _;
    }

    constructor() {
        NEA = msg.sender;
        binLocations[1] = "Orchard";
        binLocations[2] = "Tampines";
        binLocations[3] = "Jurong";
        binLocations[4] = "Bedok";
    }

    function registerItem(
        string memory _recyclerName,
        string memory _materialType,
        uint256 _weight,
        uint256 _binNumber
    ) public onlyNEA {
        require(bytes(binLocations[_binNumber]).length != 0, "Bin location not set");

        itemCount++;
        RecyclingItem storage r = items[itemCount];
        r.Id = itemCount;
        r.itemId = string(abi.encodePacked("000", uint2str(itemCount)));
        r.recyclerName = _recyclerName;
        r.materialType = _materialType;
        r.weight = _weight;
        r.binNumber = _binNumber;
        r.location = binLocations[_binNumber];
        r.status = RecyclingStatus.Approved;  // always approved
        r.submittedBy = msg.sender;

        // Update Total Weight for Leaderboard
        userTotalWeights[_recyclerName] += _weight;
        if (!hasRecycled[_recyclerName]) {
            recyclerList.push(_recyclerName);
            hasRecycled[_recyclerName] = true;
        }

        emit ItemSubmitted(itemCount, block.timestamp); // emit timestamp
    }

    function getRecyclerListCount() public view returns(uint256) {
        return recyclerList.length;
    }

    // Helper: convert uint to string
    function uint2str(uint256 _i) internal pure returns (string memory str) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 length;
        while (j != 0) { length++; j /= 10; }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            bstr[--k] = bytes1(uint8(48 + _i % 10));
            _i /= 10;
        }
        str = string(bstr);
    }

    function getItemSummary(uint256 _id) public view returns (
        uint256 Id,
        string memory itemId,
        string memory recyclerName,
        string memory materialType,
        uint256 weight,
        uint256 binNumber,
        string memory location,
        RecyclingStatus status,
        address submittedBy
    ) {
        RecyclingItem storage item = items[_id];
        return (
            item.Id,
            item.itemId,
            item.recyclerName,
            item.materialType,
            item.weight,
            item.binNumber,
            item.location,
            item.status,
            item.submittedBy
        );
    }
}
