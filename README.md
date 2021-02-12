Optimistic Ethereum Multisignature Wallet
===================

The original Gnosis multisig wallet, updated to work on [Optimistic Ethereum](https://optimism.io/). The repository for the EVM-only version of this project can be [found here](https://github.com/gnosis/MultiSigWallet).

🚨🚧 **WARNING: This project is a work in progress. It is not yet working on the OVM.** 🚧🚨

The purpose of multisig wallets is to increase security by requiring multiple parties to agree on transactions before execution. Transactions can be executed only when confirmed by a predefined number of owners. A web user interface can be found [here](/dapp).


Install
-------------
**NOTE:** Not compatible with current NodeJS LTS. Recommended NodeJS version is v6.17.1 (last LTS for v6).

```
# For Ubuntu/Debian you need to install libusb development headers
apt install -y libusb-1.0-0-dev

git clone https://github.com/gnosis/MultiSigWallet.git
cd MultiSigWallet

# Latest NodeJS (v12.13.0) does NOT appear to work correctly.
# You should use NVM and install Node v6.17.1 for best results: https://github.com/nvm-sh/nvm
# Tested by @Privex on 2019-Nov-06 with v6.17.1 with success
nvm install v6.17.1

# node-gyp is required for 'npm install' to work correctly
npm install node-gyp

npm install
```

Test
-------------
### Run contract tests:
```
npm test
```
### Run interface tests:
```
npm run test-dapp
```

Deploy Contracts
-------------
### Deploy multisig wallet:
```
truffle migrate <account1,account2,...,accountN> <requiredConfirmations>
```
### Deploy multisig wallet with daily limit:
```
truffle migrate <account1,account2,...,accountN> <requiredConfirmations> <dailyLimit>
```


Limitations
-------------
This implementation does not allow the creation of smart contracts via multisignature transactions.
Transactions to address 0 cannot be done. Any other transaction can be done.

Security
-------------
All contracts are WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

License
-------------
[LGPL v3](./LICENSE)
