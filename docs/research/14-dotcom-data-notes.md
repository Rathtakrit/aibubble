# Dot-com and telecom boom data, 1 January 1995 to 31 December 2002

Draft data for a past-bubble picture in the same shape as the AI boom data: company bubbles sized by market value,
money lines between companies, dated news. Everything below was built from pages I opened in this run; a search
result on its own was never used as a source.

Files (all `"status": "draft"`):

- `data/past/dotcom/companies.json` — 19 companies, each with a ticker and a `first_mention` date.
- `data/past/dotcom/values.json` — 120 market value points.
- `data/past/dotcom/deals.json` — 1 deal (AOL and Time Warner).
- `data/past/dotcom/news.json` — 34 news items, 19 of them `key_date`.

`node scripts/check-data.mjs data/past/dotcom` prints only "date … is before 2017-06-12" lines, which is expected
for a past bubble. It prints no deal-kind problems because only the `investment` kind is used (see the gap list).

## Where the numbers come from

- **Market values:** the "End of year Market Cap" table on `companiesmarketcap.com/<company>/marketcap/`, in US
  dollars. One page per company. The same pages print an "All time high intraday market cap" line, which I used for
  the peak points (Sun, Lucent, WorldCom, Global Crossing, Qwest, Enron, Time Warner).
- **Cisco's peak:** Cisco's own heritage page (`heritage.cisco.com/2000_marketcap/`) says Cisco became the most
  valuable company on 27 March 2000 at $82 a share, market cap $569bn.
- **AOL:** `theguardian.com`, 10 January 2000, says AOL had a market capitalisation of about $164bn and Time Warner
  about $83bn, and calls the deal a $250bn merger.
- **News:** the Wikipedia article "Dot-com bubble" (for the Nasdaq peak and fall, Barron's, MicroStrategy, the
  Microsoft ruling, Pets.com, the 1999 run, the October 2002 low); the Federal Reserve page for Greenspan's
  5 December 1996 speech; Wikipedia summaries for the Telecommunications Act, Lucent, Pets.com, WorldCom, Enron and
  theGlobe.com; the Amazon press release for its 1997 share sale; Wired for Netscape's first day; BBC News pages
  for the WorldCom, Global Crossing, Lucent, Cisco, Nortel and JDS Uniphase failures.

## Judgement calls

1. **Year ends** are dated 31 December because that is the point the companiesmarketcap table reports. Not every
   company has every year: the series start in 1996 for the older firms and 1997 or 1998 for the rest, and stop when
   a company stopped trading.
2. **Peaks** are the all-time high *intraday* market cap printed on the company page, on the date printed there. They
   are not year-end points and are labelled "peak".
3. **Companies that failed or were bought stop.** Enron's last point is 31 December 2001 ($0.44bn).
   Time Warner's last point is 11 January 2001 ($94.50bn), the last trade as TWX before the merger completed.
   Global Crossing and WorldCom keep a 31 December 2002 point ($0.016bn and $0.41bn) because the site still reports
   a value then; 2002 is the last year of the range.
4. **AOL has a single point**, about $164bn on 10 January 2000, the day the merger was announced. I found no page
   that gave AOL's own year-end values, so its bubble has one dot rather than a line.
5. **`first_mention`** is the earliest date I could source for that company inside the range, usually its first
   value date. Three are different: Lucent uses 30 September 1996, the day AT&T split it off (Wikipedia summary);
   Amazon uses 14 May 1997, the date of its offer announcement (Amazon press release); AOL uses 10 January 2000
   because that is where it enters this picture. No news item or deal is dated before a player's `first_mention`.
6. **The deal amount differs by source.** The Guardian called it a $250bn merger on the day it was announced; the
   Wikipedia article on the merger says a $180bn agreement at $108 a share; other accounts give $182bn once debt is
   counted. I used 180 with `amount_type: "reported"` and the Wikipedia merger page as the source, and left the total
   out of the news summary so that item does not depend on which figure is right.
7. **Units:** every value is in US$ billions, as printed. Global Crossing's last point is $16.37m on the page,
   entered as 0.01637.
8. **Rounding:** values are entered as printed, without extra precision.
9. **Dell and JDS Uniphase are left out of `companies.json`.** Both belong in the list, but I could not open a page
   that gave a dated market value for either in the range, and I would rather leave them out than invent a number.
   They still appear in the news (JDS Uniphase's $50.6bn loss; the 1999 JDS Fitel/Uniphase merger).
10. **No "Other dot-coms" group.** I found no page with a combined market value for Pets.com, Webvan, eToys,
    Priceline, theGlobe.com and Netscape, so per the brief the group is left out and those firms appear in news only
    (Pets.com and theGlobe.com do; the others have no dated item I could source).
11. **News wording** is mine and plain. No item says buy or sell, or predicts prices. Investment terms are avoided
    rather than explained, to keep each summary inside one sentence of 160 characters.

## Coverage of the events the brief asked for

Netscape listing (1995-08-09), Greenspan (1996-12-05), Telecommunications Act (1996-02-08), Amazon's share sale
(1997-05-14), the 1998–1999 run (1998-11-13, 1999-12-31), AOL and Time Warner (2000-01-10), the Nasdaq peak
(2000-03-10), Cisco as the most valuable company (2000-03-27), Barron's "Burning Up" (2000-03-20), the April 2000
falls (2000-04-14), Pets.com closing (2000-11-09), Lucent warning (2000-12-21) and Nortel (2001-10-03), Cisco's 2001
write-off (2001-04-17), Enron (2001-12-02), Global Crossing (2002-01-28), WorldCom (2002-07-21), the Nasdaq low
(2002-10-09).

Density is thin in two stretches: 1995 to mid-1997 has four items, and 1998 has two. The peak (March 2000) and the
fall (2000 to 2002) are the densest, as asked.

## Pages opened

80 page loads were read: 20 companiesmarketcap market-cap pages, 2 full Wikipedia articles (the dot-com bubble
article and the raw JDSU article), 45 Wikipedia summary pages, and 13 news, company or official pages (BBC ×7,
Guardian, Wired, Amazon press room, Cisco heritage, Federal Reserve). Three of the 80 were repeats: two summaries
redirected to a page already read (Dot-com company to the bubble article, Netscape Communications to Netscape) and
one BBC page was read twice, over http and then https, to check the address. Two of the pages read
(`centurylink` and the US ranking page) were not used. Ten DuckDuckGo search pages were also opened to find
addresses, but a search page on its own is not used as a source.

Twenty-eight attempts were refused (403, 404, 410, 503 or an empty reader): fcc.gov, upi.com, macrotrends.net,
money.cnn.com, one archive.org copy, lasvegassun.com, the jina reader proxy, and twenty companiesmarketcap addresses
for Qwest, AOL, JDS Uniphase, Dell, MCI and Viavi that do not exist or use another name.

## Not found / doubts

- **Dell market value.** Search excerpts said Dell reached a market value of about $100bn in 2000, but that came from
  excerpts; I did not open a page in this run that states a dated Dell market value, so Dell is not in the data.
- **JDS Uniphase market value.** The Wikipedia article gives share prices ($153 down to under $2) and the $50.6bn
  loss, but no market value with a date. Not in the data.
- **MCI market value.** WorldCom bought MCI in 1998 (Wikipedia summary), but I found no dated MCI market value, so
  the WorldCom–MCI deal is not in `deals.json`.
- **AOL's own yearly values, before and after the merger.** Only the $164bn figure on 10 January 2000 was sourced.
- **Netscape's $28 offer price.** The opened Wired page gives the $75 first-day high but not the offer price; $28
  appears only in search excerpts, so it is not in the data.
- **Cisco's $2.25bn inventory charge.** The figure appears in Cisco's annual report and news excerpts, but I opened
  only the BBC piece, which gives a $4bn restructuring charge and unsold stock. The news item uses the BBC figures.
- **UK and German 3G licence totals (£22.5bn and £30bn).** Stated in the dot-com article, but without exact dates, so
  they are left out of news rather than given an invented date.
- **The text of Barron's "Burning Up".** Only Wikipedia's description of the 20 March 2000 cover was opened.
- **Combined value for the "Other dot-coms" group.** Not found, so the group does not exist in the data.
- **Individual values for Webvan, eToys and Priceline.** Their pages give founding and failure years but no dated
  market values. Left out.
- **Vendor-loan and capacity deals.** Cisco's own Q&A page (via BBC) says Cisco sometimes lent customers the money to
  buy its equipment, and the telecom carriers swapped capacity, but no page I opened names two companies that are both
  in `companies.json`. So `deals.json` has one investment and no vendor-loan or capacity lines.
- **`first_mention` for most companies** is the first date their value series covers, not the date they were founded
  or listed. That is the earliest sourced date I have, but it is later than their real start.
- **Year 1995 is almost empty.** The value series start in 1996 at the earliest, so no company has a 1995 point.
