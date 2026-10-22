---
name: RFP Requirement & Task Cases
description: Ask the user for their requirement, then create RFP/requirement.md and RFP/taskcase.md in the workspace with traceable, executable test cases. Use when the user mentions RFP, requirement document, SRS, BRD, task cases, or test cases.
---

# RFP Requirement & Task Cases

Convert a raw idea into two review-ready documents in the workspace root:

| Output | Contents |
| --- | --- |
| `RFP/requirement.md` | Scope, users, functional and non-functional requirements with IDs and acceptance criteria |
| `RFP/taskcase.md` | Executable test cases traced to requirement IDs, plus traceability matrix and exit criteria |

## Non-negotiable rules

1. **Ask before writing.** Never invent the requirement. Interview the user, then confirm your summary before creating files.
2. **One question batch at a time.** Maximum five numbered questions per message. Wait for the answers before asking more.
3. **Trace everything.** Every functional requirement gets `REQ-F-nn`. Every test case gets `TC-nnn` and names the requirement it verifies.
4. **Be testable.** Acceptance criteria and expected results must be measurable. Reject vague words like "fast", "user-friendly", or "properly" unless paired with a number.
5. **No silent overwrite.** If `RFP/requirement.md` or `RFP/taskcase.md` already exists, show what exists and ask whether to replace it, create a versioned file such as `requirement-v2.md`, or merge.
6. **Reply in the user's language.** Keep IDs, field names, and file names in English.
7. **Unknowns are allowed, guesses are not.** Record missing decisions under **Open Questions** instead of filling them in.

## Workflow

### Step 1 — Collect the requirement

If the user has not already described the requirement, ask. Start with this core batch:

1. What are we building, in one or two sentences?
2. Who will use it, and what are their roles?
3. What is the single most important outcome this must achieve?
4. Which features are must-have for the first version?
5. Any fixed constraints — tech stack, platform, deadline, budget, integrations, compliance?

Then use `references/interview-guide.md` to fill gaps: scope boundaries, data, workflows, permissions, errors, non-functional targets, and acceptance.

Stop interviewing when you can write every requirement with a testable acceptance criterion. Do not ask for information the user already gave.

### Step 2 — Confirm

Reply with a compact summary:

- Goal and primary users
- In scope / out of scope
- Must-have features
- Assumptions and open questions

Ask: "Is this correct? Should I create the requirement and task case documents?"

Do not write files until the user confirms. If the user explicitly says "use your assumptions", list every assumption in the document and continue.

### Step 3 — Create `RFP/requirement.md`

1. Create the `RFP/` directory if it does not exist.
2. Read `templates/requirement.md` and follow its structure. Remove sections that truly do not apply; do not leave empty headings.
3. Assign IDs:
   - `REQ-F-01`, `REQ-F-02`, ... functional
   - `REQ-NF-01`, ... non-functional (performance, security, availability, usability, accessibility, observability)
   - `REQ-C-01`, ... constraints
4. Every functional requirement row must have a priority (`Must` / `Should` / `Could`) and concrete acceptance criteria.
5. Put unresolved decisions in **Open Questions**, each with an owner and what it blocks.

### Step 4 — Create `RFP/taskcase.md`

1. Read `templates/taskcase.md`.
2. Derive cases only from the requirements just written. Do not test features that are out of scope.
3. Minimum coverage:
   - every `REQ-F-*`: at least one positive case
   - every create/update/delete flow: validation, empty input, boundary, and failure cases
   - every role: allowed and denied actions
   - every external integration: success, timeout, and error response
   - every `REQ-NF-*`: one measurable check
4. Write each case so another person can run it without asking questions: preconditions, numbered steps, exact expected result.
5. Fill the traceability matrix, then confirm no requirement is orphaned and no test case points to a missing requirement.
6. Set every status to `Not run`.

### Step 5 — Verify, then report

Checklist:

- [ ] Both files exist under `RFP/`.
- [ ] File names are exactly `requirement.md` and `taskcase.md`.
- [ ] Every `REQ-F-*` has at least one `TC-*`.
- [ ] Every `TC-*` links to an existing requirement.
- [ ] No duplicate IDs.
- [ ] Scope matches between the two documents.
- [ ] No `TBD` outside **Open Questions**.

Report back with:

- Paths to both files
- Requirement count and test case count
- Top open questions that need the user's decision

## Edge cases

| Situation | Action |
| --- | --- |
| User gives a one-line idea | Ask the core batch from Step 1; do not pad the document with invented features. |
| User gives a large spec or file | Read it fully, then ask only about contradictions and gaps. |
| Existing documents | Ask: replace, create `requirement-v2.md`, or merge. Never destroy user work. |
| Multiple modules | Group requirements by module, keep one global ID sequence, and group test cases the same way. |
| User wants only the requirement | Still offer the task cases; create only what they approve. |
| Scope changes later | Update both files together and keep IDs stable; mark removed items as `Dropped` instead of renumbering. |
