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

  // Price
  uint256 public bPrice_; // base price
  uint256 public k_; // const k, Price = b + (n ^ 2) / k

  // Game timer
  uint256 public dRTime_; // default round time
  uint256 public dRWTime_; // default round wait time
  uint256 public dTRatio_; // decrease time ratio (/10000)
  uint256 public dTNumber_; // decrease time in second
  uint256 public iTRatio_; // increase time ratio (/10000)
  uint256 public iTNumber_; // increase time in second

  // Buyin Share
  uint256 public refShare_; // referral share (/10000)
  uint256 public holShare_; // holder share (/10000)
  uint256 public jpShare_; // Jackpot share (/10000)
  uint256 public opShare_; // operation share (/10000)

  // Prize share
  uint256 public llW_; //last Lucky Weight (/10000)
  uint256 public lpW_; //last Purchase Weight (/10000)
  uint256 public opW_; //operation Weight (/10000)
  uint256 public nrW_; //next round prize Weight (/10000)
  uint256 public thW_; //top Holder prize Weight (/10000)
  uint256[] public thD_ = [10, 6, 4]; //topHoldersDistribution

  uint256 private nonce = 0;
  uint256 public rID_; // round id number / total rounds that have happened
  uint256 public pID_; // total number of players
  address public opAddr_; // operation address

  //****************
  // PLAYER DATA
  //****************
  uint256 lastBB_; //last Buy Block
  mapping(address => uint256) public pIDxAddr_; // (addr => pID) returns player id by address
  mapping(bytes32 => uint256) public pIDxName_; // (name => pID) returns player id by name
  mapping(bytes32 => uint256) public pIDxRefC_; // (name => pID) returns player id by referral code
  mapping(uint256 => Balloondatasets.Player) public plyr_; // (pID => data) player data
  mapping(uint256 => mapping(uint256 => Balloondatasets.PlayerRounds)) public plyrRnds_; // (pID => rID => data) player round data by player id & round id
  mapping(uint256 => mapping(bytes32 => bool)) public plyrNames_; // (pID => name => bool) list of names a player owns.  (used so you can change your display name amongst any name you own)
  //****************
  //* ROUND DATA
  //****************
  mapping(uint256 => Balloondatasets.Round) public round_; // (rID => data) round data

  constructor(address _defaultAdmin) {
    _grantRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
    _grantRole(ADMIN_ROLE, _defaultAdmin);
    bPrice_ = 1000000000000000;
    k_ = 200000;

    // dRTime_ = 86400;
    // dRWTime_ = 10800;
    dRTime_ = 600;
    dRWTime_ = 300;

    iTRatio_ = 9900;
    iTNumber_ = 60;
    dTRatio_ = 100;
    dTNumber_ = 60;

    refShare_ = 1000;
    holShare_ = 2500;
    jpShare_ = 500;
    opShare_ = 0;

    llW_ = 2000;
    lpW_ = 6500;
    opW_ = 0;
    nrW_ = 500;
    thW_ = 1000;
  }

  /**
   * dsdsds
   * dsds
   */
  function registerXID(uint256 _affID, bytes32 _name, bytes32 _refC) external override {
    require(pIDxAddr_[msg.sender] == 0, 'User registered');
    if (_affID != 0) require(plyr_[_affID].addr != address(0), 'Invalid affID');
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

    emit Register(pID_, msg.sender, _name, _refC, _affID, plyr_[_affID].name, plyr_[_affID].refC);
  }

  function registerXCode(bytes32 _affcode, bytes32 _name, bytes32 _refC) external override {
    require(pIDxAddr_[msg.sender] == 0, 'User registered');
    if (_affcode != bytes32(0)) require(pIDxRefC_[_affcode] != 0, 'Invalid _affcode');

    if (_name != bytes32(0)) require(pIDxName_[_name] == 0, 'Name registered');
    if (_refC != bytes32(0)) require(pIDxRefC_[_refC] == 0, 'RefCode registered');
    pID_ += 1;
    pIDxAddr_[msg.sender] = pID_;
    if (_name != bytes32(0)) pIDxName_[_name] = pID_;
    if (_refC != bytes32(0)) pIDxRefC_[_refC] = pID_;
    plyr_[pID_].addr = msg.sender;
    plyr_[pID_].name = _name;
    plyr_[pID_].laff = pIDxRefC_[_affcode];
    plyr_[pID_].refC = _refC;

    emit Register(pID_, msg.sender, _name, _refC, pIDxRefC_[_affcode], plyr_[pIDxRefC_[_affcode]].name, _affcode);
  }

  function buyPumpXID(uint256 _pID, uint256 _affID, uint256 amount) public payable override {
    // Validation
    {
      require(plyr_[_pID].addr != address(0), 'Player is not registered');
      require(plyr_[_pID].addr == msg.sender, 'Invalid PID');
      require(lastBB_ != block.number, 'block is used');

      if (isRoundEnded()) {
        startRound();
      }
      console.log('round Id', rID_);
      if (_affID != 0 && plyr_[_pID].laff != _affID) {
        require(plyr_[_affID].addr != address(0), 'Invalid _affID');
        plyr_[_pID].laff = _affID;
      }
      uint256 n = round_[rID_].pumpB - round_[rID_].pumpS;
      console.log('number of pump', n);
      uint256 ePrice = amount *
        bPrice_ +
        ((amount * (n * n) + n * amount * (amount - 1) + ((amount * (amount - 1) * (2 * amount - 1)) / 6)) * 1e18) /
        k_;
      console.log('Require price', ePrice);
      require(msg.value >= ePrice, 'Need to send more ether');
    }
    // Finish validation
    {
      if (plyr_[_pID].lRID != 0 && plyr_[_pID].lRID < rID_) {
        updateUserReward(_pID);
      }
      plyr_[_pID].lRID = rID_;
      round_[rID_].pumpB += amount;
      round_[rID_].llPID = _pID;
      plyrRnds_[_pID][rID_].pumpB += amount;
      plyrRnds_[_pID][rID_].lastB = block.timestamp;
    }
    // uint256 random = rand();
    uint256 seed = rand();
    bool decreasing = false;
    uint256 time = iTNumber_;

    if (seed % 10000 <= dTRatio_) {
      // reduce round end time
      round_[rID_].endT -= dTNumber_;
      decreasing = true;
      time = dTNumber_;
    } else if (seed % 10000 > iTRatio_) {
      // increase round end time
      if (round_[rID_].maxET > 0) {
        if (round_[rID_].endT + iTNumber_ > round_[rID_].maxET) {
          round_[rID_].endT = round_[rID_].maxET;
        } else round_[rID_].endT += iTNumber_;
      } else {
        round_[rID_].endT += iTNumber_;
      }
    }

    {
      // prizeGame Jackpot
      if (jpShare_ > 0) {
        round_[rID_].eJackpot += (jpShare_ * msg.value) / 10000;
      }

      // Operation fee
      if (opShare_ > 0) {
        require(opAddr_ != address(0), 'invalid opAddr_');
        address payable receiver = payable(opAddr_);
        receiver.transfer((opShare_ * msg.value) / 10000);
      }

      uint256 holReward;
      // Referral fee & holder fee
      console.log('Referral ID', plyr_[_pID].laff);
      if (plyr_[_pID].laff == 0) {
        // Donot have referral then give all to holderReward
        holReward = ((refShare_ + holShare_) * msg.value) / 10000;
      } else {
        holReward += (holShare_ * msg.value) / 10000;
        plyr_[plyr_[_pID].laff].refReward += (refShare_ * msg.value) / 10000;
      }
      round_[rID_].holReward += holReward;

      uint256 totalP = round_[rID_].pumpB - round_[rID_].pumpS;
      round_[rID_].accHolPerPump += holReward / totalP;
      plyrRnds_[_pID][rID_].holderDebt = plyrRnds_[_pID][rID_].holderDebt.add(
        int256(amount.mul(round_[rID_].accHolPerPump))
      );

      round_[rID_].prizePool += ((10000 - jpShare_ - opShare_ - holShare_ - refShare_) * msg.value) / 10000;
      lastBB_ = block.number;
    }
    uint256 laff = plyr_[_pID].laff;
    emit BuyPump(
      _pID,
      msg.sender,
      plyr_[_pID].name,
      plyr_[_pID].refC,
      plyr_[_pID].laff,
      plyr_[laff].name,
      plyr_[laff].refC,
      amount,
      block.timestamp,
      rID_,
      decreasing,
      time
    );
  }

  function buyPumpXName(uint256 _pID, bytes32 _affName) external override {}

  function buyPumpXCode(uint256 _pID, bytes32 _affcode) external override {}

  function sell(uint256 n) external override {
    require(!isRoundEnded(), 'Round is ended');
    require(pIDxAddr_[msg.sender] != 0, 'User is not registered');
    uint256 _pID = pIDxAddr_[msg.sender];
    uint256 tPump = round_[rID_].pumpB - round_[rID_].pumpS;
    require(tPump >= n, 'Invalid number');
    require(plyrRnds_[_pID][rID_].pumpB - plyrRnds_[_pID][rID_].pumpS >= n, 'User donot have enough pump');

    uint256 _sellShare = (10000 - jpShare_ - opShare_ - holShare_ - refShare_);

    uint256 sellValue = (_sellShare *
      (bPrice_ * n + (n * (tPump * tPump) + (n * (n + 1) * (n + 2)) / 6 - n * (n + 1) * tPump) / k_)) / 10000;
    // transfer sellValue to user;
    address payable receiver = payable(msg.sender);
    receiver.transfer(sellValue);

    round_[rID_].prizePool -= sellValue;

    round_[rID_].pumpS += n;
    plyrRnds_[_pID][rID_].pumpS += n;
    if (plyrRnds_[_pID][rID_].pumpS == plyrRnds_[_pID][rID_].pumpB) {
      plyrRnds_[_pID][rID_].lastB = 0;
    }

    plyrRnds_[_pID][rID_].holderDebt = plyrRnds_[_pID][rID_].holderDebt.sub(int256(n.mul(round_[rID_].accHolPerPump)));

    emit SellPump(msg.sender, _pID, rID_, n);
  }

  function withdraw() external override {
    uint256 _pID = pIDxAddr_[msg.sender];
    require(_pID != 0, 'Invalid address');
    address payable receiver = payable(msg.sender);
    uint256 withdrawableValue = getUserReferralReward(_pID) + getUserHolderReward(_pID) + getUserReward(_pID);
    require(withdrawableValue > 0, 'Insufficient balance');
    receiver.transfer(withdrawableValue);
    plyr_[_pID].withdrawed += withdrawableValue;
    emit Withdraw(_pID, withdrawableValue);
  }

  function getUserReferralReward(uint256 _pID) public view returns (uint256) {
    return plyr_[_pID].refReward;
  }

  function getUserHolderReward(uint256 _pID) public view returns (uint256) {
    return plyr_[_pID].holReward + getUserHolderRewardByRound(_pID, rID_);
  }

  function getUserHolderRewardByRound(uint256 _pID, uint256 _rID) public view returns (uint256) {
    uint256 holderPump = plyrRnds_[_pID][_rID].pumpB - plyrRnds_[_pID][_rID].pumpS;
    int256 accumulated = int256(holderPump.mul(round_[_rID].accHolPerPump));
    return accumulated.sub(plyrRnds_[_pID][_rID].holderDebt).toUInt256();
  }

  function getUserReward(uint256 _pID) public view returns (uint256) {
    return plyr_[_pID].winReward + getUserRewardByRound(_pID, rID_);
  }

  function getUserRewardByRound(uint256 _pID, uint256 _rID) public view returns (uint256) {
    if (plyrRnds_[_rID][_pID].lastB == 0) return 0;
    uint256 totalPrize = round_[_rID].prizePool + round_[_rID].eJackpot;

    if (round_[_rID].llPID == _pID) {
      return (totalPrize * llW_) / 10000;
    } else {
      uint8 totalPlayer = 0;
      uint8 rank = 0;

      for (uint8 i = 1; i <= pID_; i++) {
        if (plyrRnds_[_rID][i].lastB > 0) totalPlayer += 1;
        if (plyrRnds_[_rID][i].lastB >= plyrRnds_[_rID][_pID].lastB) rank += 1;
      }
      console.log('totalPlayer', totalPlayer);
      console.log('llPID', round_[_rID].llPID);
      console.log('_pID', _pID);
      console.log('rank', rank);
      return (rank * rank * totalPrize * lpW_) / (1000 * (totalPlayer + 1) * totalPlayer * (2 * totalPlayer + 1));
    }
  }

  function getUserPendingReward(uint256 _pID) public view returns (uint256) {
    return getUserRewardByRound(_pID, rID_);
  }

  function buyCore() internal {
    if (isRoundEnded()) {
      startRound();
    }
  }

  function startRound() internal {
    console.log('startRound');
    uint256 lastEndTime = round_[rID_].endT;
    require(round_[rID_].endT + dRWTime_ <= block.timestamp, 'Pause time');
    if (rID_ == 0) lastEndTime = block.timestamp;
    uint256 totalPrize = round_[rID_].prizePool + round_[rID_].eJackpot;
    rID_ += 1;

    round_[rID_].strT = lastEndTime;
    round_[rID_].endT = lastEndTime + dRTime_;
    round_[rID_].prizePool = (totalPrize * nrW_) / 10000;
    emit RoundStart(rID_);
  }

  function isRoundEnded() internal view returns (bool) {
    console.log('isRoundEnded', round_[rID_].endT < block.timestamp);
    return round_[rID_].endT < block.timestamp;
  }

  function estimatePrice(uint256 amount) public view returns (uint256) {
    uint256 totalP = 0;
    if (!isRoundEnded()) {
      totalP = round_[rID_].pumpB - round_[rID_].pumpS;
    }
    uint256 ePrice = amount *
      bPrice_ +
      ((amount *
        (totalP * totalP) +
        totalP *
        amount *
        (amount - 1) +
        ((amount * (amount - 1) * (2 * amount - 1)) / 6)) * 1e18) /
      k_;
    return ePrice;
  }

  function rand() internal view returns (uint256) {
    uint256 seed = uint256(
      keccak256(
        abi.encodePacked(
          (block.timestamp)
            .add(block.prevrandao)
            .add((uint256(keccak256(abi.encodePacked(block.coinbase)))) / (block.timestamp))
            .add(block.gaslimit)
            .add((uint256(keccak256(abi.encodePacked(msg.sender)))) / (block.timestamp))
            .add(block.number)
        )
      )
    );
    uint256 randomValue = (seed - ((seed / 10000) * 10000));
    // console.log(randomValue);
    return randomValue;
  }

  function updateUserReward(uint256 _pID) internal {
    console.log('updateUserReward');
    if (plyr_[_pID].lRID == 0 || plyr_[_pID].lRID == rID_) return;

    uint256 lRID = plyr_[_pID].lRID;
    console.log('getUserHolderRewardByRound', getUserHolderRewardByRound(_pID, lRID));
    console.log('getUserRewardByRound', getUserRewardByRound(_pID, lRID));

    plyr_[_pID].holReward += getUserHolderRewardByRound(_pID, lRID);
    plyr_[_pID].winReward += getUserRewardByRound(_pID, lRID);
    plyr_[_pID].lRID = rID_;
  }

  function updatePumpPrice(uint256 _bPrice, uint256 _k) public onlyRole(ADMIN_ROLE) {
    bPrice_ = _bPrice;
    k_ = _k;
  }

  function updatePrizeConfig(
    uint256 _llW,
    uint256 _lpW,
    uint256 _oW,
    uint256 _nrW,
    uint256 _thW
  ) public onlyRole(ADMIN_ROLE) {
    llW_ = _llW;
    lpW_ = _lpW;
    opW_ = _oW;
    nrW_ = _nrW;
    thW_ = _thW;
  }

  function updatePrizeShare(
    uint256 _refShare,
    uint256 _holShare,
    uint256 _jpShare,
    uint256 _opShare
  ) public onlyRole(ADMIN_ROLE) {
    require(_opShare == 0 || opAddr_ != address(0), 'Invalid operation share');
    require(_refShare + _holShare + _jpShare + _opShare == 10000, 'Invalid number');
    refShare_ = _refShare;
    holShare_ = _holShare;
    jpShare_ = _jpShare;
    opShare_ = _opShare;
  }

  function updateTimeConfig(
    uint256 _dRTime,
    uint256 _dRWTime,
    uint256 _dTRatio,
    uint256 _dTNumber,
    uint256 _iTRatio,
    uint256 _iTNumber
  ) public {
    dRTime_ = _dRTime;
    dRWTime_ = _dRWTime;
    dTRatio_ = _dTRatio;
    dTNumber_ = _dTNumber;
    iTRatio_ = _iTRatio;
    iTNumber_ = _iTNumber;
  }

  function updateOpAddr(address _opAddr) public {
    opAddr_ = _opAddr;
  }
}

library Balloondatasets {
  using SafeMath for uint256;
  using SignedSafeMath for int256;
  struct Player {
    address addr; // player address
    bytes32 name; // player name
    uint256 laff; // last affiliate id used
    uint256 refReward; // refferal reward to withdraw
    uint256 holReward; // total holder reward to withdraw
    uint256 winReward; // total win reward to withdraw
    uint256 withdrawed; // value user withdrawed
    bytes32 refC; // player referral code
    uint256 lRID; // latest round user played
  }
  struct PlayerRounds {
    uint256 pumpB; // number of pump bought
    uint256 pumpS; // number of pump Sold
    uint256 lastB; // lastest buy time
    int256 holderDebt; // holder Debt
  }
  struct Round {
    uint256 strT; // time round started
    uint256 endT; // time round end
    uint256 maxET; // round max time end
    // bool ended; // has round end function been ran
    uint256 pumpB; // number of pump bought
    uint256 pumpS; // number of pump Sold
    uint256 opFee; // operation value
    uint256 eJackpot; // end game jackpot, will be added to prize pool at end game
    uint256 prizePool; // prize pool value
    uint256 llPID; // last lucky PID
    uint256 holReward; // reward share between holder
    uint256 accHolPerPump; // accumulated holder value per pump
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
