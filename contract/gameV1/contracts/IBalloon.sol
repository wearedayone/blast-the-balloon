// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

interface IBalloon {
  event RoundEnd(uint256 _rID);
  event RoundStart(uint256 _rID);
  event Register(
    uint256 _pID,
    address _addr,
    bytes32 _name,
    bytes32 _refC,
    uint256 _affID,
    bytes32 _affName,
    bytes32 _affcode
  );

  event BuyPump(
    uint256 _pID,
    address _addr,
    bytes32 _name,
    bytes32 _refC,
    uint256 _affID,
    bytes32 _affName,
    bytes32 _affcode,
    uint256 _amount,
    uint256 _bTime,
    uint256 _rID,
    bool decreasing,
    uint256 time
  );
  event Withdraw(uint256 _pID, uint256 _amount);

  event SellPump(address _addr, uint256 _pID, uint256 _rID, uint256 _amount);

  function registerXID(uint256 _affID, bytes32 _name, bytes32 _refC) external;

  function registerXCode(bytes32 _affcode, bytes32 _name, bytes32 _refC) external;

  function buyPumpXID(uint256 _pID, uint256 _affID, uint256 amount) external payable;

  function buyPumpXName(uint256 _pID, bytes32 _affName) external;

  function buyPumpXCode(uint256 _pID, bytes32 _affcode) external;

  function sell(uint256 n) external;

  function withdraw() external;
}

interface PlayerBookInterface {
  function getPlayerID(address _addr) external returns (uint256);

  function getPlayerName(uint256 _pID) external view returns (bytes32);

  function getPlayerLAff(uint256 _pID) external view returns (uint256);

  function getPlayerAddr(uint256 _pID) external view returns (address);

  function getNameFee() external view returns (uint256);

  function registerNameXIDFromDapp(
    address _addr,
    bytes32 _name,
    uint256 _affCode,
    bool _all
  ) external payable returns (bool, uint256);

  function registerNameXaddrFromDapp(
    address _addr,
    bytes32 _name,
    address _affCode,
    bool _all
  ) external payable returns (bool, uint256);

  function registerNameXnameFromDapp(
    address _addr,
    bytes32 _name,
    bytes32 _affCode,
    bool _all
  ) external payable returns (bool, uint256);
}
