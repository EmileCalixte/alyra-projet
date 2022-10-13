// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

contract Voting is Ownable {
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    // Will take the first value (RegisteringVoters) at contract deployment
    WorkflowStatus public workflowStatus;

    mapping(address => Voter) public voters;

    event VoterRegistered(address VoterAddress);

    event WorkflowStatusChanged(WorkflowStatus previousStatus, WorkflowStatus newStatus);

    event ProposalRegistered(uint proposalId);

    event Voted(address voter, uint proposalId);

    /**
     * @dev Throws if called during a phase other than the voter registration phase
     */
    modifier onlyWhileRegisteringVoters() {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "You can do this only during the voter registration phase");
        _;
    }

    /**
     * @dev Registers a new voter
     */
    function registerVoter(address _voterAddress) external onlyOwner onlyWhileRegisteringVoters {
        voters[_voterAddress].isRegistered = true;
        emit VoterRegistered(_voterAddress);
    }

    /**
     * @dev Returns true if the address is a registered voter, false otherwise.
     */
    function isVoter(address _address) external view returns (bool) {
        return voters[_address].isRegistered;
    }
}