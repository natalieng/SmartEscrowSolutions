# SmartEscrowSolutions
An end-to end prototype of a smart contract escrow solution. It is built out using the IBM Hyperledger Composer to create the private blockchain and hosted on the IBM Cloud. Also contains a REST API to access the blockchain that communicates with a a frontend website using Javascript and HTML. 

## Installation Instructions

**Prerequisite**
- [Docker](https://www.docker.com/) (Version 17.03 or higher)
- [npm](https://www.npmjs.com/)  (v3.x or v5.x)
- [Node](https://nodejs.org/en/) (version 6.x - note version 7 is not supported)
  * to install Node v6.x you can use [nvm](https://davidwalsh.name/nvm)
- [Hyperledger Composer](https://hyperledger.github.io/composer/installing/development-tools.html)

**Step 1: Set up Hyperledger Composer and Hyperledger Fabric**
- Follow steps 1-2 in an IBM github repo [here](https://github.com/IBM/Decentralized-Energy-Composer/edit/master/README.md)

**Step 2: Clone this directory**

**Step 3: Launch a local server**
Install the composer runtime:

```
composer runtime install --card PeerAdmin@hlfv1 --businessNetworkName empty-business-network
```

Deploy the business network:

```
composer network start --card PeerAdmin@hlfv1 --networkAdmin admin --networkAdminEnrollSecret adminpw --archiveFile escrow_v4.bna --file networkadmin.card
```

Import the network administrator identity as a usable business network card:
```
composer card import --file networkadmin.card
```

Check that the business network has been deployed successfully, run the following command to ping the network:
```
composer network ping --card admin@empty-business-network

```

You should be able to view the server at 
`http://localhost:3000/explorer/`

**Step 4: Launch the Website**
Open index.html.


