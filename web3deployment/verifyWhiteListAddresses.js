const Web3 = require("web3");
const fs = require("fs");
const RLP = require('rlp');

//inputs
<<<<<<< Updated upstream
const nodeUrl = "";
const whiteListContractReference = "0xCb46b40def144e355064d729D0e72DFEA80383a9";
const whiteListContractVerify = "0x0decdaf699f66f87ea41e9a3ccd7d7d1656c4fa8";
=======
const nodeUrl = 'https://mainnet.infura.io';
const whiteListContractReference = "0xCb46b40def144e355064d729D0e72DFEA80383a9";
//const whiteListContractVerify = "0xcc92a4462761134c00b3e16a9bd6ce8bfad387b0";
const whiteListContractVerify = "0x0B4A76f733D98c25F1CD5E771A5D66C31Db69649";


>>>>>>> Stashed changes

let web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));
let solc = require('solc')

const contractPath = "../contracts/";

<<<<<<< Updated upstream


=======
>>>>>>> Stashed changes
let input = {
  "ConversionRatesInterface.sol" : fs.readFileSync(contractPath + 'ConversionRatesInterface.sol', 'utf8'),
  "PermissionGroups.sol" : fs.readFileSync(contractPath + 'PermissionGroups.sol', 'utf8'),
  "ERC20Interface.sol" : fs.readFileSync(contractPath + 'ERC20Interface.sol', 'utf8'),
  "MockERC20.sol" : fs.readFileSync(contractPath + 'mockContracts/MockERC20.sol', 'utf8'),
  "SanityRatesInterface.sol" : fs.readFileSync(contractPath + 'SanityRatesInterface.sol', 'utf8'),
  "ExpectedRateInterface.sol" : fs.readFileSync(contractPath + 'ExpectedRateInterface.sol', 'utf8'),
  "Utils.sol" : fs.readFileSync(contractPath + 'Utils.sol', 'utf8'),
  "FeeBurnerInterface.sol" : fs.readFileSync(contractPath + 'FeeBurnerInterface.sol', 'utf8'),
  "WhiteListInterface.sol" : fs.readFileSync(contractPath + 'WhiteListInterface.sol', 'utf8'),
  "WhiteList.sol" : fs.readFileSync(contractPath + 'WhiteList.sol', 'utf8'),
  "KyberReserveInterface.sol" : fs.readFileSync(contractPath + 'KyberReserveInterface.sol', 'utf8'),
  "Withdrawable.sol" : fs.readFileSync(contractPath + 'Withdrawable.sol', 'utf8'),
};


async function main() {
    if (nodeUrl == '') {
        console.log("nodeUrl not set.");
        console.log("please open script and set URL on public node in let nodeUrl");
        return;
    }

    console.log("starting compilation");
    let solcOutput = await solc.compile({ sources: input }, 1);
//  console.log(solcOutput);
    console.log("finished compilation");

    let actualName = "WhiteList.sol:WhiteList";
    let bytecode = solcOutput.contracts[actualName].bytecode;

    let abi = solcOutput.contracts[actualName].interface;
    let readFromContract = new web3.eth.Contract(JSON.parse(abi));
    readFromContract.options.address = whiteListContractReference;

    let verifyContract = new web3.eth.Contract(JSON.parse(abi));
    verifyContract.options.address = whiteListContractVerify;

    console.log("fetch all whitelisted events from new contract: " + whiteListContractVerify);
    let eventsReference = await readFromContract.getPastEvents("UserCategorySet", {fromBlock: 0, toBlock: 'latest'});


    console.log("fetch all whitelisted events from reference contract: " + whiteListContractReference);
    let eventsVerify = await verifyContract.getPastEvents("UserCategorySet", {fromBlock: 0, toBlock: 'latest'});

//    console.log(eventsReference);

    let addressesReference = [];
    let categoryOld = [];
    let addressesNew = [];
    let categoryNew = [];
    let addressRefString = '';
    let addressNewString = '';

    console.log("iterate events json for both");
    for(let i = 0 ; i < eventsReference.length ; i++ ) {
        addressesReference.push((eventsReference[i].returnValues.user).toLowerCase());
    }

    for(let i = 0 ; i < eventsVerify.length ; i++ ) {
        addressesNew.push((eventsVerify[i].returnValues.user).toLowerCase());
    }

    console.log("sort addresses");
    addressesNew.sort();
    addressesReference.sort();

    console.log()
    console.log()

    console.log('addressesReference')
    console.log(addressesReference)
    for(let i = 0 ; i < addressesReference.length ; i++ ) {
        addressRefString += "\nAddress: " + addressesReference[i] + " cat: " + (await readFromContract.methods.userCategory(addressesReference[i]).call());
    }

    console.log()
    console.log('addressRefString')
    console.log(addressRefString)

    console.log()
    console.log()

    console.log('addressesNew')
    console.log(addressesNew)
    for(let i = 0 ; i < addressesNew.length ; i++ ) {
        addressNewString += "\nAddress: " + addressesNew[i] + " cat: " + (await verifyContract.methods.userCategory(addressesNew[i]).call());
    }

    fs.writeFileSync('./AddressesOld.txt', addressRefString, function(err) {

        if(err) {
            return console.log(err);
        }

        myLog(0, 1, "saved log to: " + './AddressesOld.txt');
    });

    fs.writeFileSync('./AddressesNew.txt', addressNewString, function(err) {
        if(err) {
            return console.log(err);
        }

        myLog(0, 1, "saved log to: " + './AddressesNew.txt');
    });


    for(let i = 0 ; i < eventsReference.length ; i++ ) {
        address = eventsReference[i].returnValues.user;

        whichCategory = await verifyContract.methods.userCategory(address).call();
        if (whichCategory == 0) {
           console.error(i.toString() +  ". user: " + address + " not listed. original category: " + eventsReference[i].returnValues.category);
        } else {
            console.log(i.toString() +  ". user: " + address + " category: " + whichCategory);
        }
    }
}

main();
