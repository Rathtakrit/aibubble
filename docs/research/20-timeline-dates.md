# 20 Timeline dates in data/news.json

Marks the dates a reader should see on the timeline, from the owner's review of 16 November 2026: key dates in
red, smaller events in blue. In the data, red is `"key_date": true` and blue is `"small_date": true`; one item
never carries both, and every marked item carries a `label` of at most 28 characters. `key_date` is `false` on
every other item, science items included.

Only items with `"kind": "money"` and a date on or after 2022-11-30 can be marked. Count: **9 red, 11 blue**.

## Red and blue dates

| Date | Label | Red or blue | Item id | Why |
|---|---|---|---|---|
| 2023-01-23 | Microsoft's OpenAI billions | blue | 2023-01-23-microsoft-extends-the-openai-deal | The first of the big cloud-lab cheques; a multibillion extension of the 2019 deal |
| 2023-05-30 | Nvidia hits $1tn | red | 2023-05-30-nvidia-becomes-a-1-trillion-company | The first chipmaker to pass $1tn; the market's price for AI demand |
| 2024-02-23 | Nvidia hits $2tn | blue | 2024-02-23-nvidia-passes-2-trillion | The next round number, less than a year later |
| 2024-06-20 | First big bubble warning | red | 2024-06-20-cahn-600bn-question | Sequoia's David Cahn put the gap between AI revenue and the build-out at $600bn; the earliest warning in 17 |
| 2025-01-21 | Stargate: $500bn | red | 2025-01-21-stargate-500bn-ai-infrastructure-venture | The build-out named as a $500bn project, with $100bn promised to start |
| 2025-01-27 | DeepSeek rout: $600bn | red | 2025-01-27-deepseek-rout-nvidia-loses-600bn | Nvidia fell 17% in a day; the first big market loss on doubts about AI spending |
| 2025-03-27 | CoreWeave lists | blue | 2025-03-27-coreweave-ipo-prices-at-40 | A pure AI landlord reaches the public market |
| 2025-07-16 | Slok: bigger than 1990s | blue | 2025-07-16-slok-more-overvalued-than-1990s | Apollo's chief economist: the top 10 S&P 500 firms more overvalued than in the 1990s IT bubble |
| 2025-08-14 | Altman: yes, overexcited | blue | 2025-08-14-altman-investors-overexcited | The head of OpenAI said investors as a whole were overexcited about AI |
| 2025-09-10 | Oracle's $300bn OpenAI deal | blue | 2025-09-10-oracle-signs-300bn-compute-deal-with-openai | The largest circular deal: a supplier's sales are the customer's spending |
| 2025-09-22 | Nvidia's $100bn OpenAI bet | red | 2025-09-22-nvidia-to-invest-up-to-100bn-in-openai | Chipmaker money funding the customer that buys the chips |
| 2025-10-03 | Bezos: industrial bubble | blue | 2025-10-03-bezos-industrial-bubble | Amazon's founder called it a kind of industrial bubble |
| 2025-10-29 | Nvidia first to $5tn | red | 2025-10-29-nvidia-first-company-to-5-trillion | The peak of the market's valuation of one AI supplier |
| 2025-11-03 | Burry bets against AI | blue | 2025-11-03-burry-discloses-shorts-against-nvidia-and-palantir | The "Big Short" investor takes the other side, like the 2008 figure in the owner's note |
| 2025-11-21 | Dalio: in bubble territory | blue | 2025-11-21-dalio-bubble-territory | Bridgewater's founder: in bubble territory, though the bubble is not yet pricked |
| 2026-03-16 | Gurley: an AI reset | blue | 2026-03-16-gurley-ai-reset | Benchmark's Bill Gurley: waves create bubbles, and a reset will come |
| 2026-03-31 | OpenAI at $852bn | red | 2026-03-31-openai-closes-122bn-at-852bn | The largest private round ever, at a valuation more than double the October 2025 mark |
| 2026-07-09 | Oracle cut to BBB- | blue | 2026-07-16-s-p-cuts-oracle-to-bbb | The credit agencies start pricing the build-out; one notch above junk |
| 2026-11-05 | $2.5tn wiped in a day | red | 2026-11-05-2-5tn-wiped-as-ai-stocks-rout | The first full market rout blamed on the bubble, reported as the bubble bursting |
| 2026-11-12 | Huang resigns | red | 2026-11-12-jensen-huang-resigns-kress-interim-ceo | The latest big event: the head of the company at the centre of the trade leaves |

## The public warnings added (step 2)

Source: `17-who-said-bubble.md`, table A. Only rows marked *opened* there are used, and only what that file says
the page states. Six moments, five of them blue, the earliest red.

| Date | Who | Where | Red or blue | Item id |
|---|---|---|---|---|
| 2024-06-20 | David Cahn, partner, Sequoia Capital | Essay "AI's $600B Question" | red | 2024-06-20-cahn-600bn-question |
| 2025-07-16 | Torsten Slok, chief economist, Apollo Global Management | The Daily Spark note | blue | 2025-07-16-slok-more-overvalued-than-1990s |
| 2025-08-14 | Sam Altman, CEO, OpenAI | Dinner with reporters, reported by The Verge | blue | 2025-08-14-altman-investors-overexcited |
| 2025-10-03 | Jeff Bezos, founder, Amazon | Italian Tech Week, Turin, transcript | blue | 2025-10-03-bezos-industrial-bubble |
| 2025-11-21 | Ray Dalio, founder, Bridgewater Associates | Interview reported by Fortune | blue | 2025-11-21-dalio-bubble-territory |
| 2026-03-16 | Bill Gurley, general partner, Benchmark | CNBC interview, reported by Business Insider | blue | 2026-03-16-gurley-ai-reset |

The red label says "First big bubble warning" rather than quoting a phrase, because the Cahn essay's own wording
is about a "$600bn question", not the words "AI bubble". It is the earliest warning in 17 that is marked *says
bubble* with an opened page.

## What was left out, and why

- **Every science item.** The timeline shows money items only, so the ChatGPT launch (2022-11-30), GPT-4, the
  DeepSeek-R1 paper and the rest carry no mark. Their `key_date` was set to `false`.
- **Money items before 2022-11-30.** Microsoft's $1bn into OpenAI (2019) and the earlier Nvidia results are
  before the timeline window, so they carry no mark.
- **Other money items after 2022-11-30**, unmarked to keep the marks to the turning points and a spread of
  smaller ones: the Anthropic rounds, the Meta-Scale AI stake, the Microsoft 27% stake, the xAI round and the
  SpaceX takeover, the leaking of OpenAI's accounts, the OpenAI $40bn and $20bn rounds, the capex figure, the
  IMF report and Alphabet's results. They stay in the file and still show in the day-by-day list.
- **Warnings from 17 not used**, by its own marking: the CNBC report of Altman's dinner (archive copy, not
  opened, and the same remarks as the Verge row); the MIT report, Zuckerberg, Solomon, Dimon, Pichai and Nadella
  (marked *mixed*, not a bubble call); Huang, the ECB and the "not a bubble" side; the IMF, BIS and Bank of
  England rows (valuation warnings, institutions, and the word "bubble" not on the opened page); Dalio's second
  row in January 2026 (a repeat of the November statement); Gary Marcus, Ed Zitron, David Einhorn, Ben Inker and
  Daron Acemoglu (opened bubble calls, left out to stay within 4 to 8 and to keep one moment per date or month
  where they repeat the same point). Jim Chanos and Jeremy Grantham have no row in 17 that meets its own rules,
  so they have nothing here.
- **The S&P downgrade of Oracle** is dated 2026-07-09 in the data (its id still says 07-16 from an earlier
  correction), so its blue dot sits at 9 July.
