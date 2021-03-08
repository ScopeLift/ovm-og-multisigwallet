const ethers = require('ethers');
require('dotenv').config()
const { abi, bytecode } = require('../build/contracts/ovm/MultiSigWalletFactory.json')
const { MNEMONIC } = process.env
const provider = new ethers.providers.JsonRpcProvider('https://kovan.optimism.io')
const wallet = ethers.Wallet.fromMnemonic(MNEMONIC).connect(provider)
const multisigFactory = new ethers.Contract('0x55422562984070fAeB1597342C0b684B77f5AE70', abi, wallet)
const multisigContract = new ethers.Contract('0x7b671dBae4e4Ad733Cd116aeAE378302cEAB7A06', require('../build/contracts/ovm/MultiSigWallet.json').abi, wallet)

const main = async () => {
    // const tx = await multisigFactory.create([wallet.address], 1)
    // const receipt = await tx.wait()
    // console.log(tx.hash)
    // const log = multisigFactory.interface.parseLog(
    //     receipt.logs.find(({ topics }) =>
    //       topics.includes(multisigFactory.interface.getEventTopic('ContractInstantiation'))))
    // console.log(log)
    const addOwner = await multisigContract.addOwner('0x65e3594Dfe748cd9f7Af8aF9F52b30D6f09A91E1')
    const receipt = await addOwner.wait();
    console.log(receipt)
    console.log('wallet address ', wallet.address);
    const owners = await multisigContract.getOwners();
    console.log('owners ', owners)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
