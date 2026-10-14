## Fact guard: why we compare sets of hard tokens

A rewrite can sound better and still be wrong. Language models often change concrete details without any sign of it: they round a number, move a date, shorten a URL, fix a file path that looked like a typo, or rephrase an inline code fragment. Readers rarely catch these errors, because the prose around them still reads well. Numbers, dates, links, paths and code are also the parts readers act on, so an error there costs more than anywhere else. The fact guard therefore pulls these tokens out of the original and the rewritten text and compares them as two sets.

We compare sets, not sequences, because a rewrite may reorder sentences. The check runs both ways. A missing token means the rewrite dropped information. A new token means the model invented it. Either case is a hard failure, and the guard rejects the rewrite.

We reject the rewrite rather than repair it. Patching tokens back in automatically could create new mistakes, while falling back to the original text or retrying is always safe. The check is deterministic, cheap and works in any language. It needs no second model call, and it gives the same answer every time it runs.
