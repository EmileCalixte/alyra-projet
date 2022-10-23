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
});
