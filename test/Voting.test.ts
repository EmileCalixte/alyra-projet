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

            await voting.addVoter(owner.address);

            expect((await voting.getVoter(owner.address)).isRegistered).to.equal(true);
        });

        it("Should prevent other account to add a voter", async () => {
            const { voting, owner, otherAccounts } = await loadFixture(deployFixture);

            await voting.addVoter(owner.address);

            await expect(voting.connect(otherAccounts[0]).addVoter(otherAccounts[0].address))
                .to.be.revertedWith("Ownable: caller is not the owner");

            expect((await voting.getVoter(otherAccounts[0].address)).isRegistered).to.equal(false);
        });

        it("Should prevent other account to add a voter even if it's a registered voter", async () => {
            const { voting, owner, otherAccounts } = await loadFixture(deployFixture);

            await voting.addVoter(owner.address);
            await voting.addVoter(otherAccounts[0].address);

            await expect(voting.connect(otherAccounts[0]).addVoter(otherAccounts[1].address))
                .to.be.revertedWith("Ownable: caller is not the owner");

            expect((await voting.getVoter(otherAccounts[1].address)).isRegistered).to.equal(false);
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

            await expect(voting.addVoter(otherAccounts[0].address))
                .to.be.revertedWith("Already registered");
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
});
