import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { getVotingFactory } from "../scripts/deploy";

describe("Voting", () => {
    const deployFixture = async () => {
        const Voting = await getVotingFactory();
        const voting = await Voting.deploy();

        const [owner, ...otherAccounts] = await ethers.getSigners();

        return {voting, owner, otherAccounts};
    }

    describe("Add Voter", async () => {
        it("Should add a voter", async () => {
            const { voting, owner } = await loadFixture(deployFixture);

            expect(await voting.getRegisteredVoterCount()).to.equal(0);

            await voting.addVoter(owner.address);

            expect((await voting.getVoter(owner.address)).isRegistered).to.equal(true);
            expect(await voting.getRegisteredVoterCount()).to.equal(1);
        });

        it("Should prevent other account to add a voter", async () => {
            const { voting, owner, otherAccounts } = await loadFixture(deployFixture);

            await voting.addVoter(owner.address);

            expect(await voting.getRegisteredVoterCount()).to.equal(1);

            await expect(voting.connect(otherAccounts[0]).addVoter(otherAccounts[0].address))
                .to.be.revertedWith("Ownable: caller is not the owner");

            expect((await voting.getVoter(otherAccounts[0].address)).isRegistered).to.equal(false);
            expect(await voting.getRegisteredVoterCount()).to.equal(1);
        });

        it("Should prevent other account to add a voter even if it's a registered voter", async () => {
            const { voting, owner, otherAccounts } = await loadFixture(deployFixture);

            await voting.addVoter(owner.address);
            await voting.addVoter(otherAccounts[0].address);

            expect(await voting.getRegisteredVoterCount()).to.equal(2);

            await expect(voting.connect(otherAccounts[0]).addVoter(otherAccounts[1].address))
                .to.be.revertedWith("Ownable: caller is not the owner");

            expect((await voting.getVoter(otherAccounts[1].address)).isRegistered).to.equal(false);
            expect(await voting.getRegisteredVoterCount()).to.equal(2);
        });

        it("Should emit VoterRegistered event", async () => {
            const { voting, otherAccounts } = await loadFixture(deployFixture);

            await expect(voting.addVoter(otherAccounts[0].address))
                .to.emit(voting, "VoterRegistered")
                .withArgs(otherAccounts[0].address);
        });

        it("Should prevent to add a voter if Registering Voters phase is closed", async () => {
            const { voting, owner, otherAccounts } = await loadFixture(deployFixture);

            await voting.addVoter(owner.address);

            // End registering voters phase by starting the next phase
            await voting.startProposalsRegistering();

            await expect(voting.addVoter(otherAccounts[0].address))
                .to.be.revertedWith("Voters registration is not open yet");

            expect((await voting.getVoter(otherAccounts[0].address)).isRegistered).to.equal(false);
        });

        it("Should revert if address is already a registered voter", async () => {
            const { voting, owner, otherAccounts } = await loadFixture(deployFixture);

            await voting.addVoter(owner.address);

            await expect(voting.addVoter(otherAccounts[0].address))
                .not.to.be.reverted;

            expect(await voting.getRegisteredVoterCount()).to.equal(2);

            await expect(voting.addVoter(otherAccounts[0].address))
                .to.be.revertedWith("Already registered");

            expect(await voting.getRegisteredVoterCount()).to.equal(2);
        });
    });

    describe("Register proposal", async () => {
        const deployRegisterProposalFixture = async () => {
            const { voting, owner, otherAccounts } = await deployFixture();

            const registeredVoters = otherAccounts.slice(0, 5);
            const notRegisteredAccounts = otherAccounts.slice(5, otherAccounts.length);

            await voting.addVoter(owner.address);

            for (const voter of registeredVoters) {
                await voting.addVoter(voter.address);
            }

            return {voting, owner, registeredVoters, notRegisteredAccounts};
        }

        const testProposalDescription = "Test proposal description";

        it("Should add a genesis proposal when proposals registering starts", async () => {
            const { voting } = await loadFixture(deployRegisterProposalFixture);

            await voting.startProposalsRegistering();

            expect((await voting.getOneProposal(0)).description).to.equal('GENESIS');
        });

        it("Should add a proposal from a registered voter", async () => {
            const { voting, registeredVoters } = await loadFixture(deployRegisterProposalFixture);

            await voting.startProposalsRegistering();

            await voting.connect(registeredVoters[0]).addProposal(testProposalDescription);

            expect((await voting.getOneProposal(1)).description).to.equal(testProposalDescription);
        });

        it("Should revert if proposal description is empty", async () => {
            const { voting } = await loadFixture(deployRegisterProposalFixture);

            await voting.startProposalsRegistering();

            await expect(voting.addProposal(""))
                .to.be.revertedWith("Vous ne pouvez pas ne rien proposer");
        });

        it("Should revert if a proposal is submitted by an account which is not registered as a voter", async () => {
            const { voting, notRegisteredAccounts } = await loadFixture(deployRegisterProposalFixture);

            await voting.startProposalsRegistering();

            await expect(voting.connect(notRegisteredAccounts[0]).addProposal(testProposalDescription))
                .to.be.revertedWith("You're not a voter");
        });

        it("Should revert if current workflow status is not ProposalsRegistrationStarted", async () => {
            const { voting, registeredVoters } = await loadFixture(deployRegisterProposalFixture);

            await expect(voting.connect(registeredVoters[0]).addProposal(testProposalDescription))
                .to.be.revertedWith("Proposals are not allowed yet");

            await voting.startProposalsRegistering();

            await expect(voting.connect(registeredVoters[0]).addProposal(testProposalDescription))
                .not.to.be.reverted;

            await voting.endProposalsRegistering();

            await expect(voting.connect(registeredVoters[0]).addProposal(testProposalDescription))
                .to.be.revertedWith("Proposals are not allowed yet");
        });

        it("Should emit ProposalRegistered event", async () => {
            const { voting, registeredVoters } = await loadFixture(deployRegisterProposalFixture);

            await voting.startProposalsRegistering();

            await expect(voting.connect(registeredVoters[0]).addProposal(testProposalDescription))
                .to.emit(voting, "ProposalRegistered")
                .withArgs(1); // Index of the 2nd proposal, because a first proposal is created at proposals registering start
        });
    });

    describe("Vote", async () => {
        const deployVoteFixture = async () => {
            const { voting, owner, otherAccounts } = await deployFixture();

            const registeredVoters = otherAccounts.slice(0, 5);
            const notRegisteredAccounts = otherAccounts.slice(5, otherAccounts.length);

            await voting.addVoter(owner.address);

            for (const voter of registeredVoters) {
                await voting.addVoter(voter.address);
            }

            await voting.startProposalsRegistering();

            await voting.connect(registeredVoters[0]).addProposal("Proposal 1");
            await voting.connect(registeredVoters[1]).addProposal("Proposal 2");
            await voting.connect(registeredVoters[2]).addProposal("Proposal 3");

            await voting.endProposalsRegistering();

            return {voting, owner, registeredVoters, notRegisteredAccounts};
        }

        it("Should register a vote", async () => {
            const { voting, registeredVoters } = await loadFixture(deployVoteFixture);

            await voting.startVotingSession();

            await voting.connect(registeredVoters[0]).setVote(1);

            expect((await voting.getVoter(registeredVoters[0].address)).hasVoted).to.equal(true);
            expect((await voting.getVoter(registeredVoters[0].address)).votedProposalId).to.equal(1);
            expect((await voting.getOneProposal(1)).voteCount).to.equal(1);
        });

        it("Should revert if address is not a registered voter", async () => {
            const { voting, notRegisteredAccounts } = await loadFixture(deployVoteFixture);

            await voting.startVotingSession();

            await expect(voting.connect(notRegisteredAccounts[0]).setVote(1))
                .to.be.revertedWith("You're not a voter");
        });

        it("Should revert if voter has already voted", async () => {
            const { voting, registeredVoters } = await loadFixture(deployVoteFixture);

            await voting.startVotingSession();

            await expect(voting.connect(registeredVoters[0]).setVote(1))
                .not.to.be.reverted;

            await expect(voting.connect(registeredVoters[0]).setVote(2))
                .to.be.revertedWith("You have already voted");
        });

        it("Should revert if proposal does not exist", async () => {
            const { voting, registeredVoters } = await loadFixture(deployVoteFixture);

            await voting.startVotingSession();

            await expect(voting.connect(registeredVoters[0]).setVote(999))
                .to.be.revertedWith("Proposal not found");
        })

        it("Should revert if workflow status is not VotingSessionStarted", async () => {
            const { voting, registeredVoters } = await loadFixture(deployVoteFixture);

            await expect(voting.connect(registeredVoters[0]).setVote(1))
                .to.be.revertedWith("Voting session havent started yet");

            await voting.startVotingSession();

            await expect(voting.connect(registeredVoters[0]).setVote(1))
                .not.to.be.reverted;

            await voting.endVotingSession();

            await expect(voting.connect(registeredVoters[1]).setVote(1))
                .to.be.revertedWith("Voting session havent started yet");
        });

        it("Should emit Voted event", async () => {
            const { voting, registeredVoters } = await loadFixture(deployVoteFixture);

            await voting.startVotingSession();

            await expect(voting.connect(registeredVoters[0]).setVote(1))
                .to.emit(voting, "Voted")
                .withArgs(registeredVoters[0].address, 1);
        })
    });

    describe("Tally votes", async () => {
        const deployTallyVotesFixture = async () => {
            const { voting, owner, otherAccounts } = await deployFixture();

            const registeredVoters = otherAccounts.slice(0, 5);
            const notRegisteredAccounts = otherAccounts.slice(5, otherAccounts.length);

            await voting.addVoter(owner.address);

            for (const voter of registeredVoters) {
                await voting.addVoter(voter.address);
            }

            await voting.startProposalsRegistering();

            await voting.connect(registeredVoters[0]).addProposal("Proposal 1");
            await voting.connect(registeredVoters[1]).addProposal("Proposal 2");
            await voting.connect(registeredVoters[2]).addProposal("Proposal 3");

            await voting.endProposalsRegistering();
            await voting.startVotingSession();

            await voting.connect(registeredVoters[0]).setVote(1);
            await voting.connect(registeredVoters[1]).setVote(1);
            await voting.connect(registeredVoters[2]).setVote(2);
            await voting.connect(registeredVoters[3]).setVote(2);
            await voting.connect(registeredVoters[4]).setVote(3);

            return {voting, owner, registeredVoters, notRegisteredAccounts};
        }

        it("Should revert if workflow status is not VotingSessionEnded", async () => {
            const { voting } = await loadFixture(deployTallyVotesFixture);

            await expect(voting.tallyVotes()).to.be.revertedWith("Current status is not voting session ended");
        });

        it("Should tally votes", async () => {
            const { voting } = await loadFixture(deployTallyVotesFixture);

            await voting.endVotingSession();

            await expect(voting.tallyVotes()).not.to.be.reverted;

            expect(voting.winningProposalID).not.to.equal(0);
            expect(voting.winningProposalID).not.to.equal(3); // Because proposal 3 has less votes than 1 and 2
        });

        it("Should prevent other account from tallying votes", async () => {
            const { voting, registeredVoters } = await loadFixture(deployTallyVotesFixture);

            await voting.endVotingSession();

            await expect(voting.connect(registeredVoters[0]).tallyVotes())
                .to.be.revertedWith("Ownable: caller is not the owner");
        })

        it("Should emit WorkflowStatusChange event", async () => {
            const { voting } = await loadFixture(deployTallyVotesFixture);

            await voting.endVotingSession();

            await expect(voting.tallyVotes())
                .to.emit(voting, "WorkflowStatusChange")
                .withArgs(4, 5);
        });
    })
});
