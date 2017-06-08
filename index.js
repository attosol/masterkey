#! /usr/bin/env node

const commandLineArgs = require('command-line-args');
const optionDefinitions = [
  {name: 'listall', type: Boolean},
  {name: 'list', alias: 'l', type: Boolean},
  {name: 'add', alias: 'a', type: Boolean},
  {name: 'delete', alias: 'd', type: Boolean},
  {name: 'update', alias: 'u', type: Boolean},
  {name: 'help', alias: 'h', type: Boolean},
  {name: 'key', alias: 'k', type: String},
  {name: 'value', alias: 'v', type: String}
];
const options = commandLineArgs(optionDefinitions, {partial: true});
const getUsage = require('command-line-usage');
const sections = [
  {
    header: 'MasterKey',
    content: 'Secures your values in [italic]{Microsoft Azure KeyVault}.'
  }, {
    header: 'Options',
    optionList: [
      {
        name: 'listall',
        description: 'List all keys from Azure KeyVault.'
      },
      {
        name: 'list, -l',
        description: 'Retrieve value of a key. Use with --key or -k'
      },
      {
        name: 'add, -a',
        description: 'Add the key/value pair to Azure KeyVault. Use with --key or -k & --value or -v'
      },
      {
        name: 'delete, -d',
        description: 'Delete the key/value pair from Azure KeyVault. Use with --key or -k'
      },
      {
        name: 'update, -u',
        description: 'Update the key/value pair in Azure KeyVault. Use with --key or -k & --value or -v'
      },
      {
        name: 'help, -h',
        description: 'Print this usage guide.'
      }
    ]
  }
];
const usage = getUsage(sections);

function isEmpty(myObject) {
  for(var key in myObject) {
    if (myObject.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

// View Help
if (options.help || isEmpty(options)) {
  console.log(usage);
}

// List all Keys
if (options.listall) {
  console.log("List all keys");
}

// Add a key and value to Azure KeyVault
if (options.list) {
  if (options.key) {
    console.log("List:", options.key);
  } else {
    console.log("Please provide a --key to list");
  }
}

// Add a key and value to Azure KeyVault
if (options.add) {
  if (options.key && options.value) {
    console.log("Add:", options.key, options.value);
  } else {
    console.log("Please provide a --key and --value");
  }
}

// Update a key and value to Azure KeyVault
if (options.update) {
  if (options.key && options.value) {
    console.log("Update:", options.key, options.value);
  } else {
    console.log("Please provide a --key and --value");
  }
}

// Delete a key and value from Azure KeyVault
if (options.delete) {
  if (options.key) {
    console.log("Delete:", options.key);
  } else {
    console.log("Please provide a --key to delete");
  }
}