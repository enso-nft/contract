# Enso NFT Smart Contract

This repository contains the Solidity smart contract of Enso, a detailed list of features and 
deployment instructions. 

We strongly believe in giving back to the community and the NFT space as a whole.
Advancements in smart contracts can only be made through open collaboration.

When we started our journey with Enso, there was no single comprehensive resource for building all 
the features that have made it into this smart contract.
We hope that this repository can serve as a building block and guideline for future projects.

*[Enso](https://enso.ltd)*

*Don´t close the circle*.

## Features

This smart contract is based on the ERC721 token standard and it includes the ERC721Enumerable, 
ERC721Royalty and ERC721Burnable extensions. The contract governance is implemented via the Ownable 
policy. <br>
For more information about these standards visit the 
[Openzeppelin](https://openzeppelin.com/) [documentation](https://docs.openzeppelin.com/contracts/).

Additionally, we have implemented the following features: 

* **Withdrawal** <br>
  The contract owner can withdraw the mint revenue to any address.
* **Whitelist** <br>
  The whitelist is customizable with a discounted price, separate launch and an arbitrary amount of 
  spots per address.
* **Free Mint List** <br>
  Similar to the whitelist, one can assign an arbitrary amount of free mint spots to certain addresses.
  The free mint launch is aligned with the whitelist launch.
* **Batch Functions** <br>
  A variety of batch functions are included for the mint types and for other purposes like 
  setting the whitelist.
* **Token Enumeration** <br>
  The ERC721Enumerable extension provides methods to build further enumeration utilities like 
  listing all token Ids and tokens held by any address. The implementation is inspired by [BCG](https://babychimpgang.com/)'s [contract](https://ftmscan.com/address/0x4c6dcdd6d6C6432Ed02B468501C019fca1fe17e2#code).
* **Lowering of Maximum Collectible Supply** <br>
  One can lower the maximum collectible supply, but not increase it.
* **Adjustment of Whitelist and Public Mint Price** <br>
  As long as the mint has not concluded, the whitelist price and the public price may be adjusted.
* **Metadata Change & Lock** <br>
  One can change various metadata items in the contract after launch. These include the name, 
  symbol, baseURI and contractURI. This functionality may be irreversibly locked. Please read the 
  disclaimer below on usage and risk.

All of these features are extensively tested in the included test suite with around 1300 lines of code.

**Disclaimer:** 
Note that some of the features are very powerful in what they grant to the contract owner. Notably, 
the ability to change the metadata has proven to be a big risk factor in other projects and to their 
community members. The use of each and every functionality must be openly communicated. <br>

For example, the metadata can be changed, but one should only do so before any minting is made 
publicly available. To secure the metadata from further tampering during and after the mint, there 
is a metadata lock which irrevocably locks it to its state. The engagement of the metadata lock can
be proven via the blockchain transactions.

## Getting Started 

Make sure to install and use node version **16.14.2**. 

### Install the Dependencies

```sh
npm i
```

### Run the Test Suite

```sh
npx hardhat test
```

### Deploy the Smart Contract

Create a `.env` file in the root of the repository with the following structure.

```sh
SCAN_API_KEY="<SCAN_API_KEY>"         # Fantomscan / Etherscan or similar api key
PRIVATE_KEY="<PRIVATE_KEY>"           # Private key of contract owner
```

Fill in the blanks and be careful not to leak them. The `.env` file is present in `.gitignore`.
If you are uncomfortable in having these values in the repository you may also provide them via 
environment variables.

Check the `hardhat.config.ts` file that your desired networks are defined. For Enso these are Fantom
related. 

Next, adjust the deployment script variables in `scripts/test-deploy.ts` to your liking. The contract
variables provided are designed for test networks, but can easily be adjusted for production networks.
Ideally, one would create a separate script called `scripts/prod-deploy.ts`.

Finally, the deployment can be made via:

```sh
npx hardhat run --network "<YOUR_DESIRED_NETWORK>" "scripts/<YOUR_DESIRED_SCRIPT>"
```

### Verify the Smart Contract

After deploying the smart contract it is important to verify it. This discloses and links the 
source code of the deployed smart contract. The verification guarantees to any third party that 
nothing malicious is going on. 

For this, we provide a script `scripts/test-verify.ts` which is pre-filled with the constructor 
variables of `scripts/test-deploy.ts`. Adjust as necessary and provide the deployed contract 
address.

## Further Improvements

The smart contract itself could be further improved by separating the functions into individual 
abstract contracts. Initial steps have been made by providing internally callable functions as 
private variable wrappers.

The provided testing suite is not fully orthogonal, that is some tests overlap in their testing 
responsibility. Such tests should be further modularized.

## License

This repository is licensed under the *MIT License* and a copy is included. 