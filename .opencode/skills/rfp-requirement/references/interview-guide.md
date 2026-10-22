# Requirement Interview Guide

Use this as a question bank, not a script. Ask at most five questions per message, skip anything the user already answered, and prefer open questions before narrowing down with options.

## 1. Problem and outcome

- What problem does this solve, and what happens today without it?
- What does success look like in 30 days? How will you measure it?
- What is the one thing that must work perfectly?
- What would make you reject the result even if everything else works?

## 2. Users and permissions

- Who uses this, and what are their roles?
- What can each role see and do? What must each role be blocked from doing?
- Is there an admin, moderator, or support role?
- Roughly how many users, and do they use mobile, desktop, or both?

## 3. Scope

- What is definitely in the first version?
- What is explicitly out of scope, even if it sounds related?
- What can be manual or deferred for now?
- Which existing system, spreadsheet, or workaround does this replace?

## 4. Functional behavior

- Walk me through the main flow from start to finish.
- What are the steps for the second most important flow?
- What happens when the user makes a mistake or provides invalid input?
- What happens when a record is deleted or edited — history, undo, or hard delete?
- What notifications or emails are required, and who triggers them?
- Is search, filtering, sorting, or pagination needed? On which lists?

## 5. Data

- What are the main entities and their key fields?
- Which fields are required, unique, or validated?
- Who owns the data, and how long must it be kept?
- Is there existing data to import? What format and quality?
- What should happen on export or account deletion?

## 6. Integrations

- Which external services, APIs, or payment providers are involved?
- Do we have credentials, sandbox access, and API documentation?
- What should happen when an integration is slow or down?
- Are there webhooks, scheduled jobs, or file exchanges?

## 7. Non-functional

- Expected traffic and peak load?
- Required response time or page-load target?
- Availability target and acceptable downtime?
- Security and privacy requirements — authentication, roles, encryption, audit log, compliance?
- Accessibility target, browser/device support, localization?
- Backup and recovery expectations?

## 8. Constraints

- Fixed technology stack, hosting, or platform?
- Deadline, budget, or team size?
- Existing design system, brand, or API contracts?
- Anything that cannot change?

## 9. Acceptance

- How will you decide the first version is done?
- Who signs off, and what do they need to see?
- Which scenarios must pass before launch?
- What is the rollback plan if launch fails?

## When to stop

You have enough when:

- every must-have feature has a clear actor, trigger, result, and failure behavior;
- every requirement can be written with a measurable acceptance criterion;
- scope boundaries are explicit;
- remaining unknowns are listed as open questions with an owner.

## Anti-patterns

- Do not invent features the user never mentioned.
- Do not ask for implementation details the user hired you to decide.
- Do not accept "etc." or "and so on" — ask for the complete list.
- Do not ask ten questions at once; the user will answer half of them.
- Do not treat a preference as a requirement until the user confirms it.
