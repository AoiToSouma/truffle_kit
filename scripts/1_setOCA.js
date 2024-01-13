const Xdc3 = require("xdc3");
const fs = require("fs");
require("dotenv").config();

setAuthorizedSenders();

async function setAuthorizedSenders() {
    const xdc3 = new Xdc3(
        new Xdc3.providers.HttpProvider(process.env.RPCURL)
    );

    const deployed_private_key = process.env.PRIVATEKEY;
    const owner = process.env.WALLETADDRESS;

    //Oracle ABI & Contract address to pass here
    const oracleABI = require("../build/contracts/Operator.json").abi;

    var oraclecontractAddr;
    await get_deployinfo(0, function(err, line) {
        oraclecontractAddr = line;
    });

    const pluginNode = process.env.NODEADDRESS;

    const oraclecontract = new xdc3.eth.Contract(oracleABI, oraclecontractAddr);

    const account = xdc3.eth.accounts.privateKeyToAccount(deployed_private_key);
    const nonce = await xdc3.eth.getTransactionCount(account.address);
    const gasPrice = await xdc3.eth.getGasPrice();

    const tx = {
        nonce: nonce,
        data: oraclecontract.methods.setAuthorizedSenders([pluginNode]).encodeABI(),
        gasPrice: gasPrice,
        to: oraclecontractAddr,
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

async function get_deployinfo(line_no, callback) {
    var data = fs.readFileSync("deployinfo.txt", 'utf8');
    var lines = data.split("\n");

    if (+line_no > lines.length) {
        throw new Error('File end reached without finding line');
    }

    callback(null, lines[+line_no]);

}
