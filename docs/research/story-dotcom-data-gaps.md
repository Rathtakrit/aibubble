# Dot-com story: lines and companies the data does not have

The nine chapters in `docs/story/dotcom/` use the owner's link kinds: `vendor-loan`, plus the existing
`takeover`, `investment` and `supplier` in `data/past/dotcom/deals.json`. The site relabels `supplier` as
"capacity swap". `vendor-loan` does not exist in the data. IPOs, bankruptcies, debt and venture money are told in
the text only and have no line.

## Lines to add

| id | kind | from | to | amount | date | source link | chapter | result |
|---|---|---|---|---|---|---|---|---|
| 2000-09-30-lucent-winstar | vendor-loan | lucent | winstar | 2 committed; about 0.7 lent by April 2001 | 2000-09-30 | https://www.eweek.com/news/vendor-financing-backfires/ | 06, 07 | added: 2, "committed" |
| 2000-09-30-cisco-icg | vendor-loan | cisco | icg | 0.18 | 2000-09-30 | https://www.eweek.com/news/vendor-financing-backfires/ | 06, 07 | added: 0.18, "paid" |
| 2000-09-30-lucent-leap | vendor-loan | lucent | leap | 1.35 line; 0.111 owed by April 2001 | 2000-09-30 | https://www.eweek.com/news/vendor-financing-backfires/ | 06, 07 | added: 1.35, "up to" |

Amounts are in billions of US dollars. The date 2000-09-30 is approximate for all three lines: the sources give the
year 2000, not the day, and the agreements were made at different points in the year. The day is before ICG's
bankruptcy in November 2000 and Winstar's in April 2001. The drawn and owed figures come from the April 2001
reports in the research file.

## Companies to add

| id | name | why | a value with its source | result |
|---|---|---|---|---|
| netscape | Netscape | the browser maker whose share sale opens the story; not in `companies.json` | offered 5 million shares at $28 and closed at $58.25 on 1995-08-09 (https://www.latimes.com/archives/la-xpm-1995-08-10-fi-33590-story.html) | added: first-day market value $2.9bn; the page states the market value at the $58.25 close (https://www.geschichte-der-informatik.de/articles/fun_fact_netscape_ipo) |
| winstar | Winstar Communications | the customer in the Lucent vendor loan; not in `companies.json` | market value $4,448.1 million on 2000-03-06 (https://www.sec.gov/Archives/edgar/data/868797/000088981200001155/0000889812-00-001155.txt) | added: the 10-K cover page states the market value itself |
| icg | ICG Communications | the customer in the Cisco vendor loan; not in `companies.json` | market value $5,204,544 on 2001-06-20, at $0.10 a share (https://www.sec.gov/Archives/edgar/data/1013240/000102140801503681/d10k.txt) | added: the 10-K cover page states the market value itself |
| leap | Leap Wireless International | the customer in the Lucent credit line; not in `companies.json` | market value $901,992,839 on 2001-03-01, at $31.38 a share (https://www.sec.gov/Archives/edgar/data/1065049/000093639201500032/a70002e10-k.txt) | added: the 10-K cover page states the market value itself |

The Winstar and ICG figures are the market value of stock held by non-affiliates, as their 10-K cover pages
state; the Leap figure is the same measure. The pages give a market value, not a peak value.
