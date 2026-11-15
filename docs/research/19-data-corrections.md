# 19 Data corrections from 08's table A

Changes made to `data/news.json` from table A of `08-gaps-second-pass.md`. Two fields move, `date` and
`source`; nothing else in the data changed. Item ids are left exactly as they were, including the two whose
date is now a different day. `data/deals.json` is unchanged: no row of table A matches a deal item.

| Item id | Field | Old | New | Row in 08 |
|---|---|---|---|---|
| 2019-07-22-microsoft-puts-1bn-into-openai | source | https://blogs.microsoft.com/blog/2019/07/22/openai-forms-multi-year-partnership-with-microsoft/ | https://news.microsoft.com/source/2019/07/22/openai-forms-exclusive-computing-partnership-with-microsoft-to-build-new-azure-ai-supercomputing-technologies/ | 2019-07-22 Microsoft puts $1bn into OpenAI (same) |
| 2022-11-30-chatgpt-opens-to-the-public | source | https://en.wikipedia.org/wiki/ChatGPT | https://techcrunch.com/2025/11/30/chatgpt-launched-three-years-ago-today/ | 2022-11-30 ChatGPT opens to the public (same) |
| 2023-11-17-openai-board-fires-sam-altman | source | https://openai.com/index/openai-announces-leadership-transition/ | https://techcrunch.com/2023/11/17/sam-altman-is-out-as-openais-ceo/ | 2023-11-17 OpenAI board fires Sam Altman (same) |
| 2025-03-31-openai-raises-40bn-at-300bn | source | https://en.wikipedia.org/wiki/OpenAI | https://techcrunch.com/2025/03/31/openai-raises-40b-at-300b-post-money-valuation/ | 2025-03-31 OpenAI raises $40bn at $300bn (same) |
| 2025-11-25-nvidia-memo-answers-the-bubble-charge | date | 2025-11-25 | 2025-11-24 | 2025-11-25 Nvidia memo answers the bubble charge (differs) |
| 2025-11-25-nvidia-memo-answers-the-bubble-charge | source | https://www.cnbc.com/2025/11/25/nvidia-pushes-back-on-charges-that-ai-investment-is-a-bubble.html | https://www.businessinsider.com/read-nvidia-rebuttal-michael-burry-criticism-other-claims-ai-boom-2025-11 | 2025-11-25 Nvidia memo answers the bubble charge (differs) |
| 2026-01-06-xai-raises-20bn-series-e | source | https://www.cnbc.com/2026/01/06/elon-musk-xai-raises-20-billion-from-nvidia-cisco-investors.html | https://x.ai/news/series-e | 2026-01-06 xAI raises $20bn Series E (same) |
| 2026-03-31-openai-closes-122bn-at-852bn | source | https://openai.com/index/accelerating-the-next-phase-ai/ | https://web.archive.org/web/2026/https://openai.com/index/accelerating-the-next-phase-ai/ | 2026-03-31 OpenAI closes $122bn at $852bn (same) |
| 2026-06-01-anthropic-files-confidentially-for-ipo | source | https://www.techstackipo.com/ipo/anthropic | https://techcrunch.com/2026/06/01/anthropic-files-to-go-public/ | 2026-06-01 Anthropic files confidentially for IPO (same) |
| 2026-07-16-s-p-cuts-oracle-to-bbb | date | 2026-07-16 | 2026-07-09 | 2026-07-16 S&P cuts Oracle to BBB- (differs) |
| 2026-07-16-s-p-cuts-oracle-to-bbb | source | https://www.bloomberg.com/news/articles/2026-07-16/oracle-risks-falling-behind-in-ai-race-as-spending-binge-bites | https://www.jsonline.com/story/communities/north/2026/07/16/agency-downgrades-credit-rating-of-tech-giant-oracle-amid-legal-battle/90945654007/ | 2026-07-16 S&P cuts Oracle to BBB- (differs) |
| 2026-07-20-oracle-credit-insurance-at-18-year-high | source | https://www.bloomberg.com/news/articles/2026-07-20/oracle-credit-risk-hits-near-18-year-high-on-ai-debt-load-angst | https://biz.heraldcorp.com/article/10815080 | 2026-07-20 Oracle credit insurance at 18-year high (same) |
| 2026-10-26-anthropic-files-public-s-1 | source | https://tech-insider.org/anthropic-ipo-s-1-filing-ant-nasdaq-16-3b-revenue-2026/ | https://www.anthropic.com/news/s1-sec | 2026-10-26 Anthropic files public S-1 (same) |
| 2026-11-11-openai-q3-10bn-revenue-10-9bn-loss | source | https://www.forbes.com/sites/gabrielalinzainescu/2026/11/11/openai-revenue-hits-10-billion-as-losses-reach-109-billion/ | https://finance.yahoo.com/technology/ai/articles/openai-hits-10-billion-quarterly-190211001.html | 2026-11-11 OpenAI Q3: $10bn revenue, $10.9bn loss (same) |

## Rows of table A not applied, and why

- **2023-11-21 Altman returns, new board seated (differs).** The opened page holds the return date the item
  already has, 21 November 2023. The difference in the row is the claim that Microsoft got a non-voting board
  seat, which is not a date or a number and cannot be fixed without rewording, so the item is unchanged.
- **2026-10-13 Gemini 4 Argon rolls out (differs).** The row's own opened URL, Google's release notes, gives
  13 October 2026, the date the item already carries and the source it already has. The disagreement is with a
  second opened page (Wikipedia, 30 September), not with this row's page, so there is no different date from
  this row to adopt.
- **2026-10 Gemini 4 Carbon and Hydrogen (differs: November 2026).** No such item exists in `data/news.json`.
- **2026-11 Gemini Omni 1.2 Flash (same).** No such item exists in `data/news.json`.
- **2026-10-13 IMF names AI correction a top risk (same).** The item's source is already the row's opened URL,
  so setting it to the opened URL changes nothing.
- **2026-10-31 OpenAI cuts round to $20bn at $1.25tn (same in part).** The opened page confirms only that a
  lower target was reported; it does not carry the $20bn and $1.25tn figures the item states. Swapping the
  source would point those numbers at a page that does not support them, so the item keeps its source. No date
  or number differs, so there is nothing else in the row to correct.
- **Extra rows (Nvidia board statement 8 November, independent directors 10 November, what the resignation
  cost, the 2026-11-17 results).** None of these has an item in the data. The one related item,
  2026-11-12-jensen-huang-resigns-kress-interim-ceo, already has the row's date and its opened URL, so it is
  unchanged.
