# The Social Base product review

## Company-workspace model

Social publishing tools commonly organize work by organization, brand, or channel group. Buffer's channel groups separate social accounts for brands and projects; its organization model assigns access and publishing roles. Sprout Social describes workspaces for brands, regions, or business units. The Social Base now uses the company workspace as the boundary for assigned channels, credentials, campaigns, and activity.

## Current product map

| Area | Intended scope | Current behavior |
| --- | --- | --- |
| Company workspace | Brand profile, channel handles, credentials, drafts, queue, and activity | Workspace selector; isolated credentials and post/activity queries; handles can be assigned in Channels |
| Audience audit | Imported Instagram followers/following snapshots | Account-import workflow remains separate from company publishing data |
| Create / Queue / Channels / Research / Visual Bot | Publishing tasks | One publisher entry with task tabs, avoiding duplicate sidebar destinations |
| Projects and trend sources | Reusable shared reference data | Shared catalog; generated drafts and publishing queues remain company-scoped |

## Gaps to address next

- Workspace membership and per-user permissions are not implemented; current workspace switching is a local app boundary, not multi-user tenancy.
- The Audience Audit still uses its own imported Instagram account data and is not automatically mapped to a company workspace.
- Some platforms in account profiles are not currently supported by the publishing adapter; UI must not imply that assigning a handle connects an account.
- Posting permissions and platform API availability vary. Credentials must be explicitly configured and tested; a saved handle alone is not a live connection.
- The scheduler must be started explicitly, but its current tick can request immediate publishing without a human approval step. Opening The Social Base does not trigger posts; do not use the scheduler for client campaigns until approval is enforced and tested.
- Calendar planning, review/approval, and analytics are not complete workflows yet.
- The visual automation panel is a preview, not a live screen-control bot. Scheduled autopost controls still need a clear, opt-in UI.

## Product references

- Buffer: [Using channel groups](https://support.buffer.com/en-us/articles/using-channel-groups-in-buffer-vtEPrhAiNr) and [organization setup](https://support.buffer.com/en-us/articles/getting-started-as-a-user-in-an-organization-euygyfky4N).
- Sprout Social: [Workspaces for brands and business units](https://sproutsocial.com/influencer-marketing/features/workspaces/).
- Open-source references reviewed: [Postmill](https://github.com/postmill-ai/postmill-app) and [tryPost](https://github.com/trypostit/trypost). These can inform modular patterns; neither should be treated as an Instagram follower-list API.
