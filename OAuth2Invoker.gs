/**
 * Used for invoked Google App Engine services from Google Apps Script.
 */
function OAuth2Invoker(email, pemBase64, scope, sub) {
  var accessToken = '';

  this.post = function(url, payload) {
    return this.http_method(url, 'post', payload);
  };

  this.get = function(url, payload) {
    return this.http_method(url, 'get', payload);
  };

  this.http_method = function(url, method, payload) {
    var params = {
      method : method,
      headers : {
        Authorization : "Bearer " + accessToken
      },
      muteHttpExceptions : true,
    };

    if (payload) {
      params.payload = payload;
    }

    
    Logger.log("fetching "+ url);
    //Logger.log(params);
    var response = UrlFetchApp.fetch(url, params);
    var responseText = response.getContentText('utf-8');
    
    try {
      return JSON.parse(responseText);
    }catch(Exception){}
    
    return responseText;
  };

  var encodeURL = function(str) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
  };

  /**
   * Sign the given plaintext string with the given PEM using RSA-SHA256 and
   * return a base64 encoded string.
   * 
   * @param {string}
   *          strToSign
   * @param {string}
   *          base64PEM
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
    Logger.log("requesting access token");
    // now-ish
    var iat = Math.floor(new Date().getTime() / 1000);
    var exp = iat + 3600; // expire in 1 hour

    if (typeof(scope) == "object"){
      // got an array, conert it to string
      scope = scope.join(", ");
    }

    var jwtClaimSet = {
      "iss" : email,
      "scope" : scope,
      "aud" : "https://accounts.google.com/o/oauth2/token", // this is always the value for google tokens
      exp : exp,
      iat : iat
    };
    
    if(sub){
      jwtClaimSet['sub'] = sub;
    }

    var headerBase64 = window.btoa(JSON.stringify({
      "alg" : "RS256",
      "typ" : "JWT"
    }));
    var jwtClaimBase64 = window.btoa(JSON.stringify(jwtClaimSet));

    var signedBase64 = sign(headerBase64 + '.' + jwtClaimBase64);
    var assertion = headerBase64 + '.' + jwtClaimBase64 + '.' + signedBase64;

    var resp = UrlFetchApp.fetch("https://accounts.google.com/o/oauth2/token", {
      'method' : 'post',
      'payload' : {
        'grant_type' : "urn:ietf:params:oauth:grant-type:jwt-bearer",
        'assertion' : assertion
      }
    });

    if (resp.getResponseCode() == 200) {
      var content = JSON.parse(resp.getContentText());
      return content.access_token;
    } else {
      throw new Error("Failed to retrieve access token.");
    }
  };

  this.getAccessToken = function() {
    var cachedToken = null; // CacheService.getPrivateCache().get(email+scope);
    if (cachedToken) {
      accessToken = cachedToken;
    } else {
      accessToken = requestAccessToken();
      var fiftyFiveMinutes = 3300;
      CacheService.getPrivateCache().put(email + scope, accessToken, fiftyFiveMinutes);
    }
    Logger.log("got access token: " + accessToken);
    return accessToken;
  };

  accessToken = this.getAccessToken();

}

OAuth2Invoker.constructor = OAuth2Invoker;
