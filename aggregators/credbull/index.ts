import { FetchOptions, FetchResultV2, SimpleAdapter } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";

const CBL_TGE = 1730973600; // 2024-11-07 10:00 UTC
const CBL_TOKEN = "0xD6b3d81868770083307840F513A3491960b95cb6";
const CBL_TRANSFER_EVENT_ABI = "event Transfer(address indexed from, address indexed to, uint256 value)";

const STAKING_VAULT_CREATION_TX = 1730136862; // 2024-10-28 17:34:22 UTC
const STAKING_VAULT_CONTRACT = "0xe4a4d891f02DF7bFFc5ff9e691313DE8a9E76b91";
const DEPOSIT_EVENT_ABI = "event Deposit(address indexed sender,address indexed owner,uint256 assets,uint256 shares)";
const WITHDRAW_EVENT_ABI =
  "event Withdraw(address indexed sender,address indexed receiver,address indexed owner,uint256 assets,uint256 shares)";

async function fetch(options: FetchOptions): Promise<FetchResultV2> {
  const dailyVolume = options.createBalances();
  const depositLogs = await options.getLogs({
    target: STAKING_VAULT_CONTRACT,
    eventAbi: DEPOSIT_EVENT_ABI,
  });
  const withdrawLogs = await options.getLogs({
    target: STAKING_VAULT_CONTRACT,
    eventAbi: WITHDRAW_EVENT_ABI,
  });
  depositLogs.map((e: any) => {
    console.log("fetch(): Deposit=", e);
    dailyVolume.addToken(CBL_TOKEN, e.assets);
    dailyVolume.addToken(STAKING_VAULT_CONTRACT, e.shares);
  });
  withdrawLogs.map((e: any) => {
    console.log("fetch(): Withdraw=", e);
    dailyVolume.addToken(CBL_TOKEN, e.assets);
    dailyVolume.addToken(STAKING_VAULT_CONTRACT, e.shares);
  });
  return { dailyVolume };
}

const adapter: SimpleAdapter = {
  version: 2,
  adapter: {
    [CHAIN.ARBITRUM]: {
      fetch: fetch,
      start: STAKING_VAULT_CREATION_TX,
    },
  },
};

export default adapter;
