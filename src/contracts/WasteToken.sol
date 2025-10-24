// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@hedera/hethers/contracts/HederaTokenService.sol";
import "@hedera/hethers/contracts/IHederaTokenService.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract WasteToken is HederaTokenService {
    address public owner;
    int64 public tokenSupply;
    string private constant TOKEN_NAME = "WasteNot Reduction Token";
    string private constant TOKEN_SYMBOL = "WASTE";
    uint32 private constant DECIMALS = 2;
    int64 private constant INITIAL_SUPPLY = 1_000_000; // 10,000 tokens

    constructor() {
        owner = msg.sender;
        tokenSupply = INITIAL_SUPPLY;

        IHederaTokenService.TokenCreateParams memory params = 
            IHederaTokenService.TokenCreateParams({
                name: TOKEN_NAME,
                symbol: TOKEN_SYMBOL,
                treasury: address(this),
                tokenKeys: getKeys(),
                initialSupply: tokenSupply,
                decimals: DECIMALS,
                tokenMemo: "Reward farmers for reducing post-harvest loss",
                autoRenewAccount: address(0),
                autoRenewPeriod: 0,
                tokenType: IHederaTokenService.TokenType.FUNGIBLE_COMMON,
                supplyType: IHederaTokenService.SupplyType.FINITE,
                maxSupply: 10_000_000,
                feeScheduleKey: address(0),
                pauseKey: address(0)
            });

        int responseCode = HederaTokenService.createFungibleToken(params);
        require(responseCode == 2200, "Token creation failed");

        address tokenAddress = getTokenAddress(TOKEN_SYMBOL);
        require(tokenAddress != address(0), "Invalid token address");

        // Transfer all supply to owner (you)
        responseCode = HederaTokenService.transferToken(
            tokenAddress,
            address(this),
            owner,
            tokenSupply
        );
        require(responseCode == 2200, "Initial transfer failed");
    }

    function getKeys() internal view returns (IHederaTokenService.TokenKey[] memory) {
        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](2);

        // Admin & Supply Key = Owner
        keys[0] = getSingleKey(address(this), IHederaTokenService.KeyType.SUPPLY);
        keys[1] = getSingleKey(address(this), IHederaTokenService.KeyType.ADMIN);

        return keys;
    }

    function getSingleKey(address keyAddr, IHederaTokenService.KeyType keyType)
        internal pure returns (IHederaTokenService.TokenKey memory)
    {
        return IHederaTokenService.TokenKey({
            keyType: keyType,
            key: bytes(""),
            ed25519: bytes(""),
            ECSDA_secp256k1: abi.encode(keyAddr),
            contractId: keyAddr,
            delegatable: false
        });
    }

    function getTokenAddress(string memory symbol) public view returns (address) {
        return HederaTokenService.getTokenAddress(symbol);
    }

    // Only owner can mint more tokens
    function mintTokens(int64 amount) external {
        require(msg.sender == owner, "Not authorized");
        int responseCode = HederaTokenService.mintToken(getTokenAddress(TOKEN_SYMBOL), amount, "");
        require(responseCode == 2200, "Mint failed");
        tokenSupply += amount;
    }
}