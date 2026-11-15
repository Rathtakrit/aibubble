# Skipped rows and judgement calls

Draft data for `data-draft/`, converted row by row from the research notes. Nothing in this folder has been
checked or approved by anyone: the owner still has to check every item.

What was converted:

- `docs/research/03-values.md` sections A, B and C -> `values.json`
- `docs/research/01-coverage-and-timeline.md` sections B and C -> `news.json`
- `.worker/research/opencode-go-deepseek-v4-1-flash-deals.md` and
  `.worker/research/opencode-go-kimi-k3-deals.md`, section A of each -> `deals.json`
- the company list fixed in the brief -> `companies.json`

## Counts

| Notes table | Rows | Written as an item | Used only for a group total | Skipped |
|---|---|---|---|---|
| 03-values.md section A | 217 | 118 value points | 53 (g-chips members) | 46 |
| 03-values.md section B | 43 | 14 value points | 0 | 29 |
| 03-values.md section C | 61 | 12 value points | 10 (g-labs members) | 39 |
| 01-coverage-and-timeline.md section B | 47 | 45 news items | - | 2 |
| 01-coverage-and-timeline.md section C | 60 | 58 news items | - | 2 |
| deepseek deals section A | 37 | 23 of the 40 deals | - | 10 rows skipped, 4 merged into the kimi row |
| kimi deals section A | 43 | 17 of the 40 deals | - | 8 rows skipped, 18 merged into the deepseek row |

Totals in `data-draft/`: 19 companies, 158 values (118 + 14 + 12 from the notes rows and 14 group points),
40 deals, 103 news. Every row of the two deals tables is either one of the 40 deals, one of the 18 rows skipped
for a reason, or one of the 22 rows that is the same deal in both files (see "Deals merged" at the end).

## Judgement calls

1. **Apple and Tesla are not in the draft at all.** No news row and no deal in my output names them (the notes'
   news tables never list `apple` or `tesla` in the Players column, and neither file has a deal from or to them),
   so there is no date to use as `first_mention`. The brief says a company named by no news item and no deal is
   left out of all four files, so their value rows are out of `values.json` too: 18 Apple rows and 12 Tesla
   rows, all listed below. If the owner adds one news row that names Apple, its value points can come back in.
2. **SpaceX is not in the draft.** The only listed value in the notes is a range ("~2100-2200" at the listing on
   2026-06-12), and ranges are skipped, so there is no value point and no `first_mention`. The Anthropic ->
   SpaceX cloud deal (2026-05-06) is skipped with it.
3. **When a bubble can first appear.** `first_mention` is the date of the first news item or deal that names the
   company: nvidia 2018-11-15, microsoft 2019-07-22, softbank 2020-09-13, amd 2022-10-07, meta 2023-02-24,
   amazon 2023-09-25, oracle 2025-01-21, coreweave 2025-03-10, intel 2025-09-18, broadcom 2025-10-13,
   palantir 2025-11-03, tsmc 2026-07-28 (alphabet 2017-06-12, openai 2018-06-11, anthropic 2023-02-03,
   mistral 2023-09-27, xai 2025-07-09). Several of those companies have value points from 2017-12-31, so their
   bubble would appear late in the slider even though the numbers start in 2017. An early news row per company
   would fix it; I did not invent one.
4. **g-chips (Other chips).** Points are the sum of the members that have a value on that exact date, as the
   brief says, so the counts differ: 5 members on the 2017-2022 year ends, 6 from 2023 (Arm joins on 2023-09-14),
   and only 4 on the last point (2026-11-14) because the notes' latest rows for SK Hynix and Samsung give
   "2026-11" without a day. That makes the 2026-11-14 total (1678.42) lower than the 2025-12-31 total (1700.91)
   even though neither company fell; the owner may prefer to use their November 2026 numbers anyway.
   Each point's source is the URL of the first member, in the brief's member order, that has a value on that date.
5. **g-labs (Other labs).** Members are the private companies in section C with at least one valuation that has
   an exact day and a URL: Perplexity, Scale AI, Databricks, Figure, Thinking Machines, Cursor, Crusoe, DeepSeek
   and Inflection. Left out for lack of an exact-dated valuation: Safe Superintelligence, Cohere, Lambda,
   Stability AI, Character.ai, Shield AI, Physical Intelligence. Cursor is included only because of the reported
   SpaceX acquisition on 2026-06-16, which the notes call unverified; drop that one row and Cursor leaves the
   group. The brief gives year ends for g-labs but no last date, so I added the same last date the g-chips rule
   uses (2026-11-14); without it the group series would stop at 2025-12-31. With one member the text reads
   "sum of 1 member" rather than "sum of 1 members".
6. **Mistral is in euros in the notes.** The 2025-09-09 row (EUR 11.7bn) is skipped because the notes give no
   dollar figure and converting would break the no-conversion rule. The 2026-09-08 row is kept as 24 because the
   notes themselves write "EUR 21bn+ (about US$24bn)"; the `what` keeps "announced in euros" visible.
7. **Approximate numbers** are written as the plain number with "about" in `what`: nvidia 2023-05-30, 2024-02-23,
   2024-03-01, 2024-06-05, 2026-05-13, 2026-05-14 and 2026-11-05, microsoft 2019-04-25 and 2025-07-31, amazon
   2018-09-04, alphabet 2026-01-12, oracle 2025-09-10, openai 2026-11-06. A trailing "+" is read the same way
   (Scale AI's "29+" becomes 29 with "about" in the group total, and it is a member row, not an item).
8. **Rows that hold two numbers are skipped**, for example nvidia 2025-07-09 ("~4000 intraday; close ~3974") and
   apple 2022-01-03 ("~2986 close; ~3001 intraday"). Rows that hold one valuation plus a share price, such as
   nvidia 2026-11-05 ("~4400 (price $181.60 per one snippet)"), keep the valuation.
9. **Same company and same date.** nvidia 2026-11-14 appears in both section A (latest) and section B (milestone);
   both are marked "opened", so the first row (section A) is kept.
10. **"pre-money" is kept in `what`**: openai 2026-02-27, openai 2026-11-06, anthropic 2026-02-04.
11. **Anthropic's two US$350bn reports.** The notes say a January 2026 round and a February 2026 employee tender
    could not be reconciled. The January row is "reported talks" with a month-only date, so it is skipped; the
    February tender keeps its exact day (2026-02-04) and "pre-money" in `what`.
12. **`what` texts for section B and C rows are shortened versions of the notes' own words**, kept under 80
    characters. Section A points use "year end" or "latest".
13. **News players dropped** because they are not in the company list: `stabilityai` (2022-08-22), `deepseek`
    (2025-01-22, 2026-04-24, 2026-09-10) and `spacex` (2026-02-02, which still leaves xai). Seven news items end
    up with an empty players list: 2022-08-22, 2025-01-22, 2026-04-24 and 2026-09-10 (the player is not in the
    company list) and 2024-10-08, 2026-10-13, 2026-10-15 (the notes leave the Players column blank).
14. **Deals.** Kind "chips" would become "chip" (none needed it). A blank or "—" amount becomes null (11 deals;
    8 of them are gigawatt-only deals with no dollar figure).
    `id` is date-from-to, with -kind added where the same date and pair has two deals (2025-03-10, 2025-09-18,
    2026-04-20). The 2025-01-21 Stargate rows differ between the files (softbank->stargate, investment, 500,
    committed in one; softbank->openai, cloud, 500, up to in the other); the first is skipped because "stargate"
    is not a company, so the second is the one in `deals.json`.
15. **Deal amount types come from whichever row was kept**, so they can differ from the other file: the 2019
    Microsoft->OpenAI row is "committed" (kimi row, opened) and the 2025-09-18 Nvidia->Intel row is "paid"
    (deepseek row). Every merge is listed at the end.
16. **Sums** are rounded to two decimals: the members' own figures are used as written, and the rounding only
    removes floating-point noise.
17. **SoftBank's ticker is "9984.T"** and the group ids are "g-chips" and "g-labs", as the brief gives them.
    Cursor's id is "cursor" (the notes write "cursor (Anysphere)").
18. **Nothing was invented.** Every date, number, URL, title and summary is copied from the notes. Year-end dates
    are 31 December because that is how the notes write them (the notes warn the real last trading day may
    differ). News kind is "science" for section B and "money" for section C, and `key_date` copies the notes'
    Key date column, which gives 16 + 16 = 32 key dates.

## Rows skipped, by source table

Each line is one skipped row of the notes and the reason.

### 03-values.md section A (listed company value points)

217 rows in the notes table; 46 not written as an item of their own.

| Row | Why |
|---|---|
| line 15 - nvidia 2017-06-12 | blank value |
| line 26 - microsoft 2017-06-12 | blank value |
| line 37 - alphabet 2017-06-12 | blank value |
| line 48 - amazon 2017-06-12 | blank value |
| line 59 - meta 2017-06-12 | blank value |
| line 70 - apple 2017-06-12 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 71 - apple 2017-12-31 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 72 - apple 2018-12-31 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 73 - apple 2019-12-31 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 74 - apple 2020-12-31 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 75 - apple 2021-12-31 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 76 - apple 2022-12-31 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 77 - apple 2023-12-31 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 78 - apple 2024-12-31 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 79 - apple 2025-12-31 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 80 - apple 2026-11-14 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 81 - tesla 2017-06-12 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 82 - tesla 2017-12-31 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 83 - tesla 2018-12-31 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 84 - tesla 2019-12-31 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 85 - tesla 2020-12-31 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 86 - tesla 2021-12-31 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 87 - tesla 2022-12-31 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 88 - tesla 2023-12-31 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 89 - tesla 2024-12-31 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 90 - tesla 2025-12-31 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 91 - tesla 2026-11-14 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 92 - oracle 2017-06-12 | blank value |
| line 103 - amd 2017-06-12 | blank value |
| line 114 - broadcom 2017-06-12 | blank value |
| line 125 - tsmc 2017-06-12 | blank value |
| line 136 - softbank 2017-06-12 | blank value |
| line 146 - softbank 2026-11 (day not given) | no exact day ("2026-11 (day not given)") |
| line 147 - intel 2017-06-12 | blank value |
| line 158 - palantir 2017-06-12 | blank value |
| line 159 - palantir 2020-09-30 | blank value |
| line 167 - coreweave 2017-06-12 | blank value |
| line 168 - coreweave 2025-03-28 | blank value |
| line 171 - arm 2017-06-12 | g-chips member row dropped: blank value |
| line 177 - supermicro 2017-06-12 | g-chips member row dropped: blank value |
| line 188 - micron 2017-06-12 | g-chips member row dropped: blank value |
| line 199 - sk-hynix 2017-06-12 | g-chips member row dropped: blank value |
| line 209 - sk-hynix 2026-11 (day not given) | g-chips member with no exact day (2026-11 (day not given)) |
| line 210 - samsung 2017-06-12 | g-chips member row dropped: blank value |
| line 220 - samsung 2026-11 (day not given) | g-chips member with no exact day (2026-11 (day not given)) |
| line 221 - asml 2017-06-12 | g-chips member row dropped: blank value |

### 03-values.md section B (listed company milestone days)

43 rows in the notes table; 29 not written as an item of their own.

| Row | Why |
|---|---|
| line 240 - nvidia 2024-02-22 | one-day gain or loss, a change and not a value (blank value) |
| line 244 - nvidia 2024-07-31 | one-day gain or loss, a change and not a value (blank value) |
| line 245 - nvidia 2024-09-03 | one-day gain or loss, a change and not a value (blank value) |
| line 246 - nvidia 2025-01-27 | one-day gain or loss, a change and not a value (blank value) |
| line 247 - nvidia 2025-07-09 | not a single number ("~4000 intraday; close ~3974 per one unnamed snippet") |
| line 248 - nvidia 2025-10-29 | range "~5030-5040" |
| line 251 - nvidia 2026-07-29 | one-day gain or loss, a change and not a value (blank value) |
| line 252 - nvidia 2026-10 (day not checked) | no exact day ("2026-10 (day not checked)") |
| line 254 - nvidia 2026-11-14 | duplicate point for nvidia 2026-11-14; kept 03-values.md A line 25 (nvidia 2026-11-14) (opened) |
| line 255 - apple 2018-08-02 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 256 - apple 2020-08-19 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 257 - apple 2020-09-03 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 258 - apple 2022-01-03 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 259 - apple 2026-07-28 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 260 - apple 2026-10-14 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 261 - apple 2026-11-14 | not named by any news item or deal, so no first_mention can be computed - left out of all four files |
| line 263 - microsoft 2021-06 (day not checked) | no exact day ("2021-06 (day not checked)") |
| line 266 - microsoft 2025-10 (day not checked) | no exact day ("2025-10 (day not checked)") |
| line 270 - alphabet 2026 (date not found) | no exact day ("2026 (date not found)") |
| line 271 - meta 2022-02-03 | one-day gain or loss, a change and not a value (blank value) |
| line 273 - oracle 2026-02 (early) | no exact day ("2026-02 (early)") |
| line 274 - oracle 2026-06 (week to ~11 Jun) | no exact day ("2026-06 (week to ~11 Jun)") |
| line 275 - sk-hynix 2026 (date not found) | g-chips member; section B milestone rows are not used for the group points (those come from the year-end value points) |
| line 276 - spacex 2026-06-12 | the only listed value in the notes is a range (US$2.1-2.2tn), so no value point - left out of all four files |
| line 277 - nasdaq-100 2024-07-24 | not a company in the fixed list (a market index / a market-wide figure) |
| line 278 - nasdaq-100 2025-03-07 | not a company in the fixed list (a market index / a market-wide figure) |
| line 279 - nasdaq-100 2025-03-10 | not a company in the fixed list (a market index / a market-wide figure) |
| line 280 - big-tech 2026-11-05 | not a company in the fixed list (a market index / a market-wide figure) |
| line 281 - tesla 2021-10 (day not checked) | not named by any news item or deal, so no first_mention can be computed - left out of all four files |

### 03-values.md section C (private company valuation points)

61 rows in the notes table; 39 not written as an item of their own.

| Row | Why |
|---|---|
| line 289 - openai 2024-02 (approx.) | no exact day ("2024-02 (approx.)") |
| line 291 - openai 2024-11 (day not checked) | no exact day ("2024-11 (day not checked)") |
| line 299 - anthropic 2026-01 (reported) | no exact day ("2026-01 (reported)") |
| line 301 - anthropic 2026-02 (day not checked, ~12-13 Feb) | no exact day ("2026-02 (day not checked, ~12-13 Feb)") |
| line 302 - anthropic 2026-04-29 (approx.) | reported talks, not a completed round |
| line 304 - xai 2025-03 (X merger) | no exact day ("2025-03 (X merger)") |
| line 305 - xai 2025-09 | no exact day ("2025-09") |
| line 306 - xai 2025-11 | no exact day ("2025-11") |
| line 307 - xai 2026-01 | no exact day ("2026-01") |
| line 309 - xai 2026-06-12 | not a single number ("SpaceX ~2100-2200 at IPO close") |
| line 310 - mistral 2025-09-09 | value is in euros (EUR 11.7bn) and the notes give no dollar figure |
| line 311 - mistral 2026-06 (approx.) | no exact day ("2026-06 (approx.)") |
| line 313 - safe-superintelligence 2024-09 | not a member of Other labs (no valuation with an exact day and URL); used for the membership check only |
| line 314 - safe-superintelligence 2025-04 | not a member of Other labs (no valuation with an exact day and URL); used for the membership check only |
| line 315 - safe-superintelligence 2026-07 | not a member of Other labs (no valuation with an exact day and URL); used for the membership check only |
| line 316 - perplexity 2025-03 (month per Bloomberg via snippet) | g-labs member with no exact day |
| line 317 - perplexity 2025-07 | g-labs member with no exact day |
| line 319 - perplexity 2026 (early) | g-labs member with no exact day |
| line 320 - scale-ai 2024-05 | g-labs member with no exact day |
| line 322 - databricks 2026-02 | g-labs member with no exact day |
| line 325 - cohere 2023-06 | not a member of Other labs (no valuation with an exact day and URL); used for the membership check only |
| line 326 - cohere 2024-07 | not a member of Other labs (no valuation with an exact day and URL); used for the membership check only |
| line 327 - cohere 2025-08 | not a member of Other labs (no valuation with an exact day and URL); used for the membership check only |
| line 328 - cohere 2025-09 | not a member of Other labs (no valuation with an exact day and URL); used for the membership check only |
| line 329 - cohere 2026-09 (reported) | not a member of Other labs (only reported talks); used for the membership check only |
| line 330 - cohere 2026-10 (initial close) | not a member of Other labs (no valuation with an exact day and URL); used for the membership check only |
| line 331 - figure 2024-02 | g-labs member with no exact day |
| line 334 - thinking-machines 2025-11 to 2026-01 | g-labs member with no exact day |
| line 335 - cursor (Anysphere) 2025-11 | g-labs member with no exact day |
| line 336 - cursor (Anysphere) 2026-04 (reported) | g-labs member with no exact day |
| line 338 - lambda 2025-02 | not a member of Other labs (no valuation with an exact day and URL); used for the membership check only |
| line 339 - lambda 2026-08 (reported) | not a member of Other labs (only reported talks); used for the membership check only |
| line 341 - crusoe 2026-09 | g-labs member with no exact day |
| line 342 - deepseek 2026-04 (reported) | g-labs member with no exact day |
| line 343 - deepseek 2026-06-04 (reported) | g-labs member row dropped: reported talks |
| line 345 - stability-ai 2022-10 | not a member of Other labs (no valuation with an exact day and URL); used for the membership check only |
| line 346 - character-ai 2023-03 | not a member of Other labs (no valuation with an exact day and URL); used for the membership check only |
| line 348 - shield-ai 2026 (date not found) | not a member of Other labs (no valuation with an exact day and URL); used for the membership check only |
| line 349 - physical-intelligence 2026 (date not found) | not a member of Other labs (no valuation with an exact day and URL); used for the membership check only |

### 01-coverage-and-timeline.md section B (science lane)

47 rows in the notes table; 2 not written as an item of their own.

| Row | Why |
|---|---|
| line 110 - 2026-10 (day unknown) Gemini 4 Carbon and Hydrogen | no exact day ("2026-10 (day unknown)") |
| line 111 - 2026-11 (day unknown) Gemini Omni 1.2 Flash | no exact day ("2026-11 (day unknown)") |

### 01-coverage-and-timeline.md section C (money lane)

60 rows in the notes table; 2 not written as an item of their own.

| Row | Why |
|---|---|
| line 119 - 2017-05-10 Nvidia launches Volta, built for AI | date is before 2017-06-12 |
| line 178 - 2026-11-17 Nvidia Q3 FY2027 results due | date is after 2026-11-15 |

### opencode-go-deepseek-v4-1-flash-deals.md section A

37 rows in the notes table; 10 not written as an item of their own.

| Row | Why |
|---|---|
| line 21 - 2024-03-27 amazon->anthropic investment | no URL |
| line 23 - 2025-01-21 softbank->stargate investment | from/to not in the company list (stargate) |
| line 24 - 2025-09-02 investors->anthropic investment | from/to not in the company list (investors) |
| line 35 - 2025-11-12 anthropic->fluidstack cloud | from/to not in the company list (fluidstack) |
| line 40 - 2026-02-12 investors->anthropic investment | from/to not in the company list (investors) |
| line 44 - 2026-03-31 investors->openai investment | from/to not in the company list (investors) |
| line 50 - 2026-04-24 alphabet->anthropic investment | no URL |
| line 51 - 2026-05-06 anthropic->spacex cloud | from/to not in the company list (spacex) |
| line 52 - 2026-05-06 anthropic->alphabet cloud | no URL |
| line 53 - 2026-05-28 investors->anthropic investment | from/to not in the company list (investors) |

### opencode-go-kimi-k3-deals.md section A

43 rows in the notes table; 8 not written as an item of their own.

| Row | Why |
|---|---|
| line 21 - 2024-10-02 investors->openai investment | from/to not in the company list (investors) |
| line 27 - 2025-05 (day not stated) openai->coreweave cloud | no exact day ("2025-05 (day not stated)") |
| line 28 - 2025-06-12 meta->scaleai investment | from/to not in the company list (scaleai) |
| line 31 - 2025-09-09 asml->mistral investment | from/to not in the company list (asml) |
| line 49 - 2026-01-06 investors->xai investment | from/to not in the company list (investors) |
| line 50 - 2026-02-12 investors->anthropic investment | from/to not in the company list (investors) |
| line 57 - 2026-05 (around Series H) anthropic->alphabet chip | no exact day ("2026-05 (around Series H)") |
| line 58 - 2026-05-28 investors->anthropic investment | from/to not in the company list (investors) |

## Deals merged (the same deal in both files)

22 rows describe a deal that is already in `deals.json` from the other file: same date, same from,
same to, same kind. The brief's rule kept the row whose Checked says "opened", then a row with a URL,
else the first one.

| Deal id | Row dropped (its Checked) | Row kept |
|---|---|---|
| 2019-07-22-microsoft-openai | deepseek-deals.md line 17 - 2019-07-22 microsoft->openai investment (search snippet) | kimi-deals.md line 16 - 2019-07-22 microsoft->openai investment |
| 2023-01-23-microsoft-openai | kimi-deals.md line 17 - 2023-01-23 microsoft->openai investment (opened) | deepseek-deals.md line 18 - 2023-01-23 microsoft->openai investment |
| 2023-09-25-amazon-anthropic | deepseek-deals.md line 19 - 2023-09-25 amazon->anthropic investment (not opened) | kimi-deals.md line 19 - 2023-09-25 amazon->anthropic investment |
| 2023-10-27-alphabet-anthropic | deepseek-deals.md line 20 - 2023-10-27 alphabet->anthropic investment (not opened) | kimi-deals.md line 20 - 2023-10-27 alphabet->anthropic investment |
| 2024-11-22-amazon-anthropic | deepseek-deals.md line 22 - 2024-11-22 amazon->anthropic investment (not opened) | kimi-deals.md line 22 - 2024-11-22 amazon->anthropic investment |
| 2025-09-10-openai-oracle | kimi-deals.md line 32 - 2025-09-10 openai->oracle cloud (search snippet) | deepseek-deals.md line 25 - 2025-09-10 openai->oracle cloud |
| 2025-09-18-nvidia-intel-investment | kimi-deals.md line 33 - 2025-09-18 nvidia->intel investment (search snippet) | deepseek-deals.md line 26 - 2025-09-18 nvidia->intel investment |
| 2025-09-22-nvidia-openai | kimi-deals.md line 35 - 2025-09-22 nvidia->openai investment (opened) | deepseek-deals.md line 27 - 2025-09-22 nvidia->openai investment |
| 2025-10-06-openai-amd | kimi-deals.md line 38 - 2025-10-06 openai->amd chip (opened) | deepseek-deals.md line 29 - 2025-10-06 openai->amd chip |
| 2025-10-06-amd-openai | kimi-deals.md line 39 - 2025-10-06 amd->openai investment (opened) | deepseek-deals.md line 30 - 2025-10-06 amd->openai investment |
| 2025-10-13-openai-broadcom | kimi-deals.md line 40 - 2025-10-13 openai->broadcom chip (search snippet) | deepseek-deals.md line 31 - 2025-10-13 openai->broadcom chip |
| 2025-10-28-microsoft-openai | kimi-deals.md line 43 - 2025-10-28 microsoft->openai investment (search snippet) | deepseek-deals.md line 32 - 2025-10-28 microsoft->openai investment |
| 2025-10-28-openai-microsoft | kimi-deals.md line 42 - 2025-10-28 openai->microsoft cloud (search snippet) | deepseek-deals.md line 33 - 2025-10-28 openai->microsoft cloud |
| 2025-11-03-openai-amazon | kimi-deals.md line 44 - 2025-11-03 openai->amazon cloud (search snippet) | deepseek-deals.md line 34 - 2025-11-03 openai->amazon cloud |
| 2025-11-18-nvidia-anthropic | kimi-deals.md line 46 - 2025-11-18 nvidia->anthropic investment (opened) | deepseek-deals.md line 36 - 2025-11-18 nvidia->anthropic investment |
| 2025-11-18-microsoft-anthropic | kimi-deals.md line 47 - 2025-11-18 microsoft->anthropic investment (opened) | deepseek-deals.md line 37 - 2025-11-18 microsoft->anthropic investment |
| 2025-11-18-anthropic-microsoft | kimi-deals.md line 45 - 2025-11-18 anthropic->microsoft cloud (opened) | deepseek-deals.md line 38 - 2025-11-18 anthropic->microsoft cloud |
| 2026-02-27-amazon-openai | kimi-deals.md line 51 - 2026-02-27 amazon->openai investment (search snippet) | deepseek-deals.md line 41 - 2026-02-27 amazon->openai investment |
| 2026-02-27-nvidia-openai | kimi-deals.md line 52 - 2026-02-27 nvidia->openai investment (search snippet) | deepseek-deals.md line 42 - 2026-02-27 nvidia->openai investment |
| 2026-02-27-softbank-openai | kimi-deals.md line 53 - 2026-02-27 softbank->openai investment (search snippet) | deepseek-deals.md line 43 - 2026-02-27 softbank->openai investment |
| 2026-04-20-amazon-anthropic | kimi-deals.md line 55 - 2026-04-20 amazon->anthropic investment (search snippet) | deepseek-deals.md line 47 - 2026-04-20 amazon->anthropic investment |
| 2026-04-20-anthropic-amazon-cloud | kimi-deals.md line 56 - 2026-04-20 anthropic->amazon cloud (search snippet) | deepseek-deals.md line 48 - 2026-04-20 anthropic->amazon cloud |

## Early private valuations (second pass)

Added the 11 rows of `docs/research/05-early-private-values.md` to `values.json`, then pulled `first_mention`
forward where it was earlier than a company's earliest value point, so a bubble is never drawn at a value from
years later. Every date, number and URL below is copied from that notes file.

### Points added to values.json (11)

| Company | Date | Value US$ bn | What | Source |
|---|---|---|---|---|
| openai | 2023-04-28 | 29.0 | tender offer (existing shares sold), $27bn-$29bn; reported | https://techcrunch.com/2023/04/28/openai-funding-valuation-chatgpt/ |
| openai | 2024-02-18 | 86.0 | employee tender offer completed, $86bn; reported | https://economictimes.indiatimes.com/tech/technology/openai-deal-lets-employees-sell-shares-at-86-billion-valuation/articleshow/107784738.cms |
| anthropic | 2023-05-23 | 5.0 | Series C, sources put it at nearly $5bn; reported | https://siliconvalleyinvestclub.com/2023/05/24/anthropic-raises-450-million-in-series-c-round/ |
| anthropic | 2024-05-13 | 18.4 | post-money $18.4bn quoted as current; report date, not close | https://techcrunch.com/2024/05/13/anthropic-is-expanding-to-europe-and-raising-more-money/ |
| xai | 2024-05-26 | 24.0 | Series B, $6bn at $18bn pre-money; $24bn is arithmetic, reported | https://techcrunch.com/2024/05/26/elon-musks-xai-raises-6b-from-valor-a16z-and-sequoia/ |
| xai | 2024-12-25 | 45.0 | Series C, $6bn raised, $45bn valuation; reported | https://techcrunch.com/2024/12/25/elon-musks-xai-lands-billions-in-new-cash-to-fuel-ai-ambitions/ |
| xai | 2025-03-29 | 80.0 | acquired X all-stock; xAI $80bn, X $33bn not added; reported | https://techcrunch.com/2025/03/29/elon-musk-says-xai-acquired-x/ |
| mistral | 2023-06-13 | 0.26 | seed, €105m raised at €240m post-money; reported | https://techcrunch.com/2023/06/13/frances-mistral-ai-blows-in-with-a-113m-seed-round-at-a-260m-valuation-to-take-on-openai/ |
| mistral | 2023-12-11 | 2.0 | Series A, €415m raised at ~$2bn post-money; reported | https://techcrunch.com/2023/12/11/mistral-ai-a-paris-based-openai-rival-closed-its-415-million-funding-round/ |
| mistral | 2024-06-11 | 6.0 | Series B, €600m equity and debt at $6bn post-money; reported | https://techcrunch.com/2024/06/11/paris-based-ai-startup-mistral-ai-raises-640-million/ |
| mistral | 2025-09-09 | 13.7 | Series C led by ASML, €1.7bn at €11.7bn post-money; $13.7bn is arithmetic | https://mistral.ai/news/mistral-ai-raises-1-7-b-to-accelerate-technological-progress-with-ai/ |

None of the 11 repeats a company and date already in `values.json`, so no existing point was kept in place of one.
The points are in the file's own order: company name, then date. xAI's 2025-03-29 row keeps the $80bn alone; the
separate $33bn for X is not added to it. The euro figures in "What" are the notes' own, and so are the dollar
figures the notes mark as arithmetic; nothing was converted or worked out here.

### first_mention changed (2 of the 4 private companies)

| Company | Old | New | New source |
|---|---|---|---|
| openai | 2018-06-11 | 2023-04-28 | https://techcrunch.com/2023/04/28/openai-funding-valuation-chatgpt/ |
| anthropic | 2023-02-03 | 2023-05-23 | https://siliconvalleyinvestclub.com/2023/05/24/anthropic-raises-450-million-in-series-c-round/ |

xai (2025-07-09) and mistral (2023-09-27) were already later than their earliest value point (2024-05-26 and
2023-06-13), so both were left as they were. The early dates OpenAI and Anthropic had (the 2018-06-11 GPT-1 paper
and the 2023-02-03 Google investment) came before any value point, so neither company would have had a value to
draw on those days.

### News items whose players changed (11)

The item is kept; only the company id is removed from `players`, because the item is dated before that company's
new `first_mention`. Five of them are left with no players at all.

| Date | News item | Id removed | Players after |
|---|---|---|---|
| 2018-06-11 | GPT-1: pretrain then fine-tune | openai | (none) |
| 2019-02-14 | GPT-2 held back, then released | openai | (none) |
| 2019-07-22 | Microsoft puts $1bn into OpenAI | openai | microsoft |
| 2020-01-23 | Scaling laws: bigger is predictable | openai | (none) |
| 2020-05-28 | GPT-3: scale is the trick | openai | microsoft |
| 2021-01-05 | DALL·E makes pictures from words | openai | (none) |
| 2021-06-29 | GitHub Copilot writes code | openai | microsoft |
| 2022-11-30 | ChatGPT opens to the public | openai | microsoft |
| 2023-01-23 | Microsoft extends the OpenAI deal | openai | microsoft |
| 2023-03-14 | Claude opens to the public | anthropic | (none) |
| 2023-03-14 | GPT-4 released, reads images too | openai | microsoft |

### Deals removed (3)

Each is dated before the new `first_mention` of the company it names.

| Deal id | Date | From -> to | Kind | Amount US$ bn | Title |
|---|---|---|---|---|---|
| 2019-07-22-microsoft-openai | 2019-07-22 | microsoft -> openai | investment | 1 | Microsoft invests $1B in OpenAI |
| 2023-01-23-microsoft-openai | 2023-01-23 | microsoft -> openai | investment | 10 | Microsoft adds a "multiyear, multibillion" OpenAI investment |
| 2023-02-03-alphabet-anthropic | 2023-02-03 | alphabet -> anthropic | investment | 0.3 | Google invests ~$300M in Anthropic |

The 2019 and 2023 Microsoft rows and the 2023 Microsoft news rows above now leave only Microsoft named on those
days, so Microsoft keeps its 2019-07-22 `first_mention` and those days still have something to show.

### Totals now

19 companies, 169 values (158 + 11), 37 deals (40 - 3), 103 news. `node scripts/check-data.mjs data-draft`
prints `data ok: 19 companies, 169 values, 37 deals, 103 news (status: draft)`.
