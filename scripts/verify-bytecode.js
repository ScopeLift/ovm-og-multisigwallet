const fs = require('fs');
const program = require('commander');
const ethers = require('ethers');

async function verifyBytecode({ network, contractName, contractAddress }) {
	const localBytecode = _getLocalBytecode({ contractName });
	const remoteBytecode = await _getRemoteBytecode({ network, contractAddress });

	console.log('Local bytecode:');
	console.log(`${localBytecode}\n`);

	console.log('Remote bytecode:');
	console.log(`${remoteBytecode}\n`);

	console.log(`Bytecodes match: ${localBytecode === remoteBytecode}`);
};

function _getLocalBytecode({ contractName }) {
	const artifacts = JSON.parse(
		fs.readFileSync(`./build/contracts/${contractName}.json`, 'utf8')
	);

	return artifacts.deployedBytecode;
}

async function _getRemoteBytecode({ network, contractAddress }) {
	const provider = _getOptimismProvider({ network });

	return provider.getCode(contractAddress);
}

function _getOptimismProvider({ network }) {
	const providerUrl = `https://${network}.optimism.io`;

	return new ethers.providers.JsonRpcProvider(providerUrl);
}

module.exports = {
	verifyBytecode,
	cmd: program =>
		program
      .command('verify-bytecode')
      .description('Compares the bytecode of a specific MultiSigWallet instance with the bytecode produced by compiling local sources.')
			.option('--contract-name <value>', 'The name of the contract to verify', 'MultiSigWallet')
			.option('--network <value>', 'The network where the tested instance is deployed', 'mainnet')
			.option('--contract-address <value>', 'The address of the instance to verify')
			.action(async (...args) => {
				try {
					await verifyBytecode(...args);
				} catch (err) {
					console.error(err);
					console.log(err.stack);
					process.exitCode = 1;
				}
			}),
};

program.parse(process.argv);
