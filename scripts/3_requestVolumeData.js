const Xdc3 = require("xdc3");
const fs = require("fs");
require("dotenv").config();

let fname = "deployinfo.txt"
let lname = "truffle.log"

main().catch(e => console.error(e));

async function main() {

    const xdc3 = new Xdc3(
        new Xdc3.providers.HttpProvider(process.env.RPCURL)
    );
    const deployed_private_key = process.env.PRIVATEKEY;
    const requestorABI = require("../build/contracts/APIConsumer.json").abi;
    var requestorcontractAddr;
    await get_deployinfo(2, function(err, line) {
        requestorcontractAddr = line;
    });

    const requestContract = new xdc3.eth.Contract(requestorABI, requestorcontractAddr);

    const account = xdc3.eth.accounts.privateKeyToAccount(deployed_private_key);
    const nonce = await xdc3.eth.getTransactionCount(account.address);
    const gasPrice = await xdc3.eth.getGasPrice();

    const tx = {
        nonce: nonce,
        data: requestContract.methods.requestVolumeData().encodeABI(),
        gasPrice: gasPrice,
        to: requestorcontractAddr,   // Requestor contract address
        from: account.address,
    };

    const gasLimit = await xdc3.eth.estimateGas(tx);
    tx["gasLimit"] = gasLimit;

    const signed = await xdc3.eth.accounts.signTransaction(
        tx,
        deployed_private_key
    );

    const txt = await xdc3.eth
        .sendSignedTransaction(signed.rawTransaction)
        .once("receipt", console.log);
    await add_log("[5. requestData]===========================================================");
    await add_log(JSON.stringify(txt));
    await add_log("===========================================================================");
    await add_log("");
}


async function get_deployinfo(line_no, callback) {
    var data = fs.readFileSync(fname, 'utf8');
    var lines = data.split("\n");

    if (+line_no > lines.length) {
        throw new Error('File end reached without finding line');
    }

    callback(null, lines[+line_no]);
}

async function add_log(value) {
    fs.appendFileSync(lname, value+'\n');
}
