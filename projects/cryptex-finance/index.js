const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { sumTokensSharedOwners} = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const ctxToken = "0x321c2fe4446c7c963dc41dd58879af648838f98d";
const factory = "0x70236b36f86AB4bd557Fe9934E1246537B472918";

const ethStakingContracts = [
  "0xc8BB1cd417D20116387a5e0603e195cA4f3Cf59A", //TCAP-WETH
  "0xdC4cDd5dB9EE777EFD891690dc283638CB3A5f94" //CTX-WETH
];

const ethPool2s = [
  "0xa87E2c5D5964955242989B954474ff2EB08Dd2f5", // TACP-WETH
  "0x2A93167Ed63A31F35CA4788e2EB9fBd9fA6089D0", // CTX-WETH
]
const ethVaults = [
   "0x717170b66654292dfbd89c39f5ae6753d2ac1381", // WETH VAULT
   "0x443366a7a5821619D8d57405511E4fadD9964771", // DAI VAULT
   // Hardmode Vaults
   "0xc2Ba6B8E0EE3cf48B045D966F1dCda767df74833", // WETH VAULT
   "0xA5b3Bb6e1f206624B3B8CE0c6A0f7614fd35Fa03", // DAI VAULT
   "0xa8CcA36A624215a39D5af6854ac24868559424d3", // USDC VAULT
   "0x2364536F4891Ed560A6728f4B36871de8176eE5c", // WBTC VAULT
]

const ethCollaterals = [
  ADDRESSES.ethereum.WETH, // WETH
  ADDRESSES.ethereum.DAI, // DAI
  ADDRESSES.ethereum.USDC, // USDC
  ADDRESSES.ethereum.WBTC, // WBTC
]

const optVaults = [
  "0xE0c99C503c4AE5eC50aC63C59C7eF4725C355fdD", // WETH VAULT
  "0x2C890633Db29f21fccbA57c68DcCEF09AB0D4763", // DAI VAULT
  "0x61925C38e28F60e688f7d05E65f63792166a5aFE", // LINK VAULT
  "0xc8BB1cd417D20116387a5e0603e195cA4f3Cf59A", // SNX VAULT
  "0x66ae98E432329E42B7988CFDCB6f524b1999CB4a" // UNI VAULT
]

const optCollaterals = [
  ADDRESSES.tombchain.FTM, // WETH
  ADDRESSES.optimism.DAI, // DAI
  "0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6", // LINK
  "0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4", // SNX
  "0x6fd9d7AD17242c41f7131d257212c54A0e816691" // UNI
]

async function ethTvl(timestamp, block) {
  let balances = {};
  await sumTokensSharedOwners(balances, ethCollaterals, ethVaults, block);
  return balances;
}

async function optTvl(timestamp, block, chainBlocks) {
  let balances = {};
  await sumTokensSharedOwners(balances, optCollaterals, optVaults, chainBlocks.optimism, "optimism");
  return balances;
}

const treasuryAddress = "0xa54074b2cc0e96a43048d4a68472F7F046aC0DA8";
const treasuryContents = [
  ADDRESSES.ethereum.USDC
]
const optTreasury = "0x271901c3268D0959bbc9543DE4f073D3708C88F7";

async function treasury(timestamp, block) {
  let balances = {};
  const ethBal = (await sdk.api.eth.getBalance({
    target: treasuryAddress,
    block,
  })).output;
  sdk.util.sumSingleBalance(balances, ADDRESSES.ethereum.WETH, ethBal);
  await sumTokensSharedOwners(balances, treasuryContents, [treasuryAddress], block);
  return balances;
}


module.exports = {
  methodology: "TVL includes collateral in vaults",
  ethereum: {
    tvl: ethTvl,
    pool2: staking(ethStakingContracts, ethPool2s),
    staking: staking(factory, ctxToken),
    treasury
  },
  optimism: {
    tvl: optTvl
  }
};
