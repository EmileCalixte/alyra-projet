import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      gas: 2100000,
      gasPrice: 8000000000,
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
