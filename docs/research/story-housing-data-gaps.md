# Housing story: lines and companies the data does not have

The nine chapters in `docs/story/housing/` use the link kinds the owner chose: `loan-sale`, `insurance`,
`short-term-loan`, `rescue`, plus the existing `takeover` and `investment` in `data/past/housing/deals.json`.
Only the two deal kinds exist today. Every line below is drawn in a chapter but has no row in the data.

## Lines to add

| id | kind | from | to | amount | date | source link | chapter |
|---|---|---|---|---|---|---|---|
| 2006-12-31-countrywide-fannie-mae | loan-sale | countrywide | fannie-mae | unknown (Countrywide sold $403bn of loans in 2006 in total) | 2006-12-31 | https://www.sec.gov/Archives/edgar/data/25191/000104746908002104/a2182824z10-k.htm | 02 |
| 2006-12-31-countrywide-freddie-mac | loan-sale | countrywide | freddie-mac | unknown (part of the same $403bn) | 2006-12-31 | https://www.sec.gov/Archives/edgar/data/25191/000104746908002104/a2182824z10-k.htm | 02 |
| 2007-12-31-goldman-sachs-aig | insurance | goldman-sachs | aig | unknown premium (AIG insured $527bn of bonds by then) | 2007-12-31 | https://www.sec.gov/Archives/edgar/data/5272/000095012308002280/y44393e10vk.htm | 03 |
| 2007-07-27-aig-goldman-sachs | insurance | aig | goldman-sachs | 1.8 | 2007-07-27 | https://fraser.stlouisfed.org/archival-collection/financial-crisis-inquiry-commission-4967/aig-goldman-sachs-collateral-call-timeline-updated-520675/fulltext | 03 |
| 2007-06-20-merrill-lynch-bear-stearns | short-term-loan | merrill-lynch | bear-stearns | 0.8 | 2007-06-20 | https://news.bbc.co.uk/1/hi/business/6945672.stm | 05 |
| 2008-03-16-us-government-bear-stearns | rescue | us-government | bear-stearns | 30 | 2008-03-16 | https://news.bbc.co.uk/2/mobile/business/7299938.stm | 05 |
| 2008-09-07-us-government-fannie-mae | rescue | us-government | fannie-mae | unknown | 2008-09-07 | https://home.treasury.gov/news/press-releases/hp1129 | 06 |
| 2008-09-07-us-government-freddie-mac | rescue | us-government | freddie-mac | unknown | 2008-09-07 | https://home.treasury.gov/news/press-releases/hp1129 | 06 |
| 2008-09-16-us-government-aig | rescue | us-government | aig | 85 | 2008-09-16 | https://www.federalreserve.gov/newsevents/press/other/20080916a.htm | 08 |
| 2008-09-16-aig-goldman-sachs | insurance | aig | goldman-sachs | 10.065 called, 7.596 posted | 2008-09-16 | https://fraser.stlouisfed.org/archival-collection/financial-crisis-inquiry-commission-4967/aig-goldman-sachs-collateral-call-timeline-updated-520675/fulltext | 08 |
| 2008-11-24-aig-goldman-sachs | insurance | aig | goldman-sachs | 5.6 | 2008-11-24 | https://www.newyorkfed.org/markets/maidenlane | 09 |

Amounts are in billions of US dollars. "Unknown" means the opened pages give the total but not the part on this
line.

## Companies to add

| id | name | why | a value with its source |
|---|---|---|---|
| us-government | US government (Federal Reserve, Treasury and FHFA together) | pays the rescue lines to Bear Stearns, Fannie Mae, Freddie Mac and AIG | no value; how it is drawn is a later design step |
