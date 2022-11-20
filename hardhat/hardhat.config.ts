import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require('dotenv').config();

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      gas: 2100000,
      gasPrice: 8000000000,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY as string],
    }
  },
  gasReporter: {
    enabled: true,
  },
  paths: {
    artifacts: "../frontend/src/artifacts",
  },
};

export default config;
