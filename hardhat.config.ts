import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    "test-fantom": {
      url: "https://rpc.ftm.tools/",
      accounts: process.env.PRIVATE_KEY !== undefined
        ? [process.env.PRIVATE_KEY]
        : [],
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.SCAN_API_KEY,
  },
};

export default config;
