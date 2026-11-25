# How money moves in the AI boom, 30 November 2022 to November 2026

Research base for a short story of at most ten chapters. Written 24 November 2026. Every number below was
taken from a page opened during this run; the page, a short quote and a second link (where one was found) are in
the fact table in Section 3. This is a description of deals that were announced or reported, not advice and not a
forecast.

The unit is US dollars unless a page says otherwise. "Up to" means the company announced a ceiling, not that the
money was paid. A date is the announcement or filing date, not necessarily the day cash moved.

**Words used.** A *market value* is the price of all a company's shares added together. A *valuation* is the value
investors put on a company that is not yet listed. *Equity* and a *stake* both mean a share of ownership. *Compute*
is computing power, and a *cloud contract* is a company's promise to pay a provider for that power over years. A
*bond* is a loan split into tradeable pieces; a *loan* is money borrowed and paid back with interest.
*Off-balance-sheet* means kept out of a company's own accounts, often in a *special purpose vehicle* (SPV, a
separate company set up for one project) or a *joint venture* (a company owned by two or more firms). A *circular
deal* is one in which companies in the same chain fund each other. A *warrant* is the right to buy shares later at
a set price. A *prepayment* is money paid before the service is delivered. A *revenue share* is an agreed slice of
sales paid to a partner. An *IPO* (initial public offering) is
the first sale of shares to the public; a *private placement* is a sale of shares to a chosen group instead. A
*hyperscaler* is a very large cloud provider. A *residual-value guarantee* is a promise to cover part of a
project's lost value if a lease ends.

## 1. The mechanism

Money moves in a loop: investors and lenders fund AI labs and data-centre builders, the labs sign multi-year
contracts to pay for cloud capacity and chips, the suppliers book that spending as revenue and sometimes send part
of it back as equity, warrants or capacity guarantees, and the BIS, the Bank of England and the Kansas City Fed
warn, in different ways, that the loop now leans on debt and private credit, while the Guardian reports warnings
about "circular funding"; what could break it is AI firms not earning enough to meet the expectations already in
their valuations.

1. **Investors and lenders → AI labs and data-centre builders.** Equity, bonds and loans pay for models and buildings.
2. **AI labs → cloud providers.** Multi-year contracts (sometimes with prepayments) reserve computing power.
3. **Cloud providers → chipmakers.** Orders and capacity reservations turn contracts into demand for chips.
4. **Chipmakers and cloud providers → AI labs.** Stakes, warrants, revenue shares and unsold-capacity guarantees return money or risk to the labs.
5. **AI labs → everyone.** The labs' revenue has to grow into the contracts; debt and circular deals can pass a shortfall back along the chain.

## 2. Link types found

A "link" is one way money, shares or risk moves from one company to another. "Already in data?" compares the link with the three
`kind` values in `data/deals.json`: `investment`, `cloud` and `chip`. "Drawable?" means both ends are companies
with an id in `data/companies.json`, so the link could be drawn as an arrow on the site; a link is not drawable if
one end is a fund, a group of public shareholders or a project company that is not in the data.

| Link type | Who pays whom | 2–5 real examples, amount and date | Already in data? | Drawable? |
|---|---|---|---|---|
| Equity investment in an AI lab | investor → lab | Amazon → Anthropic, up to $4bn (25 Sep 2023), later $8bn in total; Google → Anthropic, up to $2bn (27 Oct 2023, reported); Microsoft → OpenAI, stake valued at $135bn, about 27% (value, not cash paid; 28 Oct 2025); Nvidia → OpenAI, up to $100bn (22 Sep 2025), and Nvidia → Anthropic up to $10bn with Microsoft → Anthropic up to $5bn (18 Nov 2025); investor group → xAI, $20bn (6 Jan 2026) | Yes, `investment`; xAI is not in `deals.json` | Yes, except the xAI round, whose payer is a group rather than one company |
| Cloud or compute contract | lab → cloud provider | OpenAI → Oracle, $300bn over about five years (10 Sep 2025); OpenAI → Microsoft, $250bn more Azure (28 Oct 2025); OpenAI → CoreWeave, up to $11.9bn (10 Mar 2025); OpenAI → AWS, $38bn over seven years (3 Nov 2025); Anthropic → AWS, more than $100bn over ten years (20 Apr 2026) | Yes, `cloud` | Yes |
| Chip purchase or custom-chip agreement | lab → chipmaker | OpenAI → Nvidia, 10GW (22 Sep 2025); OpenAI → AMD, 6GW (6 Oct 2025); OpenAI → Broadcom, 10GW of custom accelerators (14 Oct 2025); Anthropic → Nvidia, up to 1GW (18 Nov 2025); Anthropic → Alphabet (Google Cloud), up to one million TPUs (23 Oct 2025) | Mostly: the Nvidia, AMD and Broadcom deals are `chip`; the Google TPU deal is `cloud` | Yes |
| Chip-for-stake, warrant or cross-holding | chipmaker → lab, or lab → chipmaker, in shares rather than cash | AMD → OpenAI, warrant for up to 160m shares tied to deployment (6 Oct 2025); Nvidia → Intel, $5bn of stock at $23.28 a share (18 Sep 2025); OpenAI → CoreWeave, $350m of stock (10 Mar 2025); chipmakers and cloud partners → Anthropic, $26bn of Class N stock at the IPO price (20 Nov 2026) | Partly: the AMD, Intel and CoreWeave deals are `investment`; the Anthropic placement is not in the file | Yes for AMD–OpenAI, Nvidia–Intel and OpenAI–CoreWeave; no for the placement, which has seven payers |
| Supplier invests in its own customer | supplier → customer | Microsoft → OpenAI, stake worth $135bn, about 27% (28 Oct 2025); Nvidia → OpenAI, up to $100bn (22 Sep 2025); Nvidia → Anthropic, up to $10bn (18 Nov 2025); Nvidia is a CoreWeave stockholder as well as its GPU supplier (9 Sep 2025); Amazon → Anthropic, $5bn now and up to $20bn more (20 Apr 2026) | Yes, `investment`; the Nvidia–CoreWeave stake is not a separate deal in the file | Yes |
| Capacity backstop or take-or-pay promise | supplier → cloud provider | Nvidia → CoreWeave, $6.3bn initial order and a promise to purchase residual unsold capacity through 13 Apr 2032 (9 Sep 2025); Meta → the Blue Owl Hyperion joint venture, a 16-year residual-value guarantee on the $27bn project (21 Oct 2025) | Partly: Nvidia–CoreWeave is `cloud` in the file; the Meta guarantee is not | Yes for Nvidia–CoreWeave; no for Meta–Blue Owl, because Blue Owl and the joint venture are not in the file |
| Debt: bonds and loans | lenders → borrower | Oracle, $18bn of notes (26 Sep 2025); Oracle, $82.2bn of non-current notes payable and $923m of quarterly interest (quarter ended 31 Aug 2025); the Meta–Blue Owl project, $27bn of development cost, part funded by debt sold to PIMCO (21 Oct 2025); CoreWeave, about $46.9bn of debt and $846m of quarterly interest (quarter ended 30 Sep 2026) | No; the file has only `investment`, `cloud` and `chip` | No: the other end is a bondholder or a lender, not a company in the file |
| Off-balance-sheet project vehicle (SPV or joint venture) | investors and lenders → project company | Stargate, $500bn intended over four years with $100bn immediate, equity from SoftBank, OpenAI, Oracle and MGX (21 Jan 2025); Meta–Blue Owl Hyperion, $27bn of development cost, 80% Blue Owl and 20% Meta, $7bn cash from Blue Owl and a $3bn distribution to Meta (21 Oct 2025) | Partly: Stargate is `cloud` in the file; the Meta–Blue Owl project is not | Partly: the equity funders are companies, but the project company is not in the file |
| Prepayment or customer deposit | customer → supplier | CoreWeave expected about $9bn of customer prepayments and deposits in the next three months, and carried $7.7bn of non-current deferred revenue (10 Nov 2026) | No | No: the customers are not named, so there is no single payer |
| Public listing or share sale | public investors → company | Anthropic's IPO, 1.127bn shares at $83 for about $93.5bn gross, of which $91.6bn went to the company (20 Nov 2026); Anthropic's concurrent private placement of $26bn to AMD, Broadcom, Google, Micron, Microsoft, Nvidia and TSMC (20 Nov 2026) | No; the S-1 is in `news.json`, not `deals.json` | No: public shareholders and a group of seven buyers, not one payer |
| Revenue share or payment back to a supplier-investor | lab → supplier-investor | Microsoft recorded $10bn of revenue from OpenAI in the quarter ended 30 Sep 2026 and $24.1bn in fiscal 2026 (28 Oct 2026) | No | Yes |

Two notes on the table. First, the same deal can appear in more than one row: Microsoft is both an investor in
OpenAI and a supplier to it, so the $135bn stake is an equity link and a supplier-to-customer link seen from two
sides. Second, the data file files Stargate as `cloud`, the Anthropic–Google TPU deal as `cloud` rather than
`chip`, and the Nvidia–CoreWeave backstop as `cloud`; all three are wider arrangements, which is why the "already
in data?" column says "partly" or "mostly" in places.

## 3. Fact table

Every number in Sections 1, 2 and 4 has a row here. The "second source" column gives another page opened in this
run that states or supports the same fact; "none found" means only one page was found and those rows are grouped
again in the last bullet of Section 5. Each row links to its page; the Sources list repeats every link.

| Claim | Number | Date | Primary link | Short quote from the page | Second source |
|---|---|---|---|---|---|
| F1. Microsoft's stake in OpenAI after the recapitalisation (the value of the stake it already holds, not new cash) | $135bn; about 27% on an as-converted diluted basis | 28 Oct 2025 | [Microsoft blog, 28 Oct 2025](https://blogs.microsoft.com/blog/2025/10/28/the-next-chapter-of-the-microsoft-openai-partnership/) | "Microsoft holds an investment in OpenAI Group PBC valued at approximately $135 billion, representing roughly 27 percent on an as-converted diluted basis"; "What began as an investment in a research organization has grown into one of the most successful partnerships" | [TechCrunch, 28 Oct 2026](https://techcrunch.com/2026/10/28/microsoft-recorded-10-billion-in-revenue-from-openai/) (the 27% only) |
| F2. OpenAI's additional Azure commitment | $250bn | 28 Oct 2025 | [Microsoft blog, 28 Oct 2025](https://blogs.microsoft.com/blog/2025/10/28/the-next-chapter-of-the-microsoft-openai-partnership/) | "OpenAI has contracted to purchase an incremental $250B of Azure services" | [TechCrunch, 28 Oct 2026](https://techcrunch.com/2026/10/28/microsoft-recorded-10-billion-in-revenue-from-openai/) |
| F3. Amazon's first investment in Anthropic | up to $4bn | 25 Sep 2023 | [Anthropic, 25 Sep 2023](https://www.anthropic.com/news/anthropic-amazon) | "Amazon will invest up to $4 billion in Anthropic" | [Amazon, 20 Apr 2026](https://www.aboutamazon.com/news/company-news/amazon-invests-additional-5-billion-anthropic-ai) (the $8bn total only) |
| F4. Amazon's 2026 Anthropic investment | $5bn now; up to $20bn more; $8bn previously | 20 Apr 2026 | [Amazon, 20 Apr 2026](https://www.aboutamazon.com/news/company-news/amazon-invests-additional-5-billion-anthropic-ai) | "Amazon will invest $5 billion in Anthropic today and up to an additional $20 billion in the future"; "in addition to the $8 billion Amazon previously invested in Anthropic" | [Anthropic, 20 Apr 2026](https://www.anthropic.com/news/anthropic-amazon-compute) |
| F5. Anthropic's AWS commitment and Trainium capacity | more than $100bn over ten years; up to 5GW | 20 Apr 2026 | [Anthropic, 20 Apr 2026](https://www.anthropic.com/news/anthropic-amazon-compute) | "committing more than $100 billion over the next ten years to AWS technologies" | [Amazon, 20 Apr 2026](https://www.aboutamazon.com/news/company-news/amazon-invests-additional-5-billion-anthropic-ai) |
| F6. Nvidia's investment in OpenAI and the chip deployment | up to $100bn; 10GW; first GW in second half of 2026 | 22 Sep 2025 | [Nvidia, 22 Sep 2025](https://nvidianews.nvidia.com/news/openai-and-nvidia-announce-strategic-partnership-to-deploy-10gw-of-nvidia-systems) | "invest up to $100 billion in OpenAI progressively as each gigawatt is deployed" | [BBC, 29 Oct 2025](https://www.bbc.co.uk/news/articles/cp8e970vn5vo) (the $100bn only) |
| F7. Microsoft and Nvidia invest in Anthropic; Anthropic's Azure commitment | Nvidia up to $10bn; Microsoft up to $5bn; $30bn of Azure; up to 1GW of Nvidia systems | 18 Nov 2025 | [Anthropic, 18 Nov 2025](https://www.anthropic.com/news/microsoft-nvidia-anthropic-announce-strategic-partnerships) | "committed to purchase $30 billion of Azure compute capacity ... up to one gigawatt" | none found |
| F8. AMD–OpenAI chip deal and warrant | 6GW; warrant for up to 160m shares | 6 Oct 2025 | [AMD, 6 Oct 2025](https://ir.amd.com/news-events/press-releases/detail/1260/amd-and-openai-announce-strategic-partnership-to-deploy-6-gigawatts-of-amd-gpus) | "warrant for up to 160 million shares of AMD common stock" | [TechCrunch, 14 Oct 2025](https://techcrunch.com/2025/10/14/openai-and-broadcom-partner-on-ai-hardware/) (the 6GW only; not the warrant) |
| F9. OpenAI–Broadcom custom-chip deal | 10GW; FT estimate of $350bn–$500bn cost | 14 Oct 2025 | [TechCrunch, 14 Oct 2025](https://techcrunch.com/2025/10/14/openai-and-broadcom-partner-on-ai-hardware/) | "10 gigawatts' worth of custom AI accelerator hardware" | none found |
| F10. Nvidia's stake in Intel | $5bn; $23.28 a share | 18 Sep 2025 | [Nvidia, 18 Sep 2025](https://nvidianews.nvidia.com/news/nvidia-and-intel-to-develop-ai-infrastructure-and-personal-computing-products) | "$23.28 per share" | none found |
| F11. OpenAI–CoreWeave cloud contract and stock purchase | up to $11.9bn; $350m of stock | 10 Mar 2025 | [CoreWeave, 10 Mar 2025](https://www.coreweave.com/news/coreweave-announces-agreement-with-openai-to-deliver-ai-infrastructure) | "up to $11.9 billion" | none found |
| F12. Meta–CoreWeave cloud contract | up to about $14.2bn through 14 Dec 2031 | 25 Sep 2025 | [CoreWeave 8-K, 25 Sep 2025](https://www.sec.gov/Archives/edgar/data/1769628/000176962825000050/crwv-20250925.htm) | "up to approximately $14.2 billion" | none found |
| F13. OpenAI–AWS cloud contract | $38bn over seven years | 3 Nov 2025 | [Amazon, 3 Nov 2025](https://www.aboutamazon.com/news/aws/aws-open-ai-workloads-compute-infrastructure) | "$38 billion agreement" | none found |
| F14. OpenAI–Oracle cloud contract | $300bn over about five years, purchases from 2027 | 10 Sep 2025 | [TechCrunch, 10 Sep 2025](https://techcrunch.com/2025/09/10/openai-and-oracle-reportedly-ink-historic-cloud-computing-deal) | "$300 billion" | none found; Oracle's 9 Sep release gives the $455bn backlog only (Section 5) |
| F15. Oracle's contracted backlog and quarterly revenue | $455bn, up 359%; $14.9bn of quarterly revenue | 9 Sep 2025 | [Oracle Q1 FY26, 9 Sep 2025](https://www.sec.gov/Archives/edgar/data/1341439/000119312525199175/orcl-ex99_1.htm) | "Total Remaining Performance Obligations were up 359% year-over-year ... to $455 billion" | none found |
| F16. Nvidia's backstop for CoreWeave's unsold capacity | $6.3bn initial order; residual capacity through 13 Apr 2032 | 9 Sep 2025 | [CoreWeave 8-K, 9 Sep 2025](https://www.sec.gov/Archives/edgar/data/1769628/000176962825000047/crwv-20250909.htm) | "NVIDIA is obligated to purchase the residual unsold capacity through April 13, 2032" | none found |
| F17. Oracle's September 2025 bond sale | $18bn of notes | 26 Sep 2025 | [Oracle 8-K, 26 Sep 2025](https://www.sec.gov/Archives/edgar/data/1341439/000119312525220445/d31817d8k.htm) | "Issuance of $18 Billion Aggregate Principal Amount of Notes" | none found |
| F18. Oracle's debt and interest | $82.2bn of non-current notes payable; $923m of quarterly interest | 9 Sep 2025 (balance sheet 31 Aug 2025) | [Oracle Q1 FY26, 9 Sep 2025](https://www.sec.gov/Archives/edgar/data/1341439/000119312525199175/orcl-ex99_1.htm) | "$82,236" (non-current notes payable, $m); "Interest expense (923)" | none found |
| F19. Meta–Blue Owl Hyperion joint venture | $27bn of development cost; 80% Blue Owl, 20% Meta; $7bn cash; $3bn distribution; 16-year guarantee | 21 Oct 2025 | [Meta, 21 Oct 2025](https://about.fb.com/news/2025/10/meta-blue-owl-capital-develop-hyperion-data-center/) | "approximately $27 billion in total development costs"; "80% interest in the joint venture"; "residual value guarantee for the first 16 years" | none found |
| F20. CoreWeave's debt and interest | about $46.9bn (sum of four balance-sheet lines); $846m of quarterly interest | 10 Nov 2026 (quarter ended 30 Sep 2026) | [CoreWeave Q3 2026, 10 Nov 2026](https://www.sec.gov/Archives/edgar/data/1769628/000176962826000461/coreweave3q26earningspress.htm) | "Interest expense, net $(846)"; debt lines "$9,183", "$1,389", "$32,417" and "$3,884" ($m) | none found |
| F21. CoreWeave's customer prepayments and deferred revenue | about $9bn expected in three months; $7.7bn of non-current deferred revenue | 10 Nov 2026 | [CoreWeave Q3 2026, 10 Nov 2026](https://www.sec.gov/Archives/edgar/data/1769628/000176962826000461/coreweave3q26earningspress.htm) | "approximately $9 billion in customer prepayments and deposits expected in the next three months" | none found |
| F22. Kansas City Fed on AI debt | AI share of investment-grade bond issuance 2% in 2023 and 10% in 2026; $330bn year to date, 10 times all of 2023; SPVs 90% debt-financed; neoclouds 85% | 5 Oct 2026 | [Kansas City Fed, 5 Oct 2026](https://www.kansascityfed.org/research/economic-bulletin/beyond-valuations-long-term-financial-risks-from-the-ai-build-out/) | "The most dramatic increase is in investment-grade bonds, where shares of AI firms' issuances have risen from 2 percent in 2023 to 10 percent this year"; "$330 billion, already 10 times the issuances for the whole of 2023"; "finance 90 percent of their assets with debt"; "debt-to-asset ratio of 85 percent" | none found |
| F23. BIS on the financing shift | no number | 7 Jan 2026 | [BIS Bulletin 120, 7 Jan 2026](https://www.bis.org/publications/bulletin-120-financing-ai-boom-cash-flows-debt) | "shift the source of financing from operating cash flows to debt, with private credit playing a rapidly increasing role" | [Kansas City Fed, 5 Oct 2026](https://www.kansascityfed.org/research/economic-bulletin/beyond-valuations-long-term-financial-risks-from-the-ai-build-out/) |
| F24. Nvidia's market value | $5tn, the first company to reach it | 29 Oct 2025 | [BBC, 29 Oct 2025](https://www.bbc.co.uk/news/articles/cp8e970vn5vo) | "first company in the world to reach a market value of $5tn" | none found |
| F25. The DeepSeek sell-off | Nvidia lost $600bn in a day; Nasdaq fell 3%; Oracle fell 14% | 27 Jan 2025 | [Guardian, 28 Jan 2025](https://www.theguardian.com/technology/2025/jan/28/deepseek-selloff) | "wiped $600bn in Nvidia's market value"; "Nasdaq index to drop 3%"; "Oracle stock dropped 14%" | none found |
| F26. The July 2026 AI sell-off | Kospi fell 11.5%; SK Hynix and Samsung fell more than 10%; Nvidia fell 5% and closed below $200; $250bn of Nvidia–OpenAI Ohio talks | 28 Jul 2026 | [Guardian, 28 Jul 2026](https://www.theguardian.com/business/2026/jul/28/ai-sell-off-chip-stocks-sk-hynix-samsung) | "Kospi share index down by 11.5%"; "SK Hynix and Samsung Electronics fell by more than 10%"; "Nvidia was in discussions with OpenAI about providing $250bn"; "Nvidia fell 5% and closed the session below the $200-per-share mark" | none found |
| F27. The November 2026 rout | more than $2.5tn lost from US shares (`data/news.json` figure; CNN says "roughly $2.5 trillion"; the Guardian says "$3.2tn"); Nasdaq fell 5.5%; S&P 500 fell 4.4%; investors bet on an AI slowdown after the US midterm elections | 5 Nov 2026 | [Guardian, 6 Nov 2026](https://www.theguardian.com/technology/2026/nov/06/us-tech-stock-ai-bubble-bursting-market-meltdown-explainer) | "Nasdaq fell by 5.5% and the blue-chip S&P 500 fell by 4.4%"; "as investors bet on an AI slowdown after the US midterm elections"; the page's dollar total is "More than $3.2tn" | [CNN, 5 Nov 2026](https://www.cnn.com/2026/11/05/investing/tech-heavy-nasdaq-plunges) ("wiped out roughly $2.5 trillion in market value Thursday"); [AP, 5 Nov 2026](https://apnews.com/article/stocks-markets-ai-midterm-oil-trump-7ee9c212805aa5e70cf34d25aab7a36e) (5.5% and 4.4%); `data/news.json` labels the day "$2.5tn+" and gives the Guardian URL. No openable second source was found for the $3.2tn total. |
| F28. Anthropic's IPO and concurrent placement | $93.5bn gross; $91.6bn to Anthropic; 1.127bn shares at $83; $26bn placement | 20 Nov 2026 | [Anthropic, 20 Nov 2026](https://www.anthropic.com/news/ipo-close) | "aggregate gross proceeds ... were approximately $93.5 billion"; "1,127,000,000 shares ... at a public offering price of $83.00 per share"; "313,253,007 shares of Class N common stock ... for an aggregate purchase price of approximately $26.0 billion" | none found |
| F29. Stargate | $500bn intended over four years; $100bn immediate | 21 Jan 2025 | [SoftBank, 22 Jan 2025](https://group.softbank/en/news/press/20250122) | "invest $500 billion over the next four years building new AI infrastructure for OpenAI"; "begin deploying $100 billion immediately" | [TechCrunch, 21 Jan 2025](https://techcrunch.com/2025/01/21/openai-teams-up-with-softbank-and-oracle-on-50b-data-center-project/) |
| F30. xAI's Series E | $20bn | 6 Jan 2026 | [xAI, 6 Jan 2026](https://x.ai/news/series-e) | "$20 billion" | none found |
| F31. Anthropic's Google TPU expansion | up to one million TPUs; "tens of billions of dollars" | 23 Oct 2025 | [Anthropic, 23 Oct 2025](https://www.anthropic.com/news/expanding-our-use-of-google-cloud-tpus-and-services) | "up to one million TPUs"; "worth tens of billions of dollars" | none found |
| F32. Microsoft's revenue from OpenAI | $10bn in the quarter ended 30 Sep 2026; $24.1bn in fiscal 2026 | 28 Oct 2026 | [TechCrunch, 28 Oct 2026](https://techcrunch.com/2026/10/28/microsoft-recorded-10-billion-in-revenue-from-openai/) | "Microsoft generated $10 billion in revenue from commercial arrangements with OpenAI"; "$24.1 billion" | none found |
| F33. Nvidia's stake in CoreWeave | no number | 9 Sep 2025 | [CoreWeave 8-K, 9 Sep 2025](https://www.sec.gov/Archives/edgar/data/1769628/000176962825000047/crwv-20250909.htm) | "NVIDIA supplies the Company with NVIDIA GPUs and is a stockholder of the Company." | none found |
| F34. Google's 2023 investment in Anthropic | up to $2bn; $500m now, up to $1.5bn later | 27 Oct 2023 | [TechCrunch, 27 Oct 2023](https://techcrunch.com/2023/10/27/ais-proxy-war-heats-up-as-google-reportedly-backs-anthropic-with-2b) | "reportedly involves $500 million now and up to $1.5 billion later" | none found |
| F35. The transformer paper | 12 Jun 2017; eight authors | 12 Jun 2017 | [arXiv, 12 Jun 2017](https://arxiv.org/abs/1706.03762) | "Submitted on 12 Jun 2017"; title "Attention Is All You Need"; eight authors listed | none found |
| F36. Microsoft's 2019 OpenAI investment and cloud partnership | $1bn | 22 Jul 2019 | [Microsoft, 22 Jul 2019](https://news.microsoft.com/source/2019/07/22/openai-forms-exclusive-computing-partnership-with-microsoft-to-build-new-azure-ai-supercomputing-technologies/) | "an investment of $1 billion from Microsoft"; "OpenAI will port its services to run on Microsoft Azure" | none found |
| F37. ChatGPT's public release | 30 Nov 2022 | 30 Nov 2022 | [TechCrunch, 1 Dec 2022](https://techcrunch.com/2022/12/01/while-anticipation-builds-for-gpt-4-openai-quietly-releases-gpt-3-5/) | "GPT-3.5 broke cover on Wednesday with ChatGPT"; "Debuted in a public demo yesterday afternoon". The page is dated Thursday 1 Dec 2022, so "yesterday" and "Wednesday" are both 30 Nov 2022 | [BBC, 7 Dec 2022](https://www.bbc.co.uk/news/technology-63861322) ("publicly released on Wednesday") |
| F38. Nvidia briefly reaches a $1tn market value | $1tn; first chipmaker to reach it | 30 May 2023 | [BBC, 30 May 2023](https://www.bbc.co.uk/news/business-65757812) | "Nvidia briefly joined the ranks"; "ended trading ... worth more than $990bn" | [CBS, 30 May 2023](https://www.cbsnews.com/news/nvidia-1-trillion-market-value-becoming-ai-first-chip-company-to-do-so/) ("first chip company to do so") |
| F39. OpenAI's revenue shortfall | about $50bn annualised; $20bn below the earlier $70bn figure | 8 Oct 2026 | [TechCrunch, 8 Oct 2026](https://techcrunch.com/2026/10/08/openais-revenue-is-reportedly-20-billion-less-than-previously-projected/) | "its annualized revenue is 'approaching $50 billion'"; "some $20 billion lower" | [Bloomberg, 8 Oct 2026](https://www.bloomberg.com/news/articles/2026-10-08/openai-s-annualized-revenue-nears-50-billion-ft-says) ("annualized revenue of roughly $50 billion ... less than some recently reported estimates"; "Some outlets reported last month that OpenAI was already on track to generate nearly $70 billion") |
| F40. Why a cheaper model hit Nvidia | R1 used "fewer resources and less compute power"; good models "don't necessarily need expensive, high-end chips"; Nvidia lost nearly $600bn in a day | 27 Jan 2025 | [TechCrunch, 27 Jan 2025](https://techcrunch.com/2025/01/27/nvidia-drops-600bn-off-its-market-cap-amid-the-rise-of-deepseek) | "despite using fewer resources and less compute power"; "AI models don't necessarily need expensive, high-end chips or hardware to build an impressive model, which isn't exactly great news for a chipmaker like Nvidia" | [BBC, 27 Jan 2025](https://www.bbc.com/news/articles/c0qw7z2v1pgo) ("AI models that require far less computing power than before"; "they cost a lot less than previously thought possible") |
| F41. Microsoft's capital spending, fiscal 2023 and 2024 | $44,477m in fiscal 2024; $28,107m in fiscal 2023 | 30 Jul 2024 (10-K) | [Microsoft 10-K, 30 Jul 2024](https://www.sec.gov/Archives/edgar/data/789019/000095017024087843/msft-20240630.htm) | "Additions to property and equipment (44,477) (28,107) (23,886)" | none found |
| F42. Microsoft's planned capital spending for fiscal 2025 | $80bn | 3 Jan 2025 | [TechCrunch, 3 Jan 2025](https://techcrunch.com/2025/01/03/microsoft-to-spend-80-billion-in-fy25-on-data-centers-for-ai/) | "Microsoft has earmarked $80 billion in fiscal 2025 to build data centers designed to handle artificial intelligence workloads"; "The tech giant's 2025 fiscal year ends in June." | none found |
| F43. Blue Owl Capital's business | no number | undated page, opened 24 Nov 2026 | [Blue Owl, home page](https://www.blueowl.com/) | "At Blue Owl, we are doing more than just investing in private markets"; "we are shaping the future of alternatives" | [Meta, 21 Oct 2025](https://about.fb.com/news/2025/10/meta-blue-owl-capital-develop-hyperion-data-center/) ("Blue Owl Capital complements this joint venture with its ability to deliver substantial capital at scale, along with deep expertise in digital infrastructure investment") |
| F44. Why OpenAI's revenue matters | no number | 8 Oct 2026 | [TechCrunch, 8 Oct 2026](https://techcrunch.com/2026/10/08/openais-revenue-is-reportedly-20-billion-less-than-previously-projected/) | "The issue of OpenAI's revenue has troubled the company, as it attempts to justify the gargantuan investments being made on its behalf" | none found |
| F45. OpenAI's board fires Sam Altman | fired on Friday 17 November 2023; the vast majority of 770 employees threatened to quit unless Altman and Brockman returned | 17 Nov 2023 | [Guardian, 25 Nov 2023](https://www.theguardian.com/technology/2023/nov/25/how-crisis-openai-sam-altman-unfolded) | "OpenAI's board announced on Friday 17 November that it had sacked the 38-year-old"; "The vast majority of OpenAI's 770 employees including Murati signed a letter addressed to the board threatening to quit en masse" | [BBC, 22 Nov 2023](https://www.bbc.com/news/business-67494165) ("staff threatening mass resignations unless he was reinstated") |
| F46. Microsoft hires Altman and Brockman | hired for a new AI research team on Monday 20 November 2023 | 20 Nov 2023 | [Guardian, 22 Nov 2023](https://www.theguardian.com/technology/2023/nov/22/sam-altman-openai-ceo-return-board-chatgpt) | "On Monday it hired Altman and Greg Brockman, who quit his role as OpenAI's president on Friday after his colleague's sacking" | [Guardian, 20 Nov 2023](https://www.theguardian.com/technology/2023/nov/20/openai-staff-walkout-sam-altman-board) ("Microsoft had hired the duo to head a new AI research unit") |
| F47. Altman returns after five days | attempted board coup lasted five days; employees threatened to defect to Microsoft; Altman was fired on Friday | 22 Nov 2023 | [The Verge, 22 Nov 2023](https://www.theverge.com/2023/11/22/23967223/sam-altman-returns-ceo-open-ai) | "an attempted coup by OpenAI's board that lasted five days"; "employees of OpenAI revolted, threatening to defect to Microsoft with Altman and co-founder Brockman"; "initially fired Altman on Friday" | [BBC, 22 Nov 2023](https://www.bbc.com/news/business-67494165) ("will return as boss just days after he was fired by the board") |
| F48. BBC summary of the firing and return | return days after the firing; staff threatened mass resignations; new board members appointed | 22 Nov 2023 | [BBC, 22 Nov 2023](https://www.bbc.com/news/business-67494165) | "OpenAI co-founder Sam Altman will return as boss just days after he was fired by the board"; "Mr Altman's sacking on Friday astonished industry watchers and led to staff threatening mass resignations unless he was reinstated"; "The agreement 'in principle' involves new board members being appointed" | [Guardian, 22 Nov 2023](https://www.theguardian.com/technology/2023/nov/22/sam-altman-openai-ceo-return-board-chatgpt) |

## 4. Turning points

Nine dated money moments, in order. Company ids are from `data/companies.json`; "not in data" marks an organisation
that has no id. Each quote is from a page published at the time or shortly after the event.

**1. 25 September 2023 — Amazon puts up to $4bn into Anthropic and makes AWS its main cloud.**
Companies: `amazon`, `anthropic`. What changed: a cloud provider became a large shareholder in a lab, and the lab
made that provider its primary cloud. The investment and the supply relationship were announced together.
Quote: "Today, we're announcing that Amazon will invest up to $4 billion in Anthropic."

**2. 21 January 2025 — Stargate is announced as a $500bn, four-year build.** (SoftBank's page is dated 22 January.)
Companies: `softbank`, `openai`, `oracle`, `nvidia`, `microsoft`; MGX is not in data. What changed: the build-out
was packaged as a new company with equity from several firms, not as one company's capital spending. The first
$100bn was described as immediate. Quote: "The Stargate Project is a new company which intends to invest $500
billion over the next four years building new AI infrastructure for OpenAI in the United States."

**3. 27 January 2025 — the DeepSeek sell-off shows how a model can move the money.**
Companies: `nvidia`; DeepSeek is inside the `g-labs` group. What changed: a cheaper Chinese model was read by
investors as a challenge to the size of AI chip spending, and Nvidia lost $600bn of market value in a day.
Quote: "R1's functionality and accuracy compared to its U.S. counterparts, despite using fewer resources and less
compute power ... AI models don't necessarily need expensive, high-end chips" (TechCrunch, 27 Jan 2025).

**4. 22 September 2025 — Nvidia promises up to $100bn to OpenAI while OpenAI promises to take 10GW of its chips.**
Companies: `nvidia`, `openai`. What changed: the supplier became an investor, and the investment was tied to the
customer's deployment of the supplier's product. Quote: Nvidia and OpenAI "intend to invest up to $100 billion in
OpenAI progressively as each gigawatt is deployed."

**5. 21 October 2025 — Meta and Blue Owl put the Hyperion data centre into a $27bn joint venture.**
Companies: `meta`; Blue Owl is not in data. What changed: a hyperscaler moved a data-centre project into a
separate company, with 80% owned by Blue Owl funds, a lease back to Meta and a 16-year residual-value guarantee.
Quote: "Funds managed by Blue Owl Capital will own an 80% interest in the joint venture, while Meta will retain
the remaining 20% ownership."

**6. 28 October 2025 — Microsoft's OpenAI stake is stated at about 27%, worth $135bn, and OpenAI adds $250bn of Azure.**
Companies: `microsoft`, `openai`. What changed: the partnership was converted into a stated equity stake and a
stated cloud commitment, making the size of the loop visible. Quote: "Following the recapitalization, Microsoft
holds an investment in OpenAI Group PBC valued at approximately $135 billion, representing roughly 27 percent on
an as-converted diluted basis..."

**7. 28 July 2026 — a chip-stock sell-off brings the debt and circularity questions to the surface.**
Companies: `nvidia`, `openai`, `intel`, `amd`, `g-chips`. What changed: South Korea's Kospi fell 11.5%, SK Hynix and
Samsung fell more than 10%, and Nvidia had fallen 5% the day before after a report that it was discussing $250bn for
an OpenAI data centre in Ohio. The Guardian named "circular funding" as a worry. Quote: "Investors may also be
growing jittery about the 'circular funding' at the heart of the AI industry, through which artificial intelligence
firms finance one another."

**8. 5 November 2026 — US shares lose more than $2.5tn in one day.**
Companies: `nvidia`, `alphabet`, `microsoft`, `meta`, `amazon`. What changed: the sell-off moved from
chip stocks to the whole US market after the midterm elections, with the Nasdaq down 5.5% and the S&P 500 down
4.4%. `data/news.json` gives the day as "$2.5tn+" and points to the Guardian explainer, whose text says "more than
$3.2tn"; CNN says "roughly $2.5 trillion". The chapter uses the news.json figure. Quote: "Global markets tumbled
after a Wall Street rout wiped out roughly $2.5 trillion in market value Thursday" (CNN, 5 Nov 2026).

**9. 20 November 2026 — Anthropic closes its IPO and a $26bn placement to its suppliers and partners.**
Companies: `anthropic`, `amd`, `broadcom`, `alphabet`, `microsoft`, `nvidia`, `tsmc`; Micron is inside `g-chips`.
What changed: a private lab became a public company, and the companies that supply or host it took $26bn of stock
at the IPO price in a separate placement. Quote: "The aggregate gross proceeds from the offering, before
deducting underwriting discounts and commissions and other offering expenses, were approximately $93.5 billion,
of which approximately $91.6 billion was received by Anthropic."

## 5. Disputed, single-source or unsure

- **The $300bn Oracle–OpenAI contract is reported, not confirmed by the companies.** TechCrunch's 10 September
  2025 report attributes the figure to the Wall Street Journal and says Oracle declined to comment; its 14 October
  2025 piece says neither company has confirmed the deal. Oracle's own 9 September release gives the $455bn
  backlog but not the $300bn contract. Treat the $300bn as a reported number.
- **Google's 2023 Anthropic investment is reported, not confirmed by the companies.** TechCrunch's 27 October
  2023 report attributes the figure to the Wall Street Journal and says it had asked Anthropic for comment; the
  $500m now / $1.5bn later split comes from that report. `data/deals.json` records it as $2bn "up to".
- **The size of the 5 November 2026 wipeout differs by source.** `data/news.json` labels the day "$2.5tn+" and
  points to the Guardian explainer, whose text says "more than $3.2tn" was wiped from the US stock market. CNN
  says "roughly $2.5 trillion". The two may be measuring different things (the whole US market against AI stocks),
  but the opened pages do not reconcile them. The chapter uses the news.json figure, more than $2.5tn, because no
  second openable page states $3.2tn. The FT headline also says "$3.2tn" but the FT page was blocked in this run.
  AP (5 Nov 2026) confirms the S&P 500 fell 4.4% and the Nasdaq composite 5.5% but gives no dollar total.
  Bloomberg's 5 Nov live coverage puts the Nasdaq 100's loss at $2.3tn. **Could not source:** the $3.2tn
  whole-market total has no openable second source in this run; it rests on the Guardian alone.
- **The 20% OpenAI revenue share with Microsoft is not confirmed.** TechCrunch says OpenAI "reportedly" shares 20%
  of its revenue with Microsoft and that neither company has publicly confirmed the percentage. This draft
  therefore uses the reported $10bn of Microsoft revenue, not a 20% calculation.
- **Microsoft's stake has moved since the October 2025 figure.** TechCrunch reported a decline from about 27% at
  the recapitalisation to about 25% in June 2026 and 24% in September 2026, because of dilution. The $135bn/27%
  row is the October 2025 snapshot, not the latest one.
- **CoreWeave's "$46.9bn of debt" is arithmetic, not a printed total.** It is the sum of four balance-sheet lines
  in the Q3 2026 release: $9.183bn and $1.389bn current, $32.417bn and $3.884bn non-current. The release does not
  print a total, and some of the lines are recourse and some non-recourse.
- **Meta's $27bn is a development cost, not all debt.** Meta's page says the parties committed to fund their share
  of "approximately $27 billion in total development costs". It states $7bn of cash from Blue Owl funds, a $3bn
  distribution to Meta and a 16-year residual-value guarantee, but does not state how much debt PIMCO and other
  bond investors provided.
- **Stargate's $500bn is an intention, not cash in hand.** SoftBank's page says the new company "intends to invest"
  the amount over four years and will "begin deploying" $100bn immediately. The page does not show the cash
  arriving, and the equity funders' individual shares are not given.
- **Most "up to" figures are ceilings.** Nvidia's $100bn to OpenAI, Amazon's $4bn (2023) and $5bn now with up
  to $20bn more (2026), Microsoft's $5bn and Nvidia's $10bn to Anthropic, and OpenAI's $11.9bn CoreWeave contract
  are all announced ceilings. None of the opened pages shows the full amount paid.
- **Anthropic's IPO has four different totals.** The gross proceeds from the IPO were $93.5bn, Anthropic received
  $91.6bn, the concurrent private placement added $26.0bn, and the company put the two sales together at $119.5bn.
  The $93.5bn includes 23.6m shares sold by existing holders, about $2bn, which Anthropic did not receive.
- **The Nvidia leadership change is dated differently in the repo.** `data/news.json` records Jensen Huang's
  resignation on 12 November 2026 but not his reinstatement. Nvidia's own pages record the resignation on 12
  November and the reinstatement on 23 November 2026. This is not a money fact, but a story set in late November
  2026 should not treat the resignation as the final state.
- **Many rows rest on one page.** The fact table marks these "none found". The largest single-source rows are the
  Microsoft–Anthropic investment terms, the Nvidia–Intel stake, the AMD warrant, the OpenAI–CoreWeave and
  Meta–CoreWeave contracts, the Nvidia–CoreWeave backstop and stake, the Meta–Blue Owl joint venture, CoreWeave's
  debt and prepayments, Oracle's $455bn backlog, $18bn notes, debt and interest, the Kansas City Fed figures,
  Nvidia's $5tn market value, the DeepSeek and July 2026 sell-offs, the November 2026 rout, the Anthropic IPO,
  xAI's round and Google's 2023 Anthropic investment. Where a company page and a news page both exist, the company
  page is the primary link.
- **Some pages refused to load.** Oracle's investor-relations pages and the Guardian's 29 July 2026 follow-up
  refused the fetch in this run. Reuters, CNBC, Bloomberg, the Wall Street Journal, the New York Times and
  openai.com also refuse fetches, so no row relies on them. Facts that would normally cite those pages are either
  left out or marked as reported by an opened page.

## Sources

Primary first: filings, company newsrooms and central banks. Then TechCrunch, BBC and the Guardian. All were
opened during this run; the date is the publication or filing date.

**Filings and company newsrooms**

- Microsoft, "OpenAI forms exclusive computing partnership with Microsoft", 22 Jul 2019 —
  https://news.microsoft.com/source/2019/07/22/openai-forms-exclusive-computing-partnership-with-microsoft-to-build-new-azure-ai-supercomputing-technologies/
- Microsoft, "Microsoft and OpenAI extend partnership", 23 Jan 2023 —
  https://blogs.microsoft.com/blog/2023/01/23/microsoftandopenaiextendpartnership/
- Microsoft, "The next chapter of the Microsoft–OpenAI partnership", 28 Oct 2025 —
  https://blogs.microsoft.com/blog/2025/10/28/the-next-chapter-of-the-microsoft-openai-partnership/
- Microsoft, Form 10-K for the fiscal year ended 30 June 2024, filed 30 Jul 2024 —
  https://www.sec.gov/Archives/edgar/data/789019/000095017024087843/msft-20240630.htm
- Anthropic, "Expanding access to safer AI with Amazon", 25 Sep 2023 —
  https://www.anthropic.com/news/anthropic-amazon
- Anthropic, "Expanding our use of Google Cloud TPUs and Services", 23 Oct 2025 —
  https://www.anthropic.com/news/expanding-our-use-of-google-cloud-tpus-and-services
- Anthropic, "Microsoft, NVIDIA and Anthropic announce strategic partnerships", 18 Nov 2025 —
  https://www.anthropic.com/news/microsoft-nvidia-anthropic-announce-strategic-partnerships
- Anthropic, "Anthropic and Amazon expand collaboration for up to 5 gigawatts of new compute", 20 Apr 2026 —
  https://www.anthropic.com/news/anthropic-amazon-compute
- Anthropic, "Anthropic expands partnership with Google and Broadcom", 6 Apr 2026 —
  https://www.anthropic.com/news/google-broadcom-partnership-compute
- Anthropic, "Anthropic files S-1 with the SEC", 26 Oct 2026 —
  https://www.anthropic.com/news/s1-sec
- Anthropic, "Anthropic announces closing of initial public offering", 20 Nov 2026 —
  https://www.anthropic.com/news/ipo-close
- Nvidia, "OpenAI and NVIDIA announce strategic partnership to deploy 10GW of NVIDIA systems", 22 Sep 2025 —
  https://nvidianews.nvidia.com/news/openai-and-nvidia-announce-strategic-partnership-to-deploy-10gw-of-nvidia-systems
- Nvidia, "NVIDIA and Intel to develop AI infrastructure and personal computing products", 18 Sep 2025 —
  https://nvidianews.nvidia.com/news/nvidia-and-intel-to-develop-ai-infrastructure-and-personal-computing-products
- Nvidia, "NVIDIA announces CEO transition", 12 Nov 2026 —
  https://nvidianews.nvidia.com/news/nvidia-announces-ceo-transition
- Nvidia, "NVIDIA board reinstates Jensen Huang", 23 Nov 2026 —
  https://nvidianews.nvidia.com/news/nvidia-board-reinstates-jensen-huang-as-president-ceo-and-board-director
- AMD, "AMD and OpenAI announce strategic partnership to deploy 6 gigawatts of AMD GPUs", 6 Oct 2025 —
  https://ir.amd.com/news-events/press-releases/detail/1260/amd-and-openai-announce-strategic-partnership-to-deploy-6-gigawatts-of-amd-gpus
- CoreWeave, "CoreWeave announces agreement with OpenAI to deliver AI infrastructure", 10 Mar 2025 —
  https://www.coreweave.com/news/coreweave-announces-agreement-with-openai-to-deliver-ai-infrastructure
- CoreWeave, Form 8-K, 9 Sep 2025 —
  https://www.sec.gov/Archives/edgar/data/1769628/000176962825000047/crwv-20250909.htm
- CoreWeave, Form 8-K, 25 Sep 2025 —
  https://www.sec.gov/Archives/edgar/data/1769628/000176962825000050/crwv-20250925.htm
- CoreWeave, "CoreWeave reports strong third quarter 2026 results", 10 Nov 2026 —
  https://www.sec.gov/Archives/edgar/data/1769628/000176962826000461/coreweave3q26earningspress.htm
- Oracle, Form 8-K, exhibit 99.1, Q1 fiscal 2026 results, 9 Sep 2025 —
  https://www.sec.gov/Archives/edgar/data/1341439/000119312525199175/orcl-ex99_1.htm
- Oracle, Form 8-K, 26 Sep 2025, $18bn notes —
  https://www.sec.gov/Archives/edgar/data/1341439/000119312525220445/d31817d8k.htm
- SoftBank, "Announcing The Stargate Project", 22 Jan 2025 —
  https://group.softbank/en/news/press/20250122
- Meta, "Meta announces joint venture with funds managed by Blue Owl Capital to develop Hyperion data center",
  21 Oct 2025 — https://about.fb.com/news/2025/10/meta-blue-owl-capital-develop-hyperion-data-center/
- Blue Owl, "Redefining alternatives", undated, opened 24 Nov 2026 — https://www.blueowl.com/
- Amazon, "AWS and OpenAI announce multi-year strategic partnership", 3 Nov 2025 —
  https://www.aboutamazon.com/news/aws/aws-open-ai-workloads-compute-infrastructure
- Amazon, "Amazon and Anthropic expand strategic collaboration", 20 Apr 2026 —
  https://www.aboutamazon.com/news/company-news/amazon-invests-additional-5-billion-anthropic-ai
- xAI, "Series E", 6 Jan 2026 — https://x.ai/news/series-e
- BIS, "Financing the AI boom: from cash flows to debt", BIS Bulletin 120, 7 Jan 2026 —
  https://www.bis.org/publications/bulletin-120-financing-ai-boom-cash-flows-debt
- Bank of England, Financial Stability Report, July 2026 —
  https://www.bankofengland.co.uk/financial-stability-report/2026/july-2026
- Federal Reserve Bank of Kansas City, "Beyond Valuations: Long-Term Financial Risks from the AI Build-Out",
  5 Oct 2026 —
  https://www.kansascityfed.org/research/economic-bulletin/beyond-valuations-long-term-financial-risks-from-the-ai-build-out/
- European Central Bank, blog on AI valuations, 17 Aug 2026 —
  https://www.ecb.europa.eu/press/blog/date/2026/html/ecb.blog20260817~754a8a4418.en.html

**Papers and reference**

- Vaswani et al., "Attention Is All You Need", 12 Jun 2017 — https://arxiv.org/abs/1706.03762

**AP**

- "A brutal sell-off for AI stocks sends Wall Street reeling, and the S&P 500 tumbles 4.4%", 5 Nov 2026 —
  https://apnews.com/article/stocks-markets-ai-midterm-oil-trump-7ee9c212805aa5e70cf34d25aab7a36e
- "How major US stock indexes fared Thursday 11/5/2026", 5 Nov 2026 —
  https://apnews.com/article/wall-street-stocks-dow-nasdaq-afe254c608c3d1fe2ea792812ba9765a

**CNN**

- "Massive tech sell-off wipes $2.5 trillion from the stock market", 5 Nov 2026 —
  https://www.cnn.com/2026/11/05/investing/tech-heavy-nasdaq-plunges

**Bloomberg**

- "OpenAI's Revenue Run Rate Nears $50 Billion, Less Than Reported", 8 Oct 2026 —
  https://www.bloomberg.com/news/articles/2026-10-08/openai-s-annualized-revenue-nears-50-billion-ft-says

**TechCrunch**

- "While anticipation builds for GPT-4, OpenAI quietly releases GPT-3.5", 1 Dec 2022 —
  https://techcrunch.com/2022/12/01/while-anticipation-builds-for-gpt-4-openai-quietly-releases-gpt-3-5/
- "AI's proxy war heats up as Google reportedly backs Anthropic with $2B", 27 Oct 2023 —
  https://techcrunch.com/2023/10/27/ais-proxy-war-heats-up-as-google-reportedly-backs-anthropic-with-2b
- "Microsoft to spend $80 billion in FY'25 on data centers for AI", 3 Jan 2025 —
  https://techcrunch.com/2025/01/03/microsoft-to-spend-80-billion-in-fy25-on-data-centers-for-ai/
- "OpenAI teams up with SoftBank and Oracle on $50B data center project", 21 Jan 2025 —
  https://techcrunch.com/2025/01/21/openai-teams-up-with-softbank-and-oracle-on-50b-data-center-project/
- "Nvidia drops $600B off its market cap amid the rise of DeepSeek", 27 Jan 2025 —
  https://techcrunch.com/2025/01/27/nvidia-drops-600bn-off-its-market-cap-amid-the-rise-of-deepseek
- "OpenAI and Oracle reportedly ink historic cloud computing deal", 10 Sep 2025 —
  https://techcrunch.com/2025/09/10/openai-and-oracle-reportedly-ink-historic-cloud-computing-deal
- "OpenAI and Broadcom partner on AI hardware", 14 Oct 2025 —
  https://techcrunch.com/2025/10/14/openai-and-broadcom-partner-on-ai-hardware/
- "OpenAI's revenue is reportedly $20 billion less than previously projected", 8 Oct 2026 —
  https://techcrunch.com/2026/10/08/openais-revenue-is-reportedly-20-billion-less-than-previously-projected/
- "Microsoft recorded $10 billion in revenue from OpenAI", 28 Oct 2026 —
  https://techcrunch.com/2026/10/28/microsoft-recorded-10-billion-in-revenue-from-openai/

**The Verge**

- "Sam Altman to return as CEO of OpenAI", 22 Nov 2023 —
  https://www.theverge.com/2023/11/22/23967223/sam-altman-returns-ceo-open-ai

**BBC**

- "ChatGPT: New AI chatbot has everyone talking to it", 7 Dec 2022 —
  https://www.bbc.co.uk/news/technology-63861322
- "Nvidia briefly worth $1 trillion thanks to AI boom", 30 May 2023 —
  https://www.bbc.co.uk/news/business-65757812
- "Sam Altman: Ousted OpenAI boss to return days after being sacked", 22 Nov 2023 —
  https://www.bbc.com/news/business-67494165
- "Nvidia shares sink as Chinese AI app DeepSeek spooks US markets", 27 Jan 2025 —
  https://www.bbc.com/news/articles/c0qw7z2v1pgo
- "Nvidia becomes world's first $5tn company", 29 Oct 2025 —
  https://www.bbc.co.uk/news/articles/cp8e970vn5vo

**CBS**

- "Nvidia reaches $1 trillion market value, becoming first chip company to do so", 30 May 2023 —
  https://www.cbsnews.com/news/nvidia-1-trillion-market-value-becoming-ai-first-chip-company-to-do-so/

**Guardian**

- "Sam Altman to return as CEO of OpenAI", 22 Nov 2023 —
  https://www.theguardian.com/technology/2023/nov/22/sam-altman-openai-ceo-return-board-chatgpt
- "Sacking, revolt, return: how crisis at OpenAI over Sam Altman unfolded", 25 Nov 2023 —
  https://www.theguardian.com/technology/2023/nov/25/how-crisis-openai-sam-altman-unfolded
- "Tech billionaires lost almost $100bn in stock market selloff sparked by DeepSeek", 28 Jan 2025 —
  https://www.theguardian.com/technology/2025/jan/28/deepseek-selloff
- "South Korean stock market at three-month low as AI sell-off intensifies", 28 Jul 2026 —
  https://www.theguardian.com/business/2026/jul/28/ai-sell-off-chip-stocks-sk-hynix-samsung
- "US tech stock rout: is the AI bubble bursting?", 6 Nov 2026 —
  https://www.theguardian.com/technology/2026/nov/06/us-tech-stock-ai-bubble-bursting-market-meltdown-explainer
