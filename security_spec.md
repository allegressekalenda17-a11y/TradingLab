# Security Specification for TradingLab

## Data Invariants

1. **User Profile**:
   - A user can only access their own profile.
   - `uid` must match `request.auth.uid`.
   - `email` must match the authenticated user's email.
   - `createdAt` is immutable.
   - Users cannot mark themselves as admins (no `role` or `isAdmin` field in profiles unless specified).

2. **Trade History**:
   - Only the owner of the trade log can read or write it.
   - `userId` must match `request.auth.uid`.
   - `timestamp` must be the server time.
   - Trade outcome (`WIN`/`LOSS`) must be a valid string.

3. **Watchlist**:
   - Only the owner can manage their watchlist.
   - `userId` must match `request.auth.uid`.
   - `indices` list must be bounded in size.

## The "Dirty Dozen" Payloads (Denial Tests)

1. **Identity Spoofing (User)**: Create a user profile with a different UID than current auth.
2. **Identity Spoofing (Trade)**: Create a trade record for another user's ID.
3. **Ghost Fields**: Update a user profile with `isAdmin: true` where it's not whitelisted.
4. **Invalid Type (Trade)**: Set `amount` to a string instead of a number.
5. **Path Poisoning**: Inject a huge string as a userId in the path.
6. **State Shortcut**: Try to update `timestamp` manually instead of using server time.
7. **Bypass Membership**: Read trades of another user.
8. **Recursive Cost Attack**: Request a list of all users without being authenticated.
9. **Invalid Range**: Set `dailyGoal` to a negative number.
10. **Immutable Violation**: Try to change `createdAt` on a user document.
11. **Malicious ID**: Use an ID like `../../../etc/passwd` (regex check).
12. **PII Leak**: A signed-in user tries to read another user's email field.

## Conflicts & Evaluations

| Attack | Vector | Mitigation |
| :--- | :--- | :--- |
| Identity Spoofing | Spoof `userId` | `incoming().userId == request.auth.uid` |
| State Shortcutting | Change `result` after final | Lock status on terminal value (if applicable) |
| Resource Poisoning | Malicious IDs | `isValidId(id)` pattern with regex |
| Denial of Wallet | O(n) list queries | Relational filters in `allow list` |
