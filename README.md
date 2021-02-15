Optimistic Ethereum Multisignature Wallet
===================

The original Gnosis multisig wallet, updated to work on [Optimistic Ethereum](https://optimism.io/). The repository for the EVM-only version of this project can be [found here](https://github.com/gnosis/MultiSigWallet).

🚨🚧 **WARNING: This project is a work in progress. It is not yet working on the OVM.** 🚧🚨

The purpose of multisig wallets is to increase security by requiring multiple parties to agree on transactions before execution. Transactions can be executed only when confirmed by a predefined number of owners. A web user interface can be found [here](/dapp).


Install
-------------

**NOTE**: We recommend installing [volta](https://volta.sh/) for managing versions of node and npm. This project is tested
with node `v14.15.5`, and will automatically use said version if your system has volta installed.

```bash
git clone https://github.com/ScopeLift/ovm-og-multisigwallet.git
cd ovm-og-multisigwallet

# Install contract dev dependencies
npm install

# Run contract tests
npm test

# Install frontend dev dependencies
cd dapp
npm install

# Run frontend tests
npm test
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
