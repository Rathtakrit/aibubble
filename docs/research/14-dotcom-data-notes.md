# Dot-com and telecom boom data, 1 January 1995 to 31 December 2002

Second data pass, 16 November 2026. Draft data for a past-bubble picture in the same shape as the AI boom data:
company bubbles sized by market value, money lines between companies, dated news. Every row was written only after
opening a page that states it; a search result on its own was never used. Everything below is in US dollars unless
the page printed another currency.

Files (all `"status": "draft"`):

- `companies.json` — 23 companies, each with a ticker, a `first_mention` date and a source.
- `values.json` — 158 market value points.
- `deals.json` — 9 deals in three kinds: 2 investment, 3 takeover, 4 supplier.
- `news.json` — 53 news items: 9 red key dates, 13 blue smaller dates, each with a `label`; every other item has
  `key_date: false` and no `small_date`.
- `meta.json` — three deal kinds: `investment` ("Investment deal"), `takeover` ("Takeover deal"), `supplier`
  ("Supplier loan or swap").

`node scripts/check-data.mjs data/past/dotcom` prints `data ok: 23 companies, 158 values, 9 deals, 53 news (status:
draft)`, and `node --test src/lib/data.test.ts` passes (the one dot-com expectation in that file now lists the three
kinds).

## Where the numbers come from

- **Market values:** the "End of year Market Cap" table and the "All time high intraday market cap" line on
  `companiesmarketcap.com/<company>/marketcap/`, one page per company. The same pages carry an embedded daily or
  monthly series, which is where the extra peak dates come from (see the judgement call on peaks).
- **Cisco's peak:** Cisco's own heritage page (`heritage.cisco.com/2000_marketcap/`) says Cisco became the most
  valuable company on 27 March 2000 at $82 a share, market cap $569bn.
- **AOL Time Warner's values:** `fortune.com` (4 February 2002) says the two companies together were worth
  $290 billion just after the 10 January 2000 announcement and that the merged company was "below $135 billion" when
  the article closed; the archived `washingtonpost.com` page of 1 April 2002 puts its market value at $105 billion.
- **Deal amounts and dates:** Wikipedia's merger page for AOL and Time Warner ($180bn, announced 10 January 2000,
  closed 11 January 2001); `List of mergers and acquisitions by Microsoft` (Apple $150m on 6 August 1997, AT&T $5bn
  on 19 June 1999); WorldCom's article (Sprint, $129bn, 5 October 1999); Qwest's article (US West, $48bn, 30 June
  2000); the SEC's complaint against Qwest, filed as exhibit 99.2 to Qwest's 8-K of 27 October 2004 on `sec.gov`,
  for the four capacity swaps with Enron and Global Crossing.
- **News:** see the red and blue tables below and the page list at the end.

## Judgement calls

1. **Year ends** are dated 31 December because that is the point the companiesmarketcap table reports. A company
   has a point for every year it existed in the range, from the first year the page covers (1996 at the earliest).
2. **Peaks.** Where the page prints an all-time-high line, the peak point is that value on the date the page prints,
   which is an intraday high: Sun, Lucent, WorldCom, Global Crossing, Qwest, Enron, Time Warner, US West. For the
   other companies the peak is the highest point in the page's series on the date the series gives it. Those pages
   carry a monthly series for 1996 to 2002, so those peak dates are month ends, not the exact top day: Microsoft's
   and Qualcomm's highest point is their 1999 year end, and Intel, Oracle, IBM, Nokia, Apple, AT&T, eBay, Amazon and
   Sprint are dated on the last day of the month their series peaks in. Yahoo and Nortel have daily series, so their
   peak dates are exact.
3. **A company that fails or is bought stops** at its last value point, and there are no points after it:
   - Time Warner's last point is 11 January 2001 at $94.50bn, the "last known market cap" the page prints for the
     day the merger closed; there is no Time Warner point after that. The merged company carries the line from then
     on under `aol` ("AOL Time Warner"), with the 2002 values above. Those later values come from the Fortune and
     Post pages, not from the TWX page, whose history stops at the close.
   - US West's last point is 30 June 2000 at $54.79bn, the day Qwest absorbed it.
   - Enron's last point is 31 December 2001 at $0.44bn; Global Crossing and WorldCom keep a 31 December 2002 point
     because the pages report one and 2002 is the last year of the range.
   - **The renderer does not hide a company after its last point.** It draws the last value flat for the rest of the
     set, so "Time Warner" and "US West" still appear on screen after their takeovers at their last value. The data
     does what the brief asks (a last point just before the close, none after; one merged record for AOL Time
     Warner), but removing the leftover circle needs a code change in `src/lib/layout.ts` or `src/lib/data.ts`,
     which this worker may not touch. This is the one part of "Done means" the data files alone cannot deliver.
4. **AOL Time Warner is one record, `aol`, named "AOL Time Warner".** Its first point is the two companies added
   together on 10 January 2000 ($290bn, Fortune), because that is the size of the thing being announced; the
   Guardian's $164bn is AOL alone on the same day and is used in the news summary instead. There are no sourced
   points for the merged company between January 2000 and February 2002, so the line is the site's straight draw
   between the 2000 and 2002 points, not the real path.
5. **Deal kinds.** Two are investments (Microsoft's stakes in Apple and AT&T), three are takeovers (WorldCom and
   Sprint, AOL and Time Warner, Qwest and US West), and four are supplier swaps (Qwest with Enron twice and with
   Global Crossing twice). `from` is who pays or, for a swap, who hands over the capacity: in the Enron swaps Enron
   sold to Qwest, so the line runs Enron to Qwest; in the 2001 Global Crossing swap Qwest bought, so it runs Qwest
   to Global Crossing.
6. **Deal amounts.** AOL and Time Warner: $180bn, the figure the merger page gives, `reported` (the Guardian's
   $250bn "merger" figure and the $183bn in the merger page's timeline are other counts). Qwest and US West: $48bn.
   WorldCom and Sprint: $129bn announced; regulators stopped it and no shares changed hands, so the deal is in the
   file as announced and the news item says it later collapsed. The four swaps are the revenue Qwest booked on each
   one, as the SEC complaint gives it ($36.3m in the fourth quarter of 1999, $85.5m in the third quarter of 2001
   for Enron; $105m in the first quarter of 2001 and $67.2m in the third quarter of 2001 for Global Crossing), which
   is not the same as the value of the capacity. The dates are the quarter ends.
7. **Companies added** only where a deal needed them, each with at least three dated values: Apple, AT&T, US West
   and Sprint. Their `first_mention` is their first value date. Apple's is 1996-12-31, so the Microsoft–Apple deal
   on 1997-08-06 is after it.
8. **Companies left out** for want of values: Dell (the page's history starts in 2018), Comcast (the page's numbers
   are about a tenth of Comcast's reported size in those years, so both the company and the Microsoft–Comcast
   investment are out), and all the bought firms with no market-cap page (MCI, Netscape, GeoCities, Broadcast.com,
   Ascend, Bay Networks, SDL, Winstar, Pets.com, Webvan, Priceline).
9. **The rest of the 1995 year is empty** because the market-cap pages start in 1996. The only 1995 item is the
   Nasdaq closing above 1,000 on 17 July.
10. **News wording** is mine and plain. No item says buy or sell or predicts prices. Each summary is one sentence
    of 160 characters or fewer.
11. **Month-only dates.** Where the page gives only a month, the item is dated the last day of that month and the
    summary says the month: Warren Buffett's Fortune article (November 1999), Robert Shiller's book and Julian
    Robertson closing Tiger (both March 2000). They are marked as that convention so the dots do not claim a day
    the source does not give.

## The red dates (9)

| Date | Label | Why it is a turning point |
|---|---|---|
| 1995-08-09 | Netscape's first day | The listing that showed an unprofitable browser firm could be worth millions overnight and set the pattern for the boom. |
| 1996-02-08 | Telecoms Act signed | The law that let phone and cable firms enter each other's markets, the legal start of the telecoms spending race. |
| 2000-01-10 | AOL buys Time Warner | The largest deal of the boom, old media bought with a share price built on the internet story: the top of the mania. |
| 2000-03-10 | Nasdaq peak | The index's close of 5,048.62, the day the bubble's high was set. |
| 2000-04-14 | Nasdaq falls 9% | The week the fall became visible: 9% in a day, 25% in a week. |
| 2001-09-11 | 9/11 closes markets | The attacks shut the exchanges for four trading days and deepened the slide. |
| 2001-12-02 | Enron bankrupt | Then the largest bankruptcy in US history, and the first of the accounting failures that ended the era. |
| 2002-06-25 | WorldCom fraud revealed | The $3.8bn restatement that turned a telecoms slump into a fraud crisis. |
| 2002-10-09 | Nasdaq bottom | The Nasdaq-100's low, 78% below the peak: the end of the story. |

## The blue dates (13)

| Date | Label | Why it is a smaller mark |
|---|---|---|
| 1996-12-05 | Irrational exuberance | Greenspan's public warning that asset values might be too high. |
| 1997-08-06 | Microsoft buys Apple stake | A small deal that shows the cash-rich platform firms buying into the internet story. |
| 1998-09-23 | LTCM rescue | The Fed-supervised rescue of a failing fund, the first sign that leverage could seize up the market. |
| 1998-11-24 | AOL buys Netscape | The first big internet firm buying another at a boom price. |
| 1999-11-30 | Buffett's Fortune warning | Buffett's public warning that investors expected too much. |
| 2000-01-06 | Lucent misses estimates | The first of the telecoms equipment warnings, a quarter before the Nasdaq peak. |
| 2000-03-20 | Barron's: Burning Up | The cover story warning that internet firms were running out of cash. |
| 2000-03-31 | Shiller's bubble book | Shiller's public argument, at the top, that the market was a bubble. |
| 2000-03-31 | Tiger fund closes | A famous investor shutting his fund rather than join the mania, a public statement that it was one. |
| 2000-04-03 | Microsoft loses case | The antitrust ruling against the largest company of the era. |
| 2001-01-11 | AOL Time Warner formed | The merger completing, a year after the announcement, into the fall. |
| 2001-04-01 | eToys bankrupt | A boom retailer failing, the pattern of the retail shake-out. |
| 2002-07-30 | Sarbanes-Oxley signed | The law passed in reply to the scandals. |

## Sources swapped or corrected

- The company record for AOL Time Warner now cites the Wikipedia merger page for its first mention, not the
  Guardian article, which is used for the news summary and the $164bn figure.
- AOL Time Warner's values now come from Fortune and the archived Washington Post page; before, AOL had a single
  Guardian point.
- Time Warner's last point stays at $94.50bn on 11 January 2001, but the notes now say it is the page's "last known
  market cap" for that day, not a year end, which the first pass described loosely.
- Pets.com's news item now cites the Pets.com article (announced 7 November 2000, orders stopped 9 November) instead
  of the general dot-com article, and the summary no longer says "nine months after its listing".
- The Microsoft antitrust item now cites `United States v. Microsoft Corp.` for the 3 April 2000 ruling instead of
  the dot-com article; its summary now gives the ruling rather than unsourced share moves.
- The Super Bowl item was rewritten to what the dot-com article states (two dot-com ads in 1999, 17 in 2000),
  dropping the "$2.2m for 30 seconds" and "a year later three did" lines, which the page does not state.
- The Nasdaq low item now says Nasdaq-100 and gives 1,114 and 78%, as the page does.
- The WorldCom bankruptcy item now says the company said on 21 July 2002 that it would file, as the BBC page does,
  instead of saying it had filed.
- New sources for new items: Wikipedia's "Closing milestones of the Nasdaq Composite", "History of Yahoo", "Long-Term
  Capital Management", "Netscape", "MCI Communications", "List of mergers and acquisitions by Microsoft", "Lucent
  Technologies", "FOMC actions" history and "Federal funds rate" for the rate moves, "Irrational Exuberance (book)",
  "Julian Robertson", "EToys.com", "WorldCom scandal", "Sarbanes-Oxley Act", "September 11 attacks", "Qwest",
  "WorldCom"; the SEC complaint on `sec.gov`; the Fortune and Washington Post pages above.
- No item now rests on a Wikipedia article where a first-hand page was open and stated the same fact, except where
  no better page opened (the deal prices, which come from the merger and company pages).

## Gaps

- **1995:** no market value for any company; the market-cap pages begin in 1996. Only the 17 July Nasdaq close.
- **AOL before January 2000:** no page gave AOL's own year-end values, so its bubble starts at the announcement.
- **AOL Time Warner between 2000 and 2002:** no sourced points; the line between them is a straight draw.
- **Peaks checked against a second page:** Nortel's $252bn peak agrees in size with the C$398bn Wikipedia gives for
  September 2000; WorldCom's $180.01bn on 21 June 1999 is a little above the $175bn the BBC gives as its peak. The
  data uses the market-cap page in both cases. Cisco's $569bn is from Cisco's own heritage page and no second page
  gave a different figure; the rest rest on the one market-cap page.
- **Deals not sourced because one end has no values:** AOL and Netscape, WorldCom and MCI, Yahoo and GeoCities,
  Yahoo and Broadcast.com, Lucent and Ascend, Nortel and Bay Networks, JDS Uniphase and SDL, Cisco's purchases,
  Microsoft and Comcast, Lucent's loans to Winstar and other customers.
- **Webvan** failed in 2001 but no opened page gives the day; it is not in the news. eToys and Pets.com are.
- **3G licence auctions:** the page gives April 2000 for the United Kingdom (£22.5bn) and August 2000 for Germany
  (£30bn), without days, so they are left out.
- **Analyst research scandals:** no page with a date for Spitzer's 2002 inquiry or the Merrill fine was opened, so
  the set stops at Sarbanes-Oxley.
- **The Time Warner and US West circles** stay on screen after their takeovers (judgement call 3).

## Pages opened

More than 100 distinct pages were opened. About 38 market-cap pages on companiesmarketcap.com (including the ones
whose history starts too late: Dell, Comcast, Lycos, Micron, Akamai, PayPal, Frontier, At Home, RealNetworks,
Globalstar, Portland General Electric, Juniper, Extreme), about 50 Wikipedia articles through the article endpoint
(including reads of 404 and redirect pages), and about 20 news, company or official pages: the Guardian, Wired,
Amazon's press room, Cisco heritage, the Federal Reserve's 1996 speech, six BBC business pages, Fortune, the Los
Angeles Times, the archived Washington Post page, the SEC complaint, and the two Wikipedia list pages used as deal
sources. Search pages used only to find addresses are not counted as sources.

DuckDuckGo's HTML search stopped answering part way through the run with a bot check ("Select all squares
containing a duck"). After that, addresses already known were opened directly and Wikipedia's own search was used
to find article titles. No search page is used as a source anywhere.

## Not found / doubts

- **The leftover circles after a takeover.** The data ends the bought company's series at the takeover, but the
  renderer draws the last value flat forever, so "Time Warner" still sits beside "AOL Time Warner" after January
  2001 and "US West" beside "Qwest" after June 2000. Closing that needs a code change outside this worker's files.
- **Peaks.** Only Nortel and WorldCom were checked against a second page; the others have the market-cap page as
  their only source, so a different page might give a different peak value.
- **Comcast's market value.** Its page gives about $1bn in 1997 and $0.89bn in 2001, far below Comcast's reported
  size in those years, so Comcast and the Microsoft–Comcast deal are not in the set.
- **MCI's, Netscape's, GeoCities', Broadcast.com's, Ascend's, Bay Networks', SDL's and Winstar's market values.**
  No page opened gave dated values in the set's shape, so their takeovers and Lucent's customer loans are not in
  `deals.json`.
- **Dell's market value before 2018.** The page's history starts when Dell returned to the market; its 1990s size
  is not in the set.
- **Exact dates for the UK and German 3G auctions, Webvan's failure, and the analyst investigations.** Not found on
  a page that opened.
- **Buffett's 1999 Sun Valley remarks.** No page with a date for the speech opened, so only his November 1999
  Fortune article is in the set.
- **Month-only dates** for Buffett's article, Shiller's book and Tiger's closure, as explained above.
- **Dates the page gives indirectly.** The Yahoo–GeoCities item is dated 28 January 1999, the date on the CNN story
  the GeoCities article cites, while its prose says only January 1999. The Super Bowl item is dated the day of
  Super Bowl XXXIV (30 January 2000); the article names the game, not the day. The JDS Fitel and Uniphase merger
  item from the first pass was removed because no opened page gave its date (the JDSU article says only "in 1999").
- **Peak dates for the monthly-series companies** are month ends, not the exact top day.
- **AOL Time Warner's 2002 year end.** No page gave a value for 31 December 2002; the last point is 1 April 2002.
- **Deal prices disagree by source** for AOL and Time Warner ($180bn, $183bn, $250bn in different accounts). The
  $180bn the merger page gives is used.
