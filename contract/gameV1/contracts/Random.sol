// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import 'hardhat/console.sol';

contract Random {
  uint256 private nonce = 0;

  function rand() external returns (uint256) {
    require(msg.sender == tx.origin, 'Bad credential');
    uint256 balance = msg.sender.balance;
    console.log(nonce);

    uint160 value = uint160(uint(keccak256(abi.encodePacked(nonce + balance, blockhash(block.number - 1)))));

    // console.log(value);
    uint256 loop = (value % 100) + 1;
    // console.log(loop);
    for (uint256 i = 0; i < loop; i++) {
      // console.log(gasleft());
      nonce += gasleft() % 100;
    }
    console.log(nonce);

    value = uint160(uint(keccak256(abi.encodePacked(nonce + balance, blockhash(block.number - 1)))));
    address randomAddress = address(value);

    uint256 seed = uint256(
      keccak256(
        abi.encodePacked(
          block.timestamp +
            block.prevrandao +
            ((uint256(keccak256(abi.encodePacked(block.coinbase)))) / (block.timestamp)) +
            block.gaslimit +
            ((uint256(keccak256(abi.encodePacked(randomAddress)))) / (block.timestamp)) +
            block.number
        )
      )
    );

    uint256 randomValue = (seed - ((seed / 1000) * 1000));
    console.log(randomValue);
    return randomValue;
  }
}
