import { Contract } from '@ethersproject/contracts';
import { formatEther } from '@ethersproject/units';
import { JsonRpcProvider } from '@ethersproject/providers';
import { parseBytes32String } from '@ethersproject/strings';

import admin, { firestore } from '../configs/firebase.config.js';
import Game from '../assets/abis/Game.json' assert { type: 'json' };
import logger from '../utils/logger.js';
import environments from '../utils/environments.js';
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

  const provider = new JsonRpcProvider('https://blast-sepolia.blockpi.network/v1/rpc/public');
  const contract = new Contract(GAME_ADDRESS, Game.abi, provider);
  console.log({ provider });

  contract.on(Events.Register, async (uId, address, _username, _referralCode, event) => {
    try {
      const username = parseBytes32String(_username);
      const referralCode = parseBytes32String(_referralCode);
      logger.info(`${JSON.stringify({ event: Events.Register, address, username, referralCode })}`);

      await firestore.collection('user').doc(address.toLowerCase()).update({ username, referralCode });
    } catch (err) {
      logger.error(err);
    }
  });

  contract.on(Events.BuyPump, async () => {
    console.log('buy pump');
  });

  contract.on(Events.SellPump, async (address, uId, rId, amount, event) => {
    try {
      const userId = Number(uId.toString());
      const roundId = Number(rId.toString());
      logger.info(`${JSON.stringify({ event: Events.SellPump, address, userId, roundId })}`);

      const round = await contract.round_(roundId);

      const prizePool = Number(formatEther(round.prizePool.toString()));
      const pumpSold = Number(round.pumpS.toString());

      const userGamePlay = await contract.plyrRnds_(userId, roundId);
      const userGamePlayNumberOfPumps = Number(userGamePlay.pumpB.toString()) - Number(userGamePlay.pumpS.toString());
      const userGamePlayLastPurchaseUnixTime = Number(userGamePlay.lastB.toString());

      // update season
      await firestore.collection('season').doc(`${roundId}`).update({
        prizePool,
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
  });

  contract.on(Events.Withdraw, () => {
    console.log('withdraw');
  });
};

listener();
