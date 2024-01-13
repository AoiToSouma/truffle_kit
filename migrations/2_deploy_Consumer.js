const APIConsumer = artifacts.require("APIConsumer");
const Xdc3 = require("xdc3");
const execSync = require('child_process').execSync;
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
    await deployer.deploy(APIConsumer);
    const consumer = APIConsumer.address

    await add_deployinfo(consumer);

    var oca;
    var jobid;

    await get_deployinfo(0, function(err, line) {
        oca = line;
    });
    await get_deployinfo(1, function(err, line) {
        jobid = line;
    });

    await add_log("[3. APIConsumer Contract Deploy]===========================================");
    await add_log("Oracle Contract Address      : "+oca);
    await add_log("JOBID                        : "+jobid);
    await add_log("APIConsumer Contract Address : "+consumer);
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

async function add_deployinfo(value) {
    fs.appendFileSync(fname, value+'\n');
}

async function add_log(value) {
    fs.appendFileSync(lname, value+'\n');
}
