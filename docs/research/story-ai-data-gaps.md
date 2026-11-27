# AI story: data gaps and fixes

The nine chapters in `docs/story/` use the link kinds already in `data/deals.json`: `investment`, `cloud`
and `chip`. Debt, the Anthropic listing, Stargate and the Meta and Blue Owl joint venture are told in the
chapters' text and are not drawn as links. The companies the chapters name that have no id in
`data/companies.json` are in the second table.

## Investment line added

| id | kind | from | to | amount | date | source link | chapter | result |
|---|---|---|---|---|---|---|---|---|
| 2019-07-22-microsoft-openai | investment | microsoft | openai | 1 | 2019-07-22 | https://news.microsoft.com/source/2019/07/22/openai-forms-exclusive-computing-partnership-with-microsoft-to-build-new-azure-ai-supercomputing-technologies/ | 01 | added |

Amounts are in billions of US dollars. Microsoft's announcement confirms the $1 billion investment and
supports moving OpenAI's `first_mention` from 2023-04-28 to 2019-07-22. The data check rejects any deal
that predates either company's first mention, and the chart hides companies before that date.

[The Economic Times](https://economictimes.indiatimes.com/tech/artificial-intelligence/from-non-profit-to-500-billion-openais-valuation-rise/articleshow/123330870.cms)
reports a $14 billion OpenAI valuation by April 2021. The value row uses 2021-04-30 as a month-end
marker because the report gives no exact day. That earlier point lets the chart size OpenAI on
2022-11-30 without carrying the April 2023 valuation backward unchanged.

## Companies to add

| id | name | why | a value with its source | result |
|---|---|---|---|---|
| blue-owl | Blue Owl Capital | funds managed by Blue Owl own 80% of the Hyperion data-centre joint venture with Meta, described in chapter 07 | $7bn of cash from Blue Owl funds and a $3bn distribution to Meta (Meta, 21 Oct 2025, https://about.fb.com/news/2025/10/meta-blue-owl-capital-develop-hyperion-data-center/) | not added: no chapter uses it as a player or link end |
| micron | Micron | one of the seven buyers in Anthropic's $26bn private placement, named in chapter 09 | part of the $26bn placement; the page gives no individual amount (Anthropic, 20 Nov 2026, https://www.anthropic.com/news/ipo-close) | not added: no chapter uses it as a player or link end |
| deepseek | DeepSeek | releases DeepSeek-R1, the cheap model behind the January 2025 sell-off, named in chapter 04 | no company value; Nvidia lost about $600bn of market value in a day (Guardian, 28 Jan 2025, https://www.theguardian.com/technology/2025/jan/28/deepseek-selloff) | not added: no chapter uses it as a player or link end |
