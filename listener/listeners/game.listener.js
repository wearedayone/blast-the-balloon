import { Contract } from '@ethersproject/contracts';
import { formatEther, parseEther } from '@ethersproject/units';
import { JsonRpcProvider } from '@ethersproject/providers';
import { parseBytes32String } from '@ethersproject/strings';

import admin, { firestore } from '../configs/firebase.config.js';
import Game from '../assets/abis/Game.json' assert { type: 'json' };
import logger from '../utils/logger.js';
import environments from '../utils/environments.js';
import gameConfigs from '../configs/game.config.js';
import { getActiveSeasonId } from '../services/season.service.js';

const { GAME_ADDRESS } = environments;

const Events = {
  Register: 'Register',
  BuyPump: 'BuyPump',
  SellPump: 'SellPump',
  Withdraw: 'Withdraw',
  RoundStart: 'RoundStart',
};

const listener = async () => {
  console.log('Listener is running...');

  const provider = new JsonRpcProvider('https://sepolia.blast.io');
  const contract = new Contract(GAME_ADDRESS, Game.abi, provider);

  contract.on(Events.Register, async (pId, address, _username, _referralCode, _inviteId, _inviteName, _inviteCode) => {
    try {
      console.log({ pId, address, _username, _referralCode, _inviteId, _inviteName, _inviteCode });
      const username = _username ? parseBytes32String(_username) : '';
      const referralCode = parseBytes32String(_referralCode);
      const inviteCode = parseBytes32String(_inviteCode);
      logger.info(`${JSON.stringify({ event: Events.Register, address, username, referralCode, inviteCode })}`);
      const userDoc = await firestore.collection('user').doc(address.toLowerCase()).get();
      if (userDoc.exists) {
        await firestore.collection('user').doc(address.toLowerCase()).update({ username, referralCode, inviteCode });
      } else await firestore.collection('user').doc(address.toLowerCase()).set({ username, referralCode, inviteCode });
      if (inviteCode) {
        const inviterSnapshot = await firestore
          .collection('user')
          .where('referralCode', '==', inviteCode)
          .limit(1)
          .get();
        if (!inviterSnapshot.empty) {
          await firestore.collection('userReferralProfit').add({
            userId: inviterSnapshot.docs[0].id,
            referralId: address.toLowerCase(),
            profit: 0,
          });
        }
      }
    } catch (err) {
      logger.error(err);
    }
  });

  contract.on(
    Events.BuyPump,
    async (_pID, _addr, _name, _refC, _affID, _affName, _affCode, _amount, _bTime, _rID, decreasing, time) => {
      console.log({ _pID, _addr, _name, _refC, _affID, _affName, _affCode, _amount, _bTime, _rID, decreasing, time });
      const roundId = Number(_rID.toString());
      const userId = Number(_pID.toString());
      const buyTime = Number(_bTime.toString());
      const inviteCode = parseBytes32String(_affCode);

      // update season
      const round = await contract.round_(roundId);
      console.log('BuyPump', { round });
      const startTimeUnix = Number(round.strT.toString());
      const endTimeUnix = Number(round.endT.toString());
      const maxEndTimeUnix = Number(round.maxET.toString());

      const prizePool = formatEther(round.prizePool);
      const eJackpot = formatEther(round.eJackpot);
      const pumpB = Number(round.pumpB.toString());
      const pumpS = Number(round.pumpS.toString());

      const dRWTime_ = await contract.dRWTime_();

      const seasonDoc = await firestore.collection('season').doc(`${roundId}`).get();
      if (seasonDoc.exists) {
        await firestore
          .collection('season')
          .doc(`${roundId}`)
          .update({
            pumpBought: pumpB,
            estimatedEndTime: admin.firestore.Timestamp.fromMillis(endTimeUnix * 1000),
            prizePool,
            eJackpot,
          });
      } else {
        await firestore
          .collection('season')
          .doc(`${roundId}`)
          .set({
            pumpBought: pumpB,
            estimatedEndTime: admin.firestore.Timestamp.fromMillis(endTimeUnix * 1000),
            prizePool,
            eJackpot,
            startTime: admin.firestore.Timestamp.fromMillis(startTimeUnix * 1000),
            estimatedEndTime: admin.firestore.Timestamp.fromMillis(endTimeUnix * 1000),
            maxEndTime: admin.firestore.Timestamp.fromMillis(maxEndTimeUnix * 1000),
            pauseBetweenSeason: dRWTime_.toNumber(),
            endGameJackpot: eJackpot,
            pumpBought: pumpB,
            pumpSold: pumpS,
            buyConfig: gameConfigs.buyConfig,
            gameEndConfig: gameConfigs.gameEndConfig,
            pumpPrice: gameConfigs.pumpPrice,
          });
      }

      // update user game play
      const userGamePlay = await contract.plyrRnds_(userId, roundId);
      const userGamePlayNumberOfPumps = Number(userGamePlay.pumpB.toString()) - Number(userGamePlay.pumpS.toString());
      console.log({ _addr, userGamePlayNumberOfPumps });
      const gamePlaySnapshot = await firestore
        .collection('gamePlay')
        .where('userId', '==', _addr.toLowerCase())
        .where('seasonId', '==', `${roundId}`)
        .limit(1)
        .get();

      if (!gamePlaySnapshot.empty) {
        await gamePlaySnapshot.docs[0].ref.update({
          numberOfPump: userGamePlayNumberOfPumps,
          lastPurchaseTime: admin.firestore.Timestamp.fromMillis(buyTime * 1000),
        });
      } else {
        await firestore.collection('gamePlay').add({
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          userId: _addr.toLowerCase(),
          seasonId: `${roundId}`,
          numberOfPump: userGamePlayNumberOfPumps,
          lastPurchaseTime: admin.firestore.Timestamp.fromMillis(buyTime * 1000),
        });
      }

      // update inviter referralReward
      if (inviteCode) {
        const inviteSnapshot = await firestore
          .collection('user')
          .where('referralCode', '==', inviteCode)
          .limit(1)
          .get();
        if (!inviteSnapshot.empty) {
          const referralReward = await contract.getUserReferralReward(_affID);
          await inviteSnapshot.docs[0].ref.update({ referralReward: Number(referralReward.toString()) });
        }
      }
      // const userReferralProfitSnapshot()

      // await firestore.collection('userReferralProfit').add({
      //   userId: inviterSnapshot.docs[0].id,
      //   referralId: address.toLowerCase(),
      //   profit: 0,
      // });

      // update all user holderReward
      const updateUserHolderReward = async (address) => {
        const userId = Number((await contract.pIDxAddr_(address)).toString());
        const holderReward = await contract.getUserHolderReward(userId);
        await firestore
          .collection('user')
          .doc(address)
          .update({
            holderReward: formatEther(holderReward),
          });
      };

      const userSnapshot = await firestore.collection('user').get();
      const promises = userSnapshot.docs.map((doc) => updateUserHolderReward(doc.id));
      await Promise.all(promises);
    }
  );

  contract.on(Events.SellPump, async (address, uId, rId, amount, event) => {
    try {
      const userId = Number(uId.toString());
      const roundId = Number(rId.toString());
      logger.info(`${JSON.stringify({ event: Events.SellPump, address, userId, roundId })}`);

      const round = await contract.round_(roundId);

      const prizePool = formatEther(round.prizePool);
      const eJackpot = formatEther(round.eJackpot);
      const pumpSold = Number(round.pumpS.toString());

      const userGamePlay = await contract.plyrRnds_(userId, roundId);
      const userGamePlayNumberOfPumps = Number(userGamePlay.pumpB.toString()) - Number(userGamePlay.pumpS.toString());
      const userGamePlayLastPurchaseUnixTime = Number(userGamePlay.lastB.toString());

      // update season
      await firestore.collection('season').doc(`${roundId}`).update({
        prizePool,
        eJackpot,
        pumpSold,
      });

      // update user game play
      const gamePlaySnapshot = await firestore
        .collection('gamePlay')
        .where('userId', '==', address.toLowerCase())
        .where('seasonId', '==', `${roundId}`)
        .limit(1)
        .get();

      if (!gamePlaySnapshot.empty) {
        await gamePlaySnapshot.docs[0].ref.update({
          numberOfPump: userGamePlayNumberOfPumps,
          lastPurchaseTime: admin.firestore.Timestamp.fromMillis(userGamePlayLastPurchaseUnixTime * 1000),
        });
      }
    } catch (err) {
      logger.error(err);
    }
  });

  contract.on(Events.RoundStart, async (rId) => {
    const roundId = Number(rId.toString());

    const round = await contract.round_(roundId);
    console.log('RoundStart', { round });
    const startTimeUnix = Number(round.strT.toString());
    const endTimeUnix = Number(round.endT.toString());
    const maxEndTimeUnix = Number(round.maxET.toString());

    const eJackpot = formatEther(round.eJackpot);
    const prizePool = formatEther(round.prizePool);
    const pumpB = Number(round.pumpB.toString());
    const pumpS = Number(round.pumpS.toString());

    await firestore
      .collection('season')
      .doc(`${roundId}`)
      .set({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        startTime: admin.firestore.Timestamp.fromMillis(startTimeUnix * 1000),
        estimatedEndTime: admin.firestore.Timestamp.fromMillis(endTimeUnix * 1000),
        maxEndTime: admin.firestore.Timestamp.fromMillis(maxEndTimeUnix * 1000),
        pauseBetweenSeason: gameConfigs.pauseBetweenSeason,
        prizePool,
        endGameJackpot: eJackpot,
        pumpBought: pumpB,
        pumpSold: pumpS,
        buyConfig: gameConfigs.buyConfig,
        gameEndConfig: gameConfigs.gameEndConfig,
        pumpPrice: gameConfigs.pumpPrice,
      });

    const userSnapshot = await firestore.collection('user').get();

    const promises = userSnapshot.docs.map((doc) =>
      firestore.collection('gamePlay').add({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        userId: doc.id,
        seasonId: `${roundId}`,
        numberOfPump: 0,
        lastPurchaseTime: admin.firestore.Timestamp.fromMillis(0),
      })
    );
    // await Promise.all(promises);

    await firestore
      .collection('system')
      .doc('config')
      .update({ activeSeasonId: `${roundId}` });
  });

  // contract.on(Events.Withdraw, async (address, event) => {
  //   try {
  //     await firestore.collection('user').doc(address.toLowerCase()).update({
  //       holderReward: 0,
  //       referralReward: 0,
  //     });
  //   } catch (err) {
  //     logger.error(err);
  //   }
  // });
};

export const queryEvent = async () => {
  console.log({ GAME_ADDRESS });
  const provider = new JsonRpcProvider('https://sepolia.blast.io');
  // const provider = new JsonRpcProvider('https://blast-sepolia.blockpi.network/v1/rpc/public');
  const contract = new Contract(GAME_ADDRESS, Game.abi, provider);

  const RegisterEvents = await contract.queryFilter(Events.Register, 2441353);
  for (const event of RegisterEvents) {
    const [pId, address, _username, _referralCode, _inviteId, _inviteName, _inviteCode] = event.args;
    console.log({ pId, address, _username, _referralCode, _inviteId, _inviteName, _inviteCode });
    const username = _username ? parseBytes32String(_username) : '';
    const referralCode = parseBytes32String(_referralCode);
    const inviteCode = parseBytes32String(_inviteCode);
    logger.info(
      `${JSON.stringify({
        event: Events.Register,
        address,
        username,
        referralCode,
        inviteCode,
      })}`
    );

    await firestore.collection('user').doc(address.toLowerCase()).set({ username, referralCode, inviteCode });
    if (inviteCode) {
      const inviterSnapshot = await firestore.collection('user').where('referralCode', '==', inviteCode).limit(1).get();
      if (!inviterSnapshot.empty) {
        await firestore.collection('userReferralProfit').add({
          userId: inviterSnapshot.docs[0].id,
          referralId: address.toLowerCase(),
          profit: 0,
        });
      }
    }
    // await processTransferEvent({ from, to, value, event, contract });
  }
};

export default listener;
