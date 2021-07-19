const Web3 = require('web3');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const web3 = require('./web3.js')();
const get_abi = require('./utilities/get_abi.js');
const email_alert = require('./utilities/email_alert');

module.exports = () => new Promise ((resolve,reject) => {
    let vaultAbi = JSON.parse(fs.readFileSync(path.normalize(path.dirname(require.main.filename)+'/contract_abis/v2vault.json')));
    let tokenAbi = JSON.parse(fs.readFileSync(path.normalize(path.dirname(require.main.filename)+'/contract_abis/token.json')));

    let vaultAddress = "0xF29AE508698bDeF169B89834F76704C3B205aedf";
    let vault = new web3.eth.Contract(vaultAbi, vaultAddress);
    let snx = new web3.eth.Contract(tokenAbi, "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f");

    snx.methods.balanceOf(vaultAddress).call().then(balance=>{
        let bal = balance/1e18;
        resolve(bal);
    }).catch(err => reject(err))
})