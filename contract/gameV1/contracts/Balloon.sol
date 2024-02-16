// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import './IBalloon.sol';
import './Random.sol';
import './libs/SafeMath.sol';
import './libs/SafeTransferLib.sol';
import './libs/SignedSafeMath.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';

// Uncomment this line to use console.log
import 'hardhat/console.sol';

contract Balloon is AccessControl, IBalloon {
  using SafeMath for uint256;
  using SignedSafeMath for int256;
  using SafeTransferLib for address payable;

  // Admin role - setting contract
  bytes32 public constant ADMIN_ROLE = keccak256('ADMIN_ROLE');

  Random random;

  //****************
  // Game config
  //****************
  uint256 public dRTime_; // default round time
  uint256 public dRWTime_; // default round wait time
  uint256 public bPrice_; // base price
  uint256 public k_; // const k, Price = b + (n ^ 2) / k

  uint256 public refShare_; // referral share (/10000)
  uint256 public divShare_; // holder share (/10000)
  uint256 public jpShare_; // Jackpot share (/10000)
  uint256 public opShare_; // operation share (/10000)
  uint256 public opBalance_; // Jackpot share (/10000)

  uint256 private nonce = 0;
  uint256 public rID_; // round id number / total rounds that have happened
  uint256 public pID_; // total number of players
  //****************
  // PLAYER DATA
  //****************
  mapping(address => uint256) public pIDxAddr_; // (addr => pID) returns player id by address
  mapping(bytes32 => uint256) public pIDxName_; // (name => pID) returns player id by name
  mapping(bytes32 => uint256) public pIDxRefC_; // (name => pID) returns player id by referral code
  mapping(uint256 => Balloondatasets.Player) public plyr_; // (pID => data) player data
  mapping(uint256 => mapping(uint256 => Balloondatasets.PlayerRounds)) public plyrRnds_; // (pID => rID => data) player round data by player id & round id
  mapping(uint256 => mapping(bytes32 => bool)) public plyrNames_; // (pID => name => bool) list of names a player owns.  (used so you can change your display name amongst any name you own)
  //****************
  // ROUND DATA
  //****************
  mapping(uint256 => Balloondatasets.Round) public round_; // (rID => data) round data

  constructor(address _defaultAdmin) {
    _grantRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
    _grantRole(ADMIN_ROLE, _defaultAdmin);
    bPrice_ = 1000000000000000;
    k_ = 200000;
    refShare_ = 1000;
    divShare_ = 2500;
    jpShare_ = 500;
    opShare_ = 0;
    dRTime_ = 86400;
    dRWTime_ = 10800;
  }

  function registerXID(uint256 _affID, bytes32 _name, bytes32 _refC) external override {
    require(pIDxAddr_[msg.sender] == 0, 'User registered');
    if (_name != bytes32(0)) require(pIDxName_[_name] == 0, 'Name registered');
    if (_refC != bytes32(0)) require(pIDxRefC_[_refC] == 0, 'RefCode registered');
    pID_ += 1;
    pIDxAddr_[msg.sender] = pID_;
    if (_name != bytes32(0)) pIDxName_[_name] = pID_;
    if (_refC != bytes32(0)) pIDxRefC_[_refC] = pID_;
    plyr_[pID_].addr = msg.sender;
    plyr_[pID_].name = _name;
    plyr_[pID_].laff = _affID;
    plyr_[pID_].refC = _refC;
  }

  function registerXCode(bytes32 _affcode, string memory _name, bytes32 _refC) external override {}

  function buyPumpXID(uint256 _pID, uint256 _affID, uint256 amount) public payable override {
    require(plyr_[_pID].addr != address(0), 'Player is not registered');
    if (isRoundEnded()) {
      startRound();
    }
    console.log('round Id', rID_);
    if (plyr_[_pID].laff != _affID) plyr_[_pID].laff = _affID;
    uint256 n = round_[rID_].pumpB - round_[rID_].pumpS;
    console.log('number of pump', n);
    // Price = b + (n ^ 2) / k

    uint256 ePrice = amount *
      bPrice_ +
      (amount * (n ^ 2) + (n * amount * (amount + 1) + (amount * (amount + 1) * (2 * amount + 1)) / 6)) /
      k_;
    console.log('price', ePrice);
    require(msg.value >= ePrice, 'Need to send more ether');
    round_[rID_].pumpB += amount;
    plyrRnds_[_pID][rID_].pumpB += amount;
    plyrRnds_[_pID][rID_].lastB += block.timestamp;

    // uint256 random = rand();

    if (rand() % 1000 < 1) {
      // reduce round end time
      round_[rID_].endT -= 60;
    } else {
      // increase round end time
      if (round_[rID_].maxET > 0) {
        if (round_[rID_].endT + 60 > round_[rID_].maxET) round_[rID_].endT = round_[rID_].maxET;
        else round_[rID_].endT += 60;
      } else {
        round_[rID_].endT += 60;
      }
    }
    if (jpShare_ > 0) {
      round_[rID_].eJackpot += (jpShare_ * msg.value) / 10000;
    }
    if (opShare_ > 0) {
      opBalance_ += (opShare_ * msg.value) / 10000;
    }

    if (plyr_[_pID].laff == 0) {
      // 10% give to referral
      round_[rID_].divReward += ((refShare_ + divShare_) * msg.value) / 10000;
    } else {
      plyr_[_pID].refReward += (refShare_ * msg.value) / 10000;
      round_[rID_].divReward += (divShare_ * msg.value) / 10000;
    }

    round_[rID_].prizePool += ((10000 - jpShare_ - opShare_ - divShare_ - refShare_) * msg.value) / 10000;
  }

  function buyPumpXName(uint256 _pID, string memory _affName) external override {}

  function buyPumpXCode(uint256 _pID, bytes32 _affcode) external override {}

  function sell(uint256 n) external override {
    require(!isRoundEnded(), 'Round is ended');
    require(pIDxAddr_[msg.sender] != 0, 'User is not registered');
    uint256 _pID = pIDxAddr_[msg.sender];
    uint256 tPump = round_[rID_].pumpB - round_[rID_].pumpS;
    require(tPump >= n, 'Invalid number');
    require(plyrRnds_[_pID][rID_].pumpB - plyrRnds_[_pID][rID_].pumpS >= n, 'User donot have enough pump');

    uint256 _sellShare = (10000 - jpShare_ - opShare_ - divShare_ - refShare_);

    uint256 sellValue = (_sellShare *
      (bPrice_ * n + (n * (tPump ^ 2) + (n * (n + 1) * (n + 2)) / 6 - n * (n + 1) * tPump) / k_)) / 10000;
    // transfer sellValue to user;

    round_[rID_].prizePool -= sellValue;

    round_[rID_].pumpS += n;
    plyrRnds_[_pID][rID_].pumpS += n;
    if (plyrRnds_[_pID][rID_].pumpS == plyrRnds_[_pID][rID_].pumpB) {
      plyrRnds_[_pID][rID_].lastB = 0;
    }

    emit SellPump(msg.sender, _pID, rID_, n);
  }

  function withdraw() external override {}

  function getUserReferralReward(uint256 _pID) public view returns (uint256) {
    return plyr_[_pID].refReward;
  }

  function getUserHolderReward(uint256 _pID) public view returns (uint256) {
    return plyr_[_pID].refReward;
  }

  function getUserReward(uint256 _pID) public view returns (uint256) {
    return plyr_[_pID].refReward;
  }

  function getUserPendingReward(uint256 _pID) public view returns (uint256) {
    return plyr_[_pID].refReward;
  }

  function getUserHolderReward(uint256 _pID, uint256 _rID) public view returns (uint256) {
    return plyr_[_pID].refReward;
  }

  function buyCore() internal {
    if (isRoundEnded()) {
      startRound();
    }
  }

  function startRound() internal {
    uint256 lastEndTime = round_[rID_].endT;

    rID_ += 1;
    round_[rID_].strT = lastEndTime;
    round_[rID_].endT = lastEndTime + dRTime_;
  }

  function isRoundEnded() internal view returns (bool) {
    return round_[rID_].endT < block.timestamp;
  }

  function rand() internal returns (uint256) {
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

library Balloondatasets {
  //compressedData key
  // [76-33][32][31][30][29][28-18][17][16-6][5-3][2][1][0]
  // 0 - new player (bool)
  // 1 - joined round (bool)
  // 2 - new  leader (bool)
  // 3-5 - air drop tracker (uint 0-999)
  // 6-16 - round end time
  // 17 - winnerTeam
  // 18 - 28 timestamp
  // 29 - team
  // 30 - 0 = reinvest (round), 1 = buy (round), 2 = buy (ico), 3 = reinvest (ico)
  // 31 - airdrop happened bool
  // 32 - airdrop tier
  // 33 - airdrop amount won
  //compressedIDs key
  // [77-52][51-26][25-0]
  // 0-25 - pID
  // 26-51 - winPID
  // 52-77 - rID
  struct EventReturns {
    uint256 compressedData;
    uint256 compressedIDs;
    address winnerAddr; // winner address
    bytes32 winnerName; // winner name
    uint256 amountWon; // amount won
    uint256 newPot; // amount in new pot
    uint256 P3DAmount; // amount distributed to p3d
    uint256 genAmount; // amount distributed to gen
    uint256 potAmount; // amount added to pot
  }

  struct Player {
    address addr; // player address
    bytes32 name; // player name
    uint256 laff; // last affiliate id used
    uint256 refReward; // refferal reward to withdraw
    int256 withdrawed; // value user withdrawed
    bytes32 refC; // player referral code
  }
  struct PlayerRounds {
    uint256 pumpB; // number of pump bought
    uint256 pumpS; // number of pump Sold
    uint256 lastB; // lastest buy time
  }
  struct Round {
    uint256 strT; // time round started
    uint256 endT; // time round end
    uint256 maxET; // round max time end
    bool ended; // has round end function been ran
    uint256 pumpB; // number of pump bought
    uint256 pumpS; // number of pump Sold
    uint256 divReward; // reward share between holder
    uint256 opFee; // operation value
    uint256 eJackpot; // end game jackpot, will be added to prize pool at end game
    uint256 prizePool; // prize pool value
  }

  struct TeamFee {
    uint256 gen; // % of buy in thats paid to key holders of current round
    uint256 p3d; // % of buy in thats paid to p3d holders
  }
  struct PotSplit {
    uint256 gen; // % of pot thats paid to key holders of current round
    uint256 p3d; // % of pot thats paid to p3d holders
  }
}
