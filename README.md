gas-oauth2-gae
==============

Who Might Need This
-------------------

If you got here because you need to connect to Google App Engine from Google Apps Script… using OAuth2… AND a Service Account, you are in the right place.  Likewise, if you were attempting to connect go Google Services using URLFetchApp’s built in OAuth handlers and and failed, then you are also in the right place and you have my pity.

This project helps Google Apps Script projects connect to Google APIs which require OAuth2.  It is only intended to be used when invoking services using a [service account][1].  If you are trying to invoke services as the user at keyboard, please consider using [URLFetchApp][2]

This should help you get to this:
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var invoker = new OAuth2Invoker(EMAIL, PEM64, 'https://www.googleapis.com/auth/sqlservice.admin');
var resp = invoker.get('https://www.googleapis.com/sql/v1beta3/projects/' + PROJ_NAME + '/instances');   
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Or tis
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var invoker = new OAuth2Invoker(EMAIL, PEM64, 'https://www.googleapis.com/auth/sqlservice.admin');
var resp = invoker.post('https://www.googleapis.com/some/post/service' + PROJ_NAME + '/instances', {
  myParam:'hello world',
  myParam2: 'not pretty, but it works'
});   
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


[1]: <https://developers.google.com/accounts/docs/OAuth2ServiceAccount>

[2]: <https://developers.google.com/apps-script/reference/url-fetch/>

If you are not using Google Apps Script, and are NOT using a service account, keep looking because this isn't what you want.

Usage
=====

The last thing I want people doing is invoking my libraries with their private keys.  Just copy this stuff and modify it as you see fit.


### Overview

You must

1.  Create a Service Account for your project (or get the info from an existing one).  You’ll need the private key and email address for this account.

2.  Convert the key to a PEM file, then encode it so it can be used within GAS.

3.  Include the GS files in your project (test.gs not required).


### Setting up a Service Account

Get the email and .p12 file as described in <https://developers.google.com/accounts/docs/OAuth2ServiceAccount>.

1.  Go to the Google Developers Console. Select a project. 

2.  In the sidebar on the left, select APIs & auth. 

3.  In the list of APIs, make sure all of the APIs you are using show a status of ON. 

4.  In the sidebar on the left, select Credentials.

5.   To set up a service account, select Create New Client ID. Specify that your application type is service account, and then select Create Client ID. A dialog box appears; to proceed, select Okay, got it. (If you already have a service account, you can add a new key by selecting Generate new key beneath the existing service-account credentials. A dialog box appears; to proceed, select Okay, got it.)

[^3]: <https://console.developers.google.com>



As a sanity check, your service email address should look something like 

1234567890123-ddnvfbnngngflf36vkj9avg3ufcr4ml4@developer.gserviceaccount.com.  The private key will be downloaded into a file with a name like  12345138fa5e8908fad99563ede58ae71026fa31-privatekey.pem.



### Convert that Private Key .p12 file to base64 encoded PEM

From a command prompt (making certain unix-y assumptions).

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
openssl pkcs12 -in YOURPRIVATEKEY.p12 -nodes | openssl rsa | base64 > myfile.pem.b64
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~



If you’re using OS X, you may want to just do pipe into `pbcopy` later on when you actually go to paste the key wherever.



### Invoking a service

As an example, if you have the Google Cloud SQL service enabled for your GAE application, 



~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//the service email address that goes with your user
var EMAIL = 'yourserviceemail...@developer.gserviceaccount.com';
//the base64 encoded private key you exported from the developers console
var PEM64 = 'LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVstLS0tLQpNSUlDWFFJQkFBS0JnUUMvVjJCT2ZUbVZNQmhBN0loQXZJWnFEWUxZNnBRaWxNdzFiVWtBTlJicERqUURkT1RTCmRBVHFrdDJxdGl5VEdsVFhSTU04RFhnWFk5VkNBcFNDdU1lcFNYUzArUDltY0RmbGUvN0FtcEFqSHlXTnlkL0oKSUIyam5UUTgzby9SbUhTR2djL0VNOUlIWHNmSTZPenZMRnRBVU40Y0diZi9aM2ppeneaMjZWdWNCd0lEQVFBQgpBb0dCQUt2SHNSR21RUTBjR1pvb0FJZFYrZEs2Z0k5bndraHRtQXdiS2gvQ4llZi90VmlwR0VtTW1XRlRLeWo0CjFubldlUGF1cUN5QTF5RUFvdFBaWnlVWTZUNFUvZDJ5WmFuZ0Q0SnFRU1QrTXJ5aFlXdkVEMEZBTEhsK2ZVU2gKNkxobG9pUjlCeEtnRnpjLzdPdUlSRGtDZjJ1M0hGTlBWSG1kL1RTcGpBenhqMDlKQWtFQStkL1RTeEJmenhXQgpxTnV0RFRPUUEySVgyaEFDNE8yZEFla0tTTjE4ZWp6Zm5CdE5QbVg3dDJsT3BoSklXL1c0WGhoTXZjaklwc240CjM0emxNcnQ5dXdKQkFNUUlOTTNnajkyYVdGU1hDY3FaVEVsaU1ZQ0kzRUxUaENhUHk0UjAxcU1kejVDOGNRdUMKS1FKbmhGaVJFaEpsSmJFUVRCOE5RT0U1cGFiQkz2dG9VQ1VDUVFDR3lZNFl0OFIyMklzUW95OCtKOHBQaU9LRQo1bzRtOXdYeXVkcXFZNDk2QU13K1VSdmh4UEY3aG5xK2FxNU5yTWEvT3l4cVU1eXBHOW43L096RjZRMXhBa0J3Cm5JWTQvcGVtcGRPNFJFdkxwdVM4QXp5TXFoSmVFVVFKSXZHMjFhZTNiSmlnZktBMERFR2lyL1RITEE5Rm9mVlYKRWhlb2Z1U1dmWmM3aEI3dVNLNUJBe0IyWWM4Rk9MSFRGeko2UCszVGZUNFo5QnhOd2xnN1RaUTJsdXc2WC9iSgpGTnBCMEdYZ0E5NHJvZVFPQ1pjbU50Y320R4E5QzNwQ2hvVXBBQjYvdlNxTAotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQo=';
var PROJ_NAME='your-project-123';//as it appears in the developer console

var invoker = new OAuth2Invoker(EMAIL, PEM64, 'https://www.googleapis.com/auth/sqlservice.admin');
var resp = invoker.get('https://www.googleapis.com/sql/v1beta3/projects/' + PROJ_NAME + '/instances');   
Logger.log('THE CONTENT: ' + resp.getContentText());
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
