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

    describe("Register Voter", async () => {
        it("Should register a voter", async () => {
            const { voting, otherAccounts } = await loadFixture(deployFixture);

            expect(await voting.isVoter(otherAccounts[0].address)).to.equal(false);

            await voting.registerVoter(otherAccounts[0].address);

            expect(await voting.isVoter(otherAccounts[0].address)).to.equal(true);
        });

        it("Should prevent other account to register a voter", async () => {
            const { voting, otherAccounts } = await loadFixture(deployFixture);

            expect(await voting.isVoter(otherAccounts[0].address)).to.equal(false);

            await expect(voting.connect(otherAccounts[0]).registerVoter(otherAccounts[0].address))
                .to.be.revertedWith("Ownable: caller is not the owner");

            expect(await voting.isVoter(otherAccounts[0].address)).to.equal(false);
        });

        it("Should prevent other account to register a voter even if it's a registered voter", async () => {
            const { voting, otherAccounts } = await loadFixture(deployFixture);

            await voting.registerVoter(otherAccounts[0].address);

            await expect(voting.connect(otherAccounts[0]).registerVoter(otherAccounts[1].address))
                .to.be.revertedWith("Ownable: caller is not the owner");

            expect(await voting.isVoter(otherAccounts[1].address)).to.equal(false);
        });

        it("Should emit VoterRegistered event", async () => {
            const { voting, otherAccounts } = await loadFixture(deployFixture);

            await expect(voting.registerVoter(otherAccounts[0].address))
                .to.emit(voting, "VoterRegistered")
                .withArgs(otherAccounts[0].address);
        });

        it("Should prevent to register a voter if Registering Voters phase is closed", async () => {
            const { voting, otherAccounts } = await loadFixture(deployFixture);

            // End registering voters phase by starting the next phase
            await voting.startProposalsRegistration();

            await expect(voting.registerVoter(otherAccounts[0].address))
                .to.be.revertedWith("You can do this only during the voter registration phase");

            expect(await voting.isVoter(otherAccounts[0].address)).to.equal(false);
        });
    });

    describe("Register proposal", async () => {
        const deployRegisterProposalFixture = async () => {
            const { voting, owner, otherAccounts } = await deployFixture();

            const registeredVoters = otherAccounts.slice(0, 5);
            const notRegisteredAccounts = otherAccounts.slice(5, otherAccounts.length);

            for (const voter of registeredVoters) {
                await voting.registerVoter(voter.address);
            }

            return {voting, owner, registeredVoters, notRegisteredAccounts};
        }

        const testProposalDescription = "Test proposal description";

        it("Should register a proposal from a registered voter", async () => {
            const { voting, registeredVoters } = await loadFixture(deployRegisterProposalFixture);

            await voting.startProposalsRegistration();

            expect(await voting.getProposalCount()).to.equal(0);

            await voting.connect(registeredVoters[0]).submitProposal(testProposalDescription);

            expect(await voting.getProposalCount()).to.equal(1);

            expect((await voting.proposals(0)).description).to.equal(testProposalDescription);
        });

        it("Should revert if a proposal is submitted by an account which is not registered as a voter", async () => {
            const { voting, notRegisteredAccounts } = await loadFixture(deployRegisterProposalFixture);

            await voting.startProposalsRegistration();

            expect(await voting.getProposalCount()).to.equal(0);

            await expect(voting.connect(notRegisteredAccounts[0]).submitProposal(testProposalDescription))
                .to.be.revertedWith("You must be registered to do this");

            expect(await voting.getProposalCount()).to.equal(0);
        });

        it("Should revert only if current workflow status is not ProposalsRegistrationStarted", async () => {
            const { voting, registeredVoters } = await loadFixture(deployRegisterProposalFixture);

            await expect(voting.connect(registeredVoters[0]).submitProposal(testProposalDescription))
                .to.be.revertedWith("You can do this only during the proposals registration phase");

            await voting.startProposalsRegistration();

            await expect(voting.connect(registeredVoters[0]).submitProposal(testProposalDescription))
                .not.to.be.reverted;

            await voting.endProposalsRegistration();

            await expect(voting.connect(registeredVoters[0]).submitProposal(testProposalDescription))
                .to.be.revertedWith("You can do this only during the proposals registration phase");
        });

        it("Should revert if proposals registration phase is closed without a submitted proposal", async () => {
            const { voting } = await loadFixture(deployRegisterProposalFixture);

            await voting.startProposalsRegistration();

            await expect(voting.endProposalsRegistration())
                .to.be.revertedWith("No proposals have been submitted");
        });
    });
});
