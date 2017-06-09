module.exports = function () {
  "use strict";

  let KeyVault = require('azure-keyvault');
  let AuthenticationContext = require('adal-node').AuthenticationContext;

  let secretconfig = require('./secretconfig');
  let clientId = secretconfig.clientId;
  let clientSecret = secretconfig.clientSecret;
  let vaultUri = secretconfig.vaultUri;

  // Authenticator - retrieves the access token
  let authenticator = function (challenge, callback) {
    // Create a new authentication context. 
    let context = new AuthenticationContext(challenge.authorization);
    // Use the context to acquire an authentication token. 
    return context.acquireTokenWithClientCredentials(challenge.resource, clientId, clientSecret,
      function (err, tokenResponse) {
        if (err) throw err;
        // Calculate the value to be set in the request's Authorization header and resume the call.
        let authorizationValue = tokenResponse.tokenType + ' ' + tokenResponse.accessToken;
        return callback(null, authorizationValue);
      });
  };

  let credentials = new KeyVault.KeyVaultCredentials(authenticator);
  let client = new KeyVault.KeyVaultClient(credentials);

  function setSecret(key, value, description, notBefore, expires) {
    return new Promise(function (onSuccess, onFailure) {
      console.log(
        "Vault URI = %s\n" +
        "Key = %s\n" +
        "Value = %s\n" +
        "Content Type = %s\n" +
        "Not Before = %s\n" +
        "Expire On = %s", vaultUri, key, value, description, notBefore || null, expires || null);
      client.setSecret(vaultUri, key, value, {
        contentType: description,
        secretAttributes: {
          notBefore: notBefore || null,
          expires: expires || null
        },
      }, function (err, secretBundle) {
        if (err) {
          // console.log(err);
          onFailure("Unable to save secret.");
        } else {
          onSuccess(secretBundle.id);
        }
      });
    });
  }

  function deleteSecret(key) {
    return new Promise(function (onSuccess, onFailure) {
      console.log(
        "Vault URI = %s\n" +
        "Key = %s\n", vaultUri, key);

      function getKeyName(key) {
        return key.substring(key.lastIndexOf('/') + 1);
      };

      client.deleteSecret(vaultUri, getKeyName(key), function (err, secretBundle) {
        if (err) {
          // console.log(err);
          onFailure("Unable to delete secret.");
        } else {
          onSuccess(secretBundle.id);
        }
      });
    });
  }

  function getSecret(key) {
    return new Promise(function (onSuccess, onFailure) {
      console.log("Key = %s", key);
      client.getSecret(key, function (err, secretBundle) {
        if (err) {
          // console.log(err);
          onFailure("Unable to get secret.");
        } else {
          onSuccess(secretBundle);
        }
      });
    });
  }

  function listSecrets() {
    return new Promise(function (onSuccess, onFailure) {
      client.getSecrets(vaultUri, function (err, result) {
        if (err) {
          onFailure("Unable to list secrets.");
        } else {
          onSuccess(result);
        }
      });
    });
  }

  return {
    getSecret: getSecret,
    setSecret: setSecret,
    deleteSecret: deleteSecret,
    listSecrets: listSecrets
  }
}();