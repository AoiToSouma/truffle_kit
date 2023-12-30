// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;


import "@goplugin/contracts2_3/src/v0.8/PluginClient.sol";
import "@goplugin/contracts2_3/src/v0.8/ConfirmedOwner.sol";

/**
* THIS IS AN EXAMPLE CONTRACT WHICH USES HARDCODED VALUES FOR CLARITY.
* THIS EXAMPLE USES UN-AUDITED CODE.
* DO NOT USE THIS CODE IN PRODUCTION.
*/


contract APIConsumer is PluginClient, ConfirmedOwner {
using Plugin for Plugin.Request;


uint256 public volume;
bytes32 private jobId;
uint256 private fee;


event RequestVolume(bytes32 indexed requestId, uint256 volume);


/**
* @notice Initialize the pli token and target oracle
*
* Details:
* A. Pli Token for Mainnt: 0xff7412ea7c8445c46a8254dfb557ac1e48094391
* B. Oracle: [Copy paste the Oracle Contract Address, which you deployed as first step in this page] (Plugin DevRel)
* C. jobId: <job ID>
*
*/
constructor(address _pli,address _oracle,bytes32 _jobid) ConfirmedOwner(msg.sender) {

setPluginToken(_pli);//Pli address as mentioned in ‘A’
setPluginOracle(_oracle);//Oracle address
jobId = _jobid;//Job ID as stored in ‘C’ JOB SUBMISSION
fee = (0.001 * 1000000000000000000) / 10;
}


/**
* Create a Plugin request to retrieve API response, find the target
* data, then multiply by 1000000000000000000 (to remove decimal places from data).
*/
function requestVolumeData() public returns (bytes32 requestId) {
Plugin.Request memory req = buildPluginRequest(
jobId,
address(this),
this.fulfill.selector
);


// Multiply the result by 1000000000000000000 to remove decimals
int256 timesAmount = 10 ** 18;
req.addInt("times", timesAmount);


// Sends the request
return sendPluginRequest(req, fee);
}


/**
* Receive the response in the form of uint256
*/
function fulfill(
bytes32 _requestId,
uint256 _volume
) public recordPluginFulfillment(_requestId) {
emit RequestVolume(_requestId, _volume);
volume = _volume;
}


/**
* Allow withdraw of Link tokens from the contract
*/
function withdrawPli() public onlyOwner {
PliTokenInterface pli = PliTokenInterface(PluginTokenAddress());
require(
pli.transfer(msg.sender, pli.balanceOf(address(this))),
"Unable to transfer"
);
}
}
