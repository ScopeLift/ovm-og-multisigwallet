const MultiSigWallet = artifacts.require('MultiSigWallet')
const web3 = MultiSigWallet.web3
const TestToken = artifacts.require('TestToken')
const TestCalls = artifacts.require('TestCalls')

const deployMultisig = (owners, confirmations) => {
    return MultiSigWallet.new(owners, confirmations)
}
const deployToken = () => {
	return TestToken.new()
}
const deployCalls = () => {
	return TestCalls.new()
}

const utils = require('./utils')

contract('MultiSigWallet', (accounts) => {
    let multisigInstance
    let tokenInstance
    let callsInstance
    const requiredConfirmations = 2

    beforeEach(async () => {
        multisigInstance = await deployMultisig([accounts[0], accounts[1]], requiredConfirmations)
        assert.ok(multisigInstance)
        tokenInstance = await deployToken()
        assert.ok(tokenInstance)
        callsInstance = await deployCalls()
        assert.ok(callsInstance)

        const deposit = 10000000

        // Send money to wallet contract
        // await new Promise((resolve, reject) => web3.eth.sendTransaction({to: multisigInstance.address, value: deposit, from: accounts[0]}, e => (e ? reject(e) : resolve())))
        // const balance = await utils.balanceOf(web3, multisigInstance.address)
        // assert.equal(balance.valueOf(), deposit)
    })

    it('transferWithPayloadSizeCheck', async () => {
        // Issue tokens to the multisig address
        const issueResult = await tokenInstance.issueTokens(multisigInstance.address, 1000000, {from: accounts[0]})
        assert.ok(issueResult)
        // Encode transfer call for the multisig
        const transferEncoded = tokenInstance.contract.methods.transfer(accounts[1], 1000000).encodeABI();

        const submission = await multisigInstance.submitTransaction(tokenInstance.address, 0, transferEncoded, {from: accounts[0]})
        //console.log("SUBMISSION", submission);

        for (let index = 0; index < submission.logs.length; index++) {
            const log = submission.logs[index];
            console.log('SUB EVENT', log.event);
            console.log(log.args);
        }

        const transactionId = utils.getParamFromTxEvent(
            submission,
            'transactionId', null, 'Submission')

        const confirmation = await multisigInstance.confirmTransaction(transactionId, {from: accounts[1]});
        console.log('CONFIRMATION', confirmation);

        for (let index = 0; index < confirmation.logs.length; index++) {
            const log = confirmation.logs[index];
            console.log('CON EVENT', log.event);
            console.log(log.args);
        }

        const executedTransactionId = utils.getParamFromTxEvent(
            confirmation,
            'transactionId', null, 'Execution')
        // Check that transaction has been executed
        assert.ok(transactionId.eq(executedTransactionId))
        // Check that the transfer has actually occured
        assert.equal(
            1000000,
            await tokenInstance.balanceOf(accounts[1])
        )
    })

    it('transferFailure', async () => {
        // Encode transfer call for the multisig
        const transferEncoded = tokenInstance.contract.methods.transfer(accounts[1], 1000000).encodeABI();
        const transactionId = utils.getParamFromTxEvent(
            await multisigInstance.submitTransaction(tokenInstance.address, 0, transferEncoded, {from: accounts[0]}),
            'transactionId', null, 'Submission')
        // Transfer without issuance - expected to fail
        const failedTransactionId = utils.getParamFromTxEvent(
            await multisigInstance.confirmTransaction(transactionId, {from: accounts[1]}),
            'transactionId', null, 'ExecutionFailure')
        // Check that transaction has been executed
        assert.ok(transactionId.eq(failedTransactionId))
    })

    // The test below can only work if the Multisig wallet allows non-zero destinations (that enables creation of contracts)
    // This is mainly to test the gas dynamics between the multisig and the callee contract
    /*
    it('createTestCalls', async () => {
        const transactionId = utils.getParamFromTxEvent(
            await multisigInstance.submitTransaction("0x0000000000000000000000000000000000000000", 0, TestCalls.binary, {from: accounts[0]}),
            'transactionId', null, 'Submission')
        execResult = await multisigInstance.confirmTransaction(transactionId, {from: accounts[1]})
        // Could not find a way to extract the receipt from the nested transaction to obtain the created contract address
        const executedTransactionId = utils.getParamFromTxEvent(execResult, 'transactionId', null, 'Execution')
        // Check that transaction has been executed
        assert.ok(transactionId.equals(executedTransactionId))
    })
    */

    it('callReceive1uint', async() => {
         // Encode call for the multisig
        const receive1uintEncoded = callsInstance.contract.methods.receive1uint(12345).encodeABI();
        const transactionId = utils.getParamFromTxEvent(
            await multisigInstance.submitTransaction(callsInstance.address, 67890, receive1uintEncoded, {from: accounts[0]}),
            'transactionId', null, 'Submission')

        const executedTransactionId = utils.getParamFromTxEvent(
            await multisigInstance.confirmTransaction(transactionId, {from: accounts[1]}),
            'transactionId', null, 'Execution')
        // Check that transaction has been executed
        assert.ok(transactionId.eq(executedTransactionId))
        // Check that the expected parameters and values were passed
        assert.equal(
            12345,
            await callsInstance.uint1()
        )
        assert.equal(
            32 + 4,
            await callsInstance.lastMsgDataLength()
        )
        assert.equal(
            67890,
            await callsInstance.lastMsgValue()
        )
    })

    it('callReceive2uint', async() => {
         // Encode call for the multisig
        const receive2uintsEncoded = callsInstance.contract.methods.receive2uints(12345, 67890).encodeABI();
        const transactionId = utils.getParamFromTxEvent(
            await multisigInstance.submitTransaction(callsInstance.address, 4040404, receive2uintsEncoded, {from: accounts[0]}),
            'transactionId', null, 'Submission')

        const executedTransactionId = utils.getParamFromTxEvent(
            await multisigInstance.confirmTransaction(transactionId, {from: accounts[1]}),
            'transactionId', null, 'Execution')
        // Check that transaction has been executed
        assert.ok(transactionId.eq(executedTransactionId))
        // Check that the expected parameters and values were passed
        assert.equal(
            12345,
            await callsInstance.uint1()
        )
         assert.equal(
            67890,
            await callsInstance.uint2()
        )
        assert.equal(
            32 + 32 + 4,
            await callsInstance.lastMsgDataLength()
        )
        assert.equal(
            4040404,
            await callsInstance.lastMsgValue()
        )
    })

    it('callReceive1bytes', async() => {
         // Encode call for the multisig
        const dataHex = '0x' + '0123456789abcdef'.repeat(100) // 800 bytes long

        const receive1bytesEncoded = callsInstance.contract.methods.receive1bytes(dataHex).encodeABI();
        const transactionId = utils.getParamFromTxEvent(
            await multisigInstance.submitTransaction(callsInstance.address, 10, receive1bytesEncoded, {from: accounts[0]}),
            'transactionId', null, 'Submission')

        const executedTransactionId = utils.getParamFromTxEvent(
            await multisigInstance.confirmTransaction(transactionId, {from: accounts[1]}),
            'transactionId', null, 'Execution')
        // Check that transaction has been executed
        assert.ok(transactionId.eq(executedTransactionId))
        // Check that the expected parameters and values were passed
        assert.equal(
            868, // 800 bytes data + 32 bytes offset + 32 bytes data length + 4 bytes method signature
            await callsInstance.lastMsgDataLength()
        )
        assert.equal(
            10,
            await callsInstance.lastMsgValue()
        )
        assert.equal(
            dataHex,
            await callsInstance.byteArray1()
        )
    })

})
