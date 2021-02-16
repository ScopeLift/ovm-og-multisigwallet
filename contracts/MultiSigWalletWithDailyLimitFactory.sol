pragma solidity ^0.5.17;
import "./Factory.sol";
import "./MultiSigWalletWithDailyLimit.sol";


/// @title Multisignature wallet factory for daily limit version - Allows creation of multisig wallet.
/// @author Stefan George - <stefan.george@consensys.net>
contract MultiSigWalletWithDailyLimitFactory is Factory {

    /*
     * Public functions
     */
    /// @dev Allows verified creation of multisignature wallet.
    /// @param _owners List of initial owners.
    /// @param _required Number of required confirmations.
    /// @param _dailyLimit Amount in wei, which can be withdrawn without confirmations on a daily basis.
    /// @return Returns wallet address.
    function create(address[] calldata _owners, uint _required, uint _dailyLimit)
        external
        returns (address wallet)
    {
        MultiSigWalletWithDailyLimit newWallet = new MultiSigWalletWithDailyLimit(_owners, _required, _dailyLimit);
        wallet = address(newWallet);
        register(wallet);
    }
}
