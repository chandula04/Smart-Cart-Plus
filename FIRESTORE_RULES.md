# Required Firestore Security Rules

Replace your current Firestore rules with these updated rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }

    // Products collection
    match /products/{id} {
      allow read: if true;
      allow write: if isSignedIn();
    }

    // Sections collection  
    match /sections/{id} {
      allow read: if true;
      allow write: if isSignedIn();
    }

    // Removal logs collection
    match /removalLogs/{id} {
      allow read: if true;
      allow write: if isSignedIn();
    }

    // Carts collection with proper subcollection access
    match /carts/{userId} {
      allow read, write: if isSignedIn() && request.auth.uid == userId;
      
      match /items/{itemId} {
        allow read, write: if isSignedIn() && request.auth.uid == userId;
      }
    }
  }
}
```

## How to Apply These Rules:

1. Go to your Firebase Console
2. Navigate to Firestore Database
3. Click on "Rules" tab
4. Replace the current rules with the above rules
5. Click "Publish"

## Firebase Authentication Setup:

Make sure Anonymous Authentication is enabled:

1. Go to Firebase Console → Authentication
2. Click on "Sign-in method" tab  
3. Enable "Anonymous" provider
4. Save

## Test the Setup:

After applying the rules, test:
1. Open browser console
2. Try adding a product to cart
3. Try marking an item as handled
4. Check console logs for any errors