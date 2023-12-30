const Operator = artifacts.require("Operator");
const Xdc3 = require("xdc3");
const execSync = require('child_process').execSync;
const fs = require("fs");
require("dotenv").config();

//const PLIADDRESS = process.env["PLIADDRESS"];

const PLIADDRESS = process.env.PLIADDRESS;
const pluginNode = process.env.NODEADDRESS;

const xdc3 = new Xdc3(
        new Xdc3.providers.HttpProvider(process.env.RPCURL)
    );
const deployed_private_key = process.env.PRIVATEKEY;
const account = xdc3.eth.accounts.privateKeyToAccount(deployed_private_key);
const owner = account.address.replace(/^xdc/,'0x');

let fname = "deployinfo.txt"


module.exports = async function(deployer) {
    await deployer.deploy(Operator,PLIADDRESS,owner);
    const oracle = Operator.address;

    await overwrite_deployinfo(owner);
    await add_deployinfo(oracle);

    console.log("");
    console.log("======================================================================");
    console.log("Your Wallet Addres      : "+owner);
    console.log("Oracle Contract Address : "+oracle);
    console.log("");
    await setAuthorizedSenders(oracle);

    console.log("======================================================================");
    console.log("");
}

async function setAuthorizedSenders(oca) {
    const oracleABI = require("../build/contracts/Operator.json").abi;

    const nonce = await xdc3.eth.getTransactionCount(account.address);
    const gasPrice = await xdc3.eth.getGasPrice();

    const oraclecontract = new xdc3.eth.Contract(oracleABI, oca);
    const tx = {
        nonce: nonce,
        data: oraclecontract.methods.setAuthorizedSenders([owner]).encodeABI(),
        gasPrice: gasPrice,
        to: oca,
        from: account.address,
    };
    const gasLimit = await xdc3.eth.estimateGas(tx);
    tx["gasLimit"] = gasLimit;

    const signed = await xdc3.eth.accounts.signTransaction(
        tx,
        deployed_private_key
    );
    await xdc3.eth
        .sendSignedTransaction(signed.rawTransaction)

    let status = await oraclecontract.methods.isAuthorizedSender(owner).call()
    console.log('isAuthorizedSender('+owner+'): '+status);
}

async function overwrite_deployinfo(value) {
    fs.writeFileSync(fname, value+'\n');
}

async function add_deployinfo(value) {
    fs.appendFileSync(fname, value+'\n');
}

