# Owner Content Intake

This folder is the staging contract for owner-controlled content. Production must never be updated directly from an unvalidated submission.

## States

- `PENDING`: incomplete working submission. Never publish.
- `REVIEW_READY`: structurally complete enough to review. Never publish owner-controlled facts yet.
- `APPROVED`: owner approval metadata is complete. This is the only state eligible for publication, and it must still pass the strict validator.

## Submission workflow

1. Copy `submission.template.json` to a working file outside Git.
2. Add owner-provided menu data, links, visit details, and photo filenames.
3. Put image originals under a private staging directory, not the public site.
4. Run the validator in review mode.
5. Have the owner explicitly approve the content.
6. Add approval date, approver identity, and evidence reference.
7. Change status to `APPROVED`.
8. Run the strict publish validator.
9. Build a preview and run the normal release harness before production.

## Privacy / repository rule

Actual owner submissions, approval evidence, and uploaded originals are intentionally excluded from Git. Only the template, validation logic, and public-safe production content belong in the repository.
