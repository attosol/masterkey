Node.js developers often use a package like [config](https://www.npmjs.com/package/config) to manage different configurations for the application... like development, staging, production, etc. Usually, the secrets like database connection strings, social client secrets, and various other secrets are simply thrown in as cleartext and this is not a good idea. Checking-in the secret file to a Git repository is even worse!!! In this article, you will learn about how you can safeguard your secrets in Azure Key Vault and have a better secret management workflow.

###Step 1 - Create a Global Secret file
[Register](https://docs.microsoft.com/en-us/azure/key-vault/key-vault-get-started#a-idregisteraregister-an-application-with-azure-active-directory) your application and [create a KeyVault](https://docs.microsoft.com/en-us/azure/key-vault/key-vault-get-started). Once done, copy the values for:

1. Your Application ID
2. Key for your Application, and
3. Your KeyVault URI

Store these values in the following format as a JSON file in your profile's root folder. In this example our application name is called `nodeAppName`. You can have multiple applications in the same file if you need to.

```
$ cat ~/.masterkey/azuresecret.json
{
  "nodeAppName":{
    "clientId": "YOUR-APPLICATION-ID",
    "clientSecret": "YOUR-APPLICATION-KEY",
    "vaultUri": "KEYVAULT-URI"
  }
}
```

###Step 2 - Install MasterKey
You can install MasterKey package using npm:
```
npm install -g masterkey
```
###Step 3 - Start using `masterkey`!
####Create a Secret
You can use `masterkey` to set a secret using your command line. Notice the output will reveal the `Secret URI` and `Secret Absolute URI`. You should use the `Secret URI` in your configuration file as mentioned in `Step 4`. This way, your configuration file that is checked in the Git repository only contains a public URI instead of the secret. This URI is not accessible directly since it is managed by Azure's Key Vault.

**NOTE**  
`Secret Absolute URI` is for this specific version of the secret!

```
$ masterkey --set --key "SuperSecret" --value "SHHH!!! don't tell anyone" --desc "TOP SECRET" --expire "1 Jun 2020" --app nodeAppName
##########################
Adding Secret to Azure
##########################
Vault URI = https://masterkeykv.vault.azure.net/
Key = SuperSecret
Value = SHHH!!! don't tell anyone
Content Type = TOP SECRET
Not Before = null
Expire On = 1 Jun 2020
Secret URI = https://masterkeykv.vault.azure.net/secrets/SuperSecret
Secret Absolute URI = https://masterkeykv.vault.azure.net/secrets/SuperSecret/29cc5e0836a54524bc35d07c6f7d95c5
```
####Get a Secret
```
$ masterkey --get https://masterkeykv.vault.azure.net/secrets/SuperSecret --app nodeAppName
###################################
Get a Secret from the KeyVault
###################################
SHHH!!! don't tell anyone
```
####List All
```
$ masterkey --list --app nodeAppName
#######################################
Listing all Secrets from the KeyVault
#######################################
Key | Content Type | Enabled | Not Before | Expires
https://masterkeykv.vault.azure.net/secrets/SuperSecret | TOP SECRET | true | undefined | Mon Jun 01 2020 00:00:00 GMT+0530 (IST)
```
####Delete
If you wish to delete a secret you can use `--delete` switch

####Help
```
$ masterkey -h

MasterKey

  Secure your secrets in Microsoft Azure KeyVault. 

Options

  --list, -l         List all secrets                                                              
  --set, -s          Add or update the key/value pair in Azure KeyVault.                           
  --get, -g          Get the value based on key from Azure KeyVault.                               
  --delete, -d       Delete the key/value pair from Azure KeyVault.                                
  --desc             A description that will be saved in the KeyVault along with the key.          
  --help, -h         Print this usage guide.                                                       
  --key, -k          Name of the key in Key Vault                                                  
  --value, -v        The secret value stored in Key Vault                                          
  --notbefore        The value will not be active before a specific time                           
  --expire           The value after which the key will expire                                     
  --enabled          Set the Key as enabled or disabled                                            
  --transform, -t    Replace all secret URLs with actual secrets in the transformed file.Provide a name of the template (ex: dev.template.json , prod.template.config, etc.) that has to be transformed. Each key that needs to be transformed must have a fixed prefix of "masterkey_" (ex. masterkey_db_connection, masterkey_aws_secret, and so on.                                              
  --app, -a          Provide an application name for which you want to manage information.       
```

###A Sample Workflow
Let's take a look at a sample configuration for an application that uses a [config](https://www.npmjs.com/package/config) package.

```
{
  "hostname": "www.website.com",
  "dbConfig": {
    "connectionString": "mongodb://admin:clear_text_password@location:27017"
  }
}
```
You see the problem? The `connectionString` has a password in clear text and checking this file inside a Git repository is just bad. 

- Step 1: Set up `masterkey` as mentioned in the steps above.
- Step 2: Use `masterkey` to create a secret:
```
$ masterkey --set --key "MongoDBConnectionString" --value "mongodb://admin:clear_text_password@location:27017" --desc "MongoDB Connection String Hosted in Atlas" --app nodeAppName
##########################
Adding Secret to Azure
##########################
Vault URI = https://masterkeykv.vault.azure.net/
Key = MongoDBConnectionString
Value = mongodb://admin:clear_text_password@location:27017
Content Type = MongoDB Connection String Hosted in Atlas
Not Before = null
Expire On = null
Secret URI = https://masterkeykv.vault.azure.net/secrets/MongoDBConnectionString
Secret Absolute URI = https://masterkeykv.vault.azure.net/secrets/MongoDBConnectionString/5e97d2da953c4aa7b6b97c0f723c0e4a
```
- Step 3: Create a Template file that has a format like `<filename>.template.<extension>`. Ex. `dev.template.json`, `staging.template.config`, etc.
- Step 4: Move your existing configuration to the new template file and delete your existing configuration! 

```
{
  "hostname": "www.website.com",
  "dbConfig": {
    "connectionString": "masterkey_https://masterkeykv.vault.azure.net/secrets/MongoDBConnectionString"
  }
}
```
**NOTE**  
1. Your connection is now not cleartext.
2. The value is the Secret URI you got while creating the secret and it is prefixed with `masterkey_` so that the `masterkey` module knows which one are special values and need to be retrieved during transformation that you will see next.

- Step 5: Use `--transform` switch to create your configuration file on the fly!
```
$ masterkey --transform sample.template.json --app nodeAppName
Transforming the template... sit tight!
Configuration file transformed successfully:  sample.json
```

**Great!** You can now safely ignore the `sample.json` file from your Git repository. As far as you have `sample.template.json` you can easily reproduce it on any server using `masterkey`!

### Documentation
1. [Azure Key Vault](https://azure.microsoft.com/en-in/services/key-vault/)  
2. [Step - by - Step](https://blogs.technet.microsoft.com/kv/2015/06/02/azure-key-vault-step-by-step/)  
3. [setSecret](http://azure.github.io/azure-sdk-for-node/azure-keyvault/latest/KeyVaultClient.html#setSecret)  
4. [Attosol Technologies](https://www.attosol.com/tag/mean/)