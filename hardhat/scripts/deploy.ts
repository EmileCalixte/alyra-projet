import { ethers } from "hardhat";

export const getVotingFactory = async () => {
    return await ethers.getContractFactory("Voting");
}

async function main() {
    const Voting = await getVotingFactory();
    const voting = await Voting.deploy();

    await voting.deployed();

    console.log(`Voting deployed to ${voting.address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
