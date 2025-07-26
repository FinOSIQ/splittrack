export const authConfig = {
    signInRedirectURL: `${import.meta.env.VITE_FRONTEND_URL}/authenticate`, // After login, user will be redirected here
    signOutRedirectURL: import.meta.env.VITE_FRONTEND_URL, // After logout
    clientID: "XndaGejtIaN1atamOKzfTwBJYisa", // Replace with the Client ID from Asgardeo
    baseUrl: "https://api.asgardeo.io/t/sparkz", // Replace YOUR_ORG with your Asgardeo organization name
    scope: ["openid", "email", "phone", "profile"] // Defines what user data you can access
  };
  