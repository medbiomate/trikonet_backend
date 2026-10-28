# Employer autosave URLs — 28 October 2026

Employer recovery snapshots used `autosave-employer-<UUID>` as an internal key. The indexed admin list included those copies, offered a public View link for drafts, and loaded that internal key into the editable public URL field. Autosaves also omitted creator attribution and the separately requested company slug.

Changes: keep recovery copies out of employer list rows and counts; retain requested URL and creator in new recovery records; display the requested/title slug when editing old recovery records; use that slug on explicit save and remove recovery flags; reject another company's reserved URL with 409 instead of selecting that company for update. Synchronize the URL field with successful saves, preserve old non-recovery aliases on renames, and show no public View action for unpublished employers.

Existing recovery data is retained. No draft was automatically published. Twenty-two focused tests passed; the optional database integration test was skipped because no test database was configured. Syntax checks passed for both applications.
