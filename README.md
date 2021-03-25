Optimistic Ethereum Multisignature Wallet
===================

The original Gnosis multisig wallet, updated to work on [Optimistic Ethereum](https://optimism.io/). The repository for the EVM-only version of this project can be [found here](https://github.com/gnosis/MultiSigWallet).

The purpose of multisig wallets is to increase security by requiring multiple parties to agree on transactions before execution. Transactions can be executed only when confirmed by a predefined number of owners. A web user interface can be found [here](/app).

Use
--------

The frontend is available for use with Optimistic Ethereum at [https://ogg.scopelift.co](https://ogg.scopelift.co). It can be used with Optimistic Mainnet or Optimistic Kovan testnet.


The `MultiSigWalletFactory` contract is deployed at the following addresses:

Network | Factory Address
------- | ---------------
Optimistic Mainnet | [0xA5e6EFdA500FD0BCEd87B2cd8Af1c81c0cc9D556](https://mainnet-l2-explorer.surge.sh/account/0xa5e6efda500fd0bced87b2cd8af1c81c0cc9d556)
Optimistic Kovan | [0x676Fcee7AF0dD0060b238d00d43A5542f3aA3B3e](https://kovan-l2-explorer.surge.sh/account/0x676fcee7af0dd0060b238d00d43a5542f3aa3b3e)

Install
-------------

**NOTE**: We recommend installing [volta](https://volta.sh/) for managing versions of node, npm, and yarn.

The contracts development environment has been tested with node `v10.23.3`. The frontend in `app/` is
tested with node `v14.16.0` and yarn `v1.22.10`.  Both projects will automatically use the
appropriate versions if your system has volta installed.

```bash
git clone https://github.com/ScopeLift/ovm-og-multisigwallet.git
cd ovm-og-multisigwallet

# Install contract dev dependencies
npm install

# Run contract tests for the EVM
npm test

# Run contract tests for the OVM
npm run test:ovm

# Install frontend dev dependencies
cd app
yarn

# Run frontend in dev mode
yarn dev

# Build static frontend in out/
yarn export
```

Deploy Contracts
-------------
The deployment script will deploy MultiSigWalletFactory, then instantiate the first MultiSigWallet with the deployer as the single owner

#### Create .env file

```bash
cp .env.example .env
# Edit your .env file and populate with valid values
```

#### Deploy to local development EVM

```bash
npm run deploy
```

#### Deploy to other EVM network in `truffle-config.js`

```bash
npm run deploy -- --network=kovan
```

#### Deploy to local development OVM

```bash
npm run deploy:ovm
```

To run a local OVM network, see the [Optimism integration repo](https://github.com/ethereum-optimism/optimism-integration#scripts)

#### Deploy to other OVM network

```bash
npm run deploy:ovm -- --network=kovan
```

Note the valid networks are `local`, `kovan`, and `mainnet`, and are **NOT** defined by the contents of `truffle-config-ovm.js`.
See `deploy/deploy-ovm.js` for more information.

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
