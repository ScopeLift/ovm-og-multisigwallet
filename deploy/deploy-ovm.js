/* eslint-disable no-console */
require('dotenv').config()
const ethers = require('ethers');
const { abi, bytecode } = require('../build/contracts/ovm/MultiSigWalletFactory.json');
const { MNEMONIC } = process.env;

const printUsageAndExit = () => {
  console.log('\nUsage: npm run deploy:ovm [-- --network=<network>]\n');
  console.log('where <network> is one of:');
  console.log('\tlocal (default), kovan, goerli, mainnet\n');
  console.log('Example:');
  console.log('\tnpm run deploy:ovm -- --network=kovan\n');
  process.exit();
}

const parseNetworkFlag = (arg) => {
  const split = arg.split('=');

  if (split.length !== 2) {
    printUsageAndExit();
  }

  if (split[0] !== '--network') {
    printUsageAndExit();
  }

  const validNetworks = ['local', 'kovan', 'goerli', 'mainnet'];
  const networkName = split[1];
  const isValidNetwork = validNetworks.includes(networkName);

  if (!isValidNetwork) {
    console.log(`Unsupported Network: ${networkName}`);
    printUsageAndExit();
  }

  return networkName;
}

const getNetworkArg = (args) => {
  let network;

  if (args.length === 2) {
    network = 'local';
  } else if (args.length === 3) {
    network = parseNetworkFlag(args[2])
  } else {
    printUsageAndExit();
  }

  return network;
}

const endpointForNetwork = (network) => {
  switch (network) {
    case 'local':
      return 'http://localhost:8545';
    default:
      return `https://${network}.optimism.io`;
  }
}

const main = async () => {
  if (!MNEMONIC) {
    console.log('Please define MNEMONIC in your .env file for deployment wallet');
    process.exit();
  }

  const network = getNetworkArg(process.argv);
  console.log(`Using Optimistic network ${network}`);

  const provider = new ethers.providers.JsonRpcProvider(endpointForNetwork(network));
  const wallet = ethers.Wallet.fromMnemonic(MNEMONIC).connect(provider);
  const multisigFactory = new ethers.ContractFactory( abi, bytecode, wallet );

  console.log('Deploying MultiSigWalletFactory');
  const deployment = await multisigFactory.deploy();
  await deployment.deployed();
  console.log('MultiSigWalletFactory deployed at:', deployment.address);

  const tx = await deployment.create([wallet.address], 1);
  const receipt = await tx.wait();

  console.log('Instantiating first MultiSigWallet');
  const log = deployment.interface.parseLog(
    receipt.logs.find(({ topics }) =>
      topics.includes(deployment.interface.getEventTopic('ContractInstantiation'))
    )
  );
  console.log('MultiSigWallet instantiated at:', log.args.instantiation);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
