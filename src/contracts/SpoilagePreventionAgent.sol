// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./WasteToken.sol";
import "@hedera/hethers/contracts/HederaResponseCodes.sol";
import "@hedera/hethers/contracts/HederaTokenService.sol";

contract SpoilagePreventionAgent is HederaTokenService {
    address public owner;
    address public wasteToken;
    address public farmerRegistry; // future: KIAMIS integration
    mapping(bytes32 => bool) public claimRecorded;

    event RewardClaimed(address indexed farmer, uint amount, bytes32 eventId);
    event SpoilageRiskLogged(bytes32 indexed eventId, uint humidity, string recommendation);

    constructor(address _wasteToken) {
        owner = msg.sender;
        wasteToken = _wasteToken;
        farmerRegistry = address(0); // placeholder
    }

    /**
     * Called when system detects high humidity via HCS message parsing
     */
    function logSpoilageRiskAndReward(
        bytes32 eventId,
        uint256 humidity,
        string memory swahiliAlert
    ) external {
        require(humidity > 70, "No risk detected");
        require(!claimRecorded[eventId], "Already rewarded");

        // Emit event (recorded on mirror node + HCS)
        emit SpoilageRiskLogged(eventId, humidity, swahiliAlert);

        // Mint 10 WASTE tokens (10.00) to sender
        int responseCode = mintToken(wasteToken, 1000, ""); // 10.00 tokens
        require(responseCode == HederaResponseCodes.SUCCESS, "Mint failed");

        responseCode = transferToken(wasteToken, address(this), msg.sender, 1000);
        require(responseCode == HederaResponseCodes.SUCCESS, "Transfer failed");

        claimRecorded[eventId] = true;
        emit RewardClaimed(msg.sender, 1000, eventId);
    }

    /**
     * Helper: Mint tokens (uses HTS precompile)
     */
    function mintToken(address token, int64 amount, bytes memory metadata)
        internal returns (int)
    {
        (int responseCode, , ) = HederaTokenService.mintToken(token, amount, metadata);
        return responseCode;
    }

    /**
     * Helper: Transfer tokens
     */
    function transferToken(address token, address sender, address recipient, int64 amount)
        internal returns (int)
    {
        (int responseCode, ) = HederaTokenService.transferToken(token, sender, recipient, amount);
        return responseCode;
    }

    // Only owner can update registry or recover tokens
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
}