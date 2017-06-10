#! /usr/bin/env node

const commandLineArgs = require('command-line-args');
const optionDefinitions = [
  {name: 'get', alias: 'g', type: String},
  {name: 'set', alias: 's', type: Boolean},
  {name: 'delete', alias: 'd', type: String},
  {name: 'list', alias: 'l', type: Boolean},
  {name: 'help', alias: 'h', type: Boolean},
  {name: 'key', alias: 'k', type: String},
  {name: 'value', alias: 'v', type: String},
  {name: 'desc', type: String},
  {name: 'notbefore', type: String},
  {name: 'expire', type: String},
  {name: 'transform', alias: 't', type: String},
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
  if (options.get) {
    console.log(
      "###################################\n" +
      "Get a Secret from the KeyVault\n" +
      "###################################");
    keyVault.getSecret(options.get)
      .then(function (secret) {
        console.log("Secret = %s\n\n", secret.value);
      })
      .catch(function (data) {
        console.log("Unable to get secret.\n\n" +
          "Ensure that your secret URL is valid, ex: http://keyvault_name.vault.azure.net/secrets/blah. \n\n" +
          "HINT: Use masterkey -l to view all Keys\n\n");
      });
  } else {
    console.log("Please provide the KeyVault URL from which secret is to be retrieved.");
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
  if (options.delete) {
    console.log(
      "###################################\n" +
      "Deleting Secret from the KeyVault\n" +
      "###################################");
    keyVault.deleteSecret(options.delete)
      .then(function (secret) {
        console.log("Secret deleted: %s\n\n", secret);
      })
      .catch(function (data) {
        console.log("Unable to delete secret.\n\n" +
          "Ensure that your secret URL is valid, ex: http://keyvault_name.vault.azure.net/secrets/blah. \n\n" +
          "HINT: Use masterkey -l to view all Keys\n\n");
      });
  } else {
    console.log("Please provide the KeyVault URL whose secret is to be deleted.");
  }
}

// Transform all secret URLs to actual secrets in the template and create a regular file
if (options.transform) {
  let fileName = options.transform.substring(options.transform.lastIndexOf('/') + 1);
  let split = fileName.split('.');
  let fileNameFirst = split[0];
  let fileNameSecond = split[1];
  let fileNameLast = split[2];

  if (fileNameSecond === "template") {
    let fs = require('fs');
    fs.readFile(options.transform, 'utf8', function (err, data) {
      if (err) {
        return console.log("Unable to find the file. Please check your path.\n\n");
      } else {
        let parsedConfig = JSON.parse(data);

        // Recursive function for JSON
        function processKey(key, callback) {
          callback(key);

          for (let child in parsedConfig[key]) {
            processKey(child, function (val) {
              console.log(val);
            });
          }
        };

        // list all keys in json
        for (let key in parsedConfig) {
          processKey(key, function (val) {
            console.log(val);
          });
        }
      }
    });
  } else {
    console.log("Please provide a valid template file name. Ex: ./dev.template.json\n\n");
  }
}