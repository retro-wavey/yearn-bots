const Web3 = require('web3');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const web3 = require('./web3.js')();
const get_abi = require('./utilities/get_abi.js');
const email_alert = require('./utilities/email_alert');
let vaultBalance = 0;

module.exports = () => new Promise ((resolve,reject) => {
    let vaultAbi = JSON.parse(fs.readFileSync(path.normalize(path.dirname(require.main.filename)+'/contract_abis/v2vault.json')));
    let tokenAbi = JSON.parse(fs.readFileSync(path.normalize(path.dirname(require.main.filename)+'/contract_abis/token.json')));

    let vaultAddress = "0xa5cA62D95D24A4a350983D5B8ac4EB8638887396";
    let vault = new web3.eth.Contract(vaultAbi, vaultAddress);
    let susd = new web3.eth.Contract(tokenAbi, "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51");

    susd.methods.balanceOf(vaultAddress).call().then(balance=>{
        let bal = balance/1e18;
        resolve(bal);
    }).catch(err => reject(err))
})