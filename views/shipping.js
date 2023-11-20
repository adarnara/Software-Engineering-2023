// test api token: shippo_test_98bdae79698aa6f42363e805399343db9b796058
// let shippo = require('shippo')('shippo_test_98bdae79698aa6f42363e805399343db9b796058');
// const userRepo = require('../Repository/userRepo.js');
// const productRepo = require("../Repository/ProductRepo.js");
const currMemberEmail = "testCart@gmail.com";
const currMemberAddress = "123 Epic Drive";

let emailInput = document.getElementById("username");
emailInput.value = currMemberEmail;

let primaryAddressInput = document.getElementById("address");
primaryAddressInput.value = currMemberAddress;

//`http://localhost:3000/cart/add?user_id=6547e3ad257b40fae701ccc6`