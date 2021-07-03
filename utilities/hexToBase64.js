/*
    This scripts is used to encode/decode 0x address values for the Prysm API
*/

//remove the 0x
let address = "8be02ac52634d68a3bcc9a0d82becef12a7ce081e563b70648a955ee23ed7660525a9ef7f3eabc7f0e72fae37d680b0f";
let base64StringInput = "j4rKr6kAOOYjDm_TCQ7Mh_YLIkZ66JX8f3E7EJ5XsfYQ3N-ilM9eN1n_1vwLsS_c";

let base64String = Buffer.from(address, 'hex').toString('base64');
let encoded = encodeURIComponent(base64String)
console.log("base64 encoding of address",encoded);

let addressOutput = decodeURI(Buffer.from(base64StringInput, 'base64').toString('hex'));
console.log("0x addreess output:",addressOutput)