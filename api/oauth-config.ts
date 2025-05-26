export const OAUTH_CONFIG = {
  GOOGLE: {
    WEB_CLIENT_ID:
      "971818626439-jhdf8m930fkhjsah7u94bo68rr981apl.apps.googleusercontent.com",
    IOS_CLIENT_ID:
      "971818626439-k11g0olpa2nkkjpgvjso66g715ist6b1.apps.googleusercontent.com",
    ANDROID_CLIENT_ID:
      "971818626439-g1nnp0bek58q5sjd057m0cjf6ne4sjc2.apps.googleusercontent.com",
    SCOPES: ["profile", "email"],
    RESPONSE_TYPE: "id_token",
  },
  FACEBOOK: {
    APP_ID: "1014031907323169",
    SCOPES: ["public_profile", "email"],
    AUTHORIZATION_ENDPOINT: "https://www.facebook.com/v12.0/dialog/oauth",
  },
};
