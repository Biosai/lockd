// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Claimable
 * @notice A trustless conditional escrow contract. Deposit ETH or ERC20 tokens for a specific recipient.
 *         The recipient can claim at any time. After the deadline, the depositor can reclaim their funds.
 * @dev Built with security in mind: ReentrancyGuard, SafeERC20, and comprehensive error handling.
 */
contract Claimable is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Represents a deposit with its associated data
    struct Deposit {
        address depositor;      // The address that made the deposit
        address claimant;       // The address that can claim the deposit
        address token;          // Token address (address(0) for ETH)
        uint256 amount;         // Amount deposited
        uint256 deadline;       // Timestamp after which depositor can reclaim
        bool claimed;           // Whether the deposit has been claimed/refunded
    }

    /// @notice Mapping from deposit ID to Deposit struct
    mapping(uint256 => Deposit) public deposits;

    /// @notice Total number of deposits created
    uint256 public depositCount;

    /// @notice Emitted when a new deposit is created
    event DepositCreated(
        uint256 indexed depositId,
        address indexed depositor,
        address indexed claimant,
        address token,
        uint256 amount,
        uint256 deadline
    );

    /// @notice Emitted when a deposit is claimed by the claimant
    event Claimed(uint256 indexed depositId, address indexed claimant);

    /// @notice Emitted when a deposit is refunded to the depositor (after deadline)
    event Refunded(uint256 indexed depositId, address indexed depositor);

    /// @notice Error thrown when deposit amount is zero
    error ZeroAmount();

    /// @notice Error thrown when claimant address is zero
    error ZeroClaimant();

    /// @notice Error thrown when deadline is not in the future
    error DeadlineNotInFuture();

    /// @notice Error thrown when deposit has already been claimed
    error AlreadyClaimed();

    /// @notice Error thrown when caller is not the claimant
    error NotClaimant();

    /// @notice Error thrown when caller is not the depositor
    error NotDepositor();

    /// @notice Error thrown when trying to refund before deadline
    error DeadlineNotReached();

    /// @notice Error thrown when ETH amount doesn't match for ERC20 deposit
    error InvalidETHAmount();

    /// @notice Error thrown when deposit doesn't exist
    error DepositNotFound();

    /**
     * @notice Create a new deposit for ETH
     * @param claimant The address that can claim this deposit
     * @param deadline The timestamp after which the depositor can reclaim
     * @return depositId The ID of the newly created deposit
     */
    function depositETH(
        address claimant,
        uint256 deadline
    ) external payable nonReentrant returns (uint256 depositId) {
        if (msg.value == 0) revert ZeroAmount();
        if (claimant == address(0)) revert ZeroClaimant();
        if (deadline <= block.timestamp) revert DeadlineNotInFuture();

        depositId = depositCount++;
        
        deposits[depositId] = Deposit({
            depositor: msg.sender,
            claimant: claimant,
            token: address(0),
            amount: msg.value,
            deadline: deadline,
            claimed: false
        });

        emit DepositCreated(depositId, msg.sender, claimant, address(0), msg.value, deadline);
    }

    /**
     * @notice Create a new deposit for an ERC20 token
     * @param claimant The address that can claim this deposit
     * @param token The ERC20 token address
     * @param amount The amount of tokens to deposit
     * @param deadline The timestamp after which the depositor can reclaim
     * @return depositId The ID of the newly created deposit
     */
    function depositToken(
        address claimant,
        address token,
        uint256 amount,
        uint256 deadline
    ) external nonReentrant returns (uint256 depositId) {
        if (amount == 0) revert ZeroAmount();
        if (claimant == address(0)) revert ZeroClaimant();
        if (token == address(0)) revert InvalidETHAmount();
        if (deadline <= block.timestamp) revert DeadlineNotInFuture();

        // Transfer tokens from sender to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        depositId = depositCount++;

        deposits[depositId] = Deposit({
            depositor: msg.sender,
            claimant: claimant,
            token: token,
            amount: amount,
            deadline: deadline,
            claimed: false
        });

        emit DepositCreated(depositId, msg.sender, claimant, token, amount, deadline);
    }

    /**
     * @notice Claim a deposit (only callable by the designated claimant)
     * @param depositId The ID of the deposit to claim
     */
    function claim(uint256 depositId) external nonReentrant {
        if (depositId >= depositCount) revert DepositNotFound();
        
        Deposit storage d = deposits[depositId];
        
        if (d.claimed) revert AlreadyClaimed();
        if (msg.sender != d.claimant) revert NotClaimant();

        d.claimed = true;

        _transfer(d.token, d.claimant, d.amount);

        emit Claimed(depositId, d.claimant);
    }

    /**
     * @notice Refund a deposit to the depositor (only after deadline has passed)
     * @param depositId The ID of the deposit to refund
     */
    function refund(uint256 depositId) external nonReentrant {
        if (depositId >= depositCount) revert DepositNotFound();
        
        Deposit storage d = deposits[depositId];
        
        if (d.claimed) revert AlreadyClaimed();
        if (msg.sender != d.depositor) revert NotDepositor();
        if (block.timestamp <= d.deadline) revert DeadlineNotReached();

        d.claimed = true;

        _transfer(d.token, d.depositor, d.amount);

        emit Refunded(depositId, d.depositor);
    }

    /**
     * @notice Get deposit details
     * @param depositId The ID of the deposit
     * @return depositor The address that made the deposit
     * @return claimant The address that can claim
     * @return token The token address (address(0) for ETH)
     * @return amount The deposit amount
     * @return deadline The claim deadline
     * @return claimed Whether already claimed/refunded
     */
    function getDeposit(uint256 depositId) external view returns (
        address depositor,
        address claimant,
        address token,
        uint256 amount,
        uint256 deadline,
        bool claimed
    ) {
        if (depositId >= depositCount) revert DepositNotFound();
        Deposit storage d = deposits[depositId];
        return (d.depositor, d.claimant, d.token, d.amount, d.deadline, d.claimed);
    }

    /**
     * @notice Internal function to transfer ETH or ERC20 tokens
     * @param token The token address (address(0) for ETH)
     * @param to The recipient address
     * @param amount The amount to transfer
     */
    function _transfer(address token, address to, uint256 amount) internal {
        if (token == address(0)) {
            (bool success, ) = to.call{value: amount}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
    }
}

