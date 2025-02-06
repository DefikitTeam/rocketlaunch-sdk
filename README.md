# Rocket Launch SDK

This SDK allows you to interact with RocketLaunch smart contracts. It provides functionalities to create tokens, launch pools, claim tokens, buy tokens, and sell tokens.


## Installation

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd rocket_launch_sdk
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

## Usage

### Building the Project

To build the project, run:
```sh
npm run build
```
### Example Usage

Here is an example of how to use the SDK:

```
import { RocketLaunchSdk } from './src/clients/rocketLaunchSdk';

const sdk = new RocketLaunchSdk('your-private-key');

// Create a new token
sdk.createToken('TokenName', 'TKN', 18, BigInt(1000000))
    .then(receipt => console.log('Token created:', receipt))
    .catch(error => console.error('Error creating token:', error));

// Launch a new pool
const launchPoolInputData = {
    name: 'PoolName',
    symbol: 'PLN',
    decimals: 18,
    totalSupply: BigInt(1000000),
    fixedCapETH: BigInt(100),
    tokenForAirdrop: BigInt(10000),
    tokenForFarm: BigInt(20000),
    tokenForSale: BigInt(50000),
    tokenForAddLP: BigInt(20000),
    tokenPerPurchase: BigInt(100),
    maxRepeatPurchase: BigInt(10),
    startTime: BigInt(Date.now()),
    minDurationSell: BigInt(3600),
    maxDurationSell: BigInt(7200),
    metadata: 'metadata',
    numberBatch: BigInt(1),
    maxAmountETH: BigInt(10),
    referrer: '0xYourReferrerAddress'
};

sdk.launchPool(launchPoolInputData)
    .then(receipt => console.log('Pool launched:', receipt))
    .catch(error => console.error('Error launching pool:', error));
```
