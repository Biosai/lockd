// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title FileCertification
 * @notice A contract for certifying file hashes on-chain.
 *         Provides proof of existence at a specific point in time.
 *         Files are never uploaded - only their SHA-256 hash is stored.
 */
contract FileCertification {
    /// @notice Represents a certification record
    struct Certification {
        address certifier;      // Address that certified the hash
        uint256 timestamp;      // Block timestamp when certified
    }

    /// @notice Mapping from content hash to certification data
    mapping(bytes32 => Certification) public certifications;

    /// @notice Mapping from certifier address to array of their certified hashes
    mapping(address => bytes32[]) public certifierHashes;

    /// @notice Total number of certifications
    uint256 public certificationCount;

    // ============ Events ============

    /// @notice Emitted when a new hash is certified
    event Certified(
        bytes32 indexed contentHash,
        address indexed certifier,
        uint256 timestamp
    );

    // ============ Errors ============

    /// @notice Error thrown when trying to certify an empty hash
    error EmptyHash();

    /// @notice Error thrown when hash is already certified
    error AlreadyCertified();

    // ============ Functions ============

    /**
     * @notice Certify a file hash on-chain
     * @dev First certifier wins - subsequent attempts for the same hash will fail
     * @param contentHash The SHA-256 hash of the file (as bytes32)
     */
    function certify(bytes32 contentHash) external {
        if (contentHash == bytes32(0)) revert EmptyHash();
        if (certifications[contentHash].certifier != address(0)) revert AlreadyCertified();

        certifications[contentHash] = Certification({
            certifier: msg.sender,
            timestamp: block.timestamp
        });

        certifierHashes[msg.sender].push(contentHash);
        certificationCount++;

        emit Certified(contentHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Check if a hash has been certified
     * @param contentHash The hash to check
     * @return True if the hash has been certified
     */
    function isCertified(bytes32 contentHash) external view returns (bool) {
        return certifications[contentHash].certifier != address(0);
    }

    /**
     * @notice Get certification details for a hash
     * @param contentHash The hash to look up
     * @return certifier The address that certified the hash (address(0) if not certified)
     * @return timestamp The timestamp when certified (0 if not certified)
     */
    function getCertification(bytes32 contentHash) external view returns (
        address certifier,
        uint256 timestamp
    ) {
        Certification storage cert = certifications[contentHash];
        return (cert.certifier, cert.timestamp);
    }

    /**
     * @notice Get all hashes certified by an address
     * @param certifier The address to look up
     * @return Array of content hashes certified by this address
     */
    function getHashesByCertifier(address certifier) external view returns (bytes32[] memory) {
        return certifierHashes[certifier];
    }

    /**
     * @notice Get the count of hashes certified by an address
     * @param certifier The address to look up
     * @return Number of hashes certified by this address
     */
    function getCertifierHashCount(address certifier) external view returns (uint256) {
        return certifierHashes[certifier].length;
    }
}
