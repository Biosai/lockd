// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CryptoInheritance
 * @notice A contract for crypto inheritance with dead man's switch functionality.
 *         Supports time-locked deposits, document certification, and secret-based claiming.
 *         The claimant can claim after startTime. After the deadline, the depositor can also refund.
 *         Depositors can extend deadlines (check-in) to prove they are still active.
 */
contract CryptoInheritance is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Represents a deposit with its associated data
    struct Deposit {
        address depositor;          // The address that made the deposit
        address claimant;           // The address that can claim (address(0) if using secret)
        address token;              // Token address (address(0) for ETH)
        uint256 amount;             // Amount deposited
        uint256 startTime;          // Timestamp from which claimant can claim (0 = immediate)
        uint256 deadline;           // Timestamp after which depositor can also withdraw
        bool claimed;               // Whether the deposit has been claimed/refunded
        string title;               // Optional title/label for the deposit
        bytes32 contentHash;        // Optional document hash for certification
        bytes32 claimSecretHash;    // Optional keccak256(secret) for wallet-less beneficiaries
    }

    /// @notice Mapping from deposit ID to Deposit struct
    mapping(uint256 => Deposit) public deposits;

    /// @notice Total number of deposits created
    uint256 public depositCount;

    /// @notice Maximum allowed length for deposit title (in bytes)
    uint256 public constant MAX_TITLE_LENGTH = 128;

    // ============ Events ============

    /// @notice Emitted when a new deposit is created
    event DepositCreated(
        uint256 indexed depositId,
        address indexed depositor,
        address indexed claimant,
        address token,
        uint256 amount,
        uint256 startTime,
        uint256 deadline,
        string title,
        bytes32 contentHash,
        bytes32 claimSecretHash
    );

    /// @notice Emitted when a deposit is claimed by the claimant
    event Claimed(uint256 indexed depositId, address indexed claimant);

    /// @notice Emitted when a deposit is refunded to the depositor (after deadline)
    event Refunded(uint256 indexed depositId, address indexed depositor);

    /// @notice Emitted when a deposit deadline is extended
    event DeadlineExtended(uint256 indexed depositId, uint256 oldDeadline, uint256 newDeadline);

    // ============ Errors ============

    /// @notice Error thrown when deposit amount is zero
    error ZeroAmount();

    /// @notice Error thrown when neither claimant address nor secret hash is provided
    error NoClaimMethod();

    /// @notice Error thrown when deadline is not in the future
    error DeadlineNotInFuture();

    /// @notice Error thrown when startTime is after deadline
    error StartTimeAfterDeadline();

    /// @notice Error thrown when deposit has already been claimed
    error AlreadyClaimed();

    /// @notice Error thrown when caller is not the claimant
    error NotClaimant();

    /// @notice Error thrown when caller is not the depositor
    error NotDepositor();

    /// @notice Error thrown when trying to refund before deadline
    error DeadlineNotReached();

    /// @notice Error thrown when trying to claim before startTime
    error ClaimNotYetAllowed();

    /// @notice Error thrown when ETH amount doesn't match for ERC20 deposit
    error InvalidETHAmount();

    /// @notice Error thrown when deposit doesn't exist
    error DepositNotFound();

    /// @notice Error thrown when title exceeds maximum length
    error TitleTooLong();

    /// @notice Error thrown when new deadline is not after current deadline
    error NewDeadlineNotAfterCurrent();

    /// @notice Error thrown when secret doesn't match the hash
    error InvalidSecret();

    /// @notice Error thrown when trying to use secret claim on address-based deposit
    error SecretClaimNotEnabled();

    /// @notice Error thrown when array lengths don't match
    error ArrayLengthMismatch();

    /// @notice Error thrown when total ETH sent doesn't match sum of amounts
    error TotalAmountMismatch();

    // ============ Deposit Functions ============

    /**
     * @notice Create a new deposit for ETH
     * @param claimant The address that can claim this deposit (address(0) if using secret)
     * @param startTime Timestamp from which claimant can claim (0 for immediate)
     * @param deadline The timestamp after which the depositor can also withdraw
     * @param title Optional title/label for the deposit
     * @param contentHash Optional document hash for certification (bytes32(0) if none)
     * @param claimSecretHash Optional keccak256(secret) for wallet-less beneficiaries (bytes32(0) if using claimant)
     * @return depositId The ID of the newly created deposit
     */
    function depositETH(
        address claimant,
        uint256 startTime,
        uint256 deadline,
        string calldata title,
        bytes32 contentHash,
        bytes32 claimSecretHash
    ) external payable nonReentrant returns (uint256 depositId) {
        if (msg.value == 0) revert ZeroAmount();
        if (claimant == address(0) && claimSecretHash == bytes32(0)) revert NoClaimMethod();
        if (deadline <= block.timestamp) revert DeadlineNotInFuture();
        if (startTime > deadline) revert StartTimeAfterDeadline();
        if (bytes(title).length > MAX_TITLE_LENGTH) revert TitleTooLong();

        depositId = depositCount++;
        
        deposits[depositId] = Deposit({
            depositor: msg.sender,
            claimant: claimant,
            token: address(0),
            amount: msg.value,
            startTime: startTime,
            deadline: deadline,
            claimed: false,
            title: title,
            contentHash: contentHash,
            claimSecretHash: claimSecretHash
        });

        emit DepositCreated(
            depositId,
            msg.sender,
            claimant,
            address(0),
            msg.value,
            startTime,
            deadline,
            title,
            contentHash,
            claimSecretHash
        );
    }

    /**
     * @notice Create a new deposit for an ERC20 token
     * @dev Supports fee-on-transfer tokens by recording actual balance change
     * @param claimant The address that can claim this deposit (address(0) if using secret)
     * @param token The ERC20 token address
     * @param amount The amount of tokens to deposit (may differ from actual if fee-on-transfer)
     * @param startTime Timestamp from which claimant can claim (0 for immediate)
     * @param deadline The timestamp after which the depositor can also withdraw
     * @param title Optional title/label for the deposit
     * @param contentHash Optional document hash for certification (bytes32(0) if none)
     * @param claimSecretHash Optional keccak256(secret) for wallet-less beneficiaries (bytes32(0) if using claimant)
     * @return depositId The ID of the newly created deposit
     */
    function depositToken(
        address claimant,
        address token,
        uint256 amount,
        uint256 startTime,
        uint256 deadline,
        string calldata title,
        bytes32 contentHash,
        bytes32 claimSecretHash
    ) external nonReentrant returns (uint256 depositId) {
        if (amount == 0) revert ZeroAmount();
        if (claimant == address(0) && claimSecretHash == bytes32(0)) revert NoClaimMethod();
        if (token == address(0)) revert InvalidETHAmount();
        if (deadline <= block.timestamp) revert DeadlineNotInFuture();
        if (startTime > deadline) revert StartTimeAfterDeadline();
        if (bytes(title).length > MAX_TITLE_LENGTH) revert TitleTooLong();

        // Record balance before transfer to handle fee-on-transfer tokens
        uint256 balanceBefore = IERC20(token).balanceOf(address(this));
        
        // Transfer tokens from sender to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Calculate actual amount received (handles fee-on-transfer tokens)
        uint256 actualAmount = IERC20(token).balanceOf(address(this)) - balanceBefore;
        
        // Ensure we actually received tokens
        if (actualAmount == 0) revert ZeroAmount();

        depositId = depositCount++;

        deposits[depositId] = Deposit({
            depositor: msg.sender,
            claimant: claimant,
            token: token,
            amount: actualAmount,
            startTime: startTime,
            deadline: deadline,
            claimed: false,
            title: title,
            contentHash: contentHash,
            claimSecretHash: claimSecretHash
        });

        emit DepositCreated(
            depositId,
            msg.sender,
            claimant,
            token,
            actualAmount,
            startTime,
            deadline,
            title,
            contentHash,
            claimSecretHash
        );
    }

    // ============ Batch Deposit Functions ============

    /**
     * @notice Create multiple ETH deposits in a single transaction
     * @param claimants Array of addresses that can claim each deposit
     * @param amounts Array of amounts for each deposit
     * @param startTime Timestamp from which claimants can claim (shared for all)
     * @param deadline The timestamp after which the depositor can withdraw (shared for all)
     * @param title Optional title/label (shared for all deposits)
     * @param contentHash Optional document hash (shared for all deposits)
     * @return depositIds Array of created deposit IDs
     */
    function batchDepositETH(
        address[] calldata claimants,
        uint256[] calldata amounts,
        uint256 startTime,
        uint256 deadline,
        string calldata title,
        bytes32 contentHash
    ) external payable nonReentrant returns (uint256[] memory depositIds) {
        if (claimants.length != amounts.length) revert ArrayLengthMismatch();
        if (claimants.length == 0) revert ZeroAmount();
        if (deadline <= block.timestamp) revert DeadlineNotInFuture();
        if (startTime > deadline) revert StartTimeAfterDeadline();
        if (bytes(title).length > MAX_TITLE_LENGTH) revert TitleTooLong();

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            if (amounts[i] == 0) revert ZeroAmount();
            if (claimants[i] == address(0)) revert NoClaimMethod();
            totalAmount += amounts[i];
        }
        if (msg.value != totalAmount) revert TotalAmountMismatch();

        depositIds = new uint256[](claimants.length);

        for (uint256 i = 0; i < claimants.length; i++) {
            uint256 depositId = depositCount++;
            depositIds[i] = depositId;

            deposits[depositId] = Deposit({
                depositor: msg.sender,
                claimant: claimants[i],
                token: address(0),
                amount: amounts[i],
                startTime: startTime,
                deadline: deadline,
                claimed: false,
                title: title,
                contentHash: contentHash,
                claimSecretHash: bytes32(0)
            });

            emit DepositCreated(
                depositId,
                msg.sender,
                claimants[i],
                address(0),
                amounts[i],
                startTime,
                deadline,
                title,
                contentHash,
                bytes32(0)
            );
        }
    }

    /**
     * @notice Create multiple token deposits in a single transaction
     * @param claimants Array of addresses that can claim each deposit
     * @param token The ERC20 token address
     * @param amounts Array of amounts for each deposit
     * @param startTime Timestamp from which claimants can claim (shared for all)
     * @param deadline The timestamp after which the depositor can withdraw (shared for all)
     * @param title Optional title/label (shared for all deposits)
     * @param contentHash Optional document hash (shared for all deposits)
     * @return depositIds Array of created deposit IDs
     */
    function batchDepositToken(
        address[] calldata claimants,
        address token,
        uint256[] calldata amounts,
        uint256 startTime,
        uint256 deadline,
        string calldata title,
        bytes32 contentHash
    ) external nonReentrant returns (uint256[] memory depositIds) {
        if (claimants.length != amounts.length) revert ArrayLengthMismatch();
        if (claimants.length == 0) revert ZeroAmount();
        if (token == address(0)) revert InvalidETHAmount();
        if (deadline <= block.timestamp) revert DeadlineNotInFuture();
        if (startTime > deadline) revert StartTimeAfterDeadline();
        if (bytes(title).length > MAX_TITLE_LENGTH) revert TitleTooLong();

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            if (amounts[i] == 0) revert ZeroAmount();
            if (claimants[i] == address(0)) revert NoClaimMethod();
            totalAmount += amounts[i];
        }

        // Transfer total tokens
        uint256 balanceBefore = IERC20(token).balanceOf(address(this));
        IERC20(token).safeTransferFrom(msg.sender, address(this), totalAmount);
        uint256 actualTotal = IERC20(token).balanceOf(address(this)) - balanceBefore;
        
        // For fee-on-transfer tokens, proportionally reduce each amount
        bool hasFee = actualTotal < totalAmount;

        depositIds = new uint256[](claimants.length);

        for (uint256 i = 0; i < claimants.length; i++) {
            uint256 depositId = depositCount++;
            depositIds[i] = depositId;

            // Calculate actual amount for this deposit (handle fee-on-transfer)
            uint256 depositAmount = hasFee 
                ? (amounts[i] * actualTotal) / totalAmount 
                : amounts[i];

            deposits[depositId] = Deposit({
                depositor: msg.sender,
                claimant: claimants[i],
                token: token,
                amount: depositAmount,
                startTime: startTime,
                deadline: deadline,
                claimed: false,
                title: title,
                contentHash: contentHash,
                claimSecretHash: bytes32(0)
            });

            emit DepositCreated(
                depositId,
                msg.sender,
                claimants[i],
                token,
                depositAmount,
                startTime,
                deadline,
                title,
                contentHash,
                bytes32(0)
            );
        }
    }

    // ============ Claim Functions ============

    /**
     * @notice Claim a deposit (only callable by the designated claimant)
     * @param depositId The ID of the deposit to claim
     */
    function claim(uint256 depositId) external nonReentrant {
        if (depositId >= depositCount) revert DepositNotFound();
        
        Deposit storage d = deposits[depositId];
        
        if (d.claimed) revert AlreadyClaimed();
        if (d.claimant == address(0)) revert NotClaimant(); // Must use claimWithSecret
        if (msg.sender != d.claimant) revert NotClaimant();
        if (d.startTime > 0 && block.timestamp < d.startTime) revert ClaimNotYetAllowed();

        d.claimed = true;

        _transfer(d.token, d.claimant, d.amount);

        emit Claimed(depositId, d.claimant);
    }

    /**
     * @notice Claim a deposit using a secret (for wallet-less beneficiaries)
     * @param depositId The ID of the deposit to claim
     * @param secret The secret string set by the depositor
     */
    function claimWithSecret(uint256 depositId, string calldata secret) external nonReentrant {
        if (depositId >= depositCount) revert DepositNotFound();
        
        Deposit storage d = deposits[depositId];
        
        if (d.claimed) revert AlreadyClaimed();
        if (d.claimSecretHash == bytes32(0)) revert SecretClaimNotEnabled();
        if (keccak256(bytes(secret)) != d.claimSecretHash) revert InvalidSecret();
        if (d.startTime > 0 && block.timestamp < d.startTime) revert ClaimNotYetAllowed();

        d.claimed = true;

        _transfer(d.token, msg.sender, d.amount);

        emit Claimed(depositId, msg.sender);
    }

    // ============ Refund Function ============

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

    // ============ Deadline Extension Functions ============

    /**
     * @notice Extend the deadline of a deposit (check-in mechanism)
     * @param depositId The ID of the deposit to extend
     * @param newDeadline The new deadline (must be after current deadline)
     */
    function extendDeadline(uint256 depositId, uint256 newDeadline) external {
        if (depositId >= depositCount) revert DepositNotFound();
        
        Deposit storage d = deposits[depositId];
        
        if (d.claimed) revert AlreadyClaimed();
        if (msg.sender != d.depositor) revert NotDepositor();
        if (newDeadline <= d.deadline) revert NewDeadlineNotAfterCurrent();

        uint256 oldDeadline = d.deadline;
        d.deadline = newDeadline;

        emit DeadlineExtended(depositId, oldDeadline, newDeadline);
    }

    /**
     * @notice Extend the deadline of multiple deposits at once
     * @param depositIds Array of deposit IDs to extend
     * @param newDeadline The new deadline for all deposits
     */
    function batchExtendDeadline(uint256[] calldata depositIds, uint256 newDeadline) external {
        for (uint256 i = 0; i < depositIds.length; i++) {
            uint256 depositId = depositIds[i];
            if (depositId >= depositCount) revert DepositNotFound();
            
            Deposit storage d = deposits[depositId];
            
            if (d.claimed) revert AlreadyClaimed();
            if (msg.sender != d.depositor) revert NotDepositor();
            if (newDeadline <= d.deadline) revert NewDeadlineNotAfterCurrent();

            uint256 oldDeadline = d.deadline;
            d.deadline = newDeadline;

            emit DeadlineExtended(depositId, oldDeadline, newDeadline);
        }
    }

    // ============ View Functions ============

    /**
     * @notice Get deposit details
     * @param depositId The ID of the deposit
     * @return depositor The address that made the deposit
     * @return claimant The address that can claim (address(0) if using secret)
     * @return token The token address (address(0) for ETH)
     * @return amount The deposit amount
     * @return startTime The timestamp from which claiming is allowed
     * @return deadline The refund deadline
     * @return claimed Whether already claimed/refunded
     * @return title The deposit title/label
     * @return contentHash The document hash (bytes32(0) if none)
     * @return claimSecretHash The claim secret hash (bytes32(0) if using address)
     */
    function getDeposit(uint256 depositId) external view returns (
        address depositor,
        address claimant,
        address token,
        uint256 amount,
        uint256 startTime,
        uint256 deadline,
        bool claimed,
        string memory title,
        bytes32 contentHash,
        bytes32 claimSecretHash
    ) {
        if (depositId >= depositCount) revert DepositNotFound();
        Deposit storage d = deposits[depositId];
        return (
            d.depositor,
            d.claimant,
            d.token,
            d.amount,
            d.startTime,
            d.deadline,
            d.claimed,
            d.title,
            d.contentHash,
            d.claimSecretHash
        );
    }

    // ============ Internal Functions ============

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
