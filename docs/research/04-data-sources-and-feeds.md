# 04 - Market-data sources and news feeds (checked 15 Nov 2026)

How this was checked: every terms and pricing page below was fetched on 15 Nov 2026 with curl or WebFetch. Raw pages are in `~/.cache/claude-oc/web/`, not in the repo. Quotes are copied from those pages. Where a page could not be read, the table says so.

**Short verdict.** Share counts are solved: SEC EDGAR is public-domain US government data. **Daily prices are not solved.** No free price source whose terms I could read clearly allows showing its numbers (or numbers computed from them) on a public website and storing them in a public repo. Every readable free tier says personal, internal or non-commercial use only. The owner has to choose between asking a provider for written permission, paying, or showing a thinner dataset. See B.

## A. Market-data sources compared

"Allowed?" means: may the site show these numbers, or numbers computed from them, publicly and keep them in a public repo?

| Source | What it gives | Free limits | Allowed? | The deciding sentence, quoted | Terms URL | Opened today? |
|---|---|---|---|---|---|---|
| SEC EDGAR (data.sec.gov XBRL APIs, e.g. `companyfacts`, `companyconcept`) | No prices. Shares outstanding and filings from the 10-K/10-Q/20-F cover pages. All 18 listed names except SoftBank and Samsung have an SEC CIK (checked in `company_tickers.json`). SK hynix has CIK 2120882 but its company facts were empty today. | 10 requests per second, must send a User-Agent that names you. | **Yes** (for the filing data) | "Information presented on sec.gov is considered public information and may be copied or further distributed by users of the web site without the SEC's permission. Please consider appropriate citation to the SEC as the source." Rate rule: "Current max request rate: 10 requests/second." | https://www.sec.gov/privacy and https://www.sec.gov/search-filings/edgar-search-assistance/accessing-edgar-data | Yes. Fetched both. Without a proper User-Agent the site answered 403 or "Request Rate Threshold Exceeded". With one it worked. |
| Stooq | Free daily CSV (`/q/d/l/?s=nvda.us&i=d`) and bulk files (`/db/h/`), price only, includes some foreign listings (per third-party descriptions only). | Third-party notes say an API key via CAPTCHA and a daily quota (not verified by me). | **Unclear (could not read)** | None. The terms page (`stooq.com/terms.html`) and the CSV endpoint both sit behind a JavaScript proof-of-work check. I did not try to get past it. A third-party package README says the data "can be only used under terms and conditions defined at https://stooq.com/terms.html". | https://stooq.com/terms.html | **No.** Blocked by the bot check. |
| Alpha Vantage | Daily adjusted prices, about 20 years; overview endpoint has shares and market cap now (history of market cap not seen). US plus some foreign tickers. | Free: 25 API requests per day. Premium from $49.99/month. | **No** on free | "for personal, non-commercial use, unless you and Alpha Vantage have agreed otherwise in writing". Also counts as commercial: "You plan to use or provide information accessed through the Alpha Vantage Platform as part of any type of commercial activity that allows individuals or entities other than User to access information directly or indirectly" and any purpose beyond "activities that are individual in nature". | https://www.alphavantage.co/terms_of_service/ (a PDF) | Yes. Text pulled from the PDF by hand, so wording has some missing words. Limits: https://www.alphavantage.co/premium/ |
| Tiingo | Daily prices, 30+ years, US plus some others; fundamentals on paid add-on. | Starter (free): 50 requests/hour, 1,000/day, 500 symbols/month, 1 GB/month. | **No** on free | Pricing page: licence is "Internal Use Only" and "Internal use means you may only use the data for your own personal use and you may not display or share the data". Also: "For redistribution use, our pricing is explicit and predictable on our Product pages." | https://www.tiingo.com/about/pricing (the legal page lives at https://app.tiingo.com/legal/terms; not read) | Pricing page yes. Legal page redirected to another host and I did not open it. |
| Twelve Data | Daily prices, long history; foreign exchanges on paid tiers. | Basic (free): 8 credits per minute, 800 per day. | **No** on free | "(l) Use Free Tier data for commercial purposes" is prohibited. "Redistribute or provide external display of Data only if and as expressly authorized by a Redistribution Rights Add-On or separate written agreement with Twelve Data". "Redistribution" is defined as "any publication, distribution, or provision of Data to third parties." | https://twelvedata.com/terms | Yes. Pricing: https://twelvedata.com/pricing |
| Financial Modeling Prep (FMP) | Has a "Historical Market Cap" endpoint, plus prices and shares. Foreign listings on higher tiers. | Free (Basic): 250 calls/day, 5 years of history, 500 MB per 30 days. | **No** | Pricing page: "Displaying or redistributing data sourced from FMP requires a specific Data Display and Licensing Agreement with FMP." Terms: the personal licence may not "integrate the Data or Services into any tools or applications accessible by any third parties, or use the Services to host, share, display, or provide content for others." | https://site.financialmodelingprep.com/terms-of-service | Yes. Pricing: https://site.financialmodelingprep.com/pricing-plans |
| Finnhub | Prices and fundamentals (free tier covers US stocks per its own docs; not verified). | Pricing page is loaded by script; limits not readable today. | **No** | "You hereby agree to not redistribute or share access to data or derived results from the data obtained from Finnhub with anyone or any 3rd party without written approval from Finnhub. All plan listed on Finnhub website is strictly for personal use unless explicitly stated otherwise." | https://finnhub.io/terms-of-service | Terms yes. Limits not readable. |
| Polygon.io (now Massive) | Daily prices, financials. | Free plan limits are loaded by script; not readable today. | **No** (free = individual plan) | Individuals terms: "solely for your own personal, non-commercial, and non-business purposes." Business terms forbid you to "use, redistribute ... display, disseminate ... or otherwise make available any portion of the Information to anyone other than Customer, its Authorized Users, or its Edge Users". | https://massive.com/legal/individuals-terms-of-service and https://massive.com/legal/businesses-terms-of-service | Yes (polygon.io redirects to massive.com). Limits: https://massive.com/pricing, not readable. |
| Nasdaq Data Link | Not checked in detail. | n/a | **Unclear** | `data.nasdaq.com/terms` and `/product-terms` returned 404. | (none opened) | **No.** |
| EODHD | EOD prices 30+ years, includes foreign exchanges; has market cap in its list of datasets. | Free: 20 API calls/day (1 call per EOD request), 20 requests/minute, 1 year of history. | **No** | "Non-Professional Users are permitted to store, manipulate, and analyze the data for private, non-commercial purposes. However, they are prohibited from: ... Selling, reselling, retransmitting, redistributing, displaying, or granting access to the Information or Services, whether in its original or repackaged form." | https://eodhd.com/financial-apis/terms-conditions | Yes. Pricing: https://eodhd.com/pricing |
| Marketstack (apilayer) | Daily prices, free plan 100 requests/month. Free history depth not stated on the page I read. | 100 requests/month. Paid: 10 years of history (Basic), 15+ years (Professional). | **Unclear** | The terms index (https://www.ideracorp.com/legal/APILayer) only links to documents; the product licence was not opened. | https://www.ideracorp.com/legal/APILayer | Index only. Pricing: https://marketstack.com/pricing |
| Yahoo Finance (unofficial endpoints) | Daily prices from 1970s, adjusted, foreign tickers (`9984.T`, `005930.KS`). No official API. | No stated limit; rate-limited in practice. | **No** | "You must not misuse or interfere with the Services or try to access them using a method other than the interface and the instructions that we provide... Unless otherwise expressly stated, you may not access or reuse the Services, or any portion thereof, for any commercial purpose." Also licence is "personal ... non-transferable". The site is non-commercial, but there is no grant to republish. | https://legal.yahoo.com/us/en/yahoo/terms/otos/index.html | Yes |
| FRED (St. Louis Fed) | Macro series (and a few index series). No individual company market caps. | Free key. | Not relevant | "Data series available through the FRED API, may be owned by third parties and subject to copyright restrictions." Apps must show: "This product uses the FRED API but is not endorsed or certified by the Federal Reserve Bank of St. Louis." | https://fred.stlouisfed.org/docs/api/terms_of_use.html | Yes. Only useful if the site adds macro series (rates). |
| Exchange or openly licensed datasets | Not found. | n/a | n/a | I did not find an open-licence daily price dataset covering the 2017-to-today range for these names. | n/a | Not searched beyond the above. |

## B. Recommendation

**Reading of the evidence.** The only source with a clear "yes" is SEC EDGAR, and it has no prices. For prices, every free tier I could read forbids public display. So there is no route that is both free and verified. The decision on how to get past this is the owner's, not mine.

**Route 1 (recommended): SEC EDGAR for shares plus one price source with written permission.**

1. Shares outstanding per company from SEC, public domain. Endpoint, after sending a User-Agent that names the project and a contact:
   - `https://data.sec.gov/api/xbrl/companyconcept/CIK##########/dei/EntityCommonStockSharesOutstanding.json` (cover-page count, filing date in each row). Checked for NVIDIA: 69 values from 2009 to 26 Aug 2026.
   - Company list and CIKs: `https://www.sec.gov/files/company_tickers.json`.
2. Daily closing price from one source after getting written permission. Candidates to ask, with the cost known today:
   - Stooq (free, unreadable terms; ask by email). Free if they agree.
   - Tiingo: redistribution is sold separately, price not read.
   - EODHD, Twelve Data, FMP: all say display needs a separate agreement or a paid add-on; prices not read.
3. Market value on a day = closing price on that day x latest share count whose filing date is on or before that day. Compute it in the daily job and store the result with its source links, as the repo rules require.
4. Attribution to show: "Share counts: U.S. Securities and Exchange Commission, EDGAR (public information). Prices: <provider, as it requires>." Add the provider's required notice text, if any, once the provider is chosen. The SEC asks only that you "consider appropriate citation".

**Fallback (Route 2): show fewer, derived numbers and say so.** Use SEC data only. For example, show company value at each filing date using a price the owner can source lawfully (for example, a price quoted in an SEC filing or a press release, each with its link), instead of daily prices. This keeps every number linked to a public source but breaks the "day-by-day slider" promise. This is a design change, so it needs the owner's choice.

**Not recommended:** Yahoo's unofficial endpoints. Terms give a personal licence only, and no right to republish.

**Known gaps (apply to any route)**
- **Foreign listings.**
  - TSMC (TSM), ASML, ARM and SK hynix file 20-F with SEC. Their share counts come once a year, not per quarter (TSM: 9 values since 2017; ARM: 3). Use year-end counts and say so on the page.
  - SK hynix: SEC company facts empty today, so no share count from SEC.
  - SoftBank Group (9984.T) and Samsung have no SEC data. Share counts must come from company IR pages (Tokyo and Korea exchange filings). Not checked.
  - Prices for 9984.T, Samsung (005930.KS) and SK hynix (000660.KS) are in local currency, so a currency rate is needed too (FRED has daily exchange rates; not checked).
  - ADR versus ordinary share: TSM ADR = 5 ordinary shares; the SEC count is ordinary shares. Price source and share count must be on the same basis.
- **Share-count timing.** Cover-page counts are dated near the filing, not the quarter end, and the value is a stale count between filings. Big buybacks or issues (for example SMCI, CRWV after its 2025 listing) move values between filings.
- **Two-class companies.** Alphabet and Meta have no `EntityCommonStockSharesOutstanding` in company facts (it is reported per share class and left out). Their `us-gaap/CommonStockSharesOutstanding` has data (GOOGL: 90 values). It is a balance-sheet figure; check that it is the total of all classes before use.
- **Splits.** Adjusted prices already take splits into account but SEC counts do not. NVDA (10-for-1 in 2024), TSLA, AMZN, GOOGL and AVGO split after 2017. Use unadjusted closing prices with period-correct counts, or adjusted prices with split-adjusted counts. Mixing them gives wrong values. Needs a test per ticker.
- **IPOs.** PLTR (Sep 2020), ARM (Sep 2023) and CRWV (Mar 2025) have no data before their listing. The slider must show them as not yet listed.

## C. News feeds

"Items" counts how many entries the feed returned on 15 Nov 2026. A feed with 0 items was fetched and valid but empty, or not usable. Terms column: what the site's own terms say about showing a headline, short summary and link.

| Feed | URL | Returned items today? | Covers | Terms on headline + link use | Terms URL |
|---|---|---|---|---|---|
| NVIDIA Blog | https://blogs.nvidia.com/feed/ | Yes, 18 (newest 12 Nov) | Nvidia products, partners, data centres | Not read | not opened |
| NVIDIA newsroom (press releases) | https://nvidianews.nvidia.com/releases.xml | Yes, 20 (newest 13 Nov) | Nvidia press releases | Not read | not opened |
| Microsoft Source | https://news.microsoft.com/source/feed/ | Yes, 10 (13 Nov) | Microsoft news incl. AI and cloud | Not read | not opened |
| Google blog | https://blog.google/rss/ | Yes, 20 (13 Nov) | Google and Alphabet product news | Not read | not opened |
| AWS What's New | https://aws.amazon.com/about-aws/whats-new/recent/feed/ | Yes, 100 (13 Nov) | AWS launches. Mostly small product items, noisy for money news. | Not read | not opened |
| About Amazon | https://www.aboutamazon.com/news/rss | Yes, 10 (12 Nov) | Amazon company news | Not read | not opened |
| Meta Newsroom | https://about.fb.com/news/feed/ | Yes, 10 (9 Nov) | Meta news | Not read | not opened |
| OpenAI News | https://openai.com/news/rss.xml | Yes, 1,387 entries (13 Nov) | Model releases, deals, funding | Not read | not opened |
| Anthropic news | https://www.anthropic.com/news/rss.xml | **No.** Returned a web page (error page), not a feed | n/a | n/a | n/a |
| AMD press releases | https://ir.amd.com/news-events/press-releases/rss | Yes, 10 (9 Nov) | AMD deals and results | Not read | not opened |
| Google DeepMind | https://deepmind.google/blog/rss.xml | Yes (served compressed; the feed header read fine; entries not counted) | Model and science news | Not read | not opened |
| Hugging Face blog | https://huggingface.co/blog/feed.xml | Yes, 907 (13 Nov) | Open model and tooling news | Not read | not opened |
| arXiv cs.AI | https://rss.arxiv.org/rss/cs.AI | Valid feed, **0 items** (a Sunday; arXiv lists new papers on weekdays) | Research papers | Not read. arXiv API (`export.arxiv.org/api/query`) returned 429 (too many requests) on first call. | not opened |
| SEC EDGAR 8-K Atom, per company | `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001045810&type=8-K&dateb=&owner=include&count=10&output=atom` (change CIK) | Yes, with a named User-Agent (NVIDIA tested). 403 with a plain one. | Official company filings: deals, contracts, financing | "Information presented on sec.gov is considered public information and may be copied or further distributed by users of the web site without the SEC's permission. Please consider appropriate citation to the SEC as the source." | https://www.sec.gov/privacy |
| SEC submissions JSON | `https://data.sec.gov/submissions/CIK0001045810.json` | Yes (NVIDIA tested) | Filing list per company, easier to parse than Atom | same as above | https://www.sec.gov/privacy |
| TechCrunch AI | https://techcrunch.com/category/artificial-intelligence/feed/ | Yes, 20 (14 Nov) | Funding rounds and startups | Not read | not opened |
| Ars Technica (Tech Lab) | https://feeds.arstechnica.com/arstechnica/technology-lab | Yes, 20 (10 Nov) | Tech and AI news | Not read | not opened |
| The Verge AI | https://www.theverge.com/rss/ai-artificial-intelligence/index.xml | Yes, 10 (13 Nov) | AI news | Not read | not opened |
| MIT Technology Review | https://www.technologyreview.com/feed/ | Yes, 10 (13 Nov) | AI analysis | Not read | not opened |
| NYT Technology | https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml | Yes, 42 (14 Nov) | Tech business news | Not read | not opened |
| BBC Technology | https://feeds.bbci.co.uk/news/technology/rss.xml | Yes, 21 (14 Nov) | Tech news | Not read | not opened |
| Guardian AI | https://www.theguardian.com/technology/artificialintelligence/rss | **No.** Returned a web page, not a feed | n/a | n/a | n/a |
| Broadcom IR | https://investors.broadcom.com/rss/pressrelease.aspx | **No.** 403 Access Denied | n/a | n/a | n/a |
| CoreWeave IR | https://investors.coreweave.com/rss/pressrelease.aspx | **No.** Cloudflare challenge page | n/a | n/a | n/a |
| NVIDIA IR | https://investor.nvidia.com/rss/pressrelease.aspx | **No.** 403 | n/a | n/a | n/a |
| Meta IR | https://investor.atmeta.com/rss/pressrelease.aspx | **No.** 403 | n/a | n/a | n/a |
| Alphabet | https://abc.xyz/feed/ | **No.** 403 | n/a | n/a | n/a |
| Microsoft IR | https://www.microsoft.com/en-us/investor/rss.aspx | **No.** 404 | n/a | n/a | n/a |
| Amazon press | https://press.aboutamazon.com/rss/news-releases.xml | **No.** 404 | n/a | n/a | n/a |
| Oracle | https://www.oracle.com/news/rss/ and `/news/rss/index.xml` | **No.** 404 on both | n/a | n/a | n/a |
| CNBC tech | https://www.cnbc.com/id/19854910/device/rss/rss.html | **No.** 403 | n/a | n/a | n/a |

The same was not possible to confirm for every outlet's terms: I did not open any news site's terms page. The one terms statement I have for headline-plus-link use is Yahoo's RSS clause, which is not for these feeds.

## D. Recommended feed list

Start with these 12. All returned items today unless noted.

1. **SEC EDGAR 8-K Atom per company** (all 18 SEC-registered names). The most reliable source of real deals, contracts and financing. Public domain. Needs a named User-Agent.
2. **OpenAI News** - model releases and deals.
3. **NVIDIA newsroom** (`nvidianews.nvidia.com/releases.xml`) - press releases rather than blog posts.
4. **AMD press releases** - chip deals.
5. **Microsoft Source** - cloud and AI news.
6. **Google blog** plus **Google DeepMind** - model releases and science.
7. **About Amazon** - skip the AWS What's New feed (100 items, mostly small).
8. **Meta Newsroom**.
9. **TechCrunch AI** - funding rounds, most of what the company feeds miss.
10. **MIT Technology Review** - for the "science" side.
11. **arXiv cs.AI** - weekdays only; ask for the arXiv API with a gap of a few seconds between calls.
12. **NYT Technology or BBC Technology** - one general outlet for outside confirmation. Pick one.

Why: first-party feeds give dates and links that are hard to dispute. SEC 8-Ks give the money facts. One funding-focused outlet fills the startup rounds (Anthropic, CoreWeave-type deals).

Feeds with no working address yet: **Anthropic, Oracle, Broadcom, CoreWeave** (blocked or missing). Cover them through their SEC 8-K feeds.

## E. Not checked / doubts

- **Prices are the big open point.** No free source verified as allowed for public display. The owner needs to pick from B.
- Stooq, Nasdaq Data Link, the Tiingo legal page and the Marketstack product licence were not read. Stooq sits behind a bot-check which I did not bypass.
- Finnhub and Massive free-plan limits could not be read (pages load by script).
- Third-party-style facts, not read from a primary page: Finnhub free coverage, Stooq quota and foreign coverage, Alpha Vantage 20-year depth, Yahoo history depth.
- No news site's terms of use were opened, so "terms on headline + link use" is unknown for all non-SEC feeds. Show a headline, own-words line and link only, and read each site's terms before going live. The global rule: copying text from a feed is not covered by anything I read.
- Whether the SEC "company facts" cover-page counts are the right share basis for each foreign company, and Alphabet and Meta class totals, were only spot-checked for presence, not for numbers.
- SoftBank and Samsung share counts, and currency conversion (JPY, KRW, TWD), have no source chosen.
- Alpha Vantage's PDF text was extracted by hand and has some missing words; the quoted sentences are as extracted.
- The SEC User-Agent used for tests was a placeholder. The real job needs a real contact in its User-Agent, set by the owner.
- Whether a public, ad-free, non-commercial hobby site counts as "personal use" under a given provider's terms is a legal question I did not resolve. Alpha Vantage and Tiingo wording suggests it does not.
