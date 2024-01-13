const Operator = artifacts.require("Operator");
const Xdc3 = require("xdc3");
const fs = require("fs");
require("dotenv").config();

const PLIADDRESS = process.env.PLIADDRESS;
const pluginNode = process.env.NODEADDRESS;

const xdc3 = new Xdc3(
        new Xdc3.providers.HttpProvider(process.env.RPCURL)
    );
const deployed_private_key = process.env.PRIVATEKEY;
const account = xdc3.eth.accounts.privateKeyToAccount(deployed_private_key);
const owner = account.address.replace(/^xdc/,'0x');

let fname = "deployinfo.txt"
let lname = "truffle.log"

module.exports = async function(deployer) {
    await deployer.deploy(Operator,PLIADDRESS,owner);
    const oracle = Operator.address;

    //await overwrite_deployinfo(owner);
    //await add_deployinfo(oracle);

    await overwrite_deployinfo(oracle);

    await add_log("[1. Oracle Contract Deploy]================================================");
    await add_log("Your Wallet Address     : "+owner);
    await add_log("Node Address            : "+pluginNode);
    await add_log("Oracle Contract Address : "+oracle);
    await add_log("");
    await setAuthorizedSenders(oracle);
    await add_log("===========================================================================");
    await add_log("");
}

async function setAuthorizedSenders(oca) {
    const oracleABI = require("../build/contracts/Operator.json").abi;

    const nonce = await xdc3.eth.getTransactionCount(account.address);
    const gasPrice = await xdc3.eth.getGasPrice();

    const oraclecontract = new xdc3.eth.Contract(oracleABI, oca);
    const tx = {
        nonce: nonce,
        data: oraclecontract.methods.setAuthorizedSenders([pluginNode]).encodeABI(),
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

    let status = await oraclecontract.methods.isAuthorizedSender(pluginNode).call()
    await add_log('isAuthorizedSender('+pluginNode+'): '+status);
}

async function overwrite_deployinfo(value) {
    fs.writeFileSync(fname, value+'\n');
}

async function add_deployinfo(value) {
    fs.appendFileSync(fname, value+'\n');
}

async function add_log(value) {
    fs.appendFileSync(lname, value+'\n');
}
