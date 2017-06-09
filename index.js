#! /usr/bin/env node

const commandLineArgs = require('command-line-args');
const optionDefinitions = [
  {name: 'get', alias: 'g', type: Boolean},
  {name: 'set', alias: 's', type: Boolean},
  {name: 'delete', alias: 'd', type: Boolean},
  {name: 'list', alias: 'l', type: Boolean},
  {name: 'help', alias: 'h', type: Boolean},
  {name: 'key', alias: 'k', type: String},
  {name: 'value', alias: 'v', type: String},
  {name: 'desc', type: String},
  {name: 'notbefore', type: String},
  {name: 'expire', type: String}
];
const options = commandLineArgs(optionDefinitions, {partial: true});

function isEmpty(myObject) {
  for (let key in myObject) {
    if (myObject.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

function removeSuffix(url) {
  return url.substring(0, url.lastIndexOf('/'));
}

// View Help
if (options.help || isEmpty(options)) {
  const help = require('./help');
  console.log(help.usage);
}

let keyVault = require('./keyvault');

// List all Keys
if (options.list) {
  console.log(
    "#######################################\n" +
    "Listing all Secrets from the KeyVault\n" +
    "#######################################");
  keyVault.listSecrets()
    .then(function (result) {
      console.log("Key | Content Type | Enabled | Not Before | Expires");
      result.forEach(function (k, v) {
        console.log(
          "%s | %s | %s | %s | %s", k.id, k.contentType, k.attributes.enabled, k.attributes.notBefore, k.attributes.expires);
      });
      console.log();
    })
    .catch(function (data) {
      console.log(data);
    });
}

// Add a key and value to Azure KeyVault
if (options.get) {
  if (options.key) {
    console.log(
      "###################################\n" +
      "Get a Secret from the KeyVault\n" +
      "###################################");
    keyVault.getSecret(options.key)
      .then(function (secret) {
        console.log("Secret = %s\n\n", secret.value);
      })
      .catch(function (data) {
        console.log("Unable to get secret.\n\n" +
          "Ensure that your secret URL is valid, ex: http://keyvault_name.vault.azure.net/secrets/blah. \n\n" +
          "HINT: Use masterkey -l to view all Keys\n\n");
      });
  } else {
    console.log("Please provide a --key to retrieve.");
  }
}

// Add a key and value to Azure KeyVault
if (options.set) {
  if (options.key && options.value) {
    console.log(
      "##########################\n" +
      "Adding Secret to Azure\n" +
      "##########################");
    keyVault.setSecret(
      options.key,
      options.value,
      options.desc,
      options.notbefore,
      options.expire
    )
      .then(function (secret) {
        console.log("Secret URI = %s", removeSuffix(secret));
        console.log("Secret Absolute URI = %s\n", secret);
      })
      .catch(function (data) {
        console.log(data);
      });
  } else {
    console.log("Please provide a --key and --value");
  }
}

// Delete a key and value from Azure KeyVault
if (options.delete) {
  if (options.key) {
    console.log(
      "###################################\n" +
      "Deleting Secret from the KeyVault\n" +
      "###################################");
    keyVault.deleteSecret(options.key)
      .then(function (secret) {
        console.log("Secret deleted: %s\n\n", secret);
      })
      .catch(function (data) {
        console.log("Unable to delete secret.\n\n" +
          "Ensure that your secret URL is valid, ex: http://keyvault_name.vault.azure.net/secrets/blah. \n\n" +
          "HINT: Use masterkey -l to view all Keys\n\n");
      });
  } else {
    console.log("Please provide a --key to delete");
  }
}