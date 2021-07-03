const axios = require('axios').default;
require('dotenv').config();

module.exports = (contractAddress) => new Promise ((resolve,reject) => {
    let url = "https://api.etherscan.io/api?module=contract&action=getabi&address="+contractAddress+"&apikey="+process.env.ETHERSCAN_API_KEY;
    axios.get(url).then(resp => {
        let contractABI = JSON.parse(resp.data.result);
        resolve(contractABI);
    }).catch(err => reject("Etherscan call failed "+err))
})
