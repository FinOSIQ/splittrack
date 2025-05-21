export const authConfig = {
    signInRedirectURL: "http://localhost:5173/authenticate", // After login, user will be redirected here
    signOutRedirectURL: "http://localhost:5173", // After logout
    clientID: "XndaGejtIaN1atamOKzfTwBJYisa", // Replace with the Client ID from Asgardeo
    baseUrl: "https://api.asgardeo.io/t/sparkz", // Replace YOUR_ORG with your Asgardeo organization name
    scope: ["openid", "email", "phone", "profile"] // Defines what user data you can access
  };
  