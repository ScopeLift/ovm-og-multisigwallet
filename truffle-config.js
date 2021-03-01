const testMnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";
const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config()

const mnemonic = process.env.MNEMONIC;
const infuraId = process.env.INFURA_ID;

module.exports = {
  networks: {
    kovan: {
      network_id: 42,
      provider: function() {
        const endpoint = 'https://kovan.infura.io/v3/' + infuraId;
        return new HDWalletProvider(mnemonic, endpoint);
      }
    }
  },
  compilers: {
    solc: {
      version: "0.5.16",
    },
  },
};
