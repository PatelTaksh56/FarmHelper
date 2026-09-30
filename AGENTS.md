# AGENTS.md — FarmHelper Workspace Architecture & Engineering Guidelines

## 1. Project Identity

This repository contains **FarmHelper**, a web application designed to help Indian farmers manage farms, crops, crop health, weather, market prices, government schemes, and agricultural decisions from one place.

The project is intended to combine:

- A clean, trustworthy farmer-focused user experience
- AI-assisted agricultural features
- Real-world data and APIs
- Reliable application logic
- Secure authentication and authorization
- Maintainable frontend/backend architecture
- Responsive desktop and mobile UX

The primary development environment may include **Google Antigravity**, **Google Stitch**, AI coding agents, and other development tools.

---

## 2. Core Rule: Inspect Before Changing

Before writing, deleting, refactoring, or moving code:

1. Inspect the repository structure.
2. Identify the frontend framework and build tool.
3. Identify the backend framework and API structure.
4. Identify the database and schema/migrations.
5. Identify authentication and authorization flows.
6. Identify existing reusable components and services.
7. Search for existing implementations before creating duplicates.
8. Read relevant configuration files before changing them.
9. Run the existing application or relevant tests when practical.

Do not assume the repository has the same structure as another project or tutorial.

Do not make destructive architectural changes merely because a different implementation looks cleaner.

---

## 3. Stitch UI/UX Is the Visual Source of Truth

FarmHelper's frontend design may be generated and refined in **Google Stitch** and then integrated into this repository.

When Stitch-generated UI exists in the repository, treat it as the primary visual reference.

Preserve the established design language:

- Warm ivory/off-white backgrounds
- Olive/sage green primary accents
- Dark earthy brown headings
- Muted brown secondary text
- Cream/white cards
- Thin beige borders
- Soft subtle shadows
- Generous whitespace
- Elegant serif headings
- Clean modern sans-serif UI text
- Rounded cards and controls
- Minimal line icons
- Calm premium agricultural SaaS aesthetic

Do not replace the Stitch design with a generic admin dashboard.

Do not introduce neon colors, excessive glassmorphism, excessive gradients, or futuristic cyber/AI styling unless explicitly requested.

When adding a new page or component, make it look like it belongs to the existing FarmHelper design system.

---

## 4. FarmHelper Navigation

The authenticated application should support these primary areas:

1. Overview
2. My Farm
3. Crop Doctor
4. Crop Advisor
5. Weather
6. Market & Mandi
7. Government Schemes
8. Settings
9. Help & Support

An AI Farm Assistant may be available as a dedicated experience and/or contextual assistant within relevant screens.

Do not remove existing navigation items or change their meaning without a clear requirement.

---

## 5. Authentication

The authentication experience must support the application's current requirements without weakening security.

Login may provide:

- Mobile number
- Email
- Google authentication

Registration may collect:

- Full name
- Mobile number
- Email
- Password
- Google sign-up

Rules:

- Never hard-code real user credentials.
- Never expose secrets in frontend source code.
- Never expose private service credentials to the browser.
- Validate input on both client and server where applicable.
- Use secure password handling provided by the chosen authentication system.
- Do not invent a custom cryptographic algorithm.
- Preserve existing authentication behavior unless a deliberate change is required.

---

## 6. Application Features

### 6.1 Overview

The overview should present useful farm-level information such as:

- Today's weather
- Harvest days remaining
- Current market price
- Recommended next crop
- Farm status
- Relevant alerts
- AI assistant access

Avoid overwhelming the user with unnecessary metrics.

### 6.2 My Farm

Support relevant farm information such as:

- Farm location
- Map/location view
- Farm area
- Current crop
- Planting date
- Expected harvest
- Days remaining
- Weather
- Farm status

If Google Maps or another map service is used, keep keys and privileged configuration out of client source code when security requirements require server-side handling.

### 6.3 Crop Doctor

The Crop Doctor can accept:

- Crop selection
- Crop image upload
- Manual problem description

The AI result may include:

- Possible disease/problem
- Confidence/uncertainty
- Detected symptoms
- Possible causes
- Suggested actions
- Preventive measures
- Recommendation to consult a qualified agricultural expert when appropriate

Never present AI output as guaranteed diagnosis or guaranteed treatment.

Validate uploaded files for type, size, and other relevant constraints.

### 6.4 Crop Advisor

The Crop Advisor can accept:

- Manually entered soil parameters
- Soil report image
- Soil report PDF

The system can provide:

- Recommended crops
- Soil compatibility
- Nutrient considerations
- pH compatibility
- Water requirements
- Climate considerations
- Growing period
- Reasoning/justification
- Alternative crop options

AI recommendations must be clearly treated as guidance rather than guaranteed agricultural outcomes.

Do not fabricate soil analysis values or agricultural evidence.

### 6.5 Weather

Weather data should be tied to the relevant farm/user location when available.

Show appropriate current and forecast information without claiming precision that the data source does not provide.

Handle API failures gracefully and show the last known timestamp when appropriate.

### 6.6 Market & Mandi

The interface may provide filters for:

- State
- District
- Market
- Commodity group
- Commodity

The results may include:

- Commodity
- Market
- State
- Arrival date
- Minimum price
- Maximum price
- Modal price
- Unit
- Last updated time

Never invent market prices.

Always display the relevant source/update time when data is available.

### 6.7 Government Schemes

Government scheme data should clearly distinguish verified/official information from application-generated summaries.

Prefer official government links when available.

Store and display launch dates, eligibility, benefits, and links only when supported by the data source.

Do not fabricate government schemes, eligibility requirements, deadlines, or links.

### 6.8 Settings

Settings may include:

- Language
- Land-area measurement unit
- Weight/crop-yield unit
- Temperature scale
- Notifications and alerts

User preferences must be persisted correctly and applied consistently across the application.

### 6.9 Help & Support

The Help & Support area may include:

- National Kisan Call Centre information
- FAQs
- Getting-started guidance
- Feature-specific help
- FarmHelper support contact
- Feedback

Real-world phone numbers and support information must be verified before being presented as authoritative.

---

## 7. AI Features

AI is an assistant to the application's functionality, not a replacement for deterministic application logic.

Use deterministic code for:

- Authentication
- Authorization
- Validation
- Permissions
- Database integrity
- Calculations where formulas are known
- State transitions
- User settings
- Data persistence

Use AI where it provides clear value, such as:

- Natural-language assistance
- Crop problem interpretation
- Soil-report summarization
- Crop recommendation reasoning
- Contextual explanations

Never let an AI model directly bypass security or authorization rules.

Never trust model-generated IDs, roles, permissions, prices, dates, or database commands without validation.

Never execute arbitrary code, SQL, shell commands, or filesystem operations solely because an AI response requested them.

---

## 8. Data and API Integrity

When integrating external APIs:

1. Read the API documentation or existing integration code first.
2. Use environment variables for secrets.
3. Validate and normalize external data.
4. Handle rate limits and failures.
5. Show meaningful error states.
6. Store source/update metadata when useful.
7. Do not silently substitute fabricated data for failed real data.
8. Do not claim that live data is live unless the application actually retrieved it.

For cached data, make the timestamp/status clear enough for the user to understand its freshness.

---

## 9. Database Rules

Protect data integrity above convenience.

Before schema changes:

- Inspect the current schema.
- Identify foreign-key relationships.
- Identify indexes and unique constraints.
- Consider existing production/development data.
- Use migrations when the project uses migrations.
- Avoid dropping tables or columns without explicit justification.

Do not delete or reset user data merely to solve a development problem unless the user explicitly asks for a reset.

Use parameterized queries / ORM-safe mechanisms rather than constructing SQL from untrusted user input.

Never put database credentials in frontend code.

---

## 10. Multi-User Data Isolation

FarmHelper is a multi-user application.

Every user-specific resource must be properly scoped to the authenticated user or authorized tenant/farm owner as appropriate.

Examples:

- One farmer must not see another farmer's farms.
- One farmer must not see another farmer's crop records.
- User-specific AI history must be isolated.
- User-specific settings must be isolated.
- Farm documents and uploaded images must be access-controlled.

Never rely only on frontend filtering for security.

Authorization must be enforced server-side wherever backend access is involved.

---

## 11. File Uploads

For images, PDFs, and other uploaded documents:

- Validate file type.
- Validate file size.
- Use safe filenames/IDs.
- Avoid trusting client-provided MIME types alone.
- Prevent path traversal.
- Store private uploads in a controlled location or storage service.
- Enforce access control.
- Handle upload failures cleanly.
- Avoid exposing internal filesystem paths to users.

For AI processing, clearly handle unsupported, corrupted, or unreadable files.

---

## 12. Frontend Engineering Rules

Keep frontend code maintainable and reusable.

Prefer:

- Reusable components
- Shared design tokens
- Consistent spacing
- Centralized API clients/services
- Typed data models when supported by the framework
- Clear loading states
- Clear error states
- Empty states
- Accessible forms
- Keyboard-friendly interactions
- Responsive layouts

Avoid:

- Copy-pasting entire page implementations
- Duplicating API logic across components
- Huge monolithic components when smaller components are practical
- Hard-coded user data presented as real data
- Hard-coded secrets
- Random colors that conflict with the design system

When modifying an existing component, reuse it when possible instead of creating a visually identical duplicate.

---

## 13. UI/UX Rules for Indian Farmers

The target audience may include users with limited technical familiarity.

Therefore:

- Use clear and simple wording.
- Prefer descriptive labels over unexplained icons.
- Keep important actions obvious.
- Use sufficiently large touch targets.
- Avoid unnecessary technical jargon.
- Provide useful empty and error states.
- Make upload and form flows straightforward.
- Keep critical information easy to find.

The interface should feel modern and premium without becoming difficult to operate.

Where localization is supported, design layouts so translated text can expand without breaking.

---

## 14. Responsive Design

The application must work across:

- Desktop
- Laptop
- Tablet
- Mobile

Desktop may use a persistent sidebar.

On smaller screens the sidebar may collapse into a drawer, hamburger navigation, or another established mobile pattern.

Do not solve responsive problems by simply shrinking desktop content until it becomes unreadable.

Check:

- Tables
- Forms
- Upload areas
- Maps
- Charts
- Cards
- Navigation
- Dialogs
- Long text

for mobile behavior.

---

## 15. Accessibility

Use accessible HTML and component semantics where applicable.

Requirements:

- Labels for form controls
- Visible focus states
- Keyboard navigation
- Meaningful button text
- Alt text for meaningful images
- Sufficient contrast
- Do not communicate essential information by color alone
- Proper heading hierarchy

Accessibility should be preserved during UI refactoring.

---

## 16. Error Handling

When an operation fails:

1. Read the complete error.
2. Identify the root cause.
3. Fix the underlying issue.
4. Re-run the relevant operation.
5. Verify the fix.
6. Avoid hiding errors with broad catch blocks or fake success states.

Never report success if an operation actually failed.

For user-facing errors, show a simple actionable message without exposing secrets, stack traces, SQL, or internal paths.

---

## 17. Testing and Verification

Before marking a meaningful change complete:

- Run the relevant build.
- Run relevant tests.
- Check for TypeScript/JavaScript/compiler errors where applicable.
- Check API failures and loading states.
- Verify the modified page visually.
- Verify the main user flow affected by the change.
- Check responsive behavior when the UI changes.

For authentication or authorization changes, test both allowed and denied cases.

For user-specific data, test that one user's data is not visible to another user.

For external APIs, test failure/empty/slow responses where practical.

---

## 18. Git and Change Safety

Before large or risky changes:

- Check the current Git status.
- Preserve the user's existing work.
- Prefer small, reviewable changes.
- Do not delete files simply because they appear unused without checking references.
- Do not rewrite the entire project to solve a localized issue.

When possible, make a logical commit before a major automated refactor so changes can be reverted safely.

---

## 19. Antigravity / AI Agent Operating Procedure

When working as an AI coding agent in this repository:

### Phase A — Understand

Inspect the repository and determine:

- Project structure
- Frameworks
- Runtime/build system
- Existing pages
- Existing components
- APIs
- Authentication
- Database
- Environment/configuration
- Tests

### Phase B — Plan

Before a broad change:

- State what needs to change.
- Identify files likely to change.
- Identify dependencies and risks.
- Preserve working functionality.

### Phase C — Implement

Implement the smallest coherent change that satisfies the requirement.

Prefer existing abstractions over duplicates.

### Phase D — Verify

Run appropriate build/tests/checks and inspect the resulting behavior.

### Phase E — Repair

If verification fails:

- Read the full error.
- Identify the underlying cause.
- Fix it.
- Re-run verification.

Do not repeatedly apply random changes without understanding the error.

### Phase F — Report

At the end, clearly state:

- What changed
- Which files changed
- What was verified
- Any remaining known limitations

Do not claim a feature is complete if it has not been tested or implemented.

---

## 20. Stitch-to-Antigravity Integration Rules

When Stitch-generated UI is introduced into this repository:

1. Treat the Stitch output as frontend/design input, not as an instruction to discard the existing application.
2. Compare Stitch-generated code with the existing frontend before merging.
3. Preserve existing business logic, API integrations, authentication, and database logic.
4. Reuse existing data/services behind the Stitch UI where practical.
5. Replace visual layers carefully rather than rewriting unrelated application layers.
6. Keep the resulting codebase maintainable after integration.
7. Do not preserve Stitch-generated mock data when real application data is available.
8. Convert static UI states into real loading, success, empty, and error states.
9. Connect buttons/forms/navigation to actual application behavior.
10. Verify each page after integration.

Preferred architecture:

```text
Stitch Design / UI
        ↓
FarmHelper Frontend Components
        ↓
API / Service Layer
        ↓
Backend
        ↓
Database / External Services / AI Services
```

Do not bypass the service/backend layer simply to make a UI demo appear functional when production-safe behavior is required.

---

## 21. Environment Variables and Secrets

Use `.env` or the framework's approved secret-management mechanism for sensitive configuration.

Examples include:

- Database credentials
- Authentication secrets
- Google credentials
- Maps/API keys
- AI provider keys
- External API credentials

Never commit secrets to Git.

Never print secrets into logs.

Never paste secrets into frontend bundles unless the provider explicitly documents that the key is safe for public client-side use.

Use `.env.example` for non-secret configuration documentation where appropriate.

---

## 22. No Fake Functionality

Do not make a UI appear functional by returning fabricated success messages.

Examples of unacceptable behavior:

- "Analysis complete" when no analysis happened
- Fake mandi prices presented as live data
- Fake weather presented as current weather
- Fake AI recommendations represented as real model output
- Fake database saves that were never persisted
- Fake authentication success

During prototyping, clearly label mocked/demo data as mock data.

---

## 23. No Unnecessary Rewrites

The agent must not rewrite the project from scratch unless explicitly instructed.

Do not replace the framework, database, authentication system, or architecture simply because a different technology is preferred.

Prefer incremental improvement.

---

## 24. Development Quality Bar

FarmHelper should progressively move toward production-quality engineering.

Every implementation should aim for:

- Correctness
- Security
- Maintainability
- Good UX
- Responsive behavior
- Clear error handling
- Real data integration
- Testability
- Reasonable performance

Visual polish is important, but visual polish must not be achieved by sacrificing correctness or security.

---

## 25. Final Definition of Done

A task is not considered complete merely because code was generated.

A meaningful feature is complete when:

- The requested functionality exists.
- The UI matches the FarmHelper design system.
- Existing relevant functionality still works.
- Data flows through the correct application layers.
- Security/authorization is preserved.
- Errors are handled appropriately.
- Relevant tests/build checks pass.
- The result has been visually inspected where UI changed.
- No known major regression has been introduced.

When uncertain, inspect the codebase and verify rather than guessing.



## FARMHELPER DESIGN RULE

The existing FarmHelper design system is the source of truth for all frontend changes.

Never introduce a new visual style unless explicitly requested.

For every new or modified UI:
- Reuse existing components.
- Reuse existing design tokens.
- Reuse existing colors.
- Reuse existing typography.
- Reuse existing spacing.
- Reuse existing border radii.
- Reuse existing button and input styles.
- Reuse existing sidebar/navigation patterns.
- Match existing responsive behavior.

Before creating a new component, search the codebase for an existing equivalent and reuse it.