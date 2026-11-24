# AI story: lines and companies the data does not have

The nine chapters in `docs/story/` use the link kinds already in `data/deals.json`: `investment`, `cloud`
and `chip`. One drawn line has no row in that file; it is the table below. Debt, the Anthropic listing,
Stargate and the Meta and Blue Owl joint venture are told in the chapters' text and are not drawn as links.
The companies the chapters name that have no id in `data/companies.json` are in the second table.

## Lines to add

| id | kind | from | to | amount | date | source link | chapter |
|---|---|---|---|---|---|---|---|
| 2019-07-22-microsoft-openai | investment | microsoft | openai | 1 | 2019-07-22 | https://news.microsoft.com/source/2019/07/22/openai-forms-exclusive-computing-partnership-with-microsoft-to-build-new-azure-ai-supercomputing-technologies/ | 01 |

Amounts are in billions of US dollars. The $1bn is the amount Microsoft announced in the page linked above.

## Companies to add

| id | name | why | a value with its source |
|---|---|---|---|
| blue-owl | Blue Owl Capital | funds managed by Blue Owl own 80% of the Hyperion data-centre joint venture with Meta, described in chapter 07 | $7bn of cash from Blue Owl funds and a $3bn distribution to Meta (Meta, 21 Oct 2025, https://about.fb.com/news/2025/10/meta-blue-owl-capital-develop-hyperion-data-center/) |
| micron | Micron | one of the seven buyers in Anthropic's $26bn private placement, named in chapter 09 | part of the $26bn placement; the page gives no individual amount (Anthropic, 20 Nov 2026, https://www.anthropic.com/news/ipo-close) |
| deepseek | DeepSeek | releases DeepSeek-R1, the cheap model behind the January 2025 sell-off, named in chapter 04 | no company value; Nvidia lost about $600bn of market value in a day (Guardian, 28 Jan 2025, https://www.theguardian.com/technology/2025/jan/28/deepseek-selloff) |
