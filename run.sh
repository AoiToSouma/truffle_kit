#!/bin/bash

while getopts n: flag
do
    case "${flag}" in
        n) network=${OPTARG};;
    esac
done

if [[ $network == apothem ]] || [[ $network == mainnet ]]; then

    rm -rf build/
    cp base_contracts/Operator.sol contracts/
    ./node_modules/.bin/truffle migrate --clean -f 1 --to 1 --network $network

else
    echo "missing correct flag, either '-n apothem' or '-n mainnet' is accepted, one only."
    exit 1
fi
