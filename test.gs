/** Demonstrate how to connect to the sql service in google app engine */
function invokeSqlService(){
  var invoker = new OAuth2Invoker(EMAIL, PEM64, "https://www.googleapis.com/auth/sqlservice.admin");
  var resp = invoker.get('https://www.googleapis.com/sql/v1beta3/projects/" + PROJ_NAME + "/instances');
  Logger.log("THE CONTENT" + resp.getContentText());
}
