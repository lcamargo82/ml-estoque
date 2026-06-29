# Mobile Vivid Inventory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved faithful-and-adaptive mobile redesign, complete suppliers/profile/password recovery flows, reliable biometric login, and password visibility controls across web and mobile.

**Architecture:** Keep the NestJS API as the authorization boundary, adding authenticated self-service profile endpoints instead of weakening admin-only user routes. In mobile, introduce small shared visual components and focused domain stores/services, then refactor each screen onto the approved bottom-navigation design while preserving existing inventory, camera, scanner, movement, offline, and sync behavior.

**Tech Stack:** NestJS 10, TypeORM, bcrypt, Jest, Vue 3, Pinia, Ionic Vue 8, Capacitor 8, Capgo Native Biometric, Vitest, Vue Test Utils, Tailwind CSS.

---

## File Structure

### API

- Create `projeto-nest/api/src/modules/auth/dto/update-profile.dto.ts`: validates self-service profile updates.
- Create `projeto-nest/api/src/modules/auth/dto/change-password.dto.ts`: validates current/new password input.
- Modify `projeto-nest/api/src/modules/auth/auth.controller.ts`: exposes authenticated profile update and password change routes.
- Modify `projeto-nest/api/src/modules/auth/auth.service.ts`: owns current-password comparison and self-service updates.
- Modify `projeto-nest/api/src/modules/users/users.service.ts`: supplies a password-inclusive lookup by ID without exposing it to controllers.
- Modify `projeto-nest/api/src/modules/mail/mail.service.ts`: generates mobile deep link plus web fallback.
- Modify `projeto-nest/api/src/config/env.validation.ts`: validates optional mobile reset-link base.
- Modify `projeto-nest/api/src/modules/auth/auth.service.spec.ts`: tests password/profile security rules.

### Shared Mobile Foundation

- Create `projeto-nest/mobile/src/components/AppHeader.vue`: reference-style mobile header.
- Create `projeto-nest/mobile/src/components/BottomNav.vue`: primary Dashboard/Catalog/Suppliers/Profile navigation.
- Create `projeto-nest/mobile/src/components/AppField.vue`: shared icon field.
- Create `projeto-nest/mobile/src/components/PasswordField.vue`: accessible password visibility control.
- Create `projeto-nest/mobile/src/components/AppState.vue`: loading/empty/error presentation.
- Modify `projeto-nest/mobile/src/theme/variables.css`: approved Vivid Inventory tokens and global utilities.
- Modify `projeto-nest/mobile/src/App.vue`: removes drawer and initializes app/deep-link behavior.
- Modify `projeto-nest/mobile/src/router/index.ts`: adds primary and authentication routes.

### Mobile Domains and Screens

- Create `projeto-nest/mobile/src/stores/suppliers.ts`: supplier CRUD and local cache.
- Modify `projeto-nest/mobile/src/stores/auth.ts`: profile operations, recovery, and robust biometric lifecycle.
- Modify `projeto-nest/mobile/src/stores/inventory.ts`: product update/delete helpers needed by the reference catalog actions.
- Create `projeto-nest/mobile/src/views/SuppliersView.vue`
- Create `projeto-nest/mobile/src/views/SupplierFormView.vue`
- Create `projeto-nest/mobile/src/views/ProfileView.vue`
- Create `projeto-nest/mobile/src/views/ForgotPasswordView.vue`
- Create `projeto-nest/mobile/src/views/ResetPasswordView.vue`
- Modify `projeto-nest/mobile/src/views/LoginView.vue`
- Modify `projeto-nest/mobile/src/views/HomeView.vue`
- Modify `projeto-nest/mobile/src/views/InventoryView.vue`
- Modify `projeto-nest/mobile/src/views/AddProductView.vue`
- Modify `projeto-nest/mobile/src/views/MovementView.vue`
- Modify `projeto-nest/mobile/src/views/ScannerView.vue`
- Modify `projeto-nest/mobile/android/app/src/main/AndroidManifest.xml`: registers reset deep link.

### Web Password Fields

- Modify `projeto-nest/frontend/src/components/ui/BaseInput.vue`: reusable password visibility control.
- Modify `projeto-nest/frontend/src/views/Login.vue`: uses the shared password input.
- Modify `projeto-nest/frontend/src/views/ResetPassword.vue`: uses shared password inputs.
- Existing `projeto-nest/frontend/src/views/Users.vue` automatically receives visibility through `BaseInput`.

### Tests

- Create `projeto-nest/mobile/tests/unit/auth.store.spec.ts`
- Create `projeto-nest/mobile/tests/unit/suppliers.store.spec.ts`
- Create `projeto-nest/mobile/tests/unit/PasswordField.spec.ts`
- Create `projeto-nest/mobile/tests/unit/router.spec.ts`
- Replace `projeto-nest/mobile/tests/unit/example.spec.ts`
- Add frontend Vitest configuration and `projeto-nest/frontend/src/components/ui/BaseInput.spec.ts`.

---

### Task 1: Add Secure Self-Service Profile API

**Files:**
- Create: `projeto-nest/api/src/modules/auth/dto/update-profile.dto.ts`
- Create: `projeto-nest/api/src/modules/auth/dto/change-password.dto.ts`
- Modify: `projeto-nest/api/src/modules/auth/auth.controller.ts`
- Modify: `projeto-nest/api/src/modules/auth/auth.service.ts`
- Modify: `projeto-nest/api/src/modules/users/users.service.ts`
- Test: `projeto-nest/api/src/modules/auth/auth.service.spec.ts`

- [ ] **Step 1: Write failing password-change and profile-update tests**

Add tests that mock `usersService.findByIdWithPassword`, `bcrypt.compare`, and
`usersService.update`, including:

```ts
it('rejects change password when current password is incorrect', async () => {
  usersService.findByIdWithPassword.mockResolvedValue({ id: 'user-1', password: 'hash' });
  jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

  await expect(service.changePassword('user-1', {
    currentPassword: 'wrong',
    newPassword: 'new-secret',
  })).rejects.toThrow('Senha atual incorreta');
});

it('updates only allowed profile fields', async () => {
  usersService.update.mockResolvedValue({ id: 'user-1', name: 'Novo', email: 'novo@example.com' });
  await service.updateProfile('user-1', { name: 'Novo', email: 'novo@example.com' });
  expect(usersService.update).toHaveBeenCalledWith('user-1', {
    name: 'Novo',
    email: 'novo@example.com',
  });
});
```

- [ ] **Step 2: Run the focused API test and verify RED**

Run: `cd projeto-nest/api && npm test -- auth.service.spec.ts --runInBand`

Expected: FAIL because `changePassword`, `updateProfile`, and
`findByIdWithPassword` do not exist.

- [ ] **Step 3: Implement DTOs and service methods**

Use DTOs with `IsString`, `IsEmail`, and `MinLength(6)`. Implement:

```ts
async changePassword(userId: string, dto: ChangePasswordDto) {
  const user = await this.usersService.findByIdWithPassword(userId);
  if (!user || !(await bcrypt.compare(dto.currentPassword, user.password))) {
    throw new BadRequestException('Senha atual incorreta');
  }
  await this.usersService.update(userId, { password: dto.newPassword });
  return { message: 'Senha alterada com sucesso' };
}

async updateProfile(userId: string, dto: UpdateProfileDto) {
  return this.usersService.update(userId, { name: dto.name, email: dto.email });
}
```

Expose authenticated `PATCH /auth/profile` and `POST /auth/change-password`
routes using `req.user.id`.

- [ ] **Step 4: Run API tests and build**

Run: `cd projeto-nest/api && npm test -- auth.service.spec.ts --runInBand && npm run build`

Expected: focused tests PASS and Nest build succeeds.

- [ ] **Step 5: Commit**

```bash
git add projeto-nest/api/src/modules/auth projeto-nest/api/src/modules/users/users.service.ts
git commit -m "feat: add secure self-service profile API"
```

### Task 2: Add Mobile Reset Deep Links

**Files:**
- Modify: `projeto-nest/api/src/modules/mail/mail.service.ts`
- Modify: `projeto-nest/api/src/config/env.validation.ts`
- Modify: `projeto-nest/mobile/android/app/src/main/AndroidManifest.xml`
- Modify: `projeto-nest/mobile/src/App.vue`
- Test: `projeto-nest/mobile/tests/unit/router.spec.ts`

- [ ] **Step 1: Write a failing deep-link parser/router test**

Extract and test a small exported helper from the router:

```ts
expect(resetRouteFromUrl('mlestoque://reset-password?token=abc123')).toEqual({
  path: '/reset-password',
  query: { token: 'abc123' },
});
expect(resetRouteFromUrl('mlestoque://reset-password')).toBeNull();
```

- [ ] **Step 2: Run the test and verify RED**

Run: `cd projeto-nest/mobile && npm run test:unit -- tests/unit/router.spec.ts --run`

Expected: FAIL because the helper and route do not exist.

- [ ] **Step 3: Implement deep-link generation and handling**

Add `MOBILE_RESET_URL` with default `mlestoque://reset-password` to API env
validation. Update mail content to include the mobile URL and existing web URL
without logging either token. Add the Android intent filter:

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="mlestoque" android:host="reset-password" />
</intent-filter>
```

Use `App.addListener('appUrlOpen', ...)` to route only valid reset links.

- [ ] **Step 4: Verify test and builds**

Run: `cd projeto-nest/mobile && npm run test:unit -- tests/unit/router.spec.ts --run && npm run build`

Run: `cd projeto-nest/api && npm run build`

Expected: test PASS and both builds succeed.

- [ ] **Step 5: Commit**

```bash
git add projeto-nest/api/src/modules/mail projeto-nest/api/src/config/env.validation.ts projeto-nest/mobile/android/app/src/main/AndroidManifest.xml projeto-nest/mobile/src/App.vue projeto-nest/mobile/src/router/index.ts projeto-nest/mobile/tests/unit/router.spec.ts
git commit -m "feat: support mobile password reset links"
```

### Task 3: Repair Biometric Lifecycle

**Files:**
- Modify: `projeto-nest/mobile/src/stores/auth.ts`
- Test: `projeto-nest/mobile/tests/unit/auth.store.spec.ts`

- [ ] **Step 1: Write failing biometric lifecycle tests**

Mock `NativeBiometric`, `Preferences`, and API. Cover:

```ts
it('marks biometrics linked only after credentials can be read back', async () => {
  NativeBiometric.getCredentials.mockResolvedValue({ username: 'a@b.com', password: 'secret' });
  await store.enrollBiometrics({ email: 'a@b.com', password: 'secret' });
  expect(Preferences.set).toHaveBeenCalledWith({ key: 'biometrics_linked', value: 'true' });
});

it('clears stale biometric link when credentials are missing', async () => {
  NativeBiometric.getCredentials.mockRejectedValue(new Error('missing'));
  await expect(store.loginWithBiometrics()).resolves.toMatchObject({ success: false, reason: 'credentials-missing' });
  expect(Preferences.remove).toHaveBeenCalledWith({ key: 'biometrics_linked' });
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `cd projeto-nest/mobile && npm run test:unit -- tests/unit/auth.store.spec.ts --run`

Expected: FAIL because enrollment verification and structured results do not
exist.

- [ ] **Step 3: Implement reliable biometric state**

Replace `saveBiometricCredentials` with `enrollBiometrics`, which verifies
identity, sets credentials, reads them back, compares username, then persists
the link. Add `clearBiometricLink` to delete native credentials when possible
and remove the preference. Return structured login failure reasons so the UI can
distinguish cancellation, unavailable device, and missing credentials.

- [ ] **Step 4: Run focused and full mobile unit tests**

Run: `cd projeto-nest/mobile && npm run test:unit -- tests/unit/auth.store.spec.ts --run && npm run test:unit -- --run`

Expected: all mobile unit tests PASS.

- [ ] **Step 5: Commit**

```bash
git add projeto-nest/mobile/src/stores/auth.ts projeto-nest/mobile/tests/unit/auth.store.spec.ts
git commit -m "fix: make biometric enrollment reliable"
```

### Task 4: Build Shared Mobile Visual Foundation

**Files:**
- Create: `projeto-nest/mobile/src/components/AppHeader.vue`
- Create: `projeto-nest/mobile/src/components/BottomNav.vue`
- Create: `projeto-nest/mobile/src/components/AppField.vue`
- Create: `projeto-nest/mobile/src/components/PasswordField.vue`
- Create: `projeto-nest/mobile/src/components/AppState.vue`
- Modify: `projeto-nest/mobile/src/theme/variables.css`
- Modify: `projeto-nest/mobile/src/App.vue`
- Test: `projeto-nest/mobile/tests/unit/PasswordField.spec.ts`
- Delete: `projeto-nest/mobile/tests/unit/example.spec.ts`

- [ ] **Step 1: Write failing PasswordField accessibility test**

```ts
it('toggles visibility and accessible label', async () => {
  const wrapper = mount(PasswordField, { props: { modelValue: 'secret', label: 'Senha' } });
  expect(wrapper.get('input').attributes('type')).toBe('password');
  await wrapper.get('button[aria-label="Mostrar senha"]').trigger('click');
  expect(wrapper.get('input').attributes('type')).toBe('text');
  expect(wrapper.get('button').attributes('aria-label')).toBe('Ocultar senha');
});
```

- [ ] **Step 2: Run test and verify RED**

Run: `cd projeto-nest/mobile && npm run test:unit -- tests/unit/PasswordField.spec.ts --run`

Expected: FAIL because `PasswordField.vue` does not exist.

- [ ] **Step 3: Implement shared components and theme**

Implement components with explicit props/events and no domain logic. Define the
approved tokens (`#171118`, `#201921`, `#241d25`, `#a951c6`, `#efb0ff`,
`#d0cb56`) and reusable `.vivid-page`, `.vivid-card`, `.tech-label`, and
safe-area bottom-padding utilities. Remove the drawer from `App.vue`.

- [ ] **Step 4: Run test and mobile build**

Run: `cd projeto-nest/mobile && npm run test:unit -- tests/unit/PasswordField.spec.ts --run && npm run build`

Expected: PASS and build succeeds.

- [ ] **Step 5: Commit**

```bash
git add projeto-nest/mobile/src/components projeto-nest/mobile/src/theme/variables.css projeto-nest/mobile/src/App.vue projeto-nest/mobile/tests/unit
git commit -m "feat: add vivid mobile UI foundation"
```

### Task 5: Refactor Login and Add In-App Recovery Screens

**Files:**
- Modify: `projeto-nest/mobile/src/views/LoginView.vue`
- Create: `projeto-nest/mobile/src/views/ForgotPasswordView.vue`
- Create: `projeto-nest/mobile/src/views/ResetPasswordView.vue`
- Modify: `projeto-nest/mobile/src/router/index.ts`
- Modify: `projeto-nest/mobile/src/stores/auth.ts`

- [ ] **Step 1: Add failing reset submission tests to auth store spec**

Test that forgot password posts `{ email }`, reset password posts
`{ token, password }`, and validation errors remain available to the view.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `cd projeto-nest/mobile && npm run test:unit -- tests/unit/auth.store.spec.ts --run`

Expected: FAIL because recovery actions do not exist.

- [ ] **Step 3: Implement auth actions and screens**

Add `requestPasswordReset(email)` and `resetPassword(token, password)` actions.
Rebuild login to match the reference, use `PasswordField`, expose specific
biometric errors, and link to `/forgot-password`. Build mobile forgot/reset
screens with all password visibility controls and confirmation validation.

- [ ] **Step 4: Run tests and build**

Run: `cd projeto-nest/mobile && npm run test:unit -- tests/unit/auth.store.spec.ts --run && npm run build`

Expected: tests PASS and build succeeds.

- [ ] **Step 5: Commit**

```bash
git add projeto-nest/mobile/src/views/LoginView.vue projeto-nest/mobile/src/views/ForgotPasswordView.vue projeto-nest/mobile/src/views/ResetPasswordView.vue projeto-nest/mobile/src/router/index.ts projeto-nest/mobile/src/stores/auth.ts projeto-nest/mobile/tests/unit/auth.store.spec.ts
git commit -m "feat: redesign mobile authentication flows"
```

### Task 6: Add Complete Mobile Supplier Domain

**Files:**
- Create: `projeto-nest/mobile/src/stores/suppliers.ts`
- Create: `projeto-nest/mobile/src/views/SuppliersView.vue`
- Create: `projeto-nest/mobile/src/views/SupplierFormView.vue`
- Modify: `projeto-nest/mobile/src/router/index.ts`
- Test: `projeto-nest/mobile/tests/unit/suppliers.store.spec.ts`

- [ ] **Step 1: Write failing supplier CRUD tests**

Test `fetchSuppliers`, `createSupplier`, `updateSupplier`, and `deleteSupplier`
against mocked API responses and verify cached `Preferences` writes after every
successful mutation.

- [ ] **Step 2: Run tests and verify RED**

Run: `cd projeto-nest/mobile && npm run test:unit -- tests/unit/suppliers.store.spec.ts --run`

Expected: FAIL because the supplier store does not exist.

- [ ] **Step 3: Implement supplier store and screens**

Use typed `Supplier` data (`id`, `name`, `taxId`, `contactInfo`). Build the
reference-style searchable list with edit/delete actions, delete confirmation,
loading/error/empty states, FAB, and create/edit form.

- [ ] **Step 4: Run tests and build**

Run: `cd projeto-nest/mobile && npm run test:unit -- tests/unit/suppliers.store.spec.ts --run && npm run build`

Expected: tests PASS and build succeeds.

- [ ] **Step 5: Commit**

```bash
git add projeto-nest/mobile/src/stores/suppliers.ts projeto-nest/mobile/src/views/SuppliersView.vue projeto-nest/mobile/src/views/SupplierFormView.vue projeto-nest/mobile/src/router/index.ts projeto-nest/mobile/tests/unit/suppliers.store.spec.ts
git commit -m "feat: add mobile supplier management"
```

### Task 7: Add Mobile Profile and Password Change

**Files:**
- Create: `projeto-nest/mobile/src/views/ProfileView.vue`
- Modify: `projeto-nest/mobile/src/stores/auth.ts`
- Modify: `projeto-nest/mobile/src/router/index.ts`
- Test: `projeto-nest/mobile/tests/unit/auth.store.spec.ts`

- [ ] **Step 1: Write failing profile action tests**

Test `updateProfile` calling `PATCH /auth/profile`, `changePassword` calling
`POST /auth/change-password`, and clearing biometric linkage when secure
credential refresh is declined or fails.

- [ ] **Step 2: Run tests and verify RED**

Run: `cd projeto-nest/mobile && npm run test:unit -- tests/unit/auth.store.spec.ts --run`

Expected: FAIL because profile actions do not exist.

- [ ] **Step 3: Implement profile store actions and view**

Build the reference-style profile screen with editable name/email, password
section requiring current/new/confirmation fields, forgot-password link,
biometric status/action, save feedback, and logout. After password change,
offer re-enrollment; otherwise clear the biometric link.

- [ ] **Step 4: Run tests and build**

Run: `cd projeto-nest/mobile && npm run test:unit -- tests/unit/auth.store.spec.ts --run && npm run build`

Expected: tests PASS and build succeeds.

- [ ] **Step 5: Commit**

```bash
git add projeto-nest/mobile/src/views/ProfileView.vue projeto-nest/mobile/src/stores/auth.ts projeto-nest/mobile/src/router/index.ts projeto-nest/mobile/tests/unit/auth.store.spec.ts
git commit -m "feat: add secure mobile profile"
```

### Task 8: Refactor Dashboard and Primary Navigation

**Files:**
- Modify: `projeto-nest/mobile/src/views/HomeView.vue`
- Modify: `projeto-nest/mobile/src/router/index.ts`
- Modify: `projeto-nest/mobile/src/components/BottomNav.vue`

- [ ] **Step 1: Add a focused component test for primary destinations**

Mount `BottomNav` with mocked route and verify all four approved destinations
and active state.

- [ ] **Step 2: Run test and verify RED**

Run: `cd projeto-nest/mobile && npm run test:unit -- tests/unit/BottomNav.spec.ts --run`

Expected: FAIL until destinations and active state are complete.

- [ ] **Step 3: Implement dashboard reference layout**

Use real user name, product count, stock value, low-stock/queue indicators,
recent product images, recent local movement activity, and preserved quick
actions for input, output, scanner, catalog, and sync.

- [ ] **Step 4: Run test and build**

Run: `cd projeto-nest/mobile && npm run test:unit -- tests/unit/BottomNav.spec.ts --run && npm run build`

Expected: PASS and build succeeds.

- [ ] **Step 5: Commit**

```bash
git add projeto-nest/mobile/src/views/HomeView.vue projeto-nest/mobile/src/router/index.ts projeto-nest/mobile/src/components/BottomNav.vue projeto-nest/mobile/tests/unit/BottomNav.spec.ts
git commit -m "feat: redesign mobile dashboard navigation"
```

### Task 9: Refactor Catalog and Product Form Without Regressions

**Files:**
- Modify: `projeto-nest/mobile/src/views/InventoryView.vue`
- Modify: `projeto-nest/mobile/src/views/AddProductView.vue`
- Modify: `projeto-nest/mobile/src/stores/inventory.ts`
- Modify: `projeto-nest/mobile/src/router/index.ts`

- [ ] **Step 1: Add failing inventory mutation tests**

Test API-backed `updateProduct` and `deleteProduct` helpers and verify local
items/cache update only after successful API responses.

- [ ] **Step 2: Run tests and verify RED**

Run: `cd projeto-nest/mobile && npm run test:unit -- tests/unit/inventory.store.spec.ts --run`

Expected: FAIL because mutation helpers do not exist.

- [ ] **Step 3: Implement reference catalog and reusable product form**

Rebuild catalog cards, search, stock badges, prices, edit/delete actions, FAB,
bottom navigation, and details behavior. Adapt `AddProductView` to support
create and edit routes while retaining every existing field, camera/gallery
capture, image removal, external URL, supplier selection, slug creation, and
loading/error feedback.

- [ ] **Step 4: Run tests and build**

Run: `cd projeto-nest/mobile && npm run test:unit -- tests/unit/inventory.store.spec.ts --run && npm run build`

Expected: PASS and build succeeds.

- [ ] **Step 5: Commit**

```bash
git add projeto-nest/mobile/src/views/InventoryView.vue projeto-nest/mobile/src/views/AddProductView.vue projeto-nest/mobile/src/stores/inventory.ts projeto-nest/mobile/src/router/index.ts projeto-nest/mobile/tests/unit/inventory.store.spec.ts
git commit -m "feat: redesign mobile product catalog"
```

### Task 10: Align Movement and Scanner Secondary Flows

**Files:**
- Modify: `projeto-nest/mobile/src/views/MovementView.vue`
- Modify: `projeto-nest/mobile/src/views/ScannerView.vue`

- [ ] **Step 1: Write a failing movement-query initialization test**

Verify `/movement?prodId=p1&type=OUT` initializes the form with product `p1`
and type `OUT`, preserving the scanner-to-movement contract.

- [ ] **Step 2: Run test and verify RED**

Run: `cd projeto-nest/mobile && npm run test:unit -- tests/unit/MovementView.spec.ts --run`

Expected: FAIL because current movement view ignores route query.

- [ ] **Step 3: Implement query initialization and approved styling**

Apply shared header, fields, cards, and feedback to both views. Preserve manual
SKU, scan result actions, and queued offline movement behavior.

- [ ] **Step 4: Run test and build**

Run: `cd projeto-nest/mobile && npm run test:unit -- tests/unit/MovementView.spec.ts --run && npm run build`

Expected: PASS and build succeeds.

- [ ] **Step 5: Commit**

```bash
git add projeto-nest/mobile/src/views/MovementView.vue projeto-nest/mobile/src/views/ScannerView.vue projeto-nest/mobile/tests/unit/MovementView.spec.ts
git commit -m "feat: align mobile movement and scanner flows"
```

### Task 11: Add Password Visibility Everywhere on Web

**Files:**
- Modify: `projeto-nest/frontend/package.json`
- Modify: `projeto-nest/frontend/src/components/ui/BaseInput.vue`
- Create: `projeto-nest/frontend/src/components/ui/BaseInput.spec.ts`
- Modify: `projeto-nest/frontend/src/views/Login.vue`
- Modify: `projeto-nest/frontend/src/views/ResetPassword.vue`

- [ ] **Step 1: Add Vitest tooling and write failing BaseInput test**

Configure a `test:unit` script and test that `type="password"` renders a
non-submit visibility button whose accessible label and input type toggle.

- [ ] **Step 2: Run test and verify RED**

Run: `cd projeto-nest/frontend && npm run test:unit -- src/components/ui/BaseInput.spec.ts --run`

Expected: FAIL because BaseInput has no visibility control.

- [ ] **Step 3: Implement reusable visibility control and adopt BaseInput**

Use `Eye` and `EyeOff` from `lucide-vue-next`. Keep non-password behavior
unchanged. Convert login and both reset fields to `BaseInput`; Users already
uses it.

- [ ] **Step 4: Run tests and web build**

Run: `cd projeto-nest/frontend && npm run test:unit -- --run && npm run build`

Expected: tests PASS and build succeeds.

- [ ] **Step 5: Commit**

```bash
git add projeto-nest/frontend/package.json projeto-nest/frontend/package-lock.json projeto-nest/frontend/src/components/ui/BaseInput.vue projeto-nest/frontend/src/components/ui/BaseInput.spec.ts projeto-nest/frontend/src/views/Login.vue projeto-nest/frontend/src/views/ResetPassword.vue
git commit -m "feat: add web password visibility controls"
```

### Task 12: Full Verification and Visual QA

**Files:**
- Modify only files required to fix failures found during verification.

- [ ] **Step 1: Run complete automated verification**

Run:

```bash
cd projeto-nest/api && npm test -- --runInBand && npm run build
cd projeto-nest/frontend && npm run test:unit -- --run && npm run build
cd projeto-nest/mobile && npm run test:unit -- --run && npm run build
```

Expected: all tests and builds PASS with no TypeScript errors.

- [ ] **Step 2: Run mobile lint**

Run: `cd projeto-nest/mobile && npm run lint`

Expected: PASS. Fix only issues caused or exposed by this work.

- [ ] **Step 3: Perform browser visual QA**

Start the mobile Vite app and inspect phone viewports against the ZIP reference
screens for Login, Dashboard, Catalog, Product Form, Suppliers, Supplier Form,
and Profile. Verify loading, empty, error, and populated states where practical.

- [ ] **Step 4: Perform functional browser QA**

Verify password show/hide controls, navigation, forgot/reset forms, supplier
CRUD interactions with mocked or available API, product actions, movement query
initialization, and logout. Record that real biometric prompt validation still
requires an Android device with enrolled biometrics.

- [ ] **Step 5: Review final diff and commit verification fixes**

Run: `git diff --check && git status --short`

Expected: no whitespace errors and only intended changes.

```bash
git add projeto-nest/api projeto-nest/frontend projeto-nest/mobile
git commit -m "test: verify vivid inventory redesign"
```
