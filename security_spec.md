# Security Specification – Hampiq Biomedicina Firestore Rules

## 1. Data Invariants
1. **Strict Ownership (`ownerId`)**: Every patient record in `/patients/{patientId}` must belong to an authenticated, email-verified user (`ownerId == request.auth.uid`). No cross-user read, list, create, update, or delete is permitted.
2. **PII Isolation (`/users/{userId}`)**: User profiles containing emails, doctor names, CMP, and RNE are strictly readable and writable only by the owner (`userId == request.auth.uid`). `list` on `/users` is permanently denied (`if false`).
3. **Immutable Identity & Temporal Integrity**: `uid`, `id`, `ownerId`, and `createdAt` cannot be modified after creation. `createdAt` on create and `updatedAt` on create/update must strictly equal `request.time`.
4. **Verified Auth Mandate**: All reads and writes on `/patients` and all writes on `/users` require `request.auth != null && request.auth.token.email_verified == true`.
5. **Action-Based Updates & Strict Keys**: Updates use `affectedKeys().hasOnly(...)` and call `isValidUserProfile` / `isValidPatient` on both create and update.

## 2. The "Dirty Dozen" Adversarial Payloads (Must All Be Denied)
1. **Unauthenticated Read**: `GET /patients/pac_1` with `auth == null` -> `PERMISSION_DENIED`.
2. **Unverified Email Write**: `CREATE /patients/pac_1` with `email_verified == false` -> `PERMISSION_DENIED`.
3. **Cross-Owner Read**: `GET /patients/pac_1` by User B when `ownerId == User A` -> `PERMISSION_DENIED`.
4. **Unscoped List Query**: `LIST /patients` without `where('ownerId', '==', uid)` -> `PERMISSION_DENIED`.
5. **Identity Spoofing on Create**: `CREATE /patients/pac_1` by User A with `ownerId: "user_b"` -> `PERMISSION_DENIED`.
6. **Shadow Field Injection**: `CREATE /patients/pac_1` with extra ghost field `isAdmin: true` -> `PERMISSION_DENIED`.
7. **Owner Reassignment on Update**: `UPDATE /patients/pac_1` attempting to mutate `ownerId` -> `PERMISSION_DENIED`.
8. **Client Timestamp Forgery**: `CREATE /patients/pac_1` with hardcoded `createdAt` not matching `request.time` -> `PERMISSION_DENIED`.
9. **ID Poisoning**: `CREATE /patients/invalid$id!` or ID > 128 chars -> `PERMISSION_DENIED`.
10. **String Size Exhaustion**: `CREATE /patients/pac_1` with `nombres` of 500 characters (> 120) -> `PERMISSION_DENIED`.
11. **Array Element Type Poisoning**: `CREATE /patients/pac_1` with `notasVoz: ["not-a-map"]` -> `PERMISSION_DENIED`.
12. **User Directory Enumeration**: `LIST /users` by any authenticated user -> `PERMISSION_DENIED`.
