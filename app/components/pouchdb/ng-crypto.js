var app = angular.module('crypto', []);

app.factory('crypto', [function () {

    var password = '';
    var options = {v: 1, iter: 1001, ks: 256, ts: 64, mode: "ccm", adata: "", cipher: "aes"};

    return {
        setPassword: function (newPassword) {
            password = newPassword;
        },
        clearPassword: function () {
            password = '';
        },
        encrypt: function (text) {
            console.log('encrypt', password, text, options);
            
            return sjcl.encrypt(password, text, options);
        },
        decrypt: function (text) {
            return sjcl.decrypt(password, text, options);
        }
    };
}]);
