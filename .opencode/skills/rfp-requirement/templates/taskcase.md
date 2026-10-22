# {{PROJECT_NAME}} — Task Cases

| Field | Value |
| --- | --- |
| Related requirement | `RFP/requirement.md` v{{VERSION}} |
| Document ID | RFP-{{PROJECT_SLUG}}-TC-001 |
| Date | {{YYYY-MM-DD}} |
| Status | Draft |
| Environment | {{OS, browser/device, build, test data}} |

## 1. Purpose

Verify that every requirement in `RFP/requirement.md` is met, and that any failure is reproducible.

## 2. Test approach

| Area | Coverage |
| --- | --- |
| Functional | Every `REQ-F-*`, positive path |
| Validation | Empty, invalid, boundary, and oversized input |
| Permissions | Every role: allowed and denied actions |
| Integration | Success, timeout, malformed response, retry |
| Non-functional | One measurable check per `REQ-NF-*` |

**Priority:** P0 = blocks release, P1 = important, P2 = minor.
**Status:** Not run / Pass / Fail / Blocked.

## 3. Traceability matrix

| Requirement | Test cases |
| --- | --- |
| REQ-F-01 | TC-001, TC-002 |
| REQ-NF-01 | TC-010 |

## 4. Test cases

### TC-001 — {{Title}}

| Field | Value |
| --- | --- |
| Requirement | REQ-F-01 |
| Priority | P0 |
| Type | Functional / Negative / Boundary / Permission / Integration / Non-functional |
| Preconditions | ... |
| Test data | ... |

**Steps**

1. ...
2. ...

**Expected result**

- ...

**Actual result:** _(fill during execution)_

**Status:** Not run

---

### TC-002 — {{Title}}

| Field | Value |
| --- | --- |
| Requirement | REQ-F-02 |
| Priority | P1 |
| Type | Functional |
| Preconditions | ... |
| Test data | ... |

**Steps**

1. ...
2. ...

**Expected result**

- ...

**Actual result:** _(fill during execution)_

**Status:** Not run

## 5. Exit criteria

- [ ] All P0 and P1 cases executed.
- [ ] No open Critical or High defect.
- [ ] Every requirement has at least one passing case.

## 6. Defect log

| Defect | Test case | Severity | Description | Status |
| --- | --- | --- | --- | --- |
| ... | ... | Critical / High / Medium / Low | ... | Open |

## 7. Sign-off

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| ... | ... | Pending | ... |
