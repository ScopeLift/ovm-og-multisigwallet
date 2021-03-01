/* eslint-disable no-console */
const MultisigWalletFactory = artifacts.require('MultiSigWalletFactory');

module.exports = async function(exit) {
    const [ deployer ] = await web3.eth.getAccounts();

    console.log('Deploying MultiSigWalletFactory');
    const factory = await MultisigWalletFactory.new({from: deployer});
    console.log('MultiSigWalletFactory deployed at:', factory.address);

    console.log('Instantiating first MultiSigWallet');
    const receipt = await factory.create([deployer], 1, {from: deployer});
    console.log('MultiSigWallet instantiated at:', receipt.logs[0].args.instantiation);

    exit();
}
