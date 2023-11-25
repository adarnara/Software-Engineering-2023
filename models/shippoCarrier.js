let shippo = require('shippo')('shippo_test_98bdae79698aa6f42363e805399343db9b796058');

// shippo.carrieraccount.list({ carrier: 'ups' }, function(err, response) {
//     // asynchronously called
//     if (err) {
//         console.error(err);
//     } else console.log(response);
// });

shippo.carrieraccount.create({
    "carrier": "ups",
    "account_id": "reprua_ups", // UPS user ID
    "parameters": {
        "password": "SWE_F2023", // UPS password
        "account_number": "SWEF23", // UPS account number
    },
    "active": true
}, function(err, account) {
    if (err) {
        console.error(err);
    } else console.log(account);
});






// {
//     "carrier":"fedex", 
//     "account_id":"dfsjksfdljlk2349872438907324987234kjhdfskjhdsflkjhdfskjlh3249870y", 
//     "parameters":{"meter":"69420"},
//     "test":true,
//     "active":true
// }, function(err, account) {
//   // asynchronously called
//       if (err) {
//         console.error(err);
//     } else console.log(account);
// }