<!-- Expense Tracker App: What have I done? -->

<!-- Implemented multiple OAuth logins (Key is using a subdocument in MongoDB. refer to logins [{}] inside main users document. Hence each user has a unique id and each login 'sub'document has a unique id.) -->

const profileData = {
name: profile.displayName,
email: profile.\_json.email,
username: profile.username,
photo: profile.\_json.avatar_url,
logins: [
{
method: 'github',
oauthId: profile.id,
providerId: profile.id,
accessToken: accessToken,
},
],
};

This strategy checks if a user with the same GitHub OAuth ID exists in the database. If the user doesn't exist, it creates a new user with the GitHub OAuth details. If the user already exists, it updates the access token if needed and returns the user.

The providerId is introduced to handle the scenario where a user might have accounts with different OAuth providers (e.g., GitHub and Google). This way, the same user can be associated with multiple OAuth providers, and the strategy can find the user based on the OAuth ID and provider during login.

Source of truth:
The use of subdocuments with unique ObjectIds in the logins array allows you to associate multiple OAuth logins with the same user. Each entry in the logins array represents a different OAuth login (e.g., Google, GitHub), and MongoDB ensures that each entry has a unique identifier (\_id). This allows you to have multiple login entries for the same user without any conflicts, as each entry is uniquely identified within the array.
As shown below.
{

<!-- "\_id": ObjectId("6556f379ec8f37a4cfc02053"), -->

"name": "Anand Seshadri",
"email": "anandseshawork@gmail.com",
"username": "anandsesha",
"photo": "https://avatars.githubusercontent.com/u/78548214?v=4",
"logins": [
{
"method": "github",
"oauthId": "78548214",
"accessToken": "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",

<!-- "_id": ObjectId("6556f379ec8f37a4cfc02054") -->

}
],
"createdAt": ISODate("2023-11-17T05:00:41.499Z"),
"updatedAt": ISODate("2023-11-17T05:00:41.499Z"),
"\_\_v": 0
}

Why Subdocuments with Unique IDs?

MongoDB generates unique \_id values for each subdocument in an array.
This ensures that even if a user has multiple OAuth logins (e.g., GitHub, Google), each entry in the logins array has a distinct identifier.
The \_id in the subdocument serves as a unique key, preventing conflicts or duplication within the array.

OAuth Login (e.g., GitHub):

The user decides to log in using GitHub OAuth.
The OAuth provider (GitHub) returns user information, including an oauthId that uniquely identifies the user on GitHub.
Your system checks if a user with the given oauthId already exists in the logins array of the user in the users collection.
If found, the system updates the access token or performs any necessary actions. If not found, a new entry is added to the logins array.
