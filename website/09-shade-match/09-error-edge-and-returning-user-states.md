# 09 — Error, Edge and Returning-User States

## Purpose

Protect trust when data is incomplete, preferences conflict, products are unavailable or a customer returns later.

## Incomplete answer

Keep the customer on the current step, move focus to the question and explain what is required. Do not show a generic toast disconnected from the answer group.

## Conflicting preferences

When answers create no exact match, do not force an inappropriate recommendation. Explain the trade-off:

> A deeper result and maximum application control point to different formulas. We recommend starting with the more controllable option and building the depth in layers.

Allow the customer to revise the decisive answer.

## Uncertain answers

“Not sure” is valid data. Use conservative, controllable guidance and reduce the internal confidence band. Do not shame the customer or require them to identify an undertone they cannot confidently determine.

## No exact product fit

Provide:

- the closest safe fit;
- a clear explanation of the limitation;
- support contact or guided help;
- an option to review answers.

Never state a perfect match when none exists.

## Product unavailable

Show the original best match as unavailable, then one appropriate alternative. Offer restock notification after the recommendation is visible. Do not silently swap products.

## Network or service error

Preserve all answers locally where possible. Use direct recovery copy:

> We couldn’t generate your result just now. Your answers are saved. Try again.

Provide Retry and Return to Shopping actions.

## Expired or changed result

If the catalogue or logic has materially changed since the saved result:

> Our product range has been updated. Review your previous answers to refresh your recommendation.

Do not present an obsolete product as currently recommended.

## Returning-user state

Where a valid session exists, offer:

- View my result
- Continue questionnaire
- Start again

Show the saved date and logic version internally; customer-facing version detail is needed only when a refresh affects the recommendation.

## Changed answer

Do not destroy the existing result immediately. Confirm recalculation and identify the answer being changed. After recalculation, briefly explain what changed in the recommendation.

## Privacy and deletion

Provide a route to clear saved questionnaire data. Do not retain answer data longer than necessary or use it for unrelated targeting without an appropriate lawful basis and disclosure.

## Analytics edge cases

Record recovery and failure states without logging free text or exposing sensitive answer combinations in URLs.

## Success criteria

Every failure state gives the customer a clear next action, preserves valid progress and avoids false certainty.