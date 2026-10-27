# Job editor company flow — 27 October 2026

Fixed the following frontend issues:

- Returning from company creation to `#job-editor/<slug>` reloaded the server record instead of restoring unsaved job edits and selecting the saved company.
- Background employer updates rebuilt the selected company control, closing an open picker and clearing its active search.
- Draft snapshots used the company display name as `employerSlug`; selections now retain the actual slug, including while options are loading.
- Company creation now carries the typed company name into its form, and job return restores the original saved identity separately from the edited slug.
- Failed initial company loading now displays an error and retries when the picker is reopened, instead of silently leaving an empty picker.
- Employer saves read the active visual/HTML description directly.

Updated browser module versions so existing browsers request the fix.

Validation: syntax checks passed; 17 focused tests passed across company return/selection, recovery, imported employer matching and default dates. The complete frontend suite also has failures in existing test harnesses and unrelated behavior; it does not pass as a whole. No production job or company records were created for testing.

API-hosted admin console: removed an undefined `loadEmployers()` call after successful company save. The exception prevented navigation back to the job despite a successful POST. Added client validation for the backend-required company fields. Six dedicated API console flow tests pass, including executing the successful company-submit handler through its return navigation.
