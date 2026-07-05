# Security Audit — ExpenseFlow (server + client + SMS forwarder)

**Date:** 2026-07-05
**Scope reviewed:** `server/` (Express + MongoDB/Mongoose), `client/` (React/Vite), `app-apk/` (Expo/React Native + native Android SMS receiver)
**Method:** Manual line-by-line review of auth, middleware, controllers, routes, models, client API layer, and the Android SMS plugin/native code.

Legend: 🔴 Critical · 🟠 High · 🟡 Medium · ⚪ Low

---

## 🔴 SEC-1 — Unauthenticated SMS webhook accepts arbitrary data & writes to the "first user"

**Where:** [server/src/controllers/webhookController.js](server/src/controllers/webhookController.js#L3-L55), [server/src/routes/webhookRoutes.js](server/src/routes/webhookRoutes.js#L6-L8)

**Problem:** `POST /api/v1/webhooks/sms` has **no authentication and no shared-secret / signature verification**. Any anonymous caller who knows (or guesses) the URL can inject transactions. Worse, the controller assigns the record to `await User.findOne()` — i.e. **whichever user happens to be first in the collection** — so all injected data lands on a real account. The endpoint also echoes `error.message` back to the caller.

**Impact:** Data poisoning of a real user's financial records, unbounded row creation (storage/DoS), and no way to attribute or rate-limit the source.

**Fix / acceptance criteria:**
- Require a secret: SMS app sends `Authorization: Bearer <WEBHOOK_TOKEN>` (or an HMAC signature of the body); server rejects with 401 if invalid.
- Bind the webhook to a specific user (per-user webhook token, or user id embedded in the signed token) instead of `User.findOne()`.
- Validate `sender`, `text`, `timestamp` types/lengths before use; cap `text` length.
- Do not return `error.message` to the client.
- Add rate limiting (see SEC-6).

### Development phases (implementation)
- **Phase 1 — Per-user webhook token (model):** add a unique, secret `webhookToken` field to the `User` model so each user has an unguessable credential that maps a webhook call to exactly one account.
- **Phase 2 — Webhook auth middleware:** verify an `Authorization: Bearer <token>` (or `x-webhook-token`) header, look the user up by token, attach `req.webhookUser`, and reject with `401` when missing/invalid. Wire it in front of the webhook route.
- **Phase 3 — Harden the controller:** bind the transaction to `req.webhookUser._id` (drop `User.findOne()`), validate/limit `sender`/`text`/`timestamp` (cap `text` length), and stop returning `error.message`.
- **Phase 4 — Token management endpoint:** authenticated `POST /api/auth/webhook-token` that generates/rotates a cryptographically-random token and returns it plus the full webhook URL for the user to paste into the SMS app.
- **Phase 5 — SMS app sends the token:** UI stores the token, and both the native `SmsReceiver` and the JS task send it in the `x-webhook-token` header.

**Status:** ✅ Implemented (see commit / working tree changes).

---

## 🔴 SEC-2 — Sensitive SMS (incl. OTP/2FA) forwarded over cleartext HTTP

**Where:** [app-apk/withSmsReceiver.js:33](app-apk/withSmsReceiver.js#L33) (`usesCleartextTraffic='true'`), [app-apk/App.js:85](app-apk/App.js#L85) (`http://...` example), [app-apk/withSmsReceiver.js:244-300](app-apk/withSmsReceiver.js#L244-L300), [client/src/utils/api.js:5](client/src/utils/api.js#L5)

**Problem:** The Android manifest enables cleartext traffic and the native receiver POSTs raw SMS bodies to a user-typed URL with no scheme enforcement (example is `http://`). The keyword filter (`rs`, `inr`, `credit`, `debit`, `spent`, `paid`) is broad enough to catch **bank OTP / 2FA messages**, which would then be transmitted — potentially in plaintext — to the backend.

**Impact:** Interception of banking messages and one-time passcodes on the network path (MITM), full account-takeover potential for the user's bank/other services.

**Fix / acceptance criteria:**
- Set `usesCleartextTraffic='false'`; enforce `https://` on the webhook URL in `App.js` and in the native `SmsReceiver` before sending.
- Tighten the SMS filter and/or explicitly drop messages that look like OTP codes; document exactly what is forwarded.
- Point `client/src/utils/api.js` `baseURL` at the HTTPS production API (see SEC-9).

### Development phases (implementation)
- **Phase 1 — Disable cleartext traffic:** flip `usesCleartextTraffic` to `false` in the Android manifest so the OS blocks any plain-HTTP request from the app.
- **Phase 2 — Enforce HTTPS in the native receiver:** the native `SmsReceiver` refuses to POST unless the webhook URL starts with `https://` (belt-and-braces with the app UI check added in SEC-1).
- **Phase 3 — OTP/2FA exclusion + tighter filter:** drop any message that looks like a one-time passcode / verification code before forwarding, and narrow the transaction trigger keywords (remove the over-broad bare `rs`/`inr` substring match). Applied in both the native receiver and the JS task.
- **Phase 4 — Client HTTPS base URL:** drive `client/src/utils/api.js` `baseURL` from `VITE_API_URL`, defaulting to the HTTPS production API instead of `http://localhost:5000`.

**Status:** ✅ Implemented (see commit / working tree changes).

---

## 🔴 SEC-3 — No rate limiting on auth, password-verify, or webhook endpoints

**Where:** [server/src/routes/authRoutes.js](server/src/routes/authRoutes.js), [server/index.js](server/index.js), webhook route

**Problem:** `login`, `register`, `change-password`, `verify-password`, and the SMS webhook have no throttling.

**Impact:** Online password brute-force, credential stuffing, `verify-password` used as an oracle, and webhook flooding.

**Fix / acceptance criteria:** Add `express-rate-limit` (strict limits on `/api/auth/*` and the webhook), plus account lockout/backoff on repeated failed logins.

### Development phases (implementation)
- **Phase 1 — Dependency:** add `express-rate-limit` to the server.
- **Phase 2 — Limiter middleware:** define a strict limiter for sensitive auth endpoints (login/register/change-password/verify-password) and a separate limiter for the SMS webhook, keyed by client IP.
- **Phase 3 — Wire up:** set `app.set('trust proxy', 1)` (so the real client IP is used behind Vercel's proxy) and apply the limiters to the auth routes and the webhook route.
- **Phase 4 — Verify:** boot the server and confirm the limiter returns `429` after the threshold.

**Deployment note:** the app runs on Vercel serverless. `express-rate-limit`'s default in-memory store is **per-instance** and resets on cold starts, so it blunts rapid bursts against a warm instance but is not a globally consistent limit. For production-grade limiting use a shared store (e.g. `rate-limit-mongo` on the existing MongoDB, or Redis). Tracked as a follow-up.

**Status:** ✅ Implemented (in-memory store; shared-store follow-up noted).

---

## 🟠 SEC-4 — No input validation or password policy (register / change-password)

**Where:** [server/src/controllers/authController.js:5-48](server/src/controllers/authController.js#L5-L48), [changePassword:142-159](server/src/controllers/authController.js#L142-L159)

**Problem:** No validation of email format or password strength/length anywhere. A user can register with a 1-character (or effectively empty) password; `changePassword` accepts any `newPassword`.

**Impact:** Trivially weak credentials, malformed data persisted.

**Fix / acceptance criteria:** Validate with a schema validator (e.g. `zod`/`express-validator`): valid email, min password length (≥8) + complexity, required non-empty fields. Reject with 400 before hashing.

### Development phases (implementation)
- **Phase 1 — Validators util:** a small dependency-free `validators.js` with `validateEmail` (format + length), `validateUsername` (3–30 chars, safe charset), and `validatePassword` (≥8 chars, must contain a letter and a number, ≤128).
- **Phase 2 — Register:** validate email/username/password and reject with `400` before hashing; trim email/username.
- **Phase 3 — Change password:** require `currentPassword`, enforce the password policy on `newPassword`, and reject when the new password equals the current one.
- **Phase 4 — Verify:** unit-check the validators against valid/invalid inputs.

**Status:** ✅ Implemented.

---

## 🟠 SEC-5 — Stateless JWT cannot be revoked; password change doesn't invalidate sessions

**Where:** [server/src/controllers/authController.js:67-93](server/src/controllers/authController.js#L67-L93), [server/src/middleware/auth.js](server/src/middleware/auth.js), [changePassword](server/src/controllers/authController.js#L142-L159)

**Problem:** Tokens are valid for 7 days with no server-side revocation. `logout` only clears the client cookie — a stolen/copied token remains valid. Changing the password does not invalidate previously issued tokens.

**Impact:** A leaked token grants access for up to 7 days even after logout or password reset.

**Fix / acceptance criteria:** Add a token version / `tokenValidAfter` timestamp on the user, checked in `auth` middleware; bump it on password change and logout. Consider shorter access-token lifetime + refresh token.

### Development phases (implementation)
- **Phase 1 — Model field:** add `tokenValidAfter` (epoch seconds, default 0) to `User`. Any JWT whose `iat` is earlier than this value is considered revoked.
- **Phase 2 — Middleware enforcement:** `auth` verifies the JWT signature *and* looks up the user's `tokenValidAfter`, rejecting tokens issued before it with `401`. (Existing tokens keep working because the default is 0.)
- **Phase 3 — Invalidate on sensitive events:** `changePassword` bumps `tokenValidAfter` to "now" (revoking every existing session) and re-issues a fresh cookie so the *current* session stays logged in; `logout` bumps it too so the cleared token cannot be replayed.
- **Phase 4 — Verify:** sign a token, bump the cutoff, and confirm the old token is rejected while a freshly-issued one is accepted.

**Status:** ✅ Implemented (`tokenValidAfter` cutoff; full refresh-token rotation left as a future enhancement).

---

## 🟠 SEC-6 — Verbose error messages leak internal details

**Where:** Nearly every controller returns `error: error.message` — e.g. [authController.js:46](server/src/controllers/authController.js#L46), [transactionController.js:47](server/src/controllers/transactionController.js#L47), [webhookController.js:53](server/src/controllers/webhookController.js#L53), khata/canteen/module controllers.

**Problem:** Raw exception text (DB errors, cast errors, internal paths) is sent to clients.

**Impact:** Information disclosure that aids attackers (schema/driver details, query structure).

**Fix / acceptance criteria:** Return generic messages to clients; log details server-side only. Add a central Express error handler and stop passing `error.message` in responses.

**Status:** ✅ Implemented — removed `error: error.message` from all controller responses (auth, transaction, canteen, module, khata, webhook). Verified `0` remaining occurrences.

---

## 🟠 SEC-7 — User enumeration via distinct auth responses

**Where:** [login:55-63](server/src/controllers/authController.js#L55-L63) (404 "User not found" vs 400 "Invalid credentials"), [register:11](server/src/controllers/authController.js#L11) ("User already exists"), [updateProfile:117](server/src/controllers/authController.js#L117)

**Problem:** Different status/messages reveal whether an email/username exists.

**Impact:** Attackers can enumerate valid accounts to target for phishing/brute-force.

**Fix / acceptance criteria:** Return a single generic "Invalid email or password" for all login failures (same status code); make registration reveal existence only through a rate-limited, generic flow.

**Status:** ✅ Implemented — login returns a single generic `401 Invalid email or password` for both unknown-user and wrong-password, and runs a dummy bcrypt compare when the user is absent so response timing doesn't leak account existence. (Register still reports duplicates but is rate-limited via SEC-3.)

---

## 🟡 SEC-8 — Mass assignment when adding transactions (array path)

**Where:** [server/src/controllers/transactionController.js:8-24](server/src/controllers/transactionController.js#L8-L24)

**Problem:** The array branch does `req.body.map(t => ({ ...t, user: req.userId, ... }))`, spreading **all** client-supplied fields into `insertMany`. A client can set schema fields it shouldn't control (e.g. `status: 'approved'`, `createdAt`, `date` in the past/future). The single-object branch is safe (explicit fields) — the array branch is not.

**Impact:** Integrity issues (e.g. forcing `pending` webhook transactions to `approved`, backdating records).

**Fix / acceptance criteria:** Whitelist fields explicitly in the array branch exactly like the single-object branch (`amount, date, note, type, module`). Never spread raw request objects into the model.

**Status:** ✅ Implemented — the array branch now maps to an explicit field whitelist (`amount, type, note, date, user, module`); client-supplied `status`/`_id`/`createdAt` can no longer be injected.

---

## 🟡 SEC-9 — CORS/config hardcoded to localhost; dead `allowedOrigins`

**Where:** [server/index.js:18-26](server/index.js#L18-L26)

**Problem:** `cors({ origin: "http://localhost:5173", credentials: true })` is hardcoded; the `allowedOrigins` array and `baseFrontendUrl` are declared but unused. The client `baseURL` is also hardcoded to `http://localhost:5000`. This is fragile config that tends to get "fixed" in prod by reflecting the request origin — which, combined with `credentials:true`, would be a serious CORS hole.

**Impact:** Broken prod auth today; high risk of an insecure origin-reflection fix later.

**Fix / acceptance criteria:** Drive allowed origins from an env allowlist (never reflect arbitrary origins with credentials). Drive client `baseURL` from an env var. Remove dead config.

**Status:** ✅ Implemented — CORS origin is validated against a `CORS_ORIGINS` env allowlist (comma-separated; no-Origin requests like the SMS app allowed); dead `baseFrontendUrl`/hardcoded array removed. Client `baseURL` moved to `VITE_API_URL` in SEC-2. **Set `CORS_ORIGINS=https://my-expence-tracckker.vercel.app` in server env.**

---

## 🟡 SEC-10 — Server does not fail-fast on missing JWT_SECRET

**Where:** [server/index.js:10-12](server/index.js#L10-L12)

**Problem:** A missing `JWT_SECRET` only logs a warning and the server keeps running. There is no check that the secret is present and of sufficient length/entropy.

**Impact:** Risk of running with an undefined/weak signing key (forgeable tokens).

**Fix / acceptance criteria:** Exit on startup if `JWT_SECRET` is missing or shorter than ~32 chars.

**Status:** ✅ Implemented — server now `process.exit(1)`s at startup if `JWT_SECRET` is missing or `< 32` chars. Verified: booting with a short secret prints `FATAL` and refuses to start. **Ensure the deployed secret is ≥32 random chars.**

---

## 🟡 SEC-11 — No query-operator / NoSQL-injection hardening

**Where:** [login:52-55](server/src/controllers/authController.js#L52-L55), [register:10](server/src/controllers/authController.js#L10), webhook, all `req.body`/`req.query` usage

**Problem:** Request objects are passed straight into Mongoose queries. Mongoose casting on typed String fields blunts classic `{$gt:""}` operator injection, but there is no defense-in-depth (no `express-mongo-sanitize`, no explicit type coercion of `email`/`password` to strings).

**Impact:** Reduces exposure to operator-injection tricks and future untyped queries.

**Fix / acceptance criteria:** Add `express-mongo-sanitize` (or equivalent) and coerce/validate `email`/`password`/ids to expected primitive types before querying.

**Status:** ✅ Implemented — a custom `sanitize` middleware (Express-5-safe; recursively strips `$`-prefixed and dotted keys from body/params) runs globally; `login` also type-checks `email`/`password` as strings. Verified: `{"email":{"$ne":null}}` on `/api/auth/login` is neutralized and returns `400`. (Custom middleware used instead of `express-mongo-sanitize`, which mutates the now-read-only `req.query` in Express 5.)

---

## 🟡 SEC-12 — Missing security headers / hardening middleware

**Where:** [server/index.js](server/index.js)

**Problem:** No `helmet`, no body-size limit on `express.json()`, no HSTS/other headers.

**Impact:** Larger attack surface (clickjacking, MIME sniffing, oversized-payload DoS).

**Fix / acceptance criteria:** Add `helmet()`, set `express.json({ limit: '32kb' })` (tune as needed), enable HSTS in production.

**Status:** ✅ Implemented — `helmet()` enabled and `express.json({ limit: '32kb' })` set. Verified: responses now carry CSP, HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, etc.

---

## ⚪ SEC-13 — Android privacy/permission surface & JSON building in native receiver

**Where:** [app-apk/withSmsReceiver.js:13-22](app-apk/withSmsReceiver.js#L13-L22) (READ_SMS + RECEIVE_SMS + boot + battery-opt-ignore), [SmsReceiver JSON build:281-286](app-apk/withSmsReceiver.js#L281-L286)

**Problem:** The app requests broad SMS + boot + battery permissions and reads **all** incoming SMS. The native receiver builds JSON via `String.format` with hand-rolled escaping (only `"` and `\n`), which can produce malformed JSON for other control characters/backslashes. Confirm Play Store SMS-permission policy compliance.

**Impact:** Privacy exposure of all SMS; brittle payloads; store-policy rejection risk.

**Fix / acceptance criteria:** Request the minimum permissions needed; use a real JSON serializer (`org.json.JSONObject`) instead of string formatting; document the SMS-handling justification for Play review.

**Status:** ✅ Implemented — dropped `READ_SMS` (inbox access; `RECEIVE_SMS` alone suffices for incoming broadcasts) and switched the native payload to `org.json.JSONObject` for correct escaping. Requires a native rebuild (`eas build`) to take effect. Play-review justification doc still TODO.

---

## ⚪ SEC-14 — Config drift bug worth noting (not a vuln, but breaks the security model)

**Where:** [app-apk/SmsTask.js:14](app-apk/SmsTask.js#L14) reads `AsyncStorage.getItem('WEBHOOK_URL')`, but [app-apk/App.js:45](app-apk/App.js#L45) and the native receiver use a `webhook.txt` file.

**Problem:** Two different storage mechanisms for the webhook URL; the JS background task will never find the URL saved by the UI. Flagged because a half-wired forwarding path can lead to silent failures or a stale/attacker-controlled URL going unnoticed.

**Fix / acceptance criteria:** Standardize on one storage location for the webhook URL across UI, JS task, and native receiver.

**Status:** ✅ Implemented — `SmsTask.js` now reads the same `webhook.txt` / `webhook_token.txt` files used by the UI and native receiver (previously it read never-set AsyncStorage keys), so all three paths share one source of truth.

---

## Suggested priority order
1. SEC-1, SEC-2 (unauthenticated webhook + cleartext bank/OTP SMS) — fix first.
2. SEC-3, SEC-4, SEC-5, SEC-7 (auth hardening).
3. SEC-6, SEC-8, SEC-9, SEC-10, SEC-11, SEC-12.
4. SEC-13, SEC-14.

## Good practices already in place
- Passwords hashed with `bcrypt` (cost 12); hash excluded via `.select('-passwordHash')`.
- Auth cookie is `httpOnly` + `secure` + `sameSite:none`.
- Per-user ownership scoping on transaction/khata/canteen/module queries (`{ user: req.userId }`).
- `.env` is git-ignored and not committed.
