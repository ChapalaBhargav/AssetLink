# AssetLink
internship task

* Asset Conflict Manager – React + Firebase App

This project is a full-stack web application built with React and Firebase, designed to allow users to register assets, communicate with each other using predefined messages, and detect conflicts when multiple users attempt to use the same asset. It also includes an admin dashboard with conflict monitoring and message control features.

Features

*** User Functionality
- Sign up / Log in with email.
- Register Assets uniquely to your account.
- Send Messages to other users by entering an Asset ID.
- Conflict Detection if multiple users are registered to the same asset.
- Predefined Message Limits enforced per user.

*** Admin Functionality
- View All Assets and their assigned users.
- Detect and View Conflicts in real-time.
- View All Messages, sorted by time, with sender info and asset mapping.
- Set Maximum Messages allowed per user from dashboard.
- Sync Conflicts manually via button.

** Tech Stack

| Frontend |                        Backend                        |  Database |     Auth      |
|----------|-------------------------------------------------------|-----------|---------------|
| React    | Firebase Functions *(planned)* / Express *(optional)* | Firestore | Firebase Auth |

** Setup Instructions

1. Clone the Repository

```
git clone https://github.com/yourusername/asset-conflict-manager.git
cd asset-conflict-manager
```

2. Install Dependencies
   
```
npm install
```

3. Configure Firebase

Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/) and add the following configuration in `src/firebase.js`:

```
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET.appspot.com",
  messagingSenderId: "YOUR_MSG_ID",
  appId: "YOUR_APP_ID"
};
```

4. Run the App
   
```
npm start
```

The app will be available at `http://localhost:3000`.

** Project Structure

```
src/
│
├── firebase.js           # Firebase config and exports
├── App.js                # Main routing and logic
├── AdminDashboard.js     # Admin dashboard view
├── UserDashboard.js      # User-facing dashboard
├── utils.js              # Conflict detection and syncing
└── ...
```

** Firestore Rules (Dev)

For development purposes, use open rules:

```
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

