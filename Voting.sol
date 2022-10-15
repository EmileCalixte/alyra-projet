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

    // Used to check if a submitted proposal already exists.
    // We could iterate over the `proposals` array and compare strings, but using an additionnal mapping uses a constant
    // amount of gas regardless the amount of proposals, where the amount of gas used by iterating over an array varies 
    // with the length of the array
    mapping(string => bool) private existingProposalDescriptions;

    // Used to store temporarily the proposal ids having the most vote count, and then break the tie if multiple
    // proposals are equal
    uint[] private potentialWinningProposalIds;

    uint private winningProposalId;

    uint private randomNonce = 0;

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
     * @dev Throws if called by an address who has already voted
     */
    modifier onlyNotYetVoted() {
        require(voters[msg.sender].hasVoted == false, "You have already voted");
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
     * @dev Throws if called during a phase other than between proposals registration phase and voting phase
     */
    modifier onlyWhileProposalsRegistrationEnded() {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationEnded, "You can do this only between the proposals registration phase and the voting session");
        _;
    }

    /**
     * @dev Throws if called during a phase other than the voting session
     */
    modifier onlyWhileVotingSessionStarted() {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, "You can do this only during the voting session");
        _;
    }

    /**
     * @dev Throws if called during a phase other than after the voting session
     */
    modifier onlyWhileVotingSessionEnded() {
        require(workflowStatus == WorkflowStatus.VotingSessionEnded, "You can do this only just after the voting session");
        _;
    }

    /**
     * @dev Throws if called before the votes have been tallied
     */
    modifier onlyWhenVotesTallied() {
        require(workflowStatus == WorkflowStatus.VotesTallied, "You can do this only after the votes have been tallied");
        _;
    }

    /**
     * @dev Throws if `proposalId` does not refer to an existing proposal
     */
    modifier proposalExists(uint _proposalId) {
        require(_proposalId < getProposalCount(), "This proposal does not exist");
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
     * @dev Starts the voting session
     */
    function startVotingSession() external onlyOwner onlyWhileProposalsRegistrationEnded {
        _changeWorkflowStatus(WorkflowStatus.VotingSessionStarted);
    }

    /**
     * @dev Ends the voting session
     */
    function endVotingSession() external onlyOwner onlyWhileVotingSessionStarted {
        _changeWorkflowStatus(WorkflowStatus.VotingSessionEnded);
    }

    /**
     * @dev Finds the proposal that received the most votes. If there is a tie, the tie is broken with a random draw
     */
    function tallyVotes() external onlyOwner onlyWhileVotingSessionEnded {
        uint maxVoteCount = 0;

        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount == maxVoteCount) {
                potentialWinningProposalIds.push(i);
            } else if (proposals[i].voteCount > maxVoteCount) {
                // Clear current potential winning proposal ids because we found a proposal which have more votes
                delete potentialWinningProposalIds;
                
                potentialWinningProposalIds.push(i);
                maxVoteCount = proposals[i].voteCount;
            }
        }

        if (potentialWinningProposalIds.length == 1) {
            winningProposalId = potentialWinningProposalIds[0];
        } else {
            winningProposalId = potentialWinningProposalIds[_getRandomUint(potentialWinningProposalIds.length - 1)];
        }

        _changeWorkflowStatus(WorkflowStatus.VotesTallied);
    }

    /**
     * @dev Adds a new proposal
     */
    function submitProposal(string memory _description) external onlyRegistered onlyWhileProposalsRegistrationStarted {
        require(existingProposalDescriptions[_description] == false, "This proposal already exists");

        Proposal memory proposal = Proposal(_description, 0);

        proposals.push(proposal);
        existingProposalDescriptions[_description] = true;

        emit ProposalRegistered(getProposalCount() - 1);
    }

    /**
     * @dev Returns the number of proposals
     */
    function getProposalCount() public view returns (uint) {
        return proposals.length;
    }

    /**
     * @dev Saves the vote of a voter for the proposal `proposalId`
     */
    function vote(uint _proposalId) external onlyWhileVotingSessionStarted onlyRegistered onlyNotYetVoted proposalExists(_proposalId) {
        proposals[_proposalId].voteCount++;

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = _proposalId;

        emit Voted(msg.sender, _proposalId);
    }

    /**
     * @dev Returns the ID of the winning proposal
     */
    function getWinningProposal() external view onlyWhenVotesTallied returns (uint) {
        return winningProposalId;
    }

    /**
     * @dev Switches workflow status to `_newStatus`
     */
    function _changeWorkflowStatus(WorkflowStatus _newStatus) internal {
        WorkflowStatus previousStatus = workflowStatus;
        workflowStatus = _newStatus;

        emit WorkflowStatusChanged(previousStatus, _newStatus);
    }

    /**
     * @dev Returns a pseudorandom uint between 0 and `_max` (included)
     */
    function _getRandomUint(uint _max) internal returns (uint) {
        randomNonce++;
        return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randomNonce))) % (_max + 1);
    }
}
