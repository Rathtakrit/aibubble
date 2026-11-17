# Housing and credit boom: data notes

The set covers 1 January 2003 to 31 December 2009 in `data/past/housing/`. On 16 November 2026 it holds
20 companies, 125 value points, 7 money lines and 70 news items, all with `"status": "draft"`.

The first pass had 50 news items, 39 of them citing Wikipedia, 19 red dates and no blue ones. This pass
replaces almost every news source with a first-hand or news page, adds 20 items, gives the timeline 9 red
and 11 blue dates, and rebuilds the money lines from 7 rows on Wikipedia to 7 rows on BBC, Guardian or
Federal Reserve pages.

## What the set tells

- **2003 to 2006, the boom.** The Fed holds its rate at 1 percent, then raises it 17 times to 5.25 percent.
  Greenspan suggests more mortgage choices, Buffett calls derivatives a time bomb, Rajan and Shiller warn,
  the homeownership rate reaches 69 percent, and the Case-Shiller index peaks at 206.52 in July 2006.
- **2007, the mortgage market breaks.** HSBC warns, New Century fails, two Bear Stearns funds collapse,
  BNP Paribas freezes three funds on 9 August, Northern Rock has a run, and the banks start writing down
  subprime debt. The Dow peaks on 9 October.
- **2008, the banks break.** Bear Stearns is sold, IndyMac fails, Fannie Mae and Freddie Mac are seized,
  Lehman fails, AIG is rescued, the money funds break, Goldman and Morgan Stanley become banks, WaMu is
  sold, the $700bn rescue passes, and the UK and Swiss governments recapitalise their banks.
- **2009, the bottom.** Citigroup's value falls to $25bn, the stimulus passes, the Dow hits 6,547.05 on
  9 March, the stress tests are published, and the recession ends in June.

## Pages opened

The set now cites 80 different pages. 62 of them were opened in this run: 22 BBC News pages, 18 Federal
Reserve pages, 10 Guardian pages, 2 Federal Reserve History essays, 1 IMF page, 1 Harvard Business Review
page, 1 FDIC page, 1 CNN Money page read through the Wayback Machine, 1 HBR page, and 3 Wikipedia pages.
The other 18 are the CompaniesMarketCap year-end pages, unchanged from the first pass.

With the news index pages used to find stories (35 Guardian daily business indexes, 3 BBC timelines, the
Fed essays and a few search pages), this run opened about 100 pages that returned content.

## Red dates (9)

A red dot is a turning point a reader has to see.

| Date | Label | Why it is red |
| --- | --- | --- |
| 2006-07-31 | House prices peak | The Case-Shiller index reaches 206.52, its high, and the housing market turns. |
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
| 2007-10-31 | Whitney warns on Citi | Whitney's note says Citigroup's dividend is bigger than its profits. |
| 2008-09-16 | Money funds break | A money fund cannot repay $1 a share after Lehman's debt is written down. |
| 2008-09-21 | Goldman, Morgan become banks | The last two stand-alone investment banks take bank holding status. |

The two reassurances, Bernanke's "contained" and Prince's "still dancing", are blue because they are the
lines readers remember from the boom; they are not warnings but they set up the fall.

## Judgement calls

- **Wikipedia kept for three items only.** The Case-Shiller peak, Shiller's 2005 book and Whitney's note
  still cite Wikipedia; each page states the fact and no first-hand page that states the same thing could
  be opened. They are listed under "Not found / doubts".
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
  were the two cases for a "payout" kind, and neither could be sourced (see gaps). `meta.json` therefore
  keeps the two kinds it had, and `src/lib/data.test.ts` is unchanged.
- **Lloyds and HBOS are news only.** Neither is a company bubble, so the £12bn takeover is a blue-free news
  item and not a money line.
- **Wells Fargo and Wachovia are a money line, Citigroup's rival bid is not.** Citigroup's bid was backed by
  the FDIC and was overtaken by Wells Fargo's offer; the row shows the deal that completed.
- **Every news item is `"kind": "money"`.** None of these events is a science story.
- **The deal sources are the day's news pages.** BBC News for Bear Stearns, Merrill Lynch, WaMu, Wachovia and
  MUFG; the Guardian for Countrywide and Berkshire's Goldman stake.

## Source swaps and corrections

All 39 Wikipedia news items were opened again. 36 now cite a first-hand or news page; the 3 that remain are
the Case-Shiller peak, Shiller's book and Whitney's note.

| Item | First pass | Now | Why |
| --- | --- | --- | --- |
| House prices peak | "national home price index ... 206.52" | "S&P Case-Shiller index ... 206.52" | 206.52 is the S&P index; the national index peaked at 198.01 in 2006 Q1. |
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
- **Companies still cite Wikipedia.** 18 of the 20 company rows cite Wikipedia; only Merrill Lynch's source
  was changed, to the Guardian page that reports O'Neal's departure. The brief asked for news items and
  deals, so the company rows were left alone.
- **Values are year ends only** for most companies. Peak days and low days are not filled except where a
  sale price doubles as the last value (Countrywide, Merrill).
- **Bank of America's $2bn in Countrywide, August 2007.** No page opened states the amount and date, so the
  investment is not a money line; the January 2008 takeover is.
- **AIG's payments to its trading partners.** No opened page lists them. The New York Times page of
  15 March 2009 is paywalled and its Wayback copies are login pages; the Global Policy Forum reprint no
  longer resolves. Goldman, Merrill, Bank of America, Citigroup, Wachovia and UBS are named in the brief,
  but no money line was written without a page.
- **JPMorgan's collateral calls on Lehman.** The FCIC court filing and report PDFs could not be read here
  (no PDF tool) and sec.gov refuses this machine.
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

- **Case-Shiller peak.** The 206.52 July 2006 figure is on Wikipedia's Case-Shiller page, which does not
  cite a source for it, and no S&P page opened here states it. The red date rests on that one page.
- **Shiller's second edition.** The same Wikipedia page says the second edition came out in 2005 and doubted
  home prices; the exact publication day was not found, so the item is dated 31 December 2005.
- **Whitney's note.** Wikipedia states the 31 October 2007 note and its dividend point; the CIBC report
  itself is a PDF and the Guardian's report of the downgrade does not name her. The blue date rests on
  Wikipedia.
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
