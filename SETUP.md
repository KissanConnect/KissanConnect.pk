# Kissan Connect (کسان کنیکٹ) - Easy Setup Guide

Welcome to **Kissan Connect** — Pakistan's digital agriculture and farmer-wholesaler portal!
This app is designed to work immediately out-of-the-box in demo mode so you can test all features right away.

Follow the simple steps below to connect your real Firebase database and Formspree suggestion form. No coding knowledge required!

---

## 1. Create a Free Firebase Project

1. Open your browser and go to: [https://console.firebase.google.com](https://console.firebase.google.com)
2. Sign in with your Google Account.
3. Click **Add project** (or *Create a project*).
4. Name your project (e.g. `kissan-connect-pk`) and click **Continue**.
5. You can disable or enable Google Analytics (either is fine), then click **Create project**.

---

## 2. Enable Authentication (Email/Password & Google)

1. In the left menu of the Firebase Console, click on **Build** > **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab:
   - Click on **Email/Password**, toggle **Enable**, and click **Save**.
   - Click on **Google**, toggle **Enable**, select your support email, and click **Save**.

---

## 3. Create Cloud Firestore Database

1. In the left menu, click on **Build** > **Firestore Database**.
2. Click **Create database**.
3. Choose a location closest to Pakistan (e.g. `asia-south1` Mumbai or `asia-southeast1` Singapore).
4. Select **Start in test mode** (or production mode) and click **Enable**.

---

## 4. Copy Your Firebase Web App Config

1. In the Firebase Console, click the **Gear icon (⚙️)** next to *Project Overview* at the top left > select **Project settings**.
2. Scroll down to the **Your apps** section and click the **Web icon (`</>`)**.
3. Register app nickname: `Kissan Connect Web`.
4. Leave *Firebase Hosting* unchecked and click **Register app**.
5. You will see a code block containing `firebaseConfig`. Copy the values:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`
6. Open `src/firebaseConfig.ts` in this project and paste your values in place of the placeholders:

```typescript
export const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789...",
  appId: "1:123456789:web:abcdef..."
};
```

---

## 5. Publish Firestore Security Rules

1. In Firebase Console, go to **Firestore Database** > click on the **Rules** tab.
2. Replace all existing text with the following security rules and click **Publish**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User profile documents
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Fertilizer and Tractor prices (Read by everyone, updated only by admins)
    match /fertilizerPrices/{priceId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /tractors/{tractorId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Mandi Listings (Publicly viewable, only owner can edit/delete)
    match /listings/{listingId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && (resource.data.userId == request.auth.uid || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Private farmer farm records & crop plans (Strictly private to the user)
    match /produceRecords/{id} {
      allow read, write: if request.auth != null && (resource == null || resource.data.userId == request.auth.uid);
    }
    
    match /expenseRecords/{id} {
      allow read, write: if request.auth != null && (resource == null || resource.data.userId == request.auth.uid);
    }
    
    match /incomeRecords/{id} {
      allow read, write: if request.auth != null && (resource == null || resource.data.userId == request.auth.uid);
    }
    
    match /cropPlans/{id} {
      allow read, write: if request.auth != null && (resource == null || resource.data.userId == request.auth.uid);
    }
    
    // In-app chat messages (Readable by buyer and seller only)
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
    
    // Reported listings (Anyone can submit, only admin can review)
    match /reportedListings/{reportId} {
      allow create: if true;
      allow read, write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## 6. Add Authorized Domain (for Google Sign-In)

If you use Google Sign-in on a custom domain or preview URL:
1. Go to **Authentication** > **Settings** tab > **Authorized domains**.
2. Click **Add domain** and enter your current hosting URL or applet preview domain.

---

## 7. Connect Suggestion Box with Formspree

1. Go to [https://formspree.io](https://formspree.io) and register free with your email.
2. Click **+ New Form**, name it `Kissan Connect Feedback`.
3. Copy your Form ID (e.g. `mzzbkgqr` or `xpwzabcd`).
4. Open `src/pages/SuggestionPage.tsx` and replace line 19:

```typescript
export const FORMSPREE_FORM_ID = "YOUR_FORM_ID"; // Replace with your real Formspree ID
```

All feedback submitted by Pakistani farmers will now automatically arrive directly in your email inbox!

---

## 8. Making an Account an Admin

To unlock the hidden admin management panel at `/admin` (for editing fertilizer rates and tractor specs):
1. Sign up normally with your email on the Kissan Connect registration page.
2. In the Firebase Console, go to **Firestore Database** > open the **users** collection.
3. Click on your user document.
4. Change the `role` field from `"farmer"` to `"admin"`.
5. Refresh the website — your account now has complete administrator privileges and access to `/admin`!
