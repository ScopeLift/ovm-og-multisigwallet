const fs = require('fs');
const program = require('commander');
const ethers = require('ethers');
const diff = require('fast-diff');
const chalk = require('chalk');

async function verifyBytecode({ network, contractName, contractAddress }) {
	const localBytecode = _getLocalBytecode({ contractName });
	const remoteBytecode = await _getRemoteBytecode({ network, contractAddress });

	console.log(localBytecode);
	console.log(remoteBytecode);

	_printTextDiff(localBytecode, remoteBytecode);

	if (localBytecode === remoteBytecode) {
		console.log(chalk.green('Bytecodes match ✅'));
	} else {
		console.log(chalk.red('Bytecodes do not match!'));
	}
};

function _printTextDiff(textA, textB) {
	const difference = diff(textA, textB);

	let str = '';
	difference.map(([type, text]) => {
		let chalkFn = chalk.gray;
		if (type === -1) chalkFn = chalk.red;
		if (type === 1) chalkFn = chalk.green;

		str += chalkFn(text);
	});

	console.log(`${str}\n`);
}

function _getLocalBytecode({ contractName }) {
	const artifacts = JSON.parse(
		fs.readFileSync(`./build/contracts/ovm/${contractName}.json`, 'utf8')
	);

	return artifacts.deployedBytecode;
}

async function _getRemoteBytecode({ network, contractAddress }) {
	const provider = _getOptimismProvider({ network });

	const code = await provider.getCode(contractAddress);

	return code
		.split(
			'336000905af158600e01573d6000803e3d6000fd5b3d6001141558600a015760016000f35b'
		)
		.join(
			'336000905af158601d01573d60011458600c01573d6000803e3d621234565260ea61109c52'
		);
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
