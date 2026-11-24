# How the money moved in the US housing and credit bubble, 2003–2009

Research file, 24 November 2026. This is the base for a story of at most nine chapters told next to the site's
bubble picture. It follows money between two parties, not prices. Every number below has a row in the fact table
(section 3), and every row was written only after opening the page it cites. No Wikipedia page is used.

Pages opened for this file: 33 returned usable text. Two more were opened and answered "page not found". The
refused pages are listed at the end. The pages already checked in `15-housing-data-notes.md` were reused where
they state the same fact, with their links.

Terms, explained once:

- **Subprime loan**: a mortgage to a person with a poor credit record, an unstable income, or little proof of
  either. It charges a higher rate because the chance of missed payments is higher.
- **Mortgage-backed security (MBS)**: a bond whose interest and principal come from a pool of home loans. A lender
  sells the loans; a bank or an agency bundles them and issues the bond.
- **Collateralised debt obligation (CDO)**: a bond built out of other bonds, often mortgage bonds, cut into slices
  that absorb losses in a set order.
- **Credit default swap (CDS)**: a private insurance contract on a bond or a pool of bonds. The protection buyer
  pays a premium; the protection seller pays out if the bond defaults.
- **Repo (repurchase agreement)**: a short-term cash loan against bonds. The borrower agrees to repurchase the
  bonds soon after, usually the next day. If the bonds fall in value, the lender can demand more collateral.
- **Leverage**: holding assets with borrowed money. A leverage ratio of 26.2 times means $26.20 of assets for
  every $1 of the firm's own capital.

---

## 1. Mechanism

A monthly mortgage payment was turned into a bond, the bond was pledged for short-term cash, and when house prices
stopped rising the chain ran backwards: borrowers missed payments, the bonds lost value, lenders demanded more
collateral, and the firms that had insured or borrowed against the bonds had to find cash they did not have.

The chain, step by step:

1. **Homebuyer → lender.** The household pays interest and principal on a subprime or prime mortgage. US household
   mortgage debt rose from 61 percent of GDP in 1998 to 97 percent in 2006 [F1].
2. **Lender → bank or Fannie Mae/Freddie Mac.** The lender sells the loan and gets cash to make another one.
   Countrywide sold $403.0bn of mortgage loans in 2006 and $375.9bn in 2007 [F13]. Fannie Mae's credit book was
   $2.8tn, about 23 percent of US mortgage debt, at 30 September 2007 [F4].
3. **Bank or agency → bond investors.** The loans are bundled into MBS or CDOs and sold. The investors pay cash;
   the bank or agency gets the money back and keeps a fee. Countrywide sold its loans "primarily in the form of
   securities" [F15].
4. **Bond investors and banks → AIG.** Banks and investors paid AIG premiums for CDS protection on bonds. AIG
   insured $527bn of bonds at 31 December 2007, $379bn of it to give banks relief from capital rules [F6].
5. **Bank → repo lender.** A bank borrowed overnight cash against its bonds. Lehman Brothers had $133.5bn of repo
   borrowing at 30 November 2006 [F10]; Bear Stearns had $102.4bn at 30 November 2007 [F12].

**Why it broke.** The chain needed two things that stopped together. House prices had to keep rising, so that a
borrower who could not pay could refinance; and the bonds had to keep a stable value, so that a repo lender would
accept them as collateral. The Case-Shiller 20-city index peaked at 206.52 in July 2006 [F24]. Once it fell, the
loans behind the bonds went bad, the bonds were worth less than the loans against them, and every party that had
promised to make good on them was asked for cash at the same time. The collateral calls on AIG alone reached
$33.9bn by 16 September 2008, of which $22.4bn had been posted [F16]. The Federal Reserve lent AIG $85bn for a
79.9 percent equity interest the same day [F22]. By March 2009 the government had also put $700bn behind the
banking system through TARP [F23], and the Dow had closed at 6,547.05, its lowest since 1997 [F25].

---

## 2. Link types found

The table is one row per way money moved between two parties. "Already in data?" compares the link with the two
`kind` values in `data/past/housing/deals.json`, `investment` and `takeover`. "Drawable?" follows the rule in the
brief: yes only when both ends are companies; otherwise the reason is given.

| Link type | Who pays whom (arrow) | 2–5 real examples with amount and date | Already in data? | Drawable? |
|---|---|---|---|---|
| Mortgage payment | household → lender (monthly interest and principal) | $468.2bn of mortgages originated by Countrywide in 2006 [F13]; $11.8tn of US mortgage debt outstanding at 30 Sep 2007 [F3]; 69% of households owned their home in 2006 [F2] | no — no `kind` for a household payment | no: households |
| Loan sale to a bank or agency | lender → bank or Fannie Mae/Freddie Mac (cash for loans) | Countrywide sold $403.0bn of loans in 2006 and $375.9bn in 2007 [F13]; Fannie Mae held a $2.8tn credit book, 23% of US mortgage debt, at 30 Sep 2007 [F4]; Fannie bought loans by giving lenders Fannie Mae MBS [F5] | no — a loan sale is neither investment nor takeover | yes — both ends can be companies (Countrywide → Fannie Mae) |
| Securitisation: bonds to investors | bond investors → bank or agency (cash for MBS or CDO) | Countrywide sold loans "primarily in the form of securities" [F15]; US mortgage originations were $2.8tn in 2006 and $2.5tn in 2007 [F42]; Fannie issued MBS against the loans it bought [F5] | no | no: public markets |
| CDS premium | banks and investors → AIG (premium for insurance) | AIG insured $527bn of bonds at 31 Dec 2007, $379bn for regulatory capital relief [F6]; AIG booked an $11.5bn unrealised loss on the book in 2007 [F7]; the super-senior book was $78bn, with Goldman at 27% of it [F45] | no | yes — AIG and the banks are companies |
| Collateral call on CDS | banks → AIG (cash collateral) | Total calls $33.879bn and postings $22.445bn at 16 Sep 2008 [F16]; Goldman called $10.065bn and held $7.596bn [F17]; Merrill Lynch held $2.134bn, Societe Generale $5.582bn, UBS $831m on the same day [F18] | no — a collateral payment is neither investment nor takeover | yes — both ends are companies |
| CDS payout through Maiden Lane III | AIG and the New York Fed, through ML III → banks (cash to end the contracts) | ML III paid Goldman $5.6bn on 24 Nov 2008 [F20]; ML III bought $29.3bn of CDOs with a $24.3bn New York Fed loan and $5bn of AIG equity [F21] | no | no: government — ML III is a Fed-backed vehicle, not a company in the data |
| Repo borrowing | bank → cash lender (interest, then repayment) | Lehman had $133.5bn of repo at 30 Nov 2006 [F10]; Bear Stearns had $102.4bn at 30 Nov 2007 [F12]; Merrill Lynch seized and sold $800m of bonds pledged by a Bear Stearns fund on 20 Jun 2007 [F41]; Bear clients pulled $10bn in one day in March 2008 and its reserves fell from $12.4bn to $2bn [F27] | no | yes — both ends are companies |
| Rescue takeover | acquirer → target's shareholders (cash or shares) | JPMorgan and Bear Stearns at $2 a share, $236m, 17 Mar 2008 [F26], closed at about $1.4bn on 30 May 2008 [F27]; Bank of America and Countrywide at about $4bn, 11 Jan 2008 [F31]; Bank of America and Merrill Lynch at $50bn, 15 Sep 2008 [F30]; Wells Fargo and Wachovia at $15.1bn, 3 Oct 2008 [F32]; JPMorgan and Washington Mutual at $1.9bn, 25 Sep 2008 [F28] | yes — five of the seven deal rows are `takeover` | yes |
| Outside stake | investor → bank (cash for new shares) | Berkshire Hathaway put $5bn into Goldman Sachs on 24 Sep 2008, with a right to put in $5bn more at $115 a share [F33]; Mitsubishi UFJ put $9bn into Morgan Stanley for 21% on 13 Oct 2008 [F34] | yes — two of the seven deal rows are `investment` | yes |
| Government rescue or guarantee | government → firm (loan, capital, or loss guarantee) | Federal Reserve lent AIG $85bn for 79.9%, 16 Sep 2008 [F22]; Treasury and FHFA put Fannie Mae and Freddie Mac into conservatorship, 7 Sep 2008 [F35]; the Fed put $30bn behind Bear Stearns, 17 Mar 2008 [F26]; Treasury, Fed and FDIC guaranteed a $306bn Citi asset pool and put in $20bn, 23 Nov 2008 [F37]; TARP put $700bn behind the banks, 3 Oct 2008 [F23] | no — no `kind` for a rescue | no: government |
| Bond insurance | bond investor → monoline insurer (premium); insurer → investor (payout) | MBIA reported a $2.3bn quarterly loss on 31 Jan 2008 [F38]; S&P downgraded several monolines on 19 Dec 2007 [F38] | no | yes — but MBIA is not in `companies.json` |
| Central-bank liquidity | central bank → banks (loans against collateral) | The ECB put €95bn into the eurozone banking market on 9 Aug 2007 [F40]; the Fed, Bank of Canada and Bank of Japan acted the same day [F40] | no | no: government |

Reading the table: the links already in the data are the ones a viewer can draw as a line between two company
bubbles: **rescue takeovers** and **outside stakes**. Everything else either has a household, a government, or the
public bond market at one end, or is a payment that the data's two `kind` values cannot label. That is the main
finding for the story: the biggest flows of money in this bubble were not deals between two companies. They were
payments through the bond market, collateral calls, and government support.

---

## 3. Fact table

Every number in sections 1, 2 and 4 has a row here. The primary link is the page that states the figure and gives
the quote. The second link either states the same figure or independently confirms the event; the row says which.
Dates are the date the page gives, not a date inferred from the file.

| ID | Claim | Number | Date | Primary link | Short quote | Second source link |
|---|---|---|---|---|---|---|
| F1 | US household mortgage debt rose from 61% to 97% of GDP | 61% → 97% | 1998–2006 | [Federal Reserve History, The Great Recession](https://www.federalreservehistory.org/essays/great-recession-and-its-aftermath) | "Mortgage debt of US households rose from 61 percent of GDP in 1998 to 97 percent in 2006." | [Fannie Mae 2008 10-K](https://www.sec.gov/Archives/edgar/data/310522/000095013308000795/w48295e10vk.htm) gives $11.8tn of mortgage debt at 30 Sep 2007 (scale, not the same series) |
| F2 | 69% of US households owned their home in 2006 | 69% (65% in 1995) | 2006 | [Bernanke, The Subprime Mortgage Market, 17 May 2007](https://www.federalreserve.gov/newsevents/speech/bernanke20070517a.htm) | "In 2006, 69 percent of households owned their homes; in 1995, 65 percent did." | [Federal Reserve History](https://www.federalreservehistory.org/essays/great-recession-and-its-aftermath) gives 64% in 1994 to 69% in 2005 — the year differs |
| F3 | US residential mortgage debt outstanding | $11.8tn | 30 Sep 2007 | [Fannie Mae 2008 10-K](https://www.sec.gov/Archives/edgar/data/310522/000095013308000795/w48295e10vk.htm) | "the amount of U.S. residential mortgage debt outstanding was estimated by the Federal Reserve to be approximately $11.8 trillion" | [Federal Reserve History](https://www.federalreservehistory.org/essays/great-recession-and-its-aftermath) on the debt rise (F1) |
| F4 | Fannie Mae's mortgage credit book and share of the market | $2.8tn, about 23% | 30 Sep 2007 | [Fannie Mae 2008 10-K](https://www.sec.gov/Archives/edgar/data/310522/000095013308000795/w48295e10vk.htm) | "was $2.8 trillion as of September 30, 2007, or approximately 23% of total U.S. residential mortgage debt outstanding" | [BBC, 7 Sep 2008](https://news.bbc.co.uk/2/mobile/business/7602992.stm) says the two firms account for "nearly half of the outstanding mortgages" — a different measure |
| F5 | Fannie Mae turned loans into MBS for lenders | no number | 2007 | [Fannie Mae 2008 10-K](https://www.sec.gov/Archives/edgar/data/310522/000095013308000795/w48295e10vk.htm) | "By delivering loans to us in exchange for Fannie Mae MBS, lenders gain the advantage of holding a highly liquid instrument" | [BBC, 7 Sep 2008](https://news.bbc.co.uk/2/mobile/business/7602992.stm) on the two firms' role |
| F6 | AIG's super-senior CDS notional and the part written for capital relief | $527bn; $379bn | 31 Dec 2007 | [AIG 2007 10-K](https://www.sec.gov/Archives/edgar/data/5272/000095012308002280/y44393e10vk.htm) | "Approximately $379 billion of the $527 billion in notional exposure on AIGFP's super senior credit default swap portfolio as of December 31, 2007" | [FCIC/FRASER timeline](https://fraser.stlouisfed.org/archival-collection/financial-crisis-inquiry-commission-4967/aig-goldman-sachs-collateral-call-timeline-updated-520675/fulltext) gives the $78bn SSCDS book (F45) |
| F7 | AIG's 2007 unrealised loss on the CDS book | $11.5bn | 2007 | [AIG 2007 10-K](https://www.sec.gov/Archives/edgar/data/5272/000095012308002280/y44393e10vk.htm) | "an unrealized market valuation loss of $11.5 billion on AIGFP super senior credit default swap portfolio" | [FCIC/FRASER timeline](https://fraser.stlouisfed.org/archival-collection/financial-crisis-inquiry-commission-4967/aig-goldman-sachs-collateral-call-timeline-updated-520675/fulltext) shows the collateral calls that followed |
| F8 | Extra collateral AIG would have to post on a one-notch downgrade | $1.39bn | 14 Feb 2008 | [AIG 2007 10-K](https://www.sec.gov/Archives/edgar/data/5272/000095012308002280/y44393e10vk.htm) | "would permit counterparties to call for approximately $1.39 billion of additional collateral" | [FCIC/FRASER timeline](https://fraser.stlouisfed.org/archival-collection/financial-crisis-inquiry-commission-4967/aig-goldman-sachs-collateral-call-timeline-updated-520675/fulltext) records calls rising to $32.013bn on 15 Sep 2008 |
| F9 | Lehman's total assets and leverage | $503.545bn; 26.2x (net 14.5x) | 30 Nov 2006 | [Lehman Brothers 2006 10-K](https://www.sec.gov/Archives/edgar/data/806085/000110465907010272/a07-4192_110k.htm) | "Total assets $ 503,545"; "Leverage ratio (9) 26.2x"; "Net leverage ratio (10) 14.5x" | [BBC, 16 Sep 2008](https://news.bbc.co.uk/2/mobile/business/7615931.stm) confirms the bankruptcy (F43) |
| F10 | Lehman's repo borrowing | $133.547bn | 30 Nov 2006 | [Lehman Brothers 2006 10-K](https://www.sec.gov/Archives/edgar/data/806085/000110465907010272/a07-4192_110k.htm) | "Securities sold under agreements to repurchase 133,547" | [FCIC/FRASER timeline](https://fraser.stlouisfed.org/archival-collection/financial-crisis-inquiry-commission-4967/aig-goldman-sachs-collateral-call-timeline-updated-520675/fulltext) records "margin calls on repos" in the same market |
| F11 | Bear Stearns's total assets | $395.362bn | 30 Nov 2007 | [Bear Stearns 2007 annual report](https://www.sec.gov/Archives/edgar/data/777001/000091412108000077/be11750956-ex13.txt) | "The Company's total assets at November 30, 2007 increased to $395.4 billion" | [Federal Reserve History](https://www.federalreservehistory.org/essays/support-for-specific-institutions) says "assets of approximately $400 billion in March 2008" |
| F12 | Bear Stearns's repo borrowing | $102.373bn | 30 Nov 2007 | [Bear Stearns 2007 annual report](https://www.sec.gov/Archives/edgar/data/777001/000091412108000077/be11750956-ex13.txt) | "Securities sold under agreements to repurchase 102,373" | [Guardian, 30 May 2008](https://www.theguardian.com/business/2008/may/30/bearstearns.jpmorgan) on the March 2008 run (F27) |
| F13 | Countrywide's mortgage originations and loan sales | $468.172bn originated 2006; $403.035bn sold 2006; $375.937bn sold 2007 | 2006–2007 | [Countrywide 2007 10-K](https://www.sec.gov/Archives/edgar/data/25191/000104746908002104/a2182824z10-k.htm) | "Volume of loans originated $ 415,634 $ 468,172"; "Volume of Mortgage Banking loans sold $ 375,937 $ 403,035" | [Fannie Mae 2008 10-K](https://www.sec.gov/Archives/edgar/data/310522/000095013308000795/w48295e10vk.htm) gives $2.8tn of US originations in 2006 (F42) |
| F14 | Countrywide's nonprime originations | $40.596bn 2006; $16.993bn 2007 | 2006–2007 | [Countrywide 2007 10-K](https://www.sec.gov/Archives/edgar/data/25191/000104746908002104/a2182824z10-k.htm) | "Nonprime Mortgage 16,993 40,596 44,637" | [BBC subprime timeline](https://news.bbc.co.uk/1/hi/business/6945672.stm) on the subprime market that fed these loans (context) |
| F15 | Countrywide sold loans mainly as securities | no number | 2007 | [Countrywide 2007 10-K](https://www.sec.gov/Archives/edgar/data/25191/000104746908002104/a2182824z10-k.htm) | "sold into the secondary mortgage markets, primarily in the form of securities and to a lesser extent in the form of loans" | [Fannie Mae 2008 10-K](https://www.sec.gov/Archives/edgar/data/310522/000095013308000795/w48295e10vk.htm) on the same securitisation step (F5) |
| F16 | Total collateral called on AIG and the amount posted | $33.879bn called; $22.445bn posted | 16 Sep 2008 | [FCIC/FRASER timeline](https://fraser.stlouisfed.org/archival-collection/financial-crisis-inquiry-commission-4967/aig-goldman-sachs-collateral-call-timeline-updated-520675/fulltext) | "Totals $33,879 $22,445" | [Federal Reserve History](https://www.federalreservehistory.org/essays/support-for-specific-institutions) says counterparties "pressed AIG to post collateral" |
| F17 | Goldman's call on AIG and the amount held | $10.065bn called; $7.596bn posted | 16 Sep 2008 | [FCIC/FRASER timeline](https://fraser.stlouisfed.org/archival-collection/financial-crisis-inquiry-commission-4967/aig-goldman-sachs-collateral-call-timeline-updated-520675/fulltext) | "Goldman Sachs Int'l $10,065 $7,596" | [Federal Reserve History](https://www.federalreservehistory.org/essays/support-for-specific-institutions) says counterparties "pressed AIG to post collateral" |
| F18 | Other banks' collateral held by AIG | Merrill $2.134bn; Societe Generale $5.582bn; UBS $831m | 16 Sep 2008 | [FCIC/FRASER timeline](https://fraser.stlouisfed.org/archival-collection/financial-crisis-inquiry-commission-4967/aig-goldman-sachs-collateral-call-timeline-updated-520675/fulltext) | "Merrill Lynch Int'l $3,170 $2,134"; "Societe Generale $9,818 $5,582"; "UBS $1,832 $831" | [Federal Reserve History](https://www.federalreservehistory.org/essays/support-for-specific-institutions) on the collateral pressure across AIG's counterparties |
| F19 | AIG's first Goldman margin call | $1.8bn invoice | 26–27 Jul 2007 | [FCIC/FRASER timeline](https://fraser.stlouisfed.org/archival-collection/financial-crisis-inquiry-commission-4967/aig-goldman-sachs-collateral-call-timeline-updated-520675/fulltext) | "On 7/26/07, Andrew Davilman (Goldman) emailed Alan Frost (AIGFP), informing him that Goldman would be making a margin call"; "the next day, Goldman sent AIG an invoice requesting $1.8 billion in collateral" | [AIG 2007 10-K](https://www.sec.gov/Archives/edgar/data/5272/000095012308002280/y44393e10vk.htm) on the $11.5bn loss the calls fed (F7) |
| F20 | Maiden Lane III's payment to Goldman | $5.6bn | 24 Nov 2008 | [FCIC/FRASER timeline](https://fraser.stlouisfed.org/archival-collection/financial-crisis-inquiry-commission-4967/aig-goldman-sachs-collateral-call-timeline-updated-520675/fulltext) | "Maiden Lane III pays Goldman $5.6 billion to terminate most of the SSCDS contracts between AIGFP and Goldman." | [New York Fed, Maiden Lane](https://www.newyorkfed.org/markets/maidenlane) gives the $29.3bn CDO purchase (F21) |
| F21 | Maiden Lane III's size and funding | $29.3bn CDOs; $24.3bn Fed loan; $5bn AIG equity | 24 Nov 2008 | [New York Fed, Maiden Lane](https://www.newyorkfed.org/markets/maidenlane) | "purchasing $29.3 billion in multi-sector collateralized debt obligations"; "The New York Fed lent ML III LLC approximately $24.3 billion"; "AIG contributed $5 billion of equity" | [FCIC/FRASER timeline](https://fraser.stlouisfed.org/archival-collection/financial-crisis-inquiry-commission-4967/aig-goldman-sachs-collateral-call-timeline-updated-520675/fulltext) dates the creation 24 Nov 2008 |
| F22 | The Federal Reserve's AIG loan and equity interest | $85bn; 79.9% | 16 Sep 2008 | [Federal Reserve press release](https://www.federalreserve.gov/newsevents/press/other/20080916a.htm) | "authorized the Federal Reserve Bank of New York to lend up to $85 billion to the American International Group (AIG)" | [Federal Reserve History](https://www.federalreservehistory.org/essays/support-for-specific-institutions) says Treasury received "a 79.9 percent equity interest" |
| F23 | TARP size and the House vote | $700bn; 263–171 | 3 Oct 2008 | [BBC, 3 Oct 2008](https://news.bbc.co.uk/2/mobile/business/7651060.stm) | "The US House of Representatives has passed a $700bn (£394bn) government plan"; "The 263-171 vote" | [White House, 3 Oct 2008](https://georgewbush-whitehouse.archives.gov/news/releases/2008/10/20081003-11.html) confirms the House passed the bill that day |
| F24 | The Case-Shiller peak, and when the national index passed it | 20-city 206.52; national 184.62; national peak passed in 2016 | Jul 2006; Sep 2016 | [S&P Dow Jones Indices, 29 Nov 2016](https://press.spglobal.com/2016-11-29-The-S-P-CoreLogic-Case-Shiller-National-Index-Reaches-New-High-As-Home-Price-Gains-Continue) | "20-City 206.52 Jul-06"; "National 184.62 Jul-06"; "surpassed the peak set in July 2006" | [BBC, 7 Sep 2008](https://news.bbc.co.uk/2/mobile/business/7602992.stm) on the housing crash that followed (context) |
| F25 | The Dow's low and its earlier peak | 6,547.05; 14,164.53 | 9 Mar 2009; 9 Oct 2007 | [CNN Money, 9 Mar 2009](https://web.archive.org/web/20240525053053/https://money.cnn.com/2009/03/09/markets/markets_newyork/index.htm) | "to end at 6,547.05, its lowest point since April 15, 1997"; "its all-time high of 14,164.53 on Oct. 9, 2007" | [BBC, 16 Sep 2008](https://news.bbc.co.uk/2/mobile/business/7615931.stm) on the September 2008 falls |
| F26 | Bear Stearns's rescue price and the Fed's support | $2 a share; $236m; $30bn | 17 Mar 2008 | [BBC, 17 Mar 2008](https://news.bbc.co.uk/2/mobile/business/7299938.stm) | "for $2 a share - a fraction of its previous value"; "at just $236m"; "the Federal Reserve will fund up to $30bn" | [Federal Reserve History](https://www.federalreservehistory.org/essays/support-for-specific-institutions) gives the $29bn Maiden Lane loan (F27) |
| F27 | Bear Stearns's final sale value and the run of 13 March 2008 | about $1.4bn; $29bn guarantee; $10bn withdrawn in a day; reserves $12.4bn → $2bn that day | 30 May 2008 | [Guardian, 30 May 2008](https://www.theguardian.com/business/2008/may/30/bearstearns.jpmorgan) | "a knockdown price of about $1.4bn"; "the Federal Reserve, which stepped in to guarantee $29bn of Bear's riskiest assets"; "withdrew $10bn of liquidity in a single day" | [BBC, 17 Mar 2008](https://news.bbc.co.uk/2/mobile/business/7299938.stm) gives the opening $2 a share price (F26) |
| F28 | Washington Mutual's sale price and balance sheet | $1.9bn; $307bn assets; $188bn deposits | 25–26 Sep 2008 | [BBC, 26 Sep 2008](https://news.bbc.co.uk/2/mobile/business/7637026.stm) | "sold its assets to JPMorgan Chase for $1.9bn"; "about $307bn of assets but only about $188bn of deposits" | [FDIC failed-bank list, 2008](https://www.fdic.gov/resources/resolutions/bank-failures/in-brief/2008) gives $307,000.0m assets and $188,000.0m deposits (F29) |
| F29 | FDIC's own WaMu figures | $307,000m assets; $188,000m deposits | 25 Sep 2008 | [FDIC failed-bank list, 2008](https://www.fdic.gov/resources/resolutions/bank-failures/in-brief/2008) | "Washington Mutual Bank ... September 25, 2008 $307,000.0 $188,000.0" | [BBC, 26 Sep 2008](https://news.bbc.co.uk/2/mobile/business/7637026.stm) (F28) |
| F30 | Bank of America's Merrill Lynch deal | $50bn; $29 a share | 15 Sep 2008 | [BBC, 15 Sep 2008](https://news.bbc.co.uk/2/mobile/business/7616068.stm) | "a deal worth $50bn"; "about $29 for each Merrill share" | [Guardian, 24 Sep 2008](https://www.theguardian.com/business/2008/sep/24/warrenbuffett.goldmansachs) also gives "$50bn" |
| F31 | Bank of America's Countrywide deal | about $4bn | 11 Jan 2008 | [Guardian, 11 Jan 2008](https://www.theguardian.com/business/2008/jan/11/useconomy.banking) | "America's biggest mortgage lender for around $4bn (£2.05bn) in stock" | [Countrywide 2007 10-K](https://www.sec.gov/Archives/edgar/data/25191/000104746908002104/a2182824z10-k.htm) on the lender's scale (F13) |
| F32 | Wells Fargo's Wachovia deal | $15.1bn | 3 Oct 2008 | [BBC, 3 Oct 2008](https://news.bbc.co.uk/2/mobile/business/7650746.stm) | "Wells Fargo has announced ... Wachovia for $15.1bn (£8.5bn)" | [BBC, 29 Sep 2008](https://news.bbc.co.uk/2/mobile/business/7641733.stm) records Citigroup's earlier government-backed rescue (context) |
| F33 | Berkshire Hathaway's Goldman Sachs stake | $5bn; right to $5bn more at $115 | 24 Sep 2008 | [Guardian, 24 Sep 2008](https://www.theguardian.com/business/2008/sep/24/warrenbuffett.goldmansachs) | "Warren Buffett today agreed to invest $5bn (£2.7bn) in Goldman Sachs"; "the right to ... a further $5bn in ordinary shares at $115 a share" | [Federal Reserve, 21 Sep 2008](https://www.federalreserve.gov/newsevents/press/bcreg/20080921a.htm) on the bank-status change that preceded it (context, not the amount) |
| F34 | Mitsubishi UFJ's Morgan Stanley stake | $9bn; 21% | 13 Oct 2008 | [BBC, 13 Oct 2008](https://news.bbc.co.uk/2/mobile/business/7667500.stm) | "completed a $9bn (£5.2bn) ... a 21% stake in Morgan Stanley" | [Guardian, 24 Sep 2008](https://www.theguardian.com/business/2008/sep/24/warrenbuffett.goldmansachs) says "around $8bn" for "a 20% stake" — the figures differ |
| F35 | The Fannie Mae and Freddie Mac conservatorship | nearly half of US outstanding mortgages | 7 Sep 2008 | [BBC, 7 Sep 2008](https://news.bbc.co.uk/2/mobile/business/7602992.stm) | "The two companies account for nearly half of the outstanding mortgages in the US"; "have been taken over because they posed 'an unacceptable risk' to the economy" | [Treasury statement, 7 Sep 2008](https://home.treasury.gov/news/press-releases/hp1129) confirms the conservatorship that day |
| F36 | Paulson on why conservatorship, not an equity investment | no number | 7 Sep 2008 | [Treasury statement, 7 Sep 2008](https://home.treasury.gov/news/press-releases/hp1129) | "conservatorship was the only form in which I would commit taxpayer money to the GSEs" | [BBC, 7 Sep 2008](https://news.bbc.co.uk/2/mobile/business/7602992.stm) (F35) |
| F37 | The Citigroup loss guarantee and capital injection | $306bn pool; $20bn | 23 Nov 2008 | [Federal Reserve press release](https://www.federalreserve.gov/newsevents/press/bcreg/20081123a.htm) | "an asset pool of approximately $306 billion of loans and securities"; "Treasury will invest $20 billion in Citigroup from the Troubled Asset Relief Program" | [BBC credit-crunch timeline](https://news.bbc.co.uk/2/mobile/business/7521250.stm) records the "$20bn rescue plan" on 23 Nov 2008 |
| F38 | MBIA's loss and the monoline downgrade | $2.3bn | 31 Jan 2008; 19 Dec 2007 | [BBC credit-crunch timeline](https://news.bbc.co.uk/2/mobile/business/7521250.stm) | "a major bond insurer MBIA, announces a loss of $2.3bn"; "Standard and Poor's downgrades its investment rating of a number of so-called monoline insurers" | [BBC credit-crunch timeline, 19 Dec 2007 entry](https://news.bbc.co.uk/2/mobile/business/7521250.stm) gives the downgrade that came before the loss |
| F39 | BNP Paribas's frozen funds and the market for the assets | €2bn; three funds | 9 Aug 2007 | [BBC subprime timeline](https://news.bbc.co.uk/1/hi/business/6945672.stm) | "suspends three investment funds worth 2bn euros (1.4bn)"; "it cannot value the assets in the fund, because the market has disappeared" | [BBC credit-crunch timeline](https://news.bbc.co.uk/2/mobile/business/7521250.stm) says "two of its funds" and "complete evaporation of liquidity" — the count differs |
| F40 | The ECB's first injection | €95bn | 9 Aug 2007 | [BBC credit-crunch timeline](https://news.bbc.co.uk/2/mobile/business/7521250.stm) | "The European Central Bank pumps 95bn euros (£63bn) into the banking market"; "The US Federal Reserve, the Bank of Canada and the Bank of Japan also begin to intervene." | [BBC subprime timeline](https://news.bbc.co.uk/1/hi/business/6945672.stm) records the same day |
| F41 | Merrill Lynch's seizure of Bear Stearns fund collateral | $800m | 20 Jun 2007 | [BBC subprime timeline](https://news.bbc.co.uk/1/hi/business/6945672.stm) | "Merrill Lynch seizes and sells $800m (400m) of bonds that are being used as collateral for loans made to Bear Stearns' hedge funds" | [Guardian, 30 May 2008](https://www.theguardian.com/business/2008/may/30/bearstearns.jpmorgan) on the hedge-fund collapse and Bear's March run (context) |
| F42 | US mortgage originations | $2.8tn 2006; $2.5tn 2007 | 2006–2007 | [Fannie Mae 2008 10-K](https://www.sec.gov/Archives/edgar/data/310522/000095013308000795/w48295e10vk.htm) | "Total mortgage originations declined by an estimated 10% in 2007 from $2.8 trillion in 2006 to $2.5 trillion in 2007." | [Countrywide 2007 10-K](https://www.sec.gov/Archives/edgar/data/25191/000104746908002104/a2182824z10-k.htm) gives one lender's share (F13) |
| F43 | Lehman's bankruptcy | no number | 15 Sep 2008 | [BBC, 16 Sep 2008](https://news.bbc.co.uk/2/mobile/business/7615931.stm) | "Lehman Brothers, the fourth-largest US investment bank, has filed for bankruptcy protection" | [Federal Reserve History](https://www.federalreservehistory.org/essays/support-for-specific-institutions) says Lehman filed on 15 Sep 2008 |
| F44 | AIG's size | about $1tn in assets | mid-2008 | [Federal Reserve History](https://www.federalreservehistory.org/essays/support-for-specific-institutions) | "AIG is a global financial services company that had approximately $1 trillion in reported assets in mid-2008." | [AIG 2007 10-K](https://www.sec.gov/Archives/edgar/data/5272/000095012308002280/y44393e10vk.htm) on the CDS book (F6) |
| F45 | The super-senior CDS book and Goldman's share | $78bn; Goldman 27% | 31 Dec 2007 | [FCIC/FRASER timeline](https://fraser.stlouisfed.org/archival-collection/financial-crisis-inquiry-commission-4967/aig-goldman-sachs-collateral-call-timeline-updated-520675/fulltext) | "Goldman represents 89.4% of posted collateral while it represents about $21 billion or 27% of the $78 billion SSCDS book." | [AIG 2007 10-K](https://www.sec.gov/Archives/edgar/data/5272/000095012308002280/y44393e10vk.htm) gives the $527bn notional (F6) |
| F46 | The House's first vote on TARP | $700bn; 228–205 | 29 Sep 2008 | [BBC, 29 Sep 2008](https://news.bbc.co.uk/2/mobile/business/7641733.stm) | "has voted down a $700bn (£380bn) plan"; "rejected by 228 to 205 votes" | [BBC, 3 Oct 2008](https://news.bbc.co.uk/2/mobile/business/7651060.stm) records the second vote (F23) |
| F47 | The end of the recession | June 2009 | 2007–2009 | [Federal Reserve History, The Great Recession](https://www.federalreservehistory.org/essays/great-recession-of-200709) | "The Great Recession began in December 2007 and ended in June 2009" | [Federal Reserve History, The Great Recession and Its Aftermath](https://www.federalreservehistory.org/essays/great-recession-and-its-aftermath) says "The recession ended in June 2009" |
| F48 | The fall in US home prices from the peak | about 30% | mid-2006 to mid-2009 | [Federal Reserve History, The Great Recession](https://www.federalreservehistory.org/essays/great-recession-of-200709) | "Home prices fell approximately 30 percent, on average, from their mid-2006 peak to mid-2009" | [Federal Reserve History, The Great Recession and Its Aftermath](https://www.federalreservehistory.org/essays/great-recession-and-its-aftermath) says "home prices fell by over a fifth on average across the nation from the first quarter of 2007 to the second quarter of 2011" |
| F49 | Fannie Mae and Freddie Mac's combined loss | about $14bn in the past year | 7 Sep 2008 | [BBC, 7 Sep 2008](https://news.bbc.co.uk/2/mobile/business/7602992.stm) | "But they have made a combined loss of about $14bn in the past year and officials were worried that they would no longer be able to continue functioning if such losses continued." | [Treasury statement, 7 Sep 2008](https://home.treasury.gov/news/press-releases/hp1129) confirms the conservatorship that followed |


---

## 4. Turning points

Nine dated moments in date order. Each gives the company ids from `data/past/housing/companies.json`, what
changed, and a line from the time, not hindsight.

**1. 31 July 2006 — house prices peak.** Company ids: none; this is market-wide. The Case-Shiller 20-city index
reached 206.52 in July 2006 [F24]. The national index did not pass its July 2006 level until September 2016, and
the 20-city index was still 7.1 percent below its peak then [F24]. What changed: the refinancing route that kept
subprime loans current began to close. Quote: the S&P table lists "20-City 206.52 Jul-06" as the peak [F24].

**2. 26 July 2007 — the first AIG collateral call.** Company ids: `aig`, `goldman-sachs`. Goldman told AIG
Financial Products that a margin call was coming, and sent a $1.8bn invoice the next day [F19]. What changed: a
bank treated the CDS it had bought from an insurer as a loan that needed collateral, not as a promise that could
wait. Quote: "Goldman notifies AIGFP that a margin call on the SSCDS is on the way" [F19].

**3. 9 August 2007 — BNP Paribas freezes three funds.** Company ids: none; BNP Paribas is not in the data. The bank
suspended three funds worth €2bn because it could not value the assets [F39]. What changed: banks stopped trusting
each other's mortgage bonds, and the ECB put €95bn into the market the same day [F40]. Quote: BNP "cannot value
the assets in the fund, because the market has disappeared" [F39].

**4. 16 March 2008 — Bear Stearns is rescued.** Company ids: `jpmorgan-chase`, `bear-stearns`. JPMorgan agreed to
take Bear Stearns at $2 a share, $236m, with the Federal Reserve funding up to $30bn of the less liquid assets
[F26]. What changed: a whole investment bank could fail in a week, and the first rescue takeover of the crisis
was done over a weekend. Quote: "$2 a share - a fraction of its previous value" [F26].

**5. 7 September 2008 — Fannie Mae and Freddie Mac are taken into conservatorship.** Company ids: `fannie-mae`,
`freddie-mac`. The government replaced the management of the two firms that account for nearly half of US
outstanding mortgages [F35]. What changed: the middle of the mortgage chain — the firms that turned loans into
MBS — became a government ward. Quote: the firms had "been taken over because they posed 'an unacceptable risk'
to the economy" [F35].

**6. 15 September 2008 — Lehman Brothers files for bankruptcy.** Company ids: `lehman-brothers`. Lehman, the
fourth-largest US investment bank, filed for Chapter 11 [F43]. What changed: the repo lenders and trading
partners of a major bank learned that a bankruptcy could freeze the cash they had lent against bonds. Quote:
"Lehman Brothers, the fourth-largest US investment bank, has filed for bankruptcy protection" [F43].

**7. 16 September 2008 — AIG is rescued.** Company ids: `aig`. The Federal Reserve lent AIG up to $85bn for a
79.9 percent equity interest [F22]. What changed: the insurer that stood behind $527bn of bonds could not meet the
collateral calls, so the government became its creditor and owner [F6]. Quote: "a disorderly failure of AIG could
add to already significant levels of financial market fragility" [F22].

**8. 3 October 2008 — TARP becomes law.** Company ids: none; this is government-wide. The House passed a $700bn
plan by 263 votes to 171 [F23], after rejecting an earlier version by 228 votes to 205 on 29 September [F46].
What changed: the government put public money behind the banking system, not just behind one firm. Quote: "we
have acted boldly to help prevent the crisis on Wall Street from becoming a crisis in communities across our
country" [F23].

**9. 9 March 2009 — the market bottom.** Company ids: none; this is market-wide. The Dow closed at 6,547.05, its
lowest since April 1997 [F25]. What changed: the fall that began after the October 2007 peak of 14,164.53 ended
here in the index, though the recession ran to June 2009 [F47]. Quote: "the Dow ... to end at 6,547.05, its lowest
point since April 15, 1997" [F25].

---

## 5. Disputed or unsure

- **JPMorgan's collateral calls on Lehman Brothers, reported at $8.6bn.** No page opened in this run states who
  paid whom, how much and when. The FCIC filing is a PDF (refused by the fetch tool), CNBC returned 403, and the
  New York Times DealBook lawsuit story returned 404. The claim is therefore not in the fact table and not in
  section 2. What is sourced is Lehman's own repo borrowing of $133.5bn at 30 November 2006 [F10] and Bear's
  $102.4bn at 30 November 2007 [F12]; those are balances, not the calls.
- **Bear Stearns's price.** The opening deal was $2 a share, $236m, on 17 March 2008 [F26]. The completed deal was
  about $1.4bn on 30 May 2008 [F27]. `deals.json` uses $0.24bn, which is the opening value. The BBC credit-crunch
  timeline rounds the opening figure to $240m. All three describe the same opening deal at different precision; a
  story must say which one it means.
- **Mitsubishi UFJ's Morgan Stanley stake.** BBC says $9bn for 21% on 13 October 2008 [F34]. The Guardian, writing
  on 24 September, says "around $8bn" for "a 20% stake". The deal was repriced as Morgan Stanley's shares fell.
  The file uses the BBC's completion figures.
- **The homeownership rate.** Bernanke's May 2007 speech says 69% in 2006 and 65% in 1995 [F2]. The Federal
  Reserve History essay says 64% in 1994 rising to 69% in 2005. The two agree on the peak but not the year or the
  starting point.
- **BNP Paribas's fund count.** The BBC subprime timeline says three funds worth €2bn [F39]. The BBC
  credit-crunch timeline says "two of its funds". The file follows the more detailed timeline and records the
  disagreement here.
- **The Case-Shiller "peak".** 206.52 is the 20-city index in July 2006; the national index peaked at 184.62 in
  the same month [F24]. Calling 206.52 "the US house price peak" mixes two series. The story should name the
  index.
- **AIG's $527bn and $78bn.** The 10-K gives $527bn of super-senior CDS notional at 31 December 2007 [F6]. The
  FRASER timeline gives a $78bn "SSCDS book" and says Goldman was 27% of it [F45]. The $78bn is a narrower book,
  not a contradiction; the story must not use the two as if they were the same measure.
- **AIG's total payments to its trading partners.** The widely reported $22.4bn of collateral paid between
  16 September and 31 December 2008, with Goldman at $12.9bn, comes from a New York Times DealBook page that was
  not opened in this run. The FRASER timeline gives collateral called and posted on 16 September ($33.879bn and
  $22.445bn) [F16], which is a different measure and a different date. The file uses FRASER only.
- **The Fannie Mae and Freddie Mac cost.** No opened page gives a final cost. The BBC page says the Congressional
  Budget Office had estimated a cost but the sentence is cut off in the text returned. The Treasury statement gives
  the structure (preferred stock purchase agreements, a credit facility, MBS purchases) but no dollar total [F36].
- **Washington Mutual's $1.9bn.** That is the price for the banking operations, not for the holding company. The
  FDIC table gives $307bn of assets and $188bn of deposits [F29]; the shares of the holding company were
  effectively wiped out.
- **Lehman's 26.2x leverage.** The 10-K figure is at 30 November 2006, not at the September 2008 failure [F9]. It
  shows the model, not the balance sheet on the last day.
- **The Fed's Bear Stearns support.** The announcement said up to $30bn [F26]; the Maiden Lane structure that
  followed was a $29bn loan against about $30bn of assets, with a $1bn JPMorgan loan [F27]. The two figures are
  the same support described at different stages.
- **TARP's $700bn.** That is the size authorised, not the amount spent, and not the final cost. The BBC page says
  the plan was "aimed at buying up the bad debts" [F23].
- **Countrywide's $4bn.** The price was in stock, so its dollar value moved with Bank of America's share price
  [F31]. The Guardian also notes Countrywide was worth $26bn a year earlier.
- **Two mortgage-debt series in the repo.** This file uses the Federal Reserve History series (61% to 97% of GDP,
  1998–2006) [F1]. The earlier notes in `11-past-bubbles.md` record a second series (46% to 73%, 1990s average to
  2008) that may measure something different. Neither page explains the gap.
- **Pages that refused or failed.** `govinfo.gov` returned a PDF the fetch tool could not read. `fcic.law.stanford.edu`
  timed out. Reuters, CNBC, Bloomberg, the Wall Street Journal and the New York Times refused fetches. The
  Guardian's 15 September 2008 Lehman page returned 403 on a direct fetch; the Bear Stearns and Countrywide pages
  opened. Old BBC desktop article pages now return only a title; the mobile `2/mobile/business/...` pages returned
  the full text and are the ones cited.

---

## Sources

Primary first. Every URL below was opened for this file; the ones that refused are named in section 5.

**The inquiry record**

- Financial Crisis Inquiry Commission, *AIG/Goldman Sachs Collateral Call Timeline (Updated)*, FRASER,
  https://fraser.stlouisfed.org/archival-collection/financial-crisis-inquiry-commission-4967/aig-goldman-sachs-collateral-call-timeline-updated-520675/fulltext

**Company filings (SEC EDGAR)**

- Countrywide Financial, 2007 Form 10-K,
  https://www.sec.gov/Archives/edgar/data/25191/000104746908002104/a2182824z10-k.htm
- Lehman Brothers, 2006 Form 10-K,
  https://www.sec.gov/Archives/edgar/data/806085/000110465907010272/a07-4192_110k.htm
- American International Group, 2007 Form 10-K,
  https://www.sec.gov/Archives/edgar/data/5272/000095012308002280/y44393e10vk.htm
- Bear Stearns, 2007 annual report (SEC exhibit),
  https://www.sec.gov/Archives/edgar/data/777001/000091412108000077/be11750956-ex13.txt
- Fannie Mae, 2008 Form 10-K,
  https://www.sec.gov/Archives/edgar/data/310522/000095013308000795/w48295e10vk.htm

**Federal Reserve, Treasury, FDIC, New York Fed**

- Federal Reserve Board, AIG loan release, 16 September 2008,
  https://www.federalreserve.gov/newsevents/press/other/20080916a.htm
- Federal Reserve Board, Citigroup package, 23 November 2008,
  https://www.federalreserve.gov/newsevents/press/bcreg/20081123a.htm
- Federal Reserve Board, Goldman and Morgan Stanley bank holding status, 21 September 2008,
  https://www.federalreserve.gov/newsevents/press/bcreg/20080921a.htm
- Ben Bernanke, *The Subprime Mortgage Market*, 17 May 2007,
  https://www.federalreserve.gov/newsevents/speech/bernanke20070517a.htm
- Federal Reserve History, *The Great Recession and Its Aftermath*,
  https://www.federalreservehistory.org/essays/great-recession-and-its-aftermath
- Federal Reserve History, *The Great Recession*,
  https://www.federalreservehistory.org/essays/great-recession-of-200709
- Federal Reserve History, *Support for Specific Institutions*,
  https://www.federalreservehistory.org/essays/support-for-specific-institutions
- US Treasury, Paulson statement on Fannie Mae and Freddie Mac, 7 September 2008,
  https://home.treasury.gov/news/press-releases/hp1129
- Federal Reserve Bank of New York, *Maiden Lane Transactions*,
  https://www.newyorkfed.org/markets/maidenlane
- FDIC, *Washington Mutual Bank*,
  https://www.fdic.gov/resources/resolutions/bank-failures/failed-bank-list/wamu.html
- FDIC, *Failed Bank List, 2008*,
  https://www.fdic.gov/resources/resolutions/bank-failures/in-brief/2008
- White House, *President Bush Discusses Emergency Economic Stabilization Act of 2008*, 3 October 2008,
  https://georgewbush-whitehouse.archives.gov/news/releases/2008/10/20081003-11.html

**Market data and news**

- S&P Dow Jones Indices, Case-Shiller release, 29 November 2016,
  https://press.spglobal.com/2016-11-29-The-S-P-CoreLogic-Case-Shiller-National-Index-Reaches-New-High-As-Home-Price-Gains-Continue
- CNN Money, *For Dow, another 12-year low*, 9 March 2009 (Wayback copy),
  https://web.archive.org/web/20240525053053/https://money.cnn.com/2009/03/09/markets/markets_newyork/index.htm
- BBC News, *Sub-prime crisis: Timeline*, https://news.bbc.co.uk/1/hi/business/6945672.stm
- BBC News, *Credit crunch: Timeline*, https://news.bbc.co.uk/2/mobile/business/7521250.stm
- BBC News, *Rescue for troubled Wall St bank*, 17 March 2008,
  https://news.bbc.co.uk/2/mobile/business/7299938.stm
- BBC News, *US takes over key mortgage firms*, 7 September 2008,
  https://news.bbc.co.uk/2/mobile/business/7602992.stm
- BBC News, *Lehman Bros files for bankruptcy*, 16 September 2008,
  https://news.bbc.co.uk/2/mobile/business/7615931.stm
- BBC News, *Merrill Lynch sold in $50bn deal*, 15 September 2008,
  https://news.bbc.co.uk/2/mobile/business/7616068.stm
- BBC News, *Regulator sells Washington Mutual*, 26 September 2008,
  https://news.bbc.co.uk/2/mobile/business/7637026.stm
- BBC News, *Battle to buy Wachovia heats up*, 3 October 2008,
  https://news.bbc.co.uk/2/mobile/business/7650746.stm
- BBC News, *House backs $700bn bail-out plan*, 3 October 2008,
  https://news.bbc.co.uk/2/mobile/business/7651060.stm
- BBC News, *House votes down bail-out package*, 29 September 2008,
  https://news.bbc.co.uk/2/mobile/business/7641733.stm
- BBC News, *Morgan Stanley secures investment*, 13 October 2008,
  https://news.bbc.co.uk/2/mobile/business/7667500.stm
- Guardian, *Bank of America saves Countrywide from bankruptcy*, 11 January 2008,
  https://www.theguardian.com/business/2008/jan/11/useconomy.banking
- Guardian, *Sombre Bear Stearns shareholders consent to bank's sale to JP Morgan*, 30 May 2008,
  https://www.theguardian.com/business/2008/may/30/bearstearns.jpmorgan
- Guardian, *Markets boosted as Warren Buffett invests $5bn in Goldman Sachs*, 24 September 2008,
  https://www.theguardian.com/business/2008/sep/24/warrenbuffett.goldmansachs

**Checked but not used as a source**

- `govinfo.gov` FCIC report PDF: the fetch tool cannot read PDFs.
- `fcic.law.stanford.edu`: timed out.
- Reuters, CNBC, Bloomberg, Wall Street Journal, New York Times: refused.
- Old BBC desktop article pages: only the title and metadata came back. The mobile pages above are the full text.
