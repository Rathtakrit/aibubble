# Housing and credit boom: data notes

The set covers 1 January 2003 to 31 December 2009 in `data/past/housing/`. On 16 November 2026 it holds
20 companies, 123 value points, 7 money lines and 70 news items, all with `"status": "draft"`. The third pass of
17 November 2026 replaced the last three Wikipedia news sources; the counts did not change.

The first pass had 50 news items, 39 of them citing Wikipedia, 19 red dates and no blue ones. This pass
replaces almost every news source with a first-hand or news page, adds 20 items, gives the timeline 9 red
and 11 blue dates, and rebuilds the money lines from 7 rows on Wikipedia to 7 rows on BBC, Guardian or
Federal Reserve pages.

## What the set tells

- **2003 to 2006, the boom.** The Fed holds its rate at 1 percent, then raises it 17 times to 5.25 percent.
  Greenspan suggests more mortgage choices, Buffett calls derivatives a time bomb, Rajan and Shiller warn,
  the homeownership rate reaches 69 percent, and the Case-Shiller 20-city index peaks at 206.52 in July 2006.
- **2007, the mortgage market breaks.** HSBC warns, New Century fails, two Bear Stearns funds collapse,
  BNP Paribas freezes three funds on 9 August, Northern Rock has a run, and the banks start writing down
  subprime debt. The Dow peaks on 9 October.
- **2008, the banks break.** Bear Stearns is sold, IndyMac fails, Fannie Mae and Freddie Mac are seized,
  Lehman fails, AIG is rescued, the money funds break, Goldman and Morgan Stanley become banks, WaMu is
  sold, the $700bn rescue passes, and the UK and Swiss governments recapitalise their banks.
- **2009, the bottom.** Citigroup's value falls to $25bn, the stimulus passes, the Dow hits 6,547.05 on
  9 March, the stress tests are published, and the recession ends in June.

## Pages opened

The second pass left the set citing 80 different pages. 62 of them were opened in that run: 22 BBC News pages, 18
Federal Reserve pages, 10 Guardian pages, 2 Federal Reserve History essays, 1 IMF page, 1 Harvard Business Review
page, 1 FDIC page, 1 CNN Money page read through the Wayback Machine, 1 HBR page, and 3 Wikipedia pages. The other
18 are the CompaniesMarketCap year-end pages, unchanged from the first pass. The end-date work of 17 November 2026
added six more: a BBC page, the FDIC's WaMu page, a Federal Reserve testimony, the Guardian on Bear Stearns, and two
Bank of America 8-K exhibits on the company's own investor site. The third pass replaced the 3 Wikipedia pages and
added five: S&P Dow Jones's release, Princeton's second-edition page through the Wayback Machine, the New York Times
DealBook on Whitney, and the two New York Times DealBook AIG stories.

With the news index pages used to find stories (35 Guardian daily business indexes, 3 BBC timelines, the
Fed essays and a few search pages), this run opened about 100 pages that returned content.

## Red dates (9)

A red dot is a turning point a reader has to see.

| Date | Label | Why it is red |
| --- | --- | --- |
| 2006-07-31 | House prices peak | The Case-Shiller 20-city index reaches 206.52, its high, and the housing market turns. |
| 2007-08-09 | Credit markets freeze | BNP Paribas cannot value three funds and the market for mortgage debt stops. |
| 2007-10-09 | Dow peak | The Dow closes at 14,164.53, the top before the fall. |
| 2008-03-16 | Bear Stearns rescue | A whole investment bank is sold for $2 a share with central bank support. |
| 2008-09-07 | Fannie and Freddie seized | The government takes over the two firms behind about half of US mortgages. |
| 2008-09-15 | Lehman fails | The largest bankruptcy in US history starts the worst week of the crisis. |
| 2008-09-16 | AIG rescued | The insurer at the centre of the credit default swap market is saved for $85bn. |
| 2008-10-03 | Bank rescue becomes law | The $700bn rescue is approved, four days after the House rejected it. |
| 2009-03-09 | Market bottom | The Dow closes at 6,547.05, its lowest since 1997 and the end of the fall. |

The housing crash day is 9 August 2007: it is the day the mortgage market, not just one lender, stopped
working. The banks crash day is 15 September 2008: Lehman's failure is the point where the losses spread
from mortgage securities to the banks themselves.

## Blue dates (11)

A blue dot marks a smaller event, including every public warning that this was a bubble.

| Date | Label | Why it is blue |
| --- | --- | --- |
| 2003-03-04 | Buffett warns on derivatives | Buffett's letter calls derivatives "financial weapons of mass destruction". |
| 2005-08-27 | Rajan warns at Jackson Hole | Rajan says incentives have raised the chance of a catastrophic meltdown. |
| 2005-12-31 | Shiller warns on housing | Shiller's 2005 second edition doubts that the rise in home prices can last. |
| 2007-02-08 | HSBC bad debt warning | The first big bank says US mortgage losses are larger than expected. |
| 2007-03-28 | Bernanke: 'contained' | Bernanke says the subprime effect on the wider economy seems likely to be contained. |
| 2007-05-17 | Bernanke on subprime | Bernanke sets out the foreclosure and delinquency worries in a full speech. |
| 2007-07-09 | Prince: 'still dancing' | Citigroup's chief says the bank must keep dancing while the music plays. |
| 2007-09-14 | Run on Northern Rock | Savers queue to take out about £1bn a day, the biggest British bank run in a century. |
| 2007-10-31 | Whitney warns on Citi | Whitney's note says Citigroup faces a $30bn capital shortfall and may have to cut its dividend. |
| 2008-09-16 | Money funds break | A money fund cannot repay $1 a share after Lehman's debt is written down. |
| 2008-09-21 | Goldman, Morgan become banks | The last two stand-alone investment banks take bank holding status. |

The two reassurances, Bernanke's "contained" and Prince's "still dancing", are blue because they are the
lines readers remember from the boom; they are not warnings but they set up the fall.

## Judgement calls

- **No item on Wikipedia.** The Case-Shiller peak, Shiller's 2005 book and Whitney's note were the last three
  news rows on Wikipedia. The third pass replaced all three with pages that state the same facts (below), so the
  news and deal files for both past sets hold no `wikipedia.org` URL.
- **Year-only facts are dated at the year end.** Homeownership (69 percent in 2006) is dated 31 December
  2006, Shiller's second edition (2005) 31 December 2005, and the end of the recession (June 2009) 30 June
  2009. The source gives a year or a month, not a day; the notes say so and the summaries do not invent one.
- **Bear Stearns is dated Sunday 16 March 2008.** The Federal Reserve History essay says Bear accepted the
  offer on Sunday 16 March; BBC News reported it on 17 March.
- **Stock deals are "reported".** Countrywide, Bear Stearns, Merrill Lynch and Wachovia were share deals
  whose dollar value moved with the share price; the row says `"amount_type": "reported"`.
- **The $100bn fund is dated 15 October 2007.** The Guardian's report calls it a $100bn fund; the first
  pass said $80bn, which no page opened here states.
- **No third deal kind.** The AIG payments to its trading partners and JPMorgan's collateral calls on Lehman
  were the two cases for a "payout" kind. Their figures are now sourced (see gaps), but `meta.json` has only
  `investment` and `takeover`, and a payout is neither: AIG bought no stake and took over no firm by paying
  collateral. `src/lib/data.test.ts` checks that list, so neither row was written.
- **Lloyds and HBOS are news only.** Neither is a company bubble, so the £12bn takeover is a blue-free news
  item and not a money line.
- **Wells Fargo and Wachovia are a money line, Citigroup's rival bid is not.** Citigroup's bid was backed by
  the FDIC and was overtaken by Wells Fargo's offer; the row shows the deal that completed.
- **Every news item is `"kind": "money"`.** None of these events is a science story.
- **The deal sources are the day's news pages.** BBC News for Bear Stearns, Merrill Lynch, WaMu, Wachovia and
  MUFG; the Guardian for Countrywide and Berkshire's Goldman stake.

## End dates

`ended` is the last day a company is in the picture: the day its takeover closed, or the day it failed. The
company is absent from the next day. Each date below was written only after opening a page that states it.

| Company | Old `ended` | New `ended` | What happened | Source |
| --- | --- | --- | --- | --- |
| Lehman Brothers | 2008-12-31 | 2008-09-15 | Filed for Chapter 11 bankruptcy protection in the early hours of 15 September 2008. | `news.bbc.co.uk/2/mobile/business/8256010.stm` |
| Washington Mutual | 2008-12-31 | 2008-09-25 | The FDIC sold its banking operations to JPMorgan Chase on 25 September 2008. | `fdic.gov/resources/resolutions/bank-failures/failed-bank-list/wamu.html` |
| Wachovia | 2008-10-03 | 2008-12-31 | Wells Fargo's purchase completed effective 31 December 2008. | `federalreserve.gov/newsevents/testimony/alvarez20100901a.htm` |
| Merrill Lynch | 2008-09-15 | 2009-01-01 | Bank of America completed its purchase on 1 January 2009. | Bank of America 8-K exhibit, `investor.bankofamerica.com/regulatory-and-other-filings/select-sec-filings/content/0000950123-09-000010/y73597exv99w1.htm` |
| Bear Stearns | 2008-03-24 | 2008-05-30 | JPMorgan's takeover closed on 30 May 2008. | `theguardian.com/business/2008/may/30/bearstearns.jpmorgan` |
| Countrywide Financial | 2008-01-11 | 2008-07-01 | Bank of America completed its purchase on 1 July 2008. | Bank of America 8-K exhibit, `investor.bankofamerica.com/regulatory-and-other-filings/select-sec-filings/content/0000950144-08-005220/g14113kexv99w1.htm` |

The old dates were the end of 2008 for Lehman and WaMu, the announcement day for Countrywide (11
January), Merrill Lynch (15 September) and Wachovia (3 October), and the day of the revised Bear Stearns
agreement (24 March). A company now leaves the picture on the day its takeover closed or it failed, not when
the deal was announced. Washington Mutual, Inc., the holding company whose shares are the `WM` row, filed for
Chapter 11 on 26 September 2008, the day after its bank was taken over; the picture drops it on the 25th, the
day the bank was sold and its shares stopped meaning anything.

Value points removed because they fell after the new `ended` day (`check-data` rejects them):

| Company | Point removed | Value | What the point was |
| --- | --- | --- | --- |
| Lehman Brothers | 2008-12-31 | $0.02083bn | last recorded trade, after the bankruptcy |
| Washington Mutual | 2008-12-31 | $0.008bn | last recorded trade, holding company after the seizure |

Lehman and WaMu therefore hold their 31 December 2007 value (Lehman $34.68bn, WaMu $11.82bn) from that day
until they disappear, far above what they were worth in September 2008. No opened page gives a value for either
in the week it failed. Wachovia keeps its 3 October 2008 point (the day Wells Fargo's rival bid was announced)
until 31 December, and Merrill Lynch's only point is 15 September 2008, the day it agreed to be bought.

## Source swaps and corrections

All 39 Wikipedia news items were opened again. 36 now cite a first-hand or news page; the last 3, the Case-Shiller
peak, Shiller's book and Whitney's note, were replaced in the third pass below.

| Item | First pass | Now | Why |
| --- | --- | --- | --- |
| House prices peak | "national home price index ... 206.52" | "S&P Case-Shiller 20-city index ... 206.52" | 206.52 is the 20-city index; the national index peaked at 184.62 in July 2006, as S&P's release says. |
| HSBC warning | Wikipedia | BBC, 8 February 2007 | BBC states the $10.5bn charge and the 20 percent overshoot. |
| New Century | Wikipedia | BBC, 2 April 2007 | BBC states the Chapter 11 filing and 3,200 job cuts. |
| Bear Stearns funds | "$20 billion of subprime-linked CDO" | "$3.2bn loan to one fund" | The fund was lent $3.2bn; $20bn was not the rescue. |
| BNP Paribas | Wikipedia | BBC, 9 August 2007 | BBC states three funds worth €2bn and the "complete evaporation of liquidity". |
| Northern Rock nationalised | 22 February 2008 | 17 February 2008 | BBC timeline gives 17 February. |
| Bear Stearns deal | Wikipedia | BBC, 16-17 March 2008 | BBC states $2 a share and $30bn of Fed support. |
| Fannie and Freddie | "Treasury promising up to $200 billion" | conservatorship, no figure | The $200bn figure is not on the pages opened; the claim was dropped. |
| Lehman Brothers | "$613bn bank debt and $639bn assets" | Chapter 11 filing | Those figures were not on the pages opened; the claim was dropped. |
| Money funds | "$144bn withdrawn" | the fund breaks the buck | The $144bn figure was not on the pages opened; the Fed essay describes the event. |
| WaMu | Wikipedia | FDIC and BBC | FDIC gives $307bn of assets and $188bn of deposits; BBC gives the $1.9bn price. |
| Dow peak | Wikipedia | CNN Money, 9 March 2009 | The page states the 9 October 2007 close of 14,164.53. |
| Dow low | 6,469.95 on 6 March 2009 | 6,547.05 on 9 March 2009 | CNN Money states the 9 March close and the 12-year low. |
| TARP | "225 to 208" rejection | 263-171 approval, rejection without a count | BBC gives the 263-171 vote; the rejection count was not verified. |
| Wells Fargo and Wachovia | $14.8bn | $15.1bn | BBC gives $15.1bn. |
| MUFG and Morgan Stanley | completed 14 October 2008 | completed 13 October 2008 | BBC reports the completion on 13 October; the SEC filing says 13 October. |
| Citigroup value | $6bn on 17 November 2008 | $25bn on 21 November 2008 | The Guardian states the $25bn value after a 26 percent fall. |
| Citigroup shares | up 38 percent | up about 25 percent | The Guardian states a 25 percent rise. |
| Citi rescue | $306bn | $306bn plus $20bn of capital | The Fed statement gives both. |
| Citigroup stake | none | Abu Dhabi, $7.5bn for 4.9 percent | The Guardian states the amount and the stake. |
| $80bn fund | $80bn | $100bn | The Guardian calls it a $100bn fund led by Citigroup, JPMorgan and Bank of America. |
| UBS rescue | "UBS and Credit Suisse" | UBS only | Credit Suisse refused state aid; the Guardian states this. |
| Countrywide deal | $4.1bn | about $4bn | The Guardian says "around $4bn in stock". |
| Countrywide value | $24bn on 11 January 2007 (Wikipedia) | $26bn, "about a year before the sale" | The Guardian gives $26bn a year before. |
| Merrill value | $50bn (Wikipedia) | $50bn (BBC) | Source swapped, value kept. |
| Stimulus | "Congress passes" on 13 February 2009 | Obama signs on 17 February 2009 | BBC states the signing on 17 February. |
| IndyMac | "fourth-largest bank failure" | $32bn of assets | FDIC gives the assets; the ranking claim was dropped. |
| AIG | $85bn loan | $85bn for an 80 percent stake | The Fed release and BBC give the stake. |
| Money-line kinds | Wikipedia for all 7 rows | BBC, Guardian, Fed, FDIC for all 7 rows | Same facts, better pages. |

Smaller changes: the 2007 Dow 14,000 item and the 2007 Bernanke $100bn item were dropped to keep the
timeline readable; the 2008-10-14 MUFG item was folded into the 13 October item; the January 2009
Citigroup split and the March 2009 Treasury purchases were added.

## Gaps

- **No new companies.** Barclays and Lloyds are the only candidates with CompaniesMarketCap pages, and
  both start in 2008, so neither has three in-range yearly values. Northern Rock, IndyMac, New Century,
  National City, Ambac and MBIA have no open page with three dated market values. The set stays at 20.
- **A few company and value rows still cite Wikipedia.** One of the 20 company rows, Countrywide, uses the
  Wikipedia article as its `first_mention` source, and three value points (Bear Stearns, Citigroup, Wells Fargo)
  do too. The brief asked for news items and deals, so those rows were left alone.
- **Values are year ends only** for most companies. Peak days and low days are not filled except where the
  last day doubles as the last value (Countrywide, Merrill, Wachovia), so Lehman and WaMu are held at their
  2007 year-end values until they disappear (see End dates).
- **Bank of America's $2bn in Countrywide, August 2007.** No page opened states the amount and date, so the
  investment is not a money line; the January 2008 takeover is.
- **AIG's payments to its trading partners.** The figures are now known but no money line was written. The New
  York Times DealBook on 15 and 16 March 2009 reports that AIG paid $22.4bn of collateral to its trading partners
  between 16 September and 31 December 2008 and had disclosed more than $94bn in total; its list gives Goldman
  Sachs $12.9bn, Merrill Lynch $6.8bn, Bank of America $5.2bn, Citigroup $2.3bn, Wachovia $1.5bn and UBS $5bn.
  `meta.json` has only `investment` and `takeover`, and a collateral payment is neither. Writing these as deals
  would mean adding a third kind to `meta.json` and changing `src/lib/data.test.ts`, which the task did not allow.
- **JPMorgan's collateral calls on Lehman.** The reported $8.6bn figure was not sourced from a page that opened:
  the FCIC filing is a PDF, and CNBC and Bloomberg refused this machine. With no opened page stating who paid
  whom, how much and when, no row was written.
- **Ownit Mortgage (December 2006), Michael Burry, John Paulson and the ABX index.** No first-hand or news
  page was opened that states a date and figure, so none was added.
- **Roubini's warning at the IMF on 7 September 2006.** No page opened gives the day; the Wikipedia article
  gives only 2006 and a general warning. It is not in the set.
- **Housing starts and new home sales records (2005-2006).** Census pages were not opened and no working
  URL was found, so the two records are not in the set.
- **Lloyds and HBOS, Barclays and Lehman's US business, Nomura and Lehman's Asia business, PNC and National
  City.** The companies are not in `companies.json`, so these are gaps rather than money lines.
- **sec.gov** refused this machine ("undeclared automated tool" and timeouts), so SEC filings were not used.
- **fraser.stlouisfed.org and fred.stlouisfed.org** did not connect; **imf.org** refused plain requests but
  its Rajan speech was read with the harness fetch tool.

## Not found / doubts

- **Case-Shiller peak (resolved).** The 206.52 July 2006 figure is on S&P Dow Jones's release of 29 November 2016,
  which says the 20-city index reached that level in July 2006 and the national index 184.62. The item now cites
  that page; Wikipedia's unsourced 206.52 is gone.
- **Shiller's second edition (resolved).** Princeton's page for the second edition, read through the Wayback
  Machine, lists the cloth edition as 2005 and describes the housing chapter. The exact day is still not given, so
  the item stays dated 31 December 2005.
- **Whitney's note (resolved).** The New York Times DealBook of 1 November 2007 reports the note made "late
  Wednesday night" and the $30bn capital shortfall that might force a dividend cut. The item now cites it; the
  unsourced "dividend bigger than profits" line was dropped.
- **BNP Paribas fund count.** The BBC global timeline says two funds, the BBC subprime timeline says three
  funds worth €2bn. The item follows the more detailed timeline (three).
- **Bear Stearns date.** The Fed essay says Sunday 16 March, BBC says 17 March. The item uses 16 March.
- **Citigroup's fall.** The Guardian says "more than 26 percent" in a session and a market value of $25bn;
  other accounts give different percentages. The item uses the Guardian's two figures.
- **TARP signing.** The item says Congress passed the plan, not that the President signed it the same day,
  because the BBC page reports the vote only.
- **Recession end.** June 2009 is the month the National Bureau of Economic Research later gave; the item is
  dated 30 June 2009 and the summary says "in June 2009".
- **The number of pages opened** is counted from the fetch log for this run (about 100 that returned
  content), not from the first pass.

## Third pass on sources (17 Nov 2026)

This pass replaced the last three housing news rows that cited Wikipedia and tried once more to source a money line
for AIG's collateral payments and JPMorgan's calls on Lehman. Each replacement was made only after opening a page
that states the same fact.

Counts before and after, from `grep -c wikipedia.org`:

| File | Wikipedia rows before | After |
| --- | --- | --- |
| `data/past/housing/news.json` | 3 | 0 |
| `data/past/housing/deals.json` | 0 | 0 |

### Sources swapped

| Item | Was | Now | What the opened page states |
| --- | --- | --- | --- |
| `2006-07-31-house-prices-peak` | `en.wikipedia.org/wiki/Case–Shiller_index` | S&P Dow Jones Indices release, 29 November 2016 (`press.spglobal.com/2016-11-29-The-S-P-CoreLogic-Case-Shiller-National-Index-Reaches-New-High-As-Home-Price-Gains-Continue`) | The 20-city index reached 206.52 in July 2006, its high; the national index reached 184.62, also in July 2006, and passed that high only in 2016. |
| `2005-12-31-shiller-second-edition` | `en.wikipedia.org/wiki/Irrational_Exuberance_(book)` | Princeton University Press page for the second edition, Wayback copy of 6 December 2006 (`web.archive.org/web/20061206023618/http://press.princeton.edu/titles/7922.html`) | The book is listed as "Cloth, 2005"; the page says the housing boom "may eventually be followed by declining home prices for years to come". |
| `2007-10-31-whitney-citi-note` | `en.wikipedia.org/wiki/Meredith_Whitney` | New York Times DealBook, 1 November 2007 (`archive.nytimes.com/dealbook.nytimes.com/2007/11/01/citi-may-be-forced-to-cut-dividend-report-says`) | The note was published "late Wednesday night"; it said Citigroup faced a $30bn capital shortfall and might have to cut its dividend. |

### Corrections made to rows

- **House prices peak: which index.** The old summary called 206.52 "the S&P Case-Shiller index" high. S&P's release
  says 206.52 is the 20-city index and that the national index peaked at 184.62. The summary now names the 20-city
  index, so it does not mix the two series.
- **Shiller's second edition: what the page supports.** The old summary said the book argued prices "might fall for
  years". Princeton's page says the boom "may eventually be followed by declining home prices for years to come",
  which is the wording the summary now follows. The item remains dated 31 December 2005 because the page gives the
  year only.
- **Whitney's note: the claim about the dividend.** The old summary said the dividend was larger than profits, which
  the opened page does not state. The DealBook page states the $30bn shortfall and that the dividend might be cut;
  the summary now gives those two facts and drops the comparison.

### New money lines

None. The task allowed up to six new lines between companies already in `housing/companies.json`, each only with an
opened page stating who paid whom, how much and when. Two candidates were checked and neither could be written:

- **AIG's collateral payments.** The figures are sourced: the New York Times DealBook of 15 March 2009
  (`archive.nytimes.com/dealbook.nytimes.com/2009/03/15/aig-discloses-counterparties-who-received-224-billion`)
  says AIG paid $22.4bn of collateral between 16 September and 31 December 2008 and had disclosed more than $94bn
  in total. The list it reports gives Goldman Sachs $12.9bn, Merrill Lynch $6.8bn, Bank of America $5.2bn,
  Citigroup $2.3bn, Wachovia $1.5bn and UBS $5bn; the follow-up of 16 March
  (`.../2009/03/16/as-aig-lists-firms-it-paid-anger-boils-over`) covers the reaction. But `meta.json` allows only
  `investment` and `takeover`, and `src/lib/data.test.ts` checks that list. A collateral payment is neither: AIG
  received no stake and took over no company by paying it. Writing these rows would mean changing `meta.json` and
  the test, which the task did not allow, so no rows were added.
- **JPMorgan's collateral calls on Lehman.** The reported $8.6bn was not confirmed by a page that opened: the FCIC
  filing is a PDF with no reader here, CNBC returned 403, and the New York Times DealBook story on Lehman's later
  lawsuit answered 404. No row was written without a page stating the payer, the payee, the amount and the date.

### Still on Wikipedia

None of the housing news or deal rows. Four sources outside these two files still cite Wikipedia and were left
alone because the task named only `news.json` and `deals.json`:

- `data/past/housing/companies.json`: Countrywide Financial (`Countrywide_Financial`), its `first_mention` source.
- `data/past/housing/values.json`: Bear Stearns, Citigroup and Wells Fargo, one value point each.

The dot-com set has the same situation for Lucent and AOL Time Warner in its `companies.json`; the dot-com notes
list them.

### Pages opened

At least 25 pages were opened across both sets for this pass. The housing rows and the money-line attempt used:

- **S&P Dow Jones Indices**, 29 November 2016, for the 20-city and national peaks.
- **Princeton University Press**, second edition, through the Wayback Machine, for the 2005 date and the housing
  chapter.
- **New York Times DealBook**, 1 November 2007, for Whitney's note.
- **New York Times DealBook**, 15 and 16 March 2009, for AIG's counterparty list and the reaction to it.
- Pages tried and refused for the Lehman collateral figure: the FCIC PDF (no reader), CNBC (403), Bloomberg (403),
  MarketWatch (401), Reuters (401) and the New York Times DealBook lawsuit story (404). NPR timed out and
  BusinessWire returned 403.

Searches were used to find some of these addresses; a search result was never used as a source.
