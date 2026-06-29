# Mobile Vivid Inventory Redesign

## Objective

Refactor the mobile application in `projeto-nest/mobile` to closely reproduce the
screens and design system from `stitch_smart_inventory_manager.zip`, while
preserving all existing functions and using real application data.

The work also adds complete mobile supplier and profile modules, repairs biometric
login, adds password visibility controls to every password field on web and
mobile, and supports password recovery entirely within the mobile app.

## Design Direction

Use a faithful and adaptive implementation:

- Reproduce the reference identity, hierarchy, typography, colors, surfaces,
  spacing, cards, fields, and bottom navigation as closely as practical.
- Adapt reference layouts when required by real data, loading states, errors,
  empty states, or existing application behavior.
- Preserve every existing mobile capability, including product creation,
  camera images, scanner flow, inventory movements, offline queue, and sync.
- Do not reproduce fictitious reference data as static application content.

## Mobile Architecture

### Primary Navigation

Replace the side drawer as the main navigation with the reference-style bottom
navigation:

- Dashboard
- Catalog
- Suppliers
- Profile

Secondary flows remain outside the bottom navigation:

- Scanner
- Stock movement
- Create and edit product
- Create and edit supplier
- Forgot password
- Reset password

These flows are reached through quick actions, floating action buttons, edit
buttons, and authentication links.

### Shared UI

Create focused shared mobile components for:

- Application header
- Bottom navigation
- Icon field
- Password field with accessible show/hide control
- Cards and status badges
- Loading, empty, and error states
- Confirmation dialogs where appropriate

The components follow the reference `DESIGN.md` and screenshots. Technical
values such as SKU, stock quantity, and prices use a monospaced presentation.

### State and Data

Existing stores and API services remain the source of truth. Extend them only
where needed:

- Authentication store owns authentication, profile, and biometric state.
- Inventory store continues to own products, movement queue, and offline data.
- Supplier state and operations are added with persisted cached data where
  useful for the existing offline-oriented mobile behavior.

## Screens

### Login

Closely reproduce the reference login card, branding, fields, primary action,
biometric action, and footer. Add a password visibility control and an
in-app forgot-password link.

### Dashboard

Reproduce the reference dashboard hierarchy using real product, stock, queue,
and user data. Preserve quick access to movement and scanner flows.

### Catalog and Product Form

Reproduce the reference catalog cards, search, status styling, bottom
navigation, and floating add action. Preserve product details, images, stock
data, and existing creation behavior. The product form adopts the reference
layout while retaining camera/gallery support and all existing fields.

### Suppliers

Add a complete mobile supplier module integrated with the existing API:

- List and search suppliers
- Create supplier
- Edit supplier
- Confirm and delete supplier
- Display API errors and empty/loading states

The list and form closely follow the supplier reference screens.

### Profile

Add a profile screen integrated with the existing user API:

- Display and update the current user's name and email
- Change password using current password, new password, and confirmation
- Link to in-app forgot-password flow
- Manage biometric activation state
- Log out

Profile image editing shown in the visual reference is not included because the
current API has no user-image field or upload flow.

## Authentication and Security

### Biometric Root Cause and Repair

The current implementation stores a local `biometrics_linked` flag separately
from secure credentials and does not verify successful credential persistence.
This can leave the UI reporting an active biometric link when no retrievable
credentials exist.

The repaired enrollment flow is:

1. Confirm biometric availability.
2. Complete a successful password login.
3. Ask the user to enable biometrics.
4. Verify biometric identity.
5. Store credentials in the native secure credential store.
6. Read the credentials back successfully.
7. Only then persist the local linked state.

Biometric login verifies identity, reads credentials, and performs a normal API
login. Missing or invalid secure credentials clear the stale linked state and
prompt re-enrollment. Cancellation and device errors receive distinct user
messages.

After a password change, saved biometric credentials are updated only after a
new biometric confirmation. Otherwise the biometric link is cleared to prevent
reusing an obsolete password.

### Current Password Validation

Add a dedicated authenticated API operation for changing the current user's
password. It requires:

- Current password
- New password

The API compares the current password hash before storing the new password.
Incorrect current passwords return a specific validation error.

### Password Visibility

Add an accessible show/hide password control to every password field:

- Web login
- Web reset password and confirmation
- Web user create/edit password
- Mobile login
- Mobile profile current/new/confirmation fields
- Mobile reset password and confirmation

The control has a clear accessible label and does not submit forms.

### In-App Password Recovery

Add mobile forgot-password and reset-password screens. The request screen uses
the existing forgot-password API.

Reset links support a mobile deep link that opens the reset screen in the app
with the token, with a web reset URL as fallback. The mobile reset screen
validates the token, password length, and password confirmation before using the
existing reset-password API.

Deep-link handling must not expose the reset token in logs.

## Error Handling

Show specific, actionable messages for:

- Biometric unavailable or not enrolled on device
- Biometric cancellation
- Missing or stale secure credentials
- Incorrect current password
- Expired or invalid reset token
- Validation errors from supplier and profile operations
- Offline or API connectivity failures

Loading states disable repeated submissions. Destructive supplier actions
require confirmation.

## Testing and Verification

### Automated Tests

Add focused tests for:

- Biometric enrollment only marks the link after credentials are verified
- Biometric login clears stale links when credentials are absent
- Password change rejects an incorrect current password
- Password change succeeds with a correct current password
- Mobile reset-token routing and reset submission
- Supplier create, update, and delete state behavior
- Password visibility controls

### Builds and Regression

Run existing and new tests, then verify builds for:

- NestJS API
- Web frontend
- Mobile frontend

### Visual Verification

Verify the mobile UI at representative phone viewports against the supplied
reference screenshots for:

- Login
- Dashboard
- Catalog
- Product form
- Supplier list and form
- Profile

Differences are acceptable only where required by real data, states, or
preserved application functions.

### Native Verification Limit

Unit and integration tests can verify biometric state transitions and native
plugin calls. Final validation of actual biometric prompts and secure storage
requires an Android device with biometrics enrolled.

## Acceptance Criteria

- Mobile screens closely match the supplied reference design.
- Existing mobile functions remain available and operational.
- Suppliers and profile work end to end against the API.
- Biometric state cannot remain linked without retrievable secure credentials.
- Current password is required before an authenticated password change.
- Forgot/reset password works entirely inside the mobile app after opening the
  email link, with web fallback.
- Every web and mobile password field has a working show/hide control.
- Focused tests and all three builds pass.
