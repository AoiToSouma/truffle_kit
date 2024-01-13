const Xdc3 = require("xdc3");
const fs = require("fs");
require("dotenv").config();

const PLIADDRESS = process.env.PLIADDRESS;
const pluginNode = process.env.NODEADDRESS;
const TRANSFER_PLI = process.env.TRANSFER_PLI;

let fname = "deployinfo.txt"
let lname = "truffle.log"

const convertTokens = async (n) => {
    b = new Xdc3.utils.BN(Xdc3.utils.toWei(n.toString(), 'ether'));
    return b;
}

main().catch(e => console.error(e));

async function main() {
    const xdc3 = new Xdc3(
        new Xdc3.providers.HttpProvider(process.env.RPCURL)
    );

    const deployed_private_key = process.env.PRIVATEKEY;

    const tokenABI = require("../build/contracts/PliTokenInterface.json").abi;
    const tokenContract = new xdc3.eth.Contract(tokenABI, process.env.PLIADDRESS);

    const tokens = await convertTokens(TRANSFER_PLI);
    console.log("Transfer token : ", tokens.toString(), " wei");
    const account = xdc3.eth.accounts.privateKeyToAccount(deployed_private_key);
    const nonce = await xdc3.eth.getTransactionCount(account.address);
    console.log("The nonce : ", nonce);
    const gasPrice = await xdc3.eth.getGasPrice();
    const gasPrice1 = await xdc3.eth.getGasPrice();

    var cc //Consumer Contract
    await get_deployinfo(2, function(err, line) {
        cc = line;
    });

    const tx1 = {
        nonce: nonce,
        data: tokenContract.methods.transfer(cc, tokens).encodeABI(),
        gasPrice: gasPrice1,
        to: process.env.PLIADDRESS,
        from: account.address,
    };

    tx1["gasLimit"] = 21000000;

    const signed1 = await xdc3.eth.accounts.signTransaction(
        tx1,
        deployed_private_key
    );

    await xdc3.eth
        .sendSignedTransaction(signed1.rawTransaction)
        .once("receipt", console.log);

    await add_log("[4. Transfer PLI to APIConsumer]===========================================");
    await add_log("Success "+ TRANSFER_PLI+"PLI transfer : ");
    await add_log("    "+account.address+" -> "+cc);
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
