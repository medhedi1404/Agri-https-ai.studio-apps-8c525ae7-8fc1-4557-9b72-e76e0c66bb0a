# Security Specification for Agri-Vision Diagnostics

## 1. Data Invariants
- A `User` profile must be created by the authenticated owner and cannot change their `userId`.
- A `Scan` must belong to the user who created it.
- A `CommunityAlert` must contain valid coordinates and specify the reporting user.
- Timestamps must be handled correctly (handled by server if possible, but rules will validate consistency).

## 2. The "Dirty Dozen" Payloads

1. **Identity Theft (User Profile)**: Attempting to create a user profile with someone else's UID.
2. **System Privilege Escalation**: Attempting to set an `isAdmin` or `isVerified` flag (shadow fields) on a user profile.
3. **Data Snooping (Scans)**: Unauthenticated or non-owner user attempting to read private plant scans.
4. **Scan Forgery**: Creating a scan for a different user.
5. **Ghost Alerts**: Creating a community alert without a `userId` or with another user's `userId`.
6. **Resource Exhaustion (ID Poisoning)**: Using a 10KB string as a `scanId`.
7. **Resource Exhaustion (Value Poisoning)**: Sending a massive 1MB string in `diseaseName`.
8. **Relational Sync Bypass**: Creating a scan with a non-existent userId (though we use `request.auth.uid`).
9. **Update Hijacking**: Modifying the `diseaseName` of someone else's scan.
10. **Immutable Field Tampering**: Changing the `createdAt` timestamp on an existing scan.
11. **Malicious Map Injection**: Sending invalid coordinates (e.g., Lat 500) to `communityAlerts`.
12. **Unverified Reporter**: Submitting alerts without being a registered user.

## 3. Test Runner Concept
The `firestore.rules` will explicitly block these.
