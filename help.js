module.exports = function () {
  "use strict";

  const getUsage = require('command-line-usage');
  const sections = [
    {
      header: 'MasterKey',
      content: 'Secure your secrets in [italic]{Microsoft Azure KeyVault}.'
    }, {
      header: 'Options',
      optionList: [
        {
          name: 'list, -l',
          description: 'List all secrets'
        },
        {
          name: 'set, -s',
          description: 'Add or update the key/value pair in Azure KeyVault.'
        },
        {
          name: 'get, -g',
          description: 'Get the value based on key from Azure KeyVault.'
        },
        {
          name: 'delete, -d',
          description: 'Delete the key/value pair from Azure KeyVault.'
        },
        {
          name: 'desc',
          description: 'A description that will be saved in the KeyVault along with the key.'
        },
        {
          name: 'help, -h',
          description: 'Print this usage guide.'
        },
        {
          name: 'key, -k',
          description: 'Name of the key in Key Vault'
        },
        {
          name: 'value, -v',
          description: 'The secret value stored in Key Vault'
        },
        {
          name: 'notbefore',
          description: 'The value will not be active before a specific time'
        },
        {
          name: 'expire',
          description: 'The value after which the key will expire'
        },
        {
          name: 'enabled',
          description: 'Set the Key as enabled or disabled'
        },
      ]
    }
  ];
  const usage = getUsage(sections);

  return {
    usage: usage
  }
}();