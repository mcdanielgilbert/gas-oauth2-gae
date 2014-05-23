/**
* Used for invoked Google App Engine services from Google Apps Script.
*/
function OAuth2Invoker(email, pemBase64, scope){
  this.post = function(url, payload){
    var params = {
      method:'post',
      headers : {
        Authorization : "Bearer " + accessToken
      }
    }
    
    if(payload){
     params.payload = payload; 
    }
    
    Logger.log(params);
    
    var response = UrlFetchApp.fetch(url, params); 
    return response;
  }
  
  this.get = function(url, payload){
    var params = {
      method:'get',
      headers : {
        Authorization : "Bearer " + accessToken
      }
    }
    
    if(payload){
      payload.payload = payload; 
    }
    
    Logger.log(params);
    
    var response = UrlFetchApp.fetch(url, params); 
    return response;
  }
  
  var encodeURL = function(str){
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
  };
  
  /**
  * Sign the given plaintext string with the given PEM using RSA-SHA256
  * and return a base64 encoded string.
  * @param {string} strToSign
  * @param {string} base64PEM
  */
  var sign = function(strToSign) {
    var rsa = new RSAKey();
    var pem = window.atob(pemBase64);
    rsa.readPrivateKeyFromPEMString(pem);
    var hexSig = rsa.signStringWithSHA256(strToSign);
    var sigBase64 = hex2b64(hexSig);
    var urlSafeB64 = encodeURL(sigBase64);
    return urlSafeB64;
  };
  
  var requestAccessToken = function() {
    //now-ish
    var iat = Math.floor(new Date().getTime()/1000);
    var exp = iat + 3600; //expire in 1 hour
    
    var jwtClaimSet = {
      "iss":email,
      "scope":scope,
      "aud":"https://accounts.google.com/o/oauth2/token", //this is always the value for google tokens
      exp: exp,
      iat: iat
    };
    
    var headerBase64 = window.btoa(JSON.stringify({"alg":"RS256","typ":"JWT"}));
    var jwtClaimBase64 = window.btoa(JSON.stringify(jwtClaimSet));
    
    var signedBase64 = sign(headerBase64 + '.' + jwtClaimBase64);
    var assertion = headerBase64 + '.' + jwtClaimBase64 + '.' + signedBase64;
    
    var resp = UrlFetchApp.fetch("https://accounts.google.com/o/oauth2/token",{
      'method':'post',
      'payload' : { 
        'grant_type':"urn:ietf:params:oauth:grant-type:jwt-bearer",
        'assertion': assertion 
      }
    });
    
    if(resp.getResponseCode() == 200){
      var content = JSON.parse(resp.getContentText());
      return content.access_token;
    } else {
     throw new Error("Failed to retrieve access token."); 
    }
  }
  

  var accessToken;
  
  this.getAccessToken = function(){
    var cachedToken;//= CacheService.getPrivateCache().get(email+scope);
    if(cachedToken){
      accessToken = cachedToken;
    } else {
      accessToken = requestAccessToken();
      var fiftyFiveMinutes = 3300;
      CacheService.getPrivateCache().put(email + scope, accessToken, fiftyFiveMinutes);
    }
    
    return accessToken;
  };
  
  accessToken = this.getAccessToken();
  
}

OAuth2Invoker.constructor = OAuth2Invoker;
