## Problem
Usually a Node.js application has a configuration JSON that contains various 
secrets (for example, connection strings, app secrets, etc.) in clear text. 
Checking-in these secrets in a GIT (or any other) repository is a bad idea.

## Solution
By using Microsoft Azure KeyVault & MasterKey CLI you can safely store your 
key/value without checking in the values in clear text in your GIT repository. 

The core idea is to use a template like so:

```
{
  "server": {
    "not_a_secret": {
      "key1": "value1",
      "key2": "value2"
    },
    "secrets":{
      "masterkey_db_connection": "http://secret_key_name_url",
      "masterkey_facebook_client_id":"http://secret_facebook_client_id_url",
      "masterkey_facebook_client_secret":"http://secret_facebook_client_id_url"
    }
  }
}
```

Anything that is prefixed by `masterkey` should contain a valid Azure KeyVault URL. 
This URL will be replaced by the actual value at runtime. You can easily use this module 
with a configuration management package like [config](https://www.npmjs.com/package/config).

## Detailed Setup

### Step 1
Create your Key Vault in Azure

### Step 2
Applications that use a key vault must authenticate by using a token from 
Azure Active Directory. To do this, the owner of the application must first 
register the application in their Azure Active Directory. At the end of registration, 
the application owner gets the following values:

1. An Application ID (also known as a Client ID)
2. Authentication Key (also known as the shared secret) 

[Get Started with KeyVault](https://docs.microsoft.com/en-us/azure/key-vault/key-vault-get-started)

### Step 3
Create Access Policy for the Application
Feed your Key Vault details

### Documentation
1. [Azure Key Vault](https://azure.microsoft.com/en-in/services/key-vault/)  
2. [Step - by - Step](https://blogs.technet.microsoft.com/kv/2015/06/02/azure-key-vault-step-by-step/)  
3. [setSecret](http://azure.github.io/azure-sdk-for-node/azure-keyvault/latest/KeyVaultClient.html#setSecret)  
