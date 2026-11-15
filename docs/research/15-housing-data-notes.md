# Housing and credit boom data, 1 January 2003 to 31 December 2009 — notes

Working notes for `data/past/housing/` (companies, values, deals, news). Plain words. No advice and no
predictions. Pages opened in this run: **81**.

## What is in the data

| File | Items | What |
| --- | --- | --- |
| `companies.json` | 20 | The 20 companies named in the brief, all `listed`, each with a ticker and a `first_mention`. |
| `values.json` | 125 | Market value in US$ billions: one point per year end 2003–2009 (18 companies), plus peak and last-day points where a page stated them. |
| `deals.json` | 7 | 5 `takeover`, 2 `investment`. No `rescue` row was found that fits (see gaps). |
| `news.json` | 50 | 19 marked `key_date`, the rest background. Every item is `kind: "money"`. |

The "Subprime lenders" group was left out: no page opened in this run gives a combined market value for
New Century, Ameriquest, IndyMac and Northern Rock. Those firms appear in news only, as the brief allows.

`scripts/check-data.mjs data/past/housing` prints only two kinds of problem: every deal and news date "is
before 2017-06-12" (the site's first day), and the deal kinds `takeover` are not in the script's list. Both
are the expected ones named in the brief. Nothing else is printed.

## How the pages were opened

- Pages were fetched over HTTP and stripped to text, then searched with patterns; only the sentences used
  were kept. The first three pages of the run were read with the `webfetch` tool, the rest with the same
  harness fetch call.
- DuckDuckGo (`https://html.duckduckgo.com/html/?q=...`) answered for the first searches, then began
  returning an "unusual traffic" captcha page (HTTP 202) and stopped answering for the rest of the run.
  Bing and Mojeek returned no usable result links. So after that point pages were found by following links
  inside pages already opened (Wikipedia article links, the Federal Reserve's FOMC year index pages) and by
  opening indexes directly (the FDIC press-release index, `companiesmarketcap.com` company pages). No URL in
  this data was guessed and left unchecked: every source below returned HTTP 200 and the sentence used was
  read on the page.
- Nothing was downloaded to disk, no archive copies were needed, and no site was reached around a refusal.
  Sites that refused or were unusable are listed at the end.

## Judgement calls

1. **Year-end values come from one source.** `companiesmarketcap.com/<company>/marketcap/` prints an "end of
   year Market Cap" table; every value point dated 31 December for a surviving company is that number. It is
   a single publisher for all of them, which makes the series consistent with each other.
2. **`first_mention` for most companies is 2003-01-02**, the day after the range opens. Those companies were
   already listed and already in the picture on day one, and the source page shows a 2002 and a 2003 year-end
   value for each, so the company existed across 2003. A side effect of the site's rule (a company is drawn
   from its `first_mention`, holding its first value point backwards) is that the 2003 year-end value is shown
   from January 2003.
3. **Merrill Lynch and Countrywide start late on purpose.** `companiesmarketcap.com` has no page for either
   (both URLs return 404, and no other market-cap history page for them could be opened), so there is no
   year-by-year series. Their `first_mention` is set to the day each one enters the story: 2007-10-30 for
   Merrill (its chief executive resigned, the first row that names it) and 2007-01-11 for Countrywide (the
   first value point). Merrill therefore has a single value point, the agreed sale price in September 2008.
4. **A sale price is used as the last point for the four companies bought in 2008.** Bear Stearns ($1.2bn at
   $10 a share), Wachovia ($14.8bn), Merrill Lynch ($50bn) and Countrywide ($4.1bn) were bought for shares, so
   the agreed price is what the market said the whole company was worth on that day. Where no page gave a last
   traded market value, this was the only sourced number. It is marked in `what`.
5. **The two companies that failed keep their last recorded trade.** Lehman Brothers (31 December 2008,
   $0.0208bn) and Washington Mutual (31 December 2008, $0.008bn) are the stub values `companiesmarketcap.com`
   lists as "last known market cap" for the shell left after failure. This gives each a last point near the end
   of 2008 and no points after, as the brief asks, but it is a value after the failure date, not the value on
   the day before.
6. **Countrywide's first point is dated 2007-01-11.** Wikipedia's Countrywide page says Bank of America's
   $4bn offer was "a fraction of the company's $24 billion market value a year ago", in a sentence about the
   11 January 2008 announcement. "A year ago" was read as 11 January 2007. The $24bn is the page's number, the
   date is mine.
7. **The house-price peak is dated 2006-07-31.** The Case-Shiller page says the S&P national index "attained an
   all-time high in July 2006, at a value of 206.52". July is the page's word; the last day of July is the date
   used so the row can sit on the day slider.
8. **Deal amounts.** Bear Stearns is entered at the first agreed price ($2 a share, "about $240 million"),
   because that is the figure in the sentence that names the date 16 March 2008. The later $10 a share,
   $1.2bn revision is the last value point for the company. Mitsubishi UFJ's $9bn is the announced price for
   21% of Morgan Stanley (announced 29 September, completed 14 October 2008); the deal row is dated the
   announcement.
9. **No `rescue` deal row.** A rescue in this data means money between two companies in the list arranged as
   part of a rescue. The 2008 rescues in this story ran through the government (the Fed, the Treasury, the
   FDIC) or through a buyer taking the whole company, so no row fits the "rescue" kind. Government rescues are
   in `news.json` only. The Citigroup–Wachovia arrangement of late September 2008 is the closest case and was
   left out of both files: the pages opened give its price ($2.16bn, about $1 a share) but no date.
10. **`mitsubishi-ufj` covers a renamed company.** The market-cap page runs from 2002 to today under the
    "Mitsubishi UFJ Financial" name, so its 2003–2004 points are the predecessor group's. The id is the name
    the company had when it bought into Morgan Stanley in 2008.
11. **Royal Bank of Scotland has only two value points.** Its market-cap page starts in 2008 (in dollars and in
    pounds), so the earliest sourced value is 31 December 2008. It enters the picture on 2007-12-07, the day
    of the Guardian article that names it.
12. **Fed policy news dates** are the release dates on the statements themselves, not the meeting dates in the
    press. The 8 October 2008 row is the Fed's "Federal Reserve Actions" page, which carries no date of its
    own; its date comes from the Fed's own 2008 FOMC index that links to it.
13. **Wachovia's last point is the Wells Fargo bid (3 October 2008)**, not the 31 December 2008 stub value that
    the market-cap page prints. The bid is the more honest end for the bubble.
14. **Bear Stearns' peak (18 January 2007, $20.24bn) and Wachovia's (21 February 2007, $112.05bn)** are the
    "all time high intraday market cap" lines on their market-cap pages. Washington Mutual's (9 January 2006,
    $45.32bn) and Lehman's (7 February 2007, $45.68bn) come from the same lines. Surviving companies have no
    such line, so their peak is the highest year end in the range (Citigroup 2006, Bank of America 2006,
    JPMorgan 2006, Wells Fargo 2006, Goldman 2007, Morgan Stanley 2006, AIG 2006, HSBC 2006, UBS 2006,
    Berkshire 2007, Mitsubishi UFJ 2006, Fannie Mae 2003, Freddie Mac 2004). Citigroup's highest end-of-day
    share price was on 2006-12-27, which fits the 2006 peak.

## Not found / doubts

- **Merrill Lynch and Countrywide year-end values.** No page with a year-by-year market value could be opened
  for either. Investor sites (macrotrends) returned a bot page, stockanalysis.com and every
  `companiesmarketcap.com` slug tried returned 404, SEC's browse-edgar returned 403 for an undeclared
  automated tool and was left alone. Only the sale prices are in the file.
- **The market low on 9 March 2009.** The brief names that date. The only sentence found on an opened page is
  "March 6, 2009: The Dow Jones hit its lowest level of 6,469.95, a drop of 54% from its peak", so the row is
  dated 6 March 2009. No opened page stated the 9 March close (6,547.05), and the brief's rule against
  inventing dates ruled out moving the row without one.
- **Citigroup's and Merrill Lynch's write-down numbers.** Both events are in the news file as the two chief
  executives leaving (4 November 2007, 30 October 2007), which is what the opened pages state with a date.
  The amounts could not be dated: Wikipedia's Merrill page says only "In November 2007, Merrill Lynch announced
  it would write-down $8.4 billion", and no page opened gives the date of Citigroup's $11 billion figure.
- **The first bank injections under TARP.** The Capital Purchase Program page says Treasury announced it would
  make $250 billion available and that nine institutions received funds on 28 October 2008, but the $125 billion
  total for those nine banks is not on any page that opened, so no row was written for it. The TARP law itself
  (3 October 2008) and the Citigroup and Goldman Sachs injections are in the data.
- **Fannie Mae and Freddie Mac's takeover date** is stated on the Federal Housing Finance Agency page ("On
  September 7, 2008, FHFA director Lockhart announced he had put Fannie Mae and Freddie Mac under the
  conservatorship"), and that is the date used. The Treasury's own announcement page was not opened.
- **The United Kingdom's October 2008 bank rescue** (RBS, Lloyds TSB, HBOS): the page opened gives the £20bn
  and £17bn figures in some places but no dated sentence that could carry a row, so RBS has one 2007 news row
  and no 2008 bailout row.
- **Washington Mutual's seizure date** is given as 25 September 2008 by its own page and as 26 September 2008
  by the 2008 financial crisis timeline. The company's page was used (25 September).
- **Bear Stearns' total assets** on the 2008 financial crisis page ("$10 trillion") look wrong against its
  balance sheet and were not used.
- **Pages that refused or were useless:** reuters.com, cnbc.com, bloomberg.com, wsj.com, nytimes.com, ft.com,
  forbes.com and openai.com were not tried because the brief lists them as refusing; macrotrends.net returned a
  bot page, sec.gov returned 403 for an undeclared automated tool, mojeek.com returned a captcha, two
  `companiesmarketcap.com/search/` pages and the `largest-companies-in-the-world` year pages returned 404, the
  Morgan Stanley press release from 2008 (`/about/press/articles/6962.html`) returned 404, and
  `marketcapranked.com/rankings/2007/` was opened but rejected: it is marked "data may be inaccurate" and its
  2007 numbers disagree with the market-cap pages used here (Bank of America $203.8bn against $183.28bn).
- **No 2003–2006 company values below year ends.** The market-cap pages print year ends only, so the lines
  between January 2003 and December 2004 are straight in the data even where the real path was not.

## Pages opened (all "opened", none from an archive copy)

| Date used | What it states | URL | Publisher | Checked |
| --- | --- | --- | --- | --- |
| 2003–2009 | year-end market value, all-time-high line, last recorded trade | https://companiesmarketcap.com/citigroup/marketcap/ | CompaniesMarketCap | opened |
| 2003–2009 | as above | https://companiesmarketcap.com/bank-of-america/marketcap/ | CompaniesMarketCap | opened |
| 2003–2009 | as above | https://companiesmarketcap.com/jp-morgan-chase/marketcap/ | CompaniesMarketCap | opened |
| 2003–2009 | as above | https://companiesmarketcap.com/wells-fargo/marketcap/ | CompaniesMarketCap | opened |
| 2003–2008 | as above | https://companiesmarketcap.com/wachovia/marketcap/ | CompaniesMarketCap | opened |
| 2003–2008 | as above | https://companiesmarketcap.com/washington-mutual/marketcap/ | CompaniesMarketCap | opened |
| 2003–2009 | as above | https://companiesmarketcap.com/goldman-sachs/marketcap/ | CompaniesMarketCap | opened |
| 2003–2009 | as above | https://companiesmarketcap.com/morgan-stanley/marketcap/ | CompaniesMarketCap | opened |
| 2003–2008 | as above | https://companiesmarketcap.com/bear-stearns/marketcap/ | CompaniesMarketCap | opened |
| 2003–2009 | as above | https://companiesmarketcap.com/aig/marketcap/ | CompaniesMarketCap | opened |
| 2003–2009 | as above | https://companiesmarketcap.com/fannie-mae/marketcap/ | CompaniesMarketCap | opened |
| 2003–2009 | as above | https://companiesmarketcap.com/freddie-mac/marketcap/ | CompaniesMarketCap | opened |
| 2003–2009 | as above | https://companiesmarketcap.com/hsbc/marketcap/ | CompaniesMarketCap | opened |
| 2003–2009 | as above | https://companiesmarketcap.com/ubs/marketcap/ | CompaniesMarketCap | opened |
| 2008–2009 | as above | https://companiesmarketcap.com/royal-bank-of-scotland/marketcap/ | CompaniesMarketCap | opened |
| 2008–2009 | same page in pounds | https://companiesmarketcap.com/gbp/royal-bank-of-scotland/marketcap/ | CompaniesMarketCap | opened |
| 2003–2009 | year-end market value | https://companiesmarketcap.com/berkshire-hathaway/marketcap/ | CompaniesMarketCap | opened |
| 2003–2009 | year-end market value | https://companiesmarketcap.com/mitsubishi-ufj-financial/marketcap/ | CompaniesMarketCap | opened |
| 2003–2008 | year-end market value, peak, last trade | https://companiesmarketcap.com/lehman-brothers/marketcap/ | CompaniesMarketCap | opened |
| 2006-12-27 | Citigroup's highest end-of-day price date | https://companiesmarketcap.com/citigroup/stock-price-history/ | CompaniesMarketCap | opened |
| — | Bank of America price extremes (not used) | https://companiesmarketcap.com/bank-of-america/stock-price-history/ | CompaniesMarketCap | opened |
| 2006 | S&P Case-Shiller index high 206.52 in July 2006 | https://en.wikipedia.org/wiki/Case-Shiller_index | Wikipedia | opened |
| 2007-02-08 | HSBC $10.5bn bad-debt charge, February 2007 | https://en.wikipedia.org/wiki/Subprime_mortgage_crisis | Wikipedia | opened |
| 2007-06-20, 2007-07-31 | Bear Stearns funds, $20bn exposure | https://en.wikipedia.org/wiki/2008_financial_crisis | Wikipedia | opened |
| 2008-09-15 | Lehman Chapter 11, $639bn assets, $613bn bank debt | https://en.wikipedia.org/wiki/Lehman_Brothers | Wikipedia | opened |
| 2008-03-14 | Bear Stearns lost 47% of its equity value | https://en.wikipedia.org/wiki/Bear_Stearns | Wikipedia | opened |
| 2008-09-25 | OTS seized WaMu; FDIC sold banks to JPMorgan for $1.9bn | https://en.wikipedia.org/wiki/Washington_Mutual | Wikipedia | opened |
| 2008-10-03 | Wachovia's $1-a-share Citigroup deal worth $2.16bn | https://en.wikipedia.org/wiki/Wachovia | Wikipedia | opened |
| 2008-01-11, 2008-07-01 | Countrywide: $4.1bn deal announced, completed | https://en.wikipedia.org/wiki/Countrywide_Financial | Wikipedia | opened |
| 2008-09-15 | Merrill sold to Bank of America, about $50bn, $29 a share | https://en.wikipedia.org/wiki/Merrill_(company) | Wikipedia | opened |
| 2007-10-30 | O'Neal resigned as Merrill's chief executive | https://en.wikipedia.org/wiki/Stan_O%27Neal | Wikipedia | opened |
| 2007-11-04 | Prince resigned from Citigroup | https://en.wikipedia.org/wiki/Charles_Prince | Wikipedia | opened |
| 2008-11-17 | Citigroup's market value fell to $6bn from $300bn | https://en.wikipedia.org/wiki/Citigroup | Wikipedia | opened |
| 2008-03-16 | JPMorgan to buy Bear Stearns, $2 a share, $240m | https://en.wikipedia.org/wiki/JPMorgan_Chase | Wikipedia | opened |
| 2008-09-23 | Berkshire bought $5bn of Goldman preferred, plus warrants | https://en.wikipedia.org/wiki/Goldman_Sachs | Wikipedia | opened |
| 2008-09-22, 2008-09-29, 2008-10-14 | bank holding status; MUFG $9bn for 21%; completed | https://en.wikipedia.org/wiki/Morgan_Stanley | Wikipedia | opened |
| 2007-09-14 | Northern Rock's Bank of England facility and the queue | https://en.wikipedia.org/wiki/Northern_Rock | Wikipedia | opened |
| 2008-02-22 | Northern Rock nationalisation completed | https://en.wikipedia.org/wiki/Nationalisation_of_Northern_Rock | Wikipedia | opened |
| 2007-04-02 | New Century filed for Chapter 11 | https://en.wikipedia.org/wiki/New_Century_Financial | Wikipedia | opened |
| 2008-07-11 | IndyMac Bank failed | https://en.wikipedia.org/wiki/IndyMac | Wikipedia | opened |
| 2008-10-03 | TARP created by law, $700bn | https://en.wikipedia.org/wiki/Troubled_Asset_Relief_Program | Wikipedia | opened |
| 2008-10-03 | Act agreed by the House and signed | https://en.wikipedia.org/wiki/Emergency_Economic_Stabilization_Act_of_2008 | Wikipedia | opened |
| 2008-10-14 | $250bn of TARP offered to banks; nine took funds | https://en.wikipedia.org/wiki/Capital_Purchase_Program | Wikipedia | opened |
| 2007 | HSBC first big bank to report subprime losses, $10.5bn written down | https://en.wikipedia.org/wiki/HSBC | Wikipedia | opened |
| 2008-09-07 | conservatorship and up to $200bn from Treasury | https://en.wikipedia.org/wiki/Federal_takeover_of_Fannie_Mae_and_Freddie_Mac | Wikipedia | opened |
| 2008-09-07 | Lockhart announced the conservatorship on that date | https://en.wikipedia.org/wiki/Federal_Housing_Finance_Agency | Wikipedia | opened |
| 2008-09-16 | AIG: $85bn secured credit facility | https://en.wikipedia.org/wiki/American_International_Group | Wikipedia | opened |
| 2005–2006 | housing prices peaked in early 2006; median $230,200 in July 2006 | https://en.wikipedia.org/wiki/2000s_United_States_housing_bubble | Wikipedia | opened |
| 2009-05-07 | stress test results released, 19 institutions | https://en.wikipedia.org/wiki/Supervisory_Capital_Assessment_Program | Wikipedia | opened |
| 2009 | recession dates and early 2009 market falls (context) | https://en.wikipedia.org/wiki/Great_Recession | Wikipedia | opened |
| 2009-03-09 | S&P 500 page checked for the 9 March low; no sentence found | https://en.wikipedia.org/wiki/S&P_500 | Wikipedia | opened |
| 2007-10-09 | DJIA page checked for the low; no sentence found | https://en.wikipedia.org/wiki/Dow_Jones_Industrial_Average | Wikipedia | opened |
| 2008-07 | Fannie Mae's government backstop in July 2008 | https://en.wikipedia.org/wiki/Fannie_Mae | Wikipedia | opened |
| 2008-09 | Merrill Lynch: funding crisis, sale that weekend | https://en.wikipedia.org/wiki/Merrill_Lynch | Wikipedia | opened |
| 2008-09 | up to $200bn commitment, conservatorship terms | https://en.wikipedia.org/wiki/Federal_takeover_of_Fannie_Mae_and_Freddie_Mac | Wikipedia | opened |
| 2008-10-16 | rescue plan for UBS and Credit Suisse | https://en.wikipedia.org/wiki/Credit_Suisse | Wikipedia | opened |
| 2007-09 | Ameriquest dissolved in September 2007 (not used: month only) | https://en.wikipedia.org/wiki/Ameriquest | Wikipedia | opened |
| 2007 | CDO market grew to hundreds of billions by 2006–2007 (context) | https://en.wikipedia.org/wiki/Collateralized_debt_obligation | Wikipedia | opened |
| 2008 | UK rescue of RBS and Lloyds (no dated sentence found) | https://en.wikipedia.org/wiki/2008_United_Kingdom_bank_rescue_package | Wikipedia | opened |
| 2008 | MUFG letter of intent for 20% of Morgan Stanley | https://en.wikipedia.org/wiki/Mitsubishi_UFJ_Financial_Group | Wikipedia | opened |
| 2003-06-25 | target rate cut 25bp to 1 percent | https://www.federalreserve.gov/boarddocs/press/monetary/2003/20030625/default.htm | Federal Reserve | opened |
| 2004-06-30 | target rate raised 25bp to 1-1/4 percent | https://www.federalreserve.gov/boarddocs/press/monetary/2004/20040630/default.htm | Federal Reserve | opened |
| 2005-06-30 | target rate raised 25bp to 3-1/4 percent | https://www.federalreserve.gov/boarddocs/press/monetary/2005/20050630/default.htm | Federal Reserve | opened |
| 2006-06-29 | target rate raised 25bp to 5-1/4 percent | https://www.federalreserve.gov/newsevents/press/monetary/20060629a.htm | Federal Reserve | opened |
| 2007-09-18 | target rate cut 50bp to 4-3/4 percent | https://www.federalreserve.gov/newsevents/press/monetary/20070918a.htm | Federal Reserve | opened |
| 2008-01-22 | target rate cut 75bp to 3-1/2 percent | https://www.federalreserve.gov/newsevents/press/monetary/20080122b.htm | Federal Reserve | opened |
| 2008-10-08 | target rate cut 50bp to 1-1/2 percent | https://www.federalreserve.gov/newsevents/press/monetary/20081008a.htm | Federal Reserve | opened |
| 2008-12-16 | target range 0 to 1/4 percent | https://www.federalreserve.gov/newsevents/press/monetary/20081216b.htm | Federal Reserve | opened |
| 2008-09-16 | New York Fed authorised to lend AIG up to $85bn | https://www.federalreserve.gov/newsevents/press/other/20080916a.htm | Federal Reserve | opened |
| 2008-11-23 | $306bn asset pool protected; $20bn TARP investment | https://www.federalreserve.gov/newsevents/press/bcreg/20081123a.htm | Federal Reserve | opened |
| 2008 | index used to date the 8 October action | https://www.federalreserve.gov/monetarypolicy/fomchistorical2008.htm | Federal Reserve | opened |
| 2007 | index of 2007 statements | https://www.federalreserve.gov/monetarypolicy/fomchistorical2007.htm | Federal Reserve | opened |
| 2006 | index of 2006 statements | https://www.federalreserve.gov/monetarypolicy/fomchistorical2006.htm | Federal Reserve | opened |
| 2005 | index page opened; statement links not on it | https://www.federalreserve.gov/monetarypolicy/fomchistorical2005.htm | Federal Reserve | opened |
| 2007-12-07 | £19bn wiped off RBS's market value; £950m subprime write-down | https://www.theguardian.com/business/2007/dec/07/rbs | The Guardian | opened |
| 2008 | TARP page opened for the October injections; page is a Chrysler release | https://home.treasury.gov/news/press-releases/tg1189 | US Treasury | opened |
| 2008 | FDIC press-release index for 2008 (no usable list of links) | https://www.fdic.gov/news/press-releases/2008/ | FDIC | opened |
| 2008 | FDIC release page opened; no matching sentence | https://www.fdic.gov/news/news/press/2008/pr08094.html | FDIC | opened |
| 2007 | ranking table rejected as unreliable (see doubts) | https://marketcapranked.com/rankings/2007/ | MarketCapRanked | opened |

Three pages were also read with the `webfetch` tool at the start of the run (the Citigroup, Lehman and Fannie
Mae market-cap pages) and are counted once each in the table above.
