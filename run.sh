#!/bin/bash

# Set Colour Vars
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

FUNC_DEPLOY_ORACLE(){
    rm -rf build/
    rm -f contracts/*
    cp base_contracts/Operator.sol contracts/
    sed -e 's/version:.*/version: "0.7.6",/' -i truffle-config.js
    ./node_modules/.bin/truffle migrate --clean -f 1 --to 1 --network $network
}

FUNC_CREATE_JOB(){
    ./jobs/create_job.sh
}

FUNC_DEPLOY_APICONSUMER(){
    rm -rf build/
    rm -f contracts/*
    cp base_contracts/APIConsumer.sol contracts/
    OCA=$(sed -n 1p deployinfo.txt)
    JOBID=$(sed -n 2p deployinfo.txt)
    sed -e "s/<PLI_TOKEN>/${PLI_TOKEN}/" -e "s/<OCA>/${OCA}/" -e "s/<JOBID>/${JOBID}/" -i contracts/APIConsumer.sol
    sed -e 's/version:.*/version: "0.8.7",/' -i truffle-config.js
    ./node_modules/.bin/truffle migrate --clean -f 2 --to 2 --network $network
}

FUNC_PLI_TRANSFER(){
    node scripts/2_pli_transfer.js
}

FUNC_REQUESTDATA(){
    node scripts/3_requestVolumeData.js
}

while getopts n: flag
do
    case "${flag}" in
        n) network=${OPTARG};;
    esac
done

if [[ $network == apothem ]] || [[ $network == mainnet ]]; then
    if [[ $network == apothem ]]; then
        PLI_TOKEN='0x33f4212b027E22aF7e6BA21Fc572843C0D701CD1'
    else
        PLI_TOKEN='0xff7412ea7c8445c46a8254dfb557ac1e48094391'
    fi

    rm -f truffle.log
    touch truffle.log

    FUNC_DEPLOY_ORACLE;
    FUNC_CREATE_JOB;
    FUNC_DEPLOY_APICONSUMER;
    FUNC_PLI_TRANSFER;
    FUNC_REQUESTDATA;

    exe_date=$(date '+%Y%m%d_%H%M%S')
    mv truffle.log truffle_${exe_date}.log

    echo
    echo
    echo -e "${RED}========================================================"
    echo -e "Processing has finished..."
    echo -e "Check the logs with the following command:"
    echo
    echo -e "${GREEN}cat truffle_${exe_date}.log"
    echo
    echo -e "${RED}========================================================${NC}"
    echo

else
    echo "missing correct flag, either '-n apothem' or '-n mainnet' is accepted, one only."
    exit 1
fi
