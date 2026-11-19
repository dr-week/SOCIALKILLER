-- x-engage.lua
-- Draft-only workflow. It never browses feeds, likes, replies, or submits posts.

local state = "INIT"
local target_repo = "https://github.com/dr-week/fast-framework"

function on_start()
    print("[Lua State] Draft preview only; review and submit manually.")
    state = "PREVIEW_DRAFT"
end

function execute_step()
    if state == "PREVIEW_DRAFT" then
        print("Draft prepared for review: " .. target_repo)
        state = "AWAITING_HUMAN_REVIEW"
    end
    return state
end
