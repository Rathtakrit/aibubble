# How money moved in the dot-com and telecom bubble, 1995–2002

Research for a short story of at most nine chapters. Scope: the companies in `data/past/dotcom/companies.json`,
the money links in `deals.json`, and the public record around them. All amounts are US dollars unless the page
printed another currency. The file says what the opened pages say; it does not say whether to buy or sell anything,
and it does not predict prices.

Method: every amount below was read on a page opened for this file, and the page is linked in the fact table.
Where a page gave a commitment rather than cash paid, or a market value rather than a deal price, the row says so.
The data notes in `docs/research/14-dotcom-data-notes.md` and Table B in `docs/research/11-past-bubbles.md` were
reused for dates and links; the rows that matter here were re-opened. Wikipedia was not used as a source.

## 1. Mechanism

Money moved in a loop that needed ever-higher share prices: equipment makers lent customers the price of the
equipment, carriers sold each other capacity they did not need and booked both sides as revenue, and acquirers paid
for targets with their own shares, so each deal made the next one look cheaper — until the share prices fell and the
same loops turned into bad loans, restatements and bankruptcies.

1. **Equipment maker → carrier.** Lucent promised Winstar $2bn and Cisco $500m; Cisco also lent ICG $180m; Lucent
   opened a $1.35bn line to Leap. This was **vendor financing** (an equipment maker lending a customer the money to
   buy its gear): the vendor booked the sale now and carried the loan, so when the carrier failed the loan became a
   loss. Lucent had $5.7bn of such credit out in 2000.
2. **Carrier ↔ carrier.** Qwest booked $36.3m of revenue on a **capacity swap** (two carriers buying long-term
   rights to each other's fibre and counting both sales as revenue) with Enron, and $105m with Global Crossing.
   Global Crossing booked $720m of "cash revenue" from the sale side of swaps in the first half of 2001. The right
   being sold was often an **IRU** (indefeasible right of use: a long lease on a strand of fibre); Qwest's 2001
   capacity revenue was over $1bn, more than two thirds of it swaps.
3. **Acquirer → target, paid in shares.** AOL bought Time Warner in a $250bn share deal; Qwest bought US West for
   $48bn in shares; WorldCom agreed to buy Sprint for $115bn ($129bn with debt). The target's owners were paid in
   the acquirer's paper, so the price depended on the next day's **market value** (share price times the number of
   shares).
4. **Company → media → company.** AOL Time Warner paid for advertising that came back as its own revenue: it
   restated about $500m of online advertising. Homestore paid vendors, who paid a media company, which bought ads
   from Homestore; Homestore overstated revenue by $46m (64%). This is a **round trip** (money that leaves a company
   and comes back as revenue).
5. **Public investors → company.** Amazon raised about $54m in its **IPO** (initial public offering: the first sale
   of a company's shares to the public); WorldCom sold $30bn of bonds; Qwest issued about $6.3bn of debt across
   1999, 2000 and 2002. This was the outside money that funded the networks; when the share prices fell, the IPO and
   bond taps closed, and the companies that could not pay went into **Chapter 11** (a US bankruptcy court process
   that lets a company keep running while it renegotiates its debts).

## 2. Link types found

| Link type | Who pays whom (arrow) | 2–5 real examples with amount and date | Already in data? (compare `kind` in `deals.json`) | Drawable? |
|---|---|---|---|---|
| Vendor financing (equipment loan) | Equipment maker → start-up carrier (Lucent/Cisco → Winstar, ICG, Leap) | Lucent → Winstar: $2bn commitment, 2000 (about $700m drawn by Apr 2001). Cisco → Winstar: $500m, 2000. Cisco → ICG: $180m, 2000. Lucent → Leap: $1.35bn line, $111m owed, 2001. Lucent total: $5.7bn committed, 2000. | No. `supplier` is labelled "Supplier loan or swap", but all four `supplier` rows are swaps; there is no loan row. | Yes — both ends are companies. |
| Capacity swap / IRU swap | Carrier ↔ carrier (Qwest ↔ Enron; Qwest ↔ Global Crossing) | Qwest/Enron: $36.3m revenue, Q4 1999; $85.5m, Q3 2001. Qwest/Global Crossing: $105m sale, Q1 2001; $67.2m purchase, Q3 2001. Global Crossing: $720m cash revenue from swap sales, Q1–Q2 2001. Qwest: over $1bn capacity revenue in 2001, more than two thirds swaps. | Yes — four `supplier` rows (Qwest–Enron ×2, Qwest–Global Crossing ×2). | Yes — both ends are companies. |
| Takeover paid in shares | Acquirer → target (AOL → Time Warner; Qwest → US West; WorldCom → Sprint) | AOL/Time Warner: $250bn, 10 Jan 2000. Qwest/US West: $48bn, 30 Jun 2000. WorldCom/Sprint: $115bn agreed ($129bn with debt), 5 Oct 1999; blocked in 2000. | Yes — three `takeover` rows; the AOL–Time Warner amount in the file is a different measure (see Section 5). | Yes — both ends are companies. |
| Strategic equity investment | Company → company (Microsoft → Apple; Microsoft → AT&T) | Microsoft → Apple: $150m of non-voting stock, 6 Aug 1997. Microsoft → AT&T: $5bn of convertible securities, 6 May 1999. | Yes — two `investment` rows. | Yes — both ends are companies. |
| Round-trip advertising / barter | Company → media company → back to company (AOL Time Warner; Homestore) | AOL Time Warner: about $500m of online ad revenue restated, 2000–2002. Homestore: $46m overstated (64%), first three quarters of 2001. | No — no `kind` for advertising or barter. | Yes — both ends are companies, but the line is revenue, not a deal. |
| IPO | Public investors → company (Netscape, Amazon, theGlobe.com) | Netscape: 5m shares at $28, closed $58.25, 9 Aug 1995. Amazon: 3m shares at $18 (about $54m), 14 May 1997. theGlobe.com: $9 offer, closed $63.50 (+606%), 13 Nov 1998. | No — `deals.json` has no public-market rows; `companies.json` records the first mention. | No: public markets. |
| Bond / bank debt | Bond buyers and lenders → company (WorldCom, Qwest, Global Crossing) | WorldCom: $30bn of bonds, $41bn of debts, Jul 2002. Qwest: about $6.3bn of debt issued 1999–2002. Global Crossing: $12.4bn of liabilities, 28 Jan 2002. | No — no `kind` for debt. | No: public markets (the examples are bonds; bank debt would be drawable). |
| Government spectrum fee | Telecoms → UK government (five 3G licensees → Treasury) | UK 3G auction: £22.47bn ($35.4bn), 27 Apr 2000. | No — no government payer. | No: government. |
| Venture funding | Venture fund → company (Kleiner Perkins → Amazon) | Amazon: 555,161 Series A shares at $14.05 to KPCB VIII, 1996; $8.0m net proceeds from preferred stock in 1996. | No — no venture-fund payer. | No: venture funds. |
| One-off equipment sale booked as revenue | Customer → vendor (Qwest's customers → Qwest) | Qwest: $65m upfront equipment revenue, Q1 2001; $116m, Q2 2001. | Partly — `supplier` covers swaps, not one-off equipment sales. | Yes — both ends are companies. |

## 3. Fact table

Every number in Sections 1, 2 and 4 has a row here. "Primary link" is the page opened for this file; "second source"
is a corroborating or related page. Where the second page gives a different measure, Section 5 says so.

| Claim | Number | Date | Primary link | Short quote from page | Second source link |
|---|---|---|---|---|---|
| Netscape offered 5 million shares | 5,000,000 | 1995-08-09 | https://www.latimes.com/archives/la-xpm-1995-08-10-fi-33590-story.html | "meaning the 5 million Netscape shares initially offered turned over twice." | none found |
| Netscape offer price | $28 | 1995-08-09 | https://www.latimes.com/archives/la-xpm-1995-08-10-fi-33590-story.html | "rose as high as $74.25 from the initial $28 announced Tuesday" | none found |
| Netscape first-day close | $58.25 | 1995-08-09 | https://www.latimes.com/archives/la-xpm-1995-08-10-fi-33590-story.html | "before settling down to $58.25 per share by market close." | none found |
| Greenspan questions "irrational exuberance" | quote | 1996-12-05 | https://www.federalreserve.gov/boarddocs/speeches/1996/19961205.htm | "how do we know when irrational exuberance has unduly escalated asset values" | none found |
| Microsoft most valuable stock on Nasdaq | most valuable | 2000-03-10 | https://www.bbc.com/news/business-32429413 | "Back in 2000, Microsoft was the most valuable stock on the index" | none found |
| Nasdaq record stood until 2015 | 2015 | 2015-04-23 | https://www.bbc.com/news/business-32429413 | "besting the high of 5,048.62 it hit on 10 March 2000" | none found |
| Amazon offered 3 million shares at $18 | 3,000,000 at $18 | 1997-05-14 | https://press.aboutamazon.com/1997/5/amazon-com-inc-announces-initial-public-offering-of-3-000-000-shares-of-common-stock | "announced today the initial public offering of 3,000,000 shares of its Common Stock at a price of $18 per share." | https://www.sec.gov/Archives/edgar/data/1018724/0000891020-97-000839.txt |
| Amazon gross proceeds (arithmetic: 3,000,000 × $18) | about $54m | 1997-05-14 | https://press.aboutamazon.com/1997/5/amazon-com-inc-announces-initial-public-offering-of-3-000-000-shares-of-common-stock | "3,000,000 shares of its Common Stock at a price of $18 per share." | https://www.sec.gov/Archives/edgar/data/1018724/0000891020-97-000839.txt |
| theGlobe.com offer price | $9 | 1998-11-13 | https://web.archive.org/web/20011210001758/http://money.cnn.com:80/1998/11/13/technology/theglobe/ | "well above the initial public offering price of $9". | none found |
| theGlobe.com close and first-day gain | $63.50; 606% | 1998-11-13 | https://web.archive.org/web/20011210001758/http://money.cnn.com:80/1998/11/13/technology/theglobe/ | "shares ... skyrocketed 606 percent"; "closed at $63.50". | none found |
| Lucent commitment to Winstar | $2bn | 2000 | https://www.eweek.com/news/vendor-financing-backfires/ | "Lucent extended $2 billion; Cisco $500 million." | https://www.latimes.com/archives/la-xpm-2001-apr-19-fi-52855-story.html |
| Winstar cash actually lent by Lucent | about $700m | Apr 2001 | https://www.latimes.com/archives/la-xpm-2001-apr-19-fi-52855-story.html | "has already lent Winstar about $700 million." | https://www.eweek.com/news/vendor-financing-backfires/ |
| Cisco commitment to Winstar | $500m | 2000 | https://www.eweek.com/news/vendor-financing-backfires/ | "Lucent extended $2 billion; Cisco $500 million." | https://www.latimes.com/archives/la-xpm-2001-apr-19-fi-52855-story.html |
| Cisco loan to ICG | $180m | 2000 | https://www.eweek.com/news/vendor-financing-backfires/ | "Cisco extended $180 million to ICG Communications, which later declared bankruptcy." | https://www.latimes.com/archives/la-xpm-2001-apr-19-fi-52855-story.html |
| Lucent line of credit to Leap | $1.35bn | 2000–2001 | https://www.eweek.com/news/vendor-financing-backfires/ | "Lucent extended a $1.35 billion line of credit to Leap Wireless International". | https://www.latimes.com/archives/la-xpm-2001-apr-19-fi-52855-story.html |
| Leap owed Lucent | $111m | Apr 2001 | https://www.eweek.com/news/vendor-financing-backfires/ | "now the young company owes $111 million." | https://www.latimes.com/archives/la-xpm-2001-apr-19-fi-52855-story.html |
| Lucent total customer credit committed in 2000 | $5.7bn | 2000 | https://www.eweek.com/news/vendor-financing-backfires/ | "In all, Lucent last year committed to $5.7 billion in credit to customers." | https://www.latimes.com/archives/la-xpm-2001-apr-19-fi-52855-story.html |
| Qwest revenue on Enron swap, Q4 1999 | $36.3m | 1999-12-31 | https://www.sec.gov/Archives/edgar/data/1037949/000104746904032285/a2145562zex-99_2.htm | "Qwest recognized $36.3 million in the fourth quarter of 1999 ... from the swaps with Enron." | https://www.govinfo.gov/content/pkg/CHRG-107hhrg81961/html/CHRG-107hhrg81961.htm |
| Qwest revenue on Enron swap, Q3 2001 | $85.5m | 2001-09-30 | https://www.sec.gov/Archives/edgar/data/1037949/000104746904032285/a2145562zex-99_2.htm | "in the third quarter 2001 Qwest recognized $85.5 million of revenue on the sale of IRU capacity in a swap with Enron." | https://www.govinfo.gov/content/pkg/CHRG-107hhrg81961/html/CHRG-107hhrg81961.htm |
| Qwest sale to Global Crossing, Q1 2001 | $105m | 2001-03-31 | https://www.sec.gov/Archives/edgar/data/1037949/000104746904032285/a2145562zex-99_2.htm | "Qwest sold $105 million of fiber-optic capacity to Global Crossing and recognized approximately $102 million in revenue for the sale." | https://www.govinfo.gov/content/pkg/CHRG-107hhrg81961/html/CHRG-107hhrg81961.htm |
| Qwest purchase from Global Crossing, Q3 2001 | $67.2m | 2001-09-30 | https://www.sec.gov/Archives/edgar/data/1037949/000104746904032285/a2145562zex-99_2.htm | "Qwest purchased $67.2 million of capacity in Pan America from Global Crossing in a swap transaction." | https://www.govinfo.gov/content/pkg/CHRG-107hhrg81961/html/CHRG-107hhrg81961.htm |
| Global Crossing cash revenue from swap sales | $720m | Q1–Q2 2001 | https://www.govinfo.gov/content/pkg/CHRG-107hhrg81961/html/CHRG-107hhrg81961.htm | "Global Crossing reported $720 million in cash revenues from the sale portion of these capacity swaps in the first and second quarters of 2001 alone." | https://www.sec.gov/Archives/edgar/data/1037949/000104746904032285/a2145562zex-99_2.htm |
| Qwest capacity revenue in 2001 | over $1bn | 2001 | https://www.govinfo.gov/content/pkg/CHRG-107hhrg81961/html/CHRG-107hhrg81961.htm | "the company reported revenues of more than $1 billion from network capacity sales in 2001." | https://www.sec.gov/Archives/edgar/data/1037949/000104746904032285/a2145562zex-99_2.htm |
| Qwest capacity revenue that was swaps | more than two thirds | 2001 | https://www.govinfo.gov/content/pkg/CHRG-107hhrg81961/html/CHRG-107hhrg81961.htm | "more than two thirds of those sales were swaps". | https://www.sec.gov/Archives/edgar/data/1037949/000104746904032285/a2145562zex-99_2.htm |
| AOL/Time Warner combined value at announcement | $250bn | 2000-01-10 | https://www.theguardian.com/business/2000/jan/10/efinance.internet | "today announced a $250bn merger that will combine traditional and new media into one gargantuan enterprise." | https://www.nytimes.com/2000/01/12/business/media-megadeal-market-place-two-stocks-one-swings-the-other-doesn-t.html |
| AOL and Time Warner market values at announcement | $164bn; $83bn | 2000-01-10 | https://www.theguardian.com/business/2000/jan/10/efinance.internet | "AOL currently has a market capitalisation of about $164 billion, roughly twice the $83 billion of New York-based Time Warner." | none found |
| Qwest purchase of US West | $48bn | 2000-06-30 | https://www.edn.com/qwest-us-west-pairing-alters-long-haul-landscape/ | "officially completed its $48 billion acquisition of US West Communications Inc. last week (June 30)". | https://www.sec.gov/Archives/edgar/data/1037949/000103570401000204/d84707e10-k.txt |
| WorldCom agreed bid for Sprint | $115bn | 1999-10-05 | https://www.theguardian.com/business/1999/oct/06/3 | "pulled off the world's largest takeover with an agreed $115bn (£72bn) bid for Sprint". | https://www.justice.gov/archive/atr/public/press_releases/2000/5049.htm |
| WorldCom/Sprint value including debt | $129bn | 1999-10-05 | https://www.theguardian.com/business/1999/oct/06/3 | "The all-equity transaction adds up to $129bn once debt and preferred shares are assumed." | https://www.justice.gov/archive/atr/public/press_releases/2000/5049.htm |
| WorldCom/Sprint deal called off | $129bn | 2000-07-13 | https://abcnews.com/Business/story?id=89662&page=1 | "called off their planned $129 billion telecommunications merger today in the face of extreme opposition from regulators in the United States and Europe." | https://www.justice.gov/archive/atr/public/press_releases/2000/5049.htm |
| AOL Time Warner online advertising restated | about $500m | 2000–2002 (restated 2005) | https://www.sec.gov/enforcement-litigation/litigation-releases/lr-19147 | "reduce its reported online advertising revenues by approximately $500 million". | https://www.sec.gov/enforcement-litigation/litigation-releases/lr-17745 |
| Homestore advertising revenue overstated | $46m; 64% | 2001 (charged 2002) | https://www.sec.gov/enforcement-litigation/litigation-releases/lr-17745 | "overstate its advertising revenues by $46 million (64%) for the first three quarters of 2001." | https://www.sec.gov/enforcement-litigation/litigation-releases/lr-19147 |
| WorldCom bonds | $30bn | 2002-07-22 | https://news.bbc.co.uk/2/hi/business/2143217.stm | "holders of WorldCom's $30bn in bonds". | https://www.sec.gov/Archives/edgar/data/723527/000090951802000544/mv7-22_8k.txt |
| WorldCom total debts | $41bn | 2002-07-22 | https://news.bbc.co.uk/2/hi/business/2143217.stm | "the $41bn of debts that WorldCom has left behind." | https://www.sec.gov/Archives/edgar/data/723527/000090951802000544/mv7-22_8k.txt |
| Qwest debt issued | about $6.3bn | 1999–2002 | https://www.sec.gov/Archives/edgar/data/1037949/000104746904032285/a2145562zex-99_2.htm | "In 1999, 2000, and 2002, Qwest issued approximately $6.3 billion in debt." | https://www.sec.gov/Archives/edgar/data/1037949/000103570401000204/d84707e10-k.txt |
| Global Crossing liabilities at filing | $12.4bn | 2002-01-28 | https://news.bbc.co.uk/2/hi/business/1787203.stm | "Assets: $22.4bn Liabilities: $12.4bn". | https://www.govinfo.gov/content/pkg/CHRG-107hhrg81961/html/CHRG-107hhrg81961.htm |
| Global Crossing assets at filing | $22.4bn | 2002-01-28 | https://news.bbc.co.uk/2/hi/business/1787203.stm | "Assets: $22.4bn Liabilities: $12.4bn". | https://www.govinfo.gov/content/pkg/CHRG-107hhrg81961/html/CHRG-107hhrg81961.htm |
| UK 3G auction proceeds | £22.47bn | 2000-04-27 | https://news.bbc.co.uk/2/hi/business/727831.stm | "The £22.47bn windfall is equivalent to £400 per person in the UK." | https://www.theguardian.com/money/2000/apr/28/business.personalfinancenews |
| UK 3G auction proceeds in dollars | $35.4bn | 2000-04-27 | https://news.bbc.co.uk/2/hi/business/727831.stm | "£22.47bn ($35.4bn) windfall." | https://www.theguardian.com/money/2000/apr/28/business.personalfinancenews |
| Microsoft investment in Apple | $150m | 1997-08-06 | https://news.microsoft.com/1997/08/06/microsoft-and-apple-affirm-commitment-to-build-next-generation-software-for-macintosh/ | "Microsoft will invest $150 million in non-voting Apple stock." | none found |
| Microsoft investment in AT&T | $5bn | 1999-05-06 | https://web.archive.org/web/19990507000000id_/http://money.cnn.com/1999/05/06/technology/att/ | "Microsoft will buy $5 billion worth of AT&T stock". | none found |
| Amazon Series A shares to Kleiner Perkins | 555,161 at $14.05 | 1996 | https://www.sec.gov/Archives/edgar/data/1018724/0000891020-97-000839.txt | "555,161 and 14,235 shares of Series A Preferred Stock at $14.05 per share to Kleiner Perkins Caufield & Byers VIII". | none found |
| Amazon net proceeds from preferred stock | $8.0m | 1996 | https://www.sec.gov/Archives/edgar/data/1018724/0000891020-97-000839.txt | "net proceeds of $8.0 million from the issuance of Preferred Stock". | none found |
| Qwest upfront equipment revenue, Q1 2001 | $65m | 2001-03-31 | https://www.sec.gov/Archives/edgar/data/1037949/000104746904032285/a2145562zex-99_2.htm | "recorded upfront revenue of $65 million." | https://web.archive.org/web/2005/http://www.sec.gov/litigation/litreleases/lr18936.htm |
| Qwest upfront equipment revenue, Q2 2001 | $116m | 2001-06-30 | https://www.sec.gov/Archives/edgar/data/1037949/000104746904032285/a2145562zex-99_2.htm | "recorded upfront revenue from equipment sales of $116 million." | https://web.archive.org/web/2005/http://www.sec.gov/litigation/litreleases/lr18936.htm |
| Nasdaq record close | 5,048.62 | 2000-03-10 | https://www.wired.com/2010/03/0310nasdaq-bust/ | "The Nasdaq hits 5,048.62, the high-water mark of the dot-com boom." | https://web.archive.org/web/20000311000000id_/http://money.cnn.com/2000/03/10/markets/markets_newyork/ |
| Enron share price fall | about $95 to below $1 | 2001-12-02 | https://news.bbc.co.uk/hi/english/static/in_depth/business/2002/enron/timeline/12.stm | "Its share price collapsed from about $95 to below $1." | https://www.theguardian.com/business/2001/dec/03/corporatefraud.enron |
| Global Crossing share price fall | 96% | 2002-01-28 | https://news.bbc.co.uk/2/hi/business/1787203.stm | "Share price: down 96% in past year". | https://www.govinfo.gov/content/pkg/CHRG-107hhrg81961/html/CHRG-107hhrg81961.htm |
| WorldCom fraud headline | $3.8bn | 2002-06-25 | https://www.sec.gov/enforcement-litigation/litigation-releases/lr-17588 | "SEC Charges WorldCom with $3.8 Billion Fraud". | https://www.sec.gov/Archives/edgar/data/723527/000091205702025338/a2083227zex-99_1.txt |
| WorldCom improper transfers, by period | $3.055bn + $797m | 2001 and Q1 2002 | https://www.sec.gov/Archives/edgar/data/723527/000091205702025338/a2083227zex-99_1.txt | "The amount of these transfers was $3.055 billion for 2001 and $797 million for first quarter 2002." | https://www.sec.gov/enforcement-litigation/litigation-releases/lr-17588 |
| WorldCom recorded costs as capital investment | about $3.8bn | 2002-06-25 | https://www.sec.gov/enforcement-litigation/litigation-releases/lr-17588 | "capitalizing (and deferring) rather than expensing (and immediately recognizing) approximately $3.8 billion of its costs" | https://www.sec.gov/Archives/edgar/data/723527/000091205702025338/a2083227zex-99_1.txt |
| Yahoo IPO | 2,600,000 shares at $13; about $32.5m; close $33 | 1996-04-12 | https://www.cnet.com/tech/mobile/yahoo-ipo-closes-at-33-after-43-peak/ | "would offer 2.6 million shares at $13 each"; "expects to bring in $32.5 million from the initial public offering." | none found |
| Microsoft software in AT&T set-top boxes | 2.5m to 5m more boxes | 1999-05-06 | https://web.archive.org/web/19990507000000id_/http://money.cnn.com/1999/05/06/technology/att/ | "AT&T ... already had agreed to use Microsoft's Windows CE-based systems in 5 million set-top boxes. The deal Thursday expands that by 2.5 million to 5 million boxes." | none found |
| Winstar Chapter 11 | Chapter 11; about $75m of interest missed | 2001-04-19 | https://www.latimes.com/archives/la-xpm-2001-apr-19-fi-52855-story.html | "Winstar, which filed for Chapter 11 bankruptcy protection in Wilmington, Del."; "had failed to make about $75 million of interest payments." | https://www.eweek.com/news/vendor-financing-backfires/ |
| ICG bankruptcy | debtor-in-possession from 2000-11-14 | 2000-11-14 | https://www.sec.gov/Archives/edgar/data/1013240/000102140801503681/d10k.txt | "ICG COMMUNICATIONS, INC. (Debtor-in-Possession as of November 14, 2000)" | none found |
| Winstar market value | $4,448.1m | 2000-03-06 | https://www.sec.gov/Archives/edgar/data/868797/000088981200001155/0000889812-00-001155.txt | "As of March 6, 2000, the aggregate market value of such stock was approximately $4,448.1 million." | none found |
| ICG market value | $5,204,544 | 2001-06-20 | https://www.sec.gov/Archives/edgar/data/1013240/000102140801503681/d10k.txt | "the aggregate market value ... (using the closing price of $0.10 on June 20, 2001) was approximately $5,204,544" | none found |
| Leap market value | $901,992,839 | 2001-03-01 | https://www.sec.gov/Archives/edgar/data/1065049/000093639201500032/a70002e10-k.txt | "As of March 1, 2001, the aggregate market value of the registrant's voting stock held by non-affiliates of the registrant was approximately $901,992,839" | none found |
| Nasdaq close, 4 October 2002 | 1,139.90; 77% below the peak | 2002-10-04 | https://www.goldmansachs.com/our-firm/history/moments/2000-dot-com-bubble | "On October 4, 2002, the Nasdaq index fell to 1,139.90 units, a fall of 77% from its peak." | none found |

## 4. Turning points

Nine dated points, in order. Company ids are from `companies.json`; "not in data" means the company or index is not
one of the 23 bubbles. Each quote is from the page named in the last column.

| Date | Companies (ids) | What changed | Contemporaneous quote | Source |
|---|---|---|---|---|
| 1995-08-09 | not in data (Netscape) | A young browser company with no profits sold 5m shares at $28 and closed at $58.25. It set the template: a story, not earnings, could raise public money. | "It had taken Netscape 'about a minute.'" (Wall Street Journal, quoted in the 1995 Blog) | https://1995blog.com/2015/08/02/the-netscape-moment-20-years-on/ |
| 1997-05-14 | `amazon` | An online bookshop raised about $54m and showed that internet retail could use the public market. The money paid for warehouses and growth, not profits. | "announced today the initial public offering of 3,000,000 shares of its Common Stock at a price of $18 per share." | https://press.aboutamazon.com/1997/5/amazon-com-inc-announces-initial-public-offering-of-3-000-000-shares-of-common-stock |
| 1999-10-05 | `worldcom`, `sprint` | The largest takeover ever, paid in shares, would have combined two of the largest US long-distance carriers. Regulators blocked it in 2000, so the shares were never issued — but the deal marked the high tide of consolidation. | The FCC chairman said the merger appeared to signal a "surrender" in the long-distance price war. | https://www.theguardian.com/business/1999/oct/06/3 |
| 2000-01-10 | `aol`, `time-warner` | AOL, an internet service provider, bought the world's biggest media company with its own shares. The combined value was $250bn at announcement; it was the top of the mania. | "This is an historic moment in which new media has truly come of age." (Steve Case) | https://www.theguardian.com/business/2000/jan/10/efinance.internet |
| 2000-03-10 | not in data (Nasdaq index) | The index closed at a record 5,048.62. From here the market fell; the paper wealth that had paid for deals and loans began to shrink. | "The Dow would do well to get back to its all-time high while the Nasdaq is in uncharted territory." (Donald Selkin) | https://web.archive.org/web/20000311000000id_/http://money.cnn.com/2000/03/10/markets/markets_newyork/ |
| 2000-06-30 | `qwest`, `us-west` | A long-distance upstart bought a Baby Bell for $48bn in shares, the first full merger of a long-distance and local phone company. It loaded Qwest with the local network, the debt and the accounting that later collapsed. | "distance is no longer relevant." (Rep. Billy Tauzin) | https://www.edn.com/qwest-us-west-pairing-alters-long-haul-landscape/ |
| 2001-12-02 | `enron` | Chapter 11; the share fell from about $95 to below $1. The first big bankruptcy of the accounting scandals; its swaps with Qwest were part of the capacity story. | "Uncertainty has severely impacted the market's confidence in Enron and its trading operations." (Kenneth Lay) | https://news.bbc.co.uk/hi/english/static/in_depth/business/2002/enron/timeline/12.stm |
| 2002-01-28 | `global-crossing` | Chapter 11 with $22.4bn of assets and $12.4bn of liabilities; the shares were down 96% in a year. The company had booked $720m of swap revenue in the first half of 2001. | "billions of dollars of investors' funds have disappeared down an electronic plughole." (BBC's Mark Gregory) | https://news.bbc.co.uk/2/hi/business/1787203.stm |
| 2002-06-25 | `worldcom` | WorldCom admitted $3.8bn of improper accounting (later $3.055bn + $797m), the largest fraud of the era. It filed Chapter 11 on 21 July 2002. | "Our senior management team is shocked by these discoveries." (John Sidgmore) | https://www.sec.gov/Archives/edgar/data/723527/000091205702025338/a2083227zex-99_1.txt |

## 5. Disputed or unsure

1. **Nasdaq peak: 5,048.62 or 5,048.64?** Wired (2010) and the data's red date say 5,048.62; CNNfn's same-day report
   says "The Nasdaq rose 1.78 points to 5,048.64 Friday". The difference is 0.02 points. The narrative uses
   5,048.62 because that is the figure in the data and in Wired; I could not reconcile the two from the pages opened.
2. **AOL/Time Warner: $250bn, $165bn or $180bn?** The Guardian's announcement-day report says a "$250bn merger" and
   gives AOL a market value of about $164bn and Time Warner $83bn. Those two market values add to $247bn, so the
   $250bn headline is rounded. The `takeover` row in `deals.json` uses $165bn from the New York Times, a deal value
   at announcement that I could not re-open (the NYT refused the fetch). These are different measures — combined
   market value, a rounded headline and the value of the shares offered on a particular day — not necessarily errors.
3. **WorldCom fraud: $3.8bn or $3.85bn?** The SEC headline says $3.8bn; the SEC complaint and WorldCom's release give
   $3.055bn for 2001 plus $797m for the first quarter of 2002, which sum to $3.852bn; the BBC rounds to $3.85bn.
   Same money, different rounding and scope.
4. **Global Crossing: $54bn lost or $25.5bn of assets?** The House hearing says investors lost $54bn; the BBC gives
   $22.4bn of assets and $12.4bn of liabilities at the filing, and a table of "telecom failures" gives Global
   Crossing $25.5bn. Investor losses are measured from the peak market value; assets are a balance-sheet number at
   bankruptcy. Both can be true.
5. **Lucent/Winstar: $2bn or $700m?** eWeek says Lucent extended a $2bn commitment; the LA Times says Lucent had
   "already lent Winstar about $700 million" by the April 2001 filing. A commitment is not money paid out. The table
   gives both and labels them.
6. **Were the capacity swaps fraud or normal business?** The House hearing itself says there is a legitimate IRU and
   a legitimate accounting treatment; the SEC alleges Qwest used swaps to book revenue for capacity it did not need
   and could not use, and Qwest settled "without admitting or denying" the allegations. So the link type is real; the
   fraud finding is about specific swaps and how they were timed and disclosed.
7. **Vendor financing: cause or symptom?** eWeek calls it a "dark secret" and "table stakes"; the loans followed the
   carriers' business plans and the vendors' need to book sales. The pages do not prove that vendor financing caused
   the collapse rather than magnified it. This file says "magnified", not "caused".
8. **UK 3G: £22.47bn or £22.5bn?** BBC and the Guardian say £22.47bn; the National Audit Office rounds to £22.5bn.
   The NAO report page gives the 2001 report date but not the auction closing date; BBC and the Guardian give
   27 April 2000. The table uses 27 April 2000 and £22.47bn.
9. **Single-source rows.** Some rows have no independent second source: the Microsoft investments, the Amazon
   preferred-stock items and the theGlobe.com amount. The New York Times, Reuters, CNBC, Bloomberg and the Wall
   Street Journal blocked or refused fetches; the Ritter IPO PDFs could not be read because the fetcher rejects PDFs.
   The file says "none found" rather than inventing a second link.
10. **Qwest's $3.8bn is an allegation, not a finding.** The SEC complaint is the primary document; Qwest's $250m
    penalty was a settlement without admission. The file attributes the figure to the SEC.

## Sources

All pages below were opened for this file. Dates are the page's publication date where it gave one.

**SEC, courts and US government**

- SEC v. Qwest Communications International Inc., complaint, exhibit 99.2 to Qwest's 8-K, 27 October 2004:
  https://www.sec.gov/Archives/edgar/data/1037949/000104746904032285/a2145562zex-99_2.htm
- SEC Litigation Release 19147, Time Warner/AOL, 21 March 2005:
  https://www.sec.gov/enforcement-litigation/litigation-releases/lr-19147
- SEC Litigation Release 17745, Homestore, 25 September 2002:
  https://www.sec.gov/enforcement-litigation/litigation-releases/lr-17745
- SEC Litigation Release 17588, WorldCom, 27 June 2002:
  https://www.sec.gov/enforcement-litigation/litigation-releases/lr-17588
- SEC Litigation Release 16552, America Online, 15 May 2000:
  https://www.sec.gov/enforcement-litigation/litigation-releases/lr-16552
- SEC Litigation Release 18936, Qwest, 21 October 2004 (archive copy):
  https://web.archive.org/web/2005/http://www.sec.gov/litigation/litreleases/lr18936.htm
- WorldCom, Form 8-K, 21 July 2002:
  https://www.sec.gov/Archives/edgar/data/723527/000090951802000544/mv7-22_8k.txt
- WorldCom, press release, exhibit 99.1 to Form 8-K, 25 June 2002:
  https://www.sec.gov/Archives/edgar/data/723527/000091205702025338/a2083227zex-99_1.txt
- MCI WorldCom, Form 10-K for 1998:
  https://www.sec.gov/Archives/edgar/data/723527/0000950134-99-002242.txt
- Qwest, Form 10-K for 2000:
  https://www.sec.gov/Archives/edgar/data/1037949/000103570401000204/d84707e10-k.txt
- Amazon.com, prospectus (S-1/424B1), 1997:
  https://www.sec.gov/Archives/edgar/data/1018724/0000891020-97-000839.txt
- US House of Representatives, committee hearing on capacity swaps, 24 September and 1 October 2002:
  https://www.govinfo.gov/content/pkg/CHRG-107hhrg81961/html/CHRG-107hhrg81961.htm
- US Department of Justice, press release on the WorldCom/Sprint suit, 27 June 2000:
  https://www.justice.gov/archive/atr/public/press_releases/2000/5049.htm
- Federal Reserve, Alan Greenspan, "The Challenge of Central Banking in a Democratic Society", 5 December 1996:
  https://www.federalreserve.gov/boarddocs/speeches/1996/19961205.htm
- White House, remarks at the signing of the Telecommunications Act, 8 February 1996:
  https://clintonwhitehouse4.archives.gov/WH/EOP/OP/telecom/release.html
- National Audit Office, "The Auction of Radio Spectrum for the Third Generation of Mobile Telephones",
  19 October 2001:
  https://www.nao.org.uk/reports/radiocommunications-agency-the-auction-of-radio-spectrum-for-the-third-generation-of-mobile-telephones

**Company releases**

- Microsoft, "Microsoft and Apple Affirm Commitment...", 6 August 1997:
  https://news.microsoft.com/1997/08/06/microsoft-and-apple-affirm-commitment-to-build-next-generation-software-for-macintosh/
- Amazon.com, "Amazon.com, Inc. Announces Initial Public Offering...", 14 May 1997:
  https://press.aboutamazon.com/1997/5/amazon-com-inc-announces-initial-public-offering-of-3-000-000-shares-of-common-stock

**Newspapers and archives**

- The Guardian, "World's biggest merger puts $115bn squeeze on telecoms companies", 6 October 1999:
  https://www.theguardian.com/business/1999/oct/06/3
- The Guardian, "AOL and Time Warner in $250bn merger", 10 January 2000:
  https://www.theguardian.com/business/2000/jan/10/efinance.internet
- The Guardian, "Mobile phones auction nets £22bn", 28 April 2000:
  https://www.theguardian.com/money/2000/apr/28/business.personalfinancenews
- BBC News, "UK mobile phone auction nets billions", 27 April 2000:
  https://news.bbc.co.uk/2/hi/business/727831.stm
- BBC News, "Global Crossing files for bankruptcy", 28 January 2002:
  https://news.bbc.co.uk/2/hi/business/1787203.stm
- BBC News, Enron timeline, "December 2001: Bankrupt", 2 December 2001:
  https://news.bbc.co.uk/hi/english/static/in_depth/business/2002/enron/timeline/12.stm
- BBC News, "Bankrupt WorldCom resists breakup", 22 July 2002:
  https://news.bbc.co.uk/2/hi/business/2143217.stm
- eWeek, "Vendor Financing Backfires", 23 April 2001:
  https://www.eweek.com/news/vendor-financing-backfires/
- Los Angeles Times (Reuters), "Winstar Files for Bankruptcy, Blames Lucent", 19 April 2001:
  https://www.latimes.com/archives/la-xpm-2001-apr-19-fi-52855-story.html
- EDN, "Qwest-US West pairing alters long-haul landscape", 6 July 2000:
  https://www.edn.com/qwest-us-west-pairing-alters-long-haul-landscape/
- CNNfn, "theglobe.com surges 606%", 13 November 1998 (Wayback copy):
  https://web.archive.org/web/20011210001758/http://money.cnn.com:80/1998/11/13/technology/theglobe/
- CNNfn, "Nasdaq sets record (again)", 10 March 2000 (Wayback copy):
  https://web.archive.org/web/20000311000000id_/http://money.cnn.com/2000/03/10/markets/markets_newyork/
- CNNfn, "Microsoft to buy $5 billion of AT&T stock", 6 May 1999 (Wayback copy):
  https://web.archive.org/web/19990507000000id_/http://money.cnn.com/1999/05/06/technology/att/
- The 1995 Blog, "The 'Netscape Moment,' 20 years on", 2 August 2015:
  https://1995blog.com/2015/08/02/the-netscape-moment-20-years-on/
- Internet History Podcast, "20 Years On: Why Netscape's IPO Was the 'Big Bang'...", 7 August 2015:
  https://www.internethistorypodcast.com/2015/08/20-years-on-why-netscapes-ipo-was-the-big-bang-of-the-internet-era
- Wired, "Aug. 9, 1995: When the Future Looked Bright for Netscape", 9 August 2011:
  https://www.wired.com/2011/08/0809netscape-bright-future/
- Wired, "March 10, 2000: Pop Goes the Nasdaq!", 10 March 2010:
  https://www.wired.com/2010/03/0310nasdaq-bust/

**Opened and not usable**

- Ofcom's 3G auction page returned 403; RCR Wireless's Winstar article returned 403; the SEC's EDGAR company
  search returned 503; `data.sec.gov` returned 404 for the Netscape CIK guess. These were not used.
- PDFs from Jay Ritter's IPO data and the NAO appendix were rejected by the fetcher (`application/pdf`), so the file
  uses individual IPOs (Netscape, Amazon, theGlobe.com) rather than aggregate IPO statistics.
