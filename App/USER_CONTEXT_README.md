# User Context Implementation

This implementation provides a React Context for managing user data throughout the application after login.

## Files Created

1. **`src/contexts/UserContext.jsx`** - Main context and provider
2. **`src/hooks/useUserData.js`** - Custom hook with utility functions
3. **`src/Components/UserInfoExample.jsx`** - Example component showing usage

## Setup

The `UserProvider` has been added to `App.jsx` to wrap the entire application:

```jsx
<AuthProvider config={authConfig}>
  <UserProvider>
    {/* Your app components */}
  </UserProvider>
</AuthProvider>
```

## Usage in Components

### Basic Usage

```jsx
import useUserData from '../hooks/useUserData';

const MyComponent = () => {
  const { user, loading, error } = useUserData();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Not logged in</div>;

  return (
    <div>
      <h1>Welcome, {user.first_name}!</h1>
      <p>User ID: {user.user_Id}</p>
      <p>Currency: {user.currency_pref}</p>
    </div>
  );
};
```

### Using Utility Functions

```jsx
import useUserData from '../hooks/useUserData';

const MyComponent = () => {
  const { 
    getFullName, 
    getInitials, 
    isLoggedIn, 
    getCurrency,
    refreshUser 
  } = useUserData();

  return (
    <div>
      {isLoggedIn() && (
        <>
          <h1>Hello, {getFullName()}!</h1>
          <div className="avatar">{getInitials()}</div>
          <p>Currency: {getCurrency()}</p>
          <button onClick={refreshUser}>Refresh</button>
        </>
      )}
    </div>
  );
};
```

## Available Properties and Methods

### From useUserData hook:

- **`user`** - User object with user_Id, first_name, last_name, currency_pref
- **`loading`** - Boolean indicating if user data is being fetched
- **`error`** - Error message if fetching failed
- **`isLoggedIn()`** - Returns true if user is logged in
- **`getFullName()`** - Returns formatted full name
- **`getInitials()`** - Returns user initials (e.g., "JD")
- **`getCurrency()`** - Returns user's currency preference
- **`refreshUser()`** - Refetch user data from API
- **`updateUser(userData)`** - Update user data manually
- **`clearUser()`** - Clear user data (for logout)

## API Response Format

The context expects this response format from `/api_user/v1/user_byCookie`:

```json
{
  "status": "success",
  "message": "User retrieved successfully",
  "data": {
    "user_Id": "30e02b55-c249-4cdd-b0a5-a3cf8a372570",
    "first_name": "thanura",
    "last_name": "mendis",
    "currency_pref": "USD"
  }
}
```

## Automatic Features

- **Auto-fetch on mount**: User data is fetched automatically when the app loads
- **Cookie-based**: Uses `withCredentials: true` for cookie authentication
- **Error handling**: Comprehensive error handling with retry functionality
- **Loading states**: Built-in loading and error states

## Integration with Logout

The `LogoutButton` component has been updated to clear user context data on logout:

```jsx
const handleLogout = () => {
  clearUser(); // Clear user context
  signOut();   // Asgardeo logout
  navigate("/"); // Navigate to login
};
```

## Updated Components

- **`HeaderProfile.jsx`** - Now uses UserContext instead of props
- **`LogoutButton.jsx`** - Clears user context on logout
- **`Home.jsx`** - Updated to not pass props to HeaderProfile

## Usage Examples

See `UserInfoExample.jsx` for a complete example of how to use all features of the UserContext.
