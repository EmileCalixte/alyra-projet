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

    Proposal[] public proposals;

    event VoterRegistered(address VoterAddress);

    event WorkflowStatusChanged(WorkflowStatus previousStatus, WorkflowStatus newStatus);

    event ProposalRegistered(uint proposalId);

    event Voted(address voter, uint proposalId);

    /**
     * @dev Throws if called by an address which is not a registered voter
     */
    modifier onlyRegistered() {
        require(voters[msg.sender].isRegistered == true, "You must be registered to do this");
        _;
    }

    /**
     * @dev Throws if called during a phase other than the voter registration phase
     */
    modifier onlyWhileRegisteringVoters() {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "You can do this only during the voter registration phase");
        _;
    }

    /**
     * @dev Throws if called during a phase other than the proposals registration phase
     */
    modifier onlyWhileProposalsRegistrationStarted() {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "You can do this only during the proposals registration phase");
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

    /**
     * @dev Starts proposals registration phase
     */
    function startProposalsRegistration() external onlyOwner onlyWhileRegisteringVoters {
        _changeWorkflowStatus(WorkflowStatus.ProposalsRegistrationStarted);
    }

    /**
     * @dev Ends proposals registration phase
     */
    function endProposalsRegistration() external onlyOwner onlyWhileProposalsRegistrationStarted {
        _changeWorkflowStatus(WorkflowStatus.ProposalsRegistrationEnded);
    }

    /**
     * @dev Adds a new proposal
     */
    function submitProposal(string memory _description) external onlyRegistered onlyWhileProposalsRegistrationStarted {
        Proposal memory proposal = Proposal(_description, 0);

        proposals.push(proposal);

        emit ProposalRegistered(getProposalCount() - 1);
    }

    /**
     * @dev Returns the number of proposals
     */
    function getProposalCount() public view returns (uint) {
        return proposals.length;
    }

    /**
     * @dev Switches workflow status to `_newStatus`
     */
    function _changeWorkflowStatus(WorkflowStatus _newStatus) internal {
        WorkflowStatus previousStatus = workflowStatus;
        workflowStatus = _newStatus;

        emit WorkflowStatusChanged(previousStatus, _newStatus);
    }
}
