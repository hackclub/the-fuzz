# The Fuzz
Hack Club's Slack Moderation Bot


## How to use
DM @The Fuzz on Slack with one of these sentences, replacing values as needed:

`channel mute [person] in [channel] for [time] because [reason]` - will stop someone from talking in a channel for the specified period of time (public channels only)

`ban [person] from [channel] for [time] because [reason]` - will kick someone out of the channel and prevent them from re-joining for the specified period of time (public channels only)

`mute [person] for [time] because [reason]` - will mute someone from talking in every public + private channel that @The Fuzz is in

## Behavior
@The Fuzz will automagically join all new public Slack channels, and re-join them immediately if removal is attempted. Any sort of mute will remove messages sent by the person specified immediately after they send them. A channel ban will kick the specified person out of the channel, and then remove them & delete their messages post-ban if they try to re-join & spam.

When you take action on someone using @The Fuzz, it will PM the user telling them what the action was, how long it is valid for, and the reason that was specified. It doesn't say the person who took the action, just to talk to someone in @staff.
