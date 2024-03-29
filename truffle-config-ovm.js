const testMnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";
const { ganache } = require('@eth-optimism/plugins/ganache');

const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config()

const mnemonic = process.env.MNEMONIC;

module.exports = {
  contracts_build_directory: './build/contracts/ovm',

  networks: {
    test: {
      network_id: 420,
      provider: ganache.provider({
        mnemonic: testMnemonic,
        network_id: 420,
      }),
    },
  },
  compilers: {
    solc: {
      // Add path to the optimism solc fork
      version: "node_modules/@eth-optimism/solc",
      settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 1
        },
      }
    }
  }
}
