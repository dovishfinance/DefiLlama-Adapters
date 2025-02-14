const ADDRESSES = require('../helper/coreAssets.json')
const { graphFetchById } = require('../helper/http')

async function tvl(timestamp, ethBlock, { arbitrum: block }, { api }) {
  const tokens = await api.call({ target: "0x17b07cfbab33c0024040e7c299f8048f4a49679b", abi: "address[]:getAllLTokens", })
  const assets = await api.multiCall({ calls: tokens, abi: "address:asset", })
  const totalAssets = await api.multiCall({ calls: tokens, abi: "uint256:totalAssets", })
  api.addTokens(assets, totalAssets)

  // const userAccounts = await api.call({ target: "0x17b07cfbab33c0024040e7c299f8048f4a49679b", abi: "address[]:getAllAccounts", })
  const data = await graphFetchById({ endpoint: 'https://api.thegraph.com/subgraphs/name/r0ohafza/sentiment', query, api, options: { useBlock: true, }})
  const userAccounts = data.map(i => i.id)
  const [equity, borrows] = await Promise.all([
    api.multiCall({ target: "0xc0ac97A0eA320Aa1E32e9DEd16fb580Ef3C078Da", calls: userAccounts, abi: "function getBalance(address account) view returns (uint256)", }),
    api.multiCall({ target: "0xc0ac97A0eA320Aa1E32e9DEd16fb580Ef3C078Da", calls: userAccounts, abi: "function getBorrows(address account) view returns (uint256)", }),
  ])
  for (let i = 0; i < equity.length; i++)
    api.add(ADDRESSES.arbitrum.WETH, equity[i] - borrows[i], {})
}

module.exports = {
  misrepresentedTokens: true,
  arbitrum: { tvl, },
  hallmarks: [
    [Math.floor(new Date('2023-04-04')/1e3), '1M hack'],
  ],
};

const query = `query get_accounts($lastId: String!, $block: Int!) {
  accounts(
    first: 1000
    block: {number: $block}
    where: {and: [{id_gt: $lastId}, {or: [{balance_gt: 0}, {debt_gt: 0}]}]}
  ) {
    id
    balance
    debt
  }
}`