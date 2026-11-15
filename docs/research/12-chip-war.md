# The chip war: sourced facts, 2018 to November 2026

Research file, 15 November 2026. Background facts for a possible "chip war" section: the contest over advanced AI
chips between the United States, China, Taiwan, the Netherlands, Japan and South Korea.

Every row was written only after opening a page that states it. Each row carries the date the source gives, the fact
with its number, the page I opened, the publisher, and a Checked cell: `opened` means the page loaded in this run,
`archive copy` means the live page refused and I read the archived copy at web.archive.org. A search-result excerpt
was never used as a source; anything I only saw in a search result is in the last section.

One method note. For Federal Register rules (federalregister.gov), the human-readable document page on this site
served only a short script shell to this machine on most attempts — about 1,200 characters with no rule text — while
the register's own document record for the same document number, at
`https://www.federalregister.gov/api/v1/documents/<number>.json`, returned the title, abstract and effective dates.
Rows for those rules cite the document page a reader would open and the fact was read from that record. Three rules
(the 2019 Huawei listing, the 7 October 2022 rule and the 25 October 2023 rule) did return full text on the document
page itself.

This file states facts and dates only. It takes no view on who is right or what happens next.

Terms used below, explained once:

- **Export control**: a government rule that says a product may not be sold to a named country or company without a
  licence.
- **Licence**: written government permission to make that sale.
- **Entity List**: the US Commerce Department's list of companies and bodies that need a licence for most US-made
  parts. Being on it is not a finding of wrong doing; it means the US government wants to check each sale.
- **Foundry**: a factory that makes chips designed by other companies. TSMC and SMIC are foundries.
- **Advanced node**: the smallest circuit size a factory can make. "7 nanometre" (7nm) means circuits about 7
  billionths of a metre across. Smaller is generally faster and cheaper per calculation.
- **Lithography machine**: the machine that prints a chip's pattern onto a silicon wafer. ASML is the only maker of
  the most advanced kind (EUV).
- **EUV**: extreme ultraviolet lithography, the newest printing method, needed for the most advanced chips.
- **HBM / DRAM / NAND**: three kinds of memory chip. DRAM is working memory, NAND is storage.
- **Fab**: short for fabrication plant, a chip factory.
- **Wafer**: the round silicon disc that chips are printed on.
- **Revenue share**: an arrangement where a company pays a government a percentage of sales made under a licence.
- **Tariff**: a tax charged when goods cross a border.
- **Section 232**: the US law that lets the president put tariffs on imports on national security grounds.
- **Subsidy / grant**: government money given to a company, here to build factories.
- **Fiscal year (FY)**: a company's own 12-month accounting year. Nvidia's FY2026 ended 25 January 2026.

---

## Table A. Timeline, one row per event

Where a rule's effective date and its date of publication in the Federal Register differ, the Date cell gives the
effective date the rule states; the URL usually shows the publication date.

| Date | Event, in one plain sentence, with its number | Countries and companies named | URL | Publisher | Checked |
|---|---|---|---|---|---|
| 16 May 2019 | The US Commerce Department's Bureau of Industry and Security added Huawei Technologies and its non-US affiliates to the Entity List, effective 16 May 2019 and published on 21 May 2019. | United States, China; Huawei | https://www.federalregister.gov/documents/2019/05/21/2019-10616/addition-of-entities-to-the-entity-list | Federal Register (BIS rule, 84 FR 22961) | opened |
| December 2020 | The US Commerce Department added the Chinese chip foundry SMIC to the Entity List. | United States, China; SMIC | https://en.wikipedia.org/wiki/Semiconductor_Manufacturing_International_Corporation | Wikipedia | opened |
| 9 August 2022 | The CHIPS and Science Act was signed into law, appropriating $52.7 billion for semiconductors: $39 billion in subsidies for chip factories on US soil and $13 billion for research and training. | United States | https://en.wikipedia.org/wiki/CHIPS_and_Science_Act | Wikipedia | opened |
| 9 August 2022 | The same Act's money is split by the CHIPS Program Office into $39 billion of incentives for factories and equipment and $11 billion into a research and development ecosystem. | United States | https://www.chips.gov/ | CHIPS for America (US Department of Commerce) | opened |
| 1 September 2022 | Nvidia said the US government now required a licence, effective immediately, for exports of its A100 and H100 AI chips and the systems containing them to China and Russia, and that about $400 million of sales to China could be affected. | United States, China; Nvidia, AMD | https://www.bbc.co.uk/news/business-62747401 | BBC News | opened |
| 7 October 2022 | The US Bureau of Industry and Security issued its advanced computing rules: new export control numbers 3A090 and 4A090 for high-performance chips, controls on tools for logic chips at 16/14nm and below, DRAM at 18nm half-pitch or less and NAND with 128 layers or more, and a bar on "US persons" supporting chip production at certain Chinese factories. | United States, China | https://www.bis.gov/press-release/commerce-implements-new-export-controls-advanced-computing-semiconductor-manufacturing-items-peoples | Bureau of Industry and Security | opened |
| 7, 12 and 21 October 2022 | The same rule took effect in three stages: tool controls on 7 October, the US-persons restriction on 12 October, and the advanced computing and supercomputer controls on 21 October 2022. | United States, China | https://www.federalregister.gov/documents/2022/10/13/2022-21658/implementation-of-additional-export-controls-certain-advanced-computing-and-semiconductor | Federal Register (BIS rule, 87 FR 62186) | opened |
| 31 March 2023 | Japan said it would restrict exports of 23 types of semiconductor manufacturing equipment, with the measures planned to take effect in July 2023. | Japan, China | https://www.bbc.co.uk/news/business-65134017 | BBC News | opened |
| 30 June 2023 | The Netherlands announced export restrictions on advanced semiconductor manufacturing equipment, a move that would particularly affect ASML. | Netherlands, China; ASML | https://www.bbc.co.uk/news/business-66063594 | BBC News | opened |
| 3 July 2023 | China's Ministry of Commerce said special licences would be needed to export gallium and germanium from the following month; China is the world's biggest producer of both metals, which are used in chips. | China | https://www.bbc.co.uk/news/business-66093114 | BBC News | opened |
| 6 September 2023 | Huawei launched its Mate 60 smartphone, powered by a Kirin 9000s chip made inside China by SMIC, the first processor to use SMIC's 7nm process. | China; Huawei, SMIC | https://en.wikipedia.org/wiki/Semiconductor_Manufacturing_International_Corporation | Wikipedia | opened |
| 17 to 25 October 2023 | The US issued a second wave of chip export rules, published on 25 October 2023, targeting chipmaking tools and more advanced chips including two Nvidia parts, and China's foreign ministry said the curbs "violate the principles of the market economy and fair competition". | United States, China; Nvidia | https://www.bbc.co.uk/news/business-67141987 | BBC News | opened |
| 25 October 2023 | The same US rule added a "performance density" measure, described by BIS as a way to stop buyers working around the limits "by simply purchasing a larger number of smaller datacenter AI chips". | United States, China | https://www.federalregister.gov/documents/2023/10/25/2023-23055/implementation-of-additional-export-controls-certain-advanced-computing-items-supercomputer-and | Federal Register (BIS rule, 88 FR 73458) | opened |
| 8 April 2024 | TSMC won $6.6 billion of US subsidies plus up to $5 billion of loans, and raised its Arizona investment from $40 billion to $65 billion. | United States, Taiwan; TSMC | https://www.bbc.co.uk/news/business-68763232 | BBC News | opened |
| 24 May 2024 | China set up its third state chip fund, the National Integrated Circuit Industry Investment Fund III, with registered capital of 344 billion yuan, about US$47.5 billion, larger than the first two. | China | https://en.wikipedia.org/wiki/China_Integrated_Circuit_Industry_Investment_Fund | Wikipedia | opened |
| 6 September 2024 | The Netherlands expanded its national export control measure for advanced semiconductor manufacturing equipment, effective 7 September 2024. | Netherlands; ASML | https://www.government.nl/topics/export-controls-of-strategic-goods | Government of the Netherlands | opened |
| 2024, reported 15 January 2026 | TSMC's Arizona factory opened and now makes chips for Nvidia, Apple, AMD and other US companies; the BBC says it was built with the help of $40 billion of US subsidies. | United States, Taiwan; TSMC, Nvidia, Apple, AMD | https://www.bbc.co.uk/news/articles/c3dmpr37yxlo | BBC News | opened |
| 2 December 2024 | BIS added new controls on high bandwidth memory (HBM) chips needed for advanced AI, new foreign direct product rules aimed at advanced-node chips, and new controls on chipmaking tools and software keys. | United States, China | https://www.federalregister.gov/documents/2024/12/05/2024-28270/foreign-produced-direct-product-rule-additions-and-refinements-to-controls-for-advanced-computing | Federal Register (BIS rule, 89 FR 96790) | opened |
| 9 December 2024 | China's market regulator opened an investigation into Nvidia, described by the BBC as a new front in the chip war. | China; Nvidia | https://www.bbc.co.uk/news/articles/cx2vkd90mk8o | BBC News | opened |
| 15 January 2025 | BIS published the "Framework for Artificial Intelligence Diffusion", revising controls on advanced computing chips and adding a control on AI model weights for certain closed dual-use models. | United States | https://www.federalregister.gov/documents/2025/01/15/2025-00636/framework-for-artificial-intelligence-diffusion | Federal Register (BIS rule, 90 FR 4544) | opened |
| 15 January 2025 | The Netherlands said it would modify its national export control measure for advanced semiconductor manufacturing equipment on 1 April 2025. | Netherlands; ASML | https://www.government.nl/topics/export-controls-of-strategic-goods | Government of the Netherlands | opened |
| 16 January 2025 | BIS added due diligence procedures for foundries and chip assembly firms to check that advanced chips are not being passed to restricted buyers. | United States | https://www.federalregister.gov/documents/2025/01/16/2025-00711/implementation-of-additional-due-diligence-measures-for-advanced-computing-integrated-circuits | Federal Register (BIS rule, 90 FR 5298) | opened |
| 9 April 2025 | The US government told Nvidia that a licence was required to export its H20 chip to China (including Hong Kong and Macau) and D:5 countries; on 14 April it said the requirement would last "for the indefinite future". | United States, China; Nvidia | https://www.sec.gov/Archives/edgar/data/1045810/000104581025000082/nvda-20250409.htm | Nvidia Form 8-K, SEC | opened |
| 15 April 2025 | Nvidia said its quarter to 27 April 2025 would include up to about $5.5 billion of charges for H20 inventory, purchase commitments and related reserves. | United States; Nvidia | https://www.sec.gov/Archives/edgar/data/1045810/000104581025000082/nvda-20250409.htm | Nvidia Form 8-K, SEC | opened |
| 13 May 2025 | The US Commerce Department announced it was rescinding the AI Diffusion Rule, told enforcement officials not to enforce it, added licence requirements for AI chip exports to Malaysia and Thailand, and issued guidance naming Huawei Ascend chips as a diversion risk. | United States, China, Malaysia, Thailand; Huawei | https://www.bis.gov/press-release/department-commerce-announces-rescission-biden-era-artificial-intelligence-diffusion-rule-strengthens | Bureau of Industry and Security | opened |
| 7 August 2025 | President Trump said he planned a 100% tariff on semiconductors imported into the United States, and that companies could avoid it by investing in the US. | United States | https://www.bbc.co.uk/news/articles/cly3r664q1eo | BBC News | opened |
| 10 August 2025 | Nvidia and AMD agreed to pay the US government 15% of their revenues from H20 and MI308 chip sales in China in return for export licences. | United States, China; Nvidia, AMD | https://www.bbc.com/news/articles/cvgvvnx8y19o | BBC News | opened |
| 22 August 2025 | US Commerce Secretary Howard Lutnick said the federal government would take a 10% stake in Intel. | United States; Intel | https://www.bbc.co.uk/news/articles/cvg3zpdl3xdo | BBC News | opened |
| August 2025 | The US government granted licences allowing Nvidia to ship certain H20 products to certain China-based customers; Nvidia later reported about $60 million of H20 revenue under those licences. | United States, China; Nvidia | https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm | Nvidia Form 10-K FY2026, SEC | opened |
| 2 September 2025 | BIS revoked the Validated End-User authorisations in China held by Intel Semiconductor (Dalian), Samsung China Semiconductor and SK hynix Semiconductor (China), effective 31 December 2025. | United States, China; Intel, Samsung, SK hynix | https://www.federalregister.gov/documents/2025/09/02/2025-16735/revocation-of-validated-end-user-authorizations-in-the-peoples-republic-of-china | Federal Register (BIS rule, 90 FR 42321) | opened |
| 12 September 2025 | BIS added 32 entities to the Entity List, 23 of them in China, plus one each in India, Iran, Singapore and Taiwan, three in Turkey and two in the UAE. | United States, China, India, Iran, Singapore, Taiwan, Turkey, UAE | https://www.federalregister.gov/documents/2025/09/16/2025-17893/additions-and-revisions-to-the-entity-list | Federal Register (BIS rule, 90 FR 44496) | opened |
| 29 September 2025 | BIS published an interim final rule making any company at least 50% owned by one or more Entity List companies automatically subject to the same restrictions. | United States, China | https://www.federalregister.gov/documents/2025/09/30/2025-19001/expansion-of-end-user-controls-to-cover-affiliates-of-certain-listed-entities | Federal Register (BIS rule, 90 FR 47201) | opened |
| 6 October 2025 | Huawei unveiled what it called its most powerful chips and a three-year plan to challenge Nvidia's dominance, and said it would make its designs and software available to Chinese firms. | China; Huawei, Nvidia | https://www.bbc.co.uk/news/articles/cgmz2vm3yv8o | BBC News | opened |
| 8 October 2025 | BIS added 29 entries (26 entities and 3 addresses) to the Entity List, 19 of them in China, nine in Turkey and one in the UAE. | United States, China, Turkey, UAE | https://www.federalregister.gov/documents/2025/10/09/2025-19508/additions-to-the-entity-list | Federal Register (BIS rule, 90 FR 48193) | opened |
| 9 October 2025 | China's Ministry of Commerce announced new rare earth export controls, including a rule covering foreign-made items in which Chinese rare earths make up 0.1% or more of the value, and said licences were unlikely for arms makers and certain chip companies. | China | https://cset.georgetown.edu/publication/mofcom-notice-2025-61/ | Center for Security and Emerging Technology (English translation of MOFCOM Notice 2025 No. 61) | opened |
| 9 October 2025 | The BBC reported that the new Chinese rules make clear licences are unlikely to be issued to arms manufacturers and certain companies in the chip industry, and that even the technology to mine, process or make magnets from rare earths needs permission to export. | China | https://www.bbc.co.uk/news/articles/ckgzl0nwvd7o | BBC News | opened |
| 10 November 2025 | BIS stayed the 50%-owned affiliates rule until 9 November 2026. | United States, China | https://www.federalregister.gov/documents/2025/11/12/2025-19846/one-year-suspension-of-expansion-of-end-user-controls-for-affiliates-of-certain-listed-entities | Federal Register (BIS final rule, 90 FR 50857) | opened |
| 8 December 2025 | President Trump said he would allow Nvidia to sell its H200 chip to "approved customers" in China and collect a 25% fee, after reversing an earlier chip-selling ban in July 2025 and demanding 15% of Nvidia's China revenues; Beijing had reportedly ordered Chinese firms to stop buying Nvidia chips made for the Chinese market. | United States, China; Nvidia, AMD | https://www.bbc.co.uk/news/articles/ckg9q635q6po | BBC News | opened |
| 14 January 2026 | The BBC reported the US had approved sales of Nvidia's H200 chips to China under a revised policy that also collects a 25% fee and requires Chinese customers to show sufficient security procedures and not use the chips for military purposes. | United States, China; Nvidia | https://www.bbc.co.uk/news/articles/cg4erx1n04lo | BBC News | opened |
| 15 January 2026 | BIS changed its licence review policy for Nvidia H200 chips and equivalents, and less advanced chips, from a presumption of denial to case-by-case review for China and Macau. | United States, China; Nvidia | https://www.federalregister.gov/documents/2026/01/15/2026-00789/revision-to-license-review-policy-for-advanced-computing-commodities | Federal Register (BIS rule, 91 FR 1684) | opened |
| 15 January 2026 | The US said it would cut tariffs on goods from Taiwan to 15%, in exchange for at least $250 billion of new direct investment by Taiwanese semiconductor and technology firms, with carve-outs from tariffs for Taiwanese chip companies investing in the US. | United States, Taiwan; TSMC | https://www.bbc.co.uk/news/articles/c3dmpr37yxlo | BBC News | opened |
| February 2026 | The US government granted a licence allowing Nvidia to ship small amounts of H200 products to specific China-based customers, with US inspection before shipment and a 25% tariff on import into the United States; Nvidia had no H200 revenue from it as of its 10-K. | United States, China; Nvidia | https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm | Nvidia Form 10-K FY2026, SEC | opened |
| 7 April 2026 | BIS extended by about eight months the date for firms to apply to become "approved IC designers", to 31 December 2026. | United States | https://www.federalregister.gov/documents/2026/04/09/2026-06851/extension-of-authorized-integrated-circuit-ic-designer-status-and-application-deadline-to-become-an | Federal Register (BIS rule, 91 FR 17851) | opened |
| 16 July 2026 | TSMC pledged another $100 billion for US production, taking its total US commitment to $265 billion, and reported a 77% jump in second-quarter net profit to $22 billion. | Taiwan, United States; TSMC | https://www.bbc.co.uk/news/articles/c62x8ldxr7eo | BBC News | opened |
| 7 August 2026 | President Trump signed an executive order imposing a 15% tariff on imported products made from polysilicon, a material used in chips and solar panels, and setting minimum import prices on polysilicon and related products. | United States, China | https://www.bbc.co.uk/news/articles/cdrvn686dljo | BBC News | opened |
| 9 November 2026 | BIS extended the stay of the 50%-owned affiliates rule again, now until 10 January 2027. | United States, China | https://www.federalregister.gov/documents/2026/11/09/2026-22793/extension-of-the-suspension-of-expansion-of-end-user-controls-for-affiliates-of-certain-listed | Federal Register (BIS final rule, 91 FR 70789) | opened |

---

## Table B. Numbers

Money as the page prints it. Where I divided one number by another to get a share, the row says so.

| Date or period | Figure | URL | Publisher | Checked |
|---|---|---|---|---|
| FY2026 (year to 25 January 2026) | Nvidia revenue from customers headquartered in China, including Hong Kong: $19,677 million, out of $215,938 million total (about 9%, my division). | https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm | Nvidia Form 10-K FY2026, SEC | opened |
| FY2025 | Nvidia revenue from China, including Hong Kong, restated: $25,048 million, out of $130,497 million total (about 19%, my division). | https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm | Nvidia Form 10-K FY2026, SEC | opened |
| FY2024 | Nvidia revenue from China, including Hong Kong, restated: $12,330 million, out of $60,922 million total (about 20%, my division). | https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm | Nvidia Form 10-K FY2026, SEC | opened |
| FY2026 | Nvidia changed its revenue-by-country table in the third quarter of FY2026 to group customers by where their head office is, and restated earlier years the same way, so these China figures are not the ones Nvidia printed at the time. | https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm | Nvidia Form 10-K FY2026, SEC | opened |
| FY2026, first quarter | Nvidia took a $4.5 billion charge for H20 excess inventory and purchase obligations after the April 2025 licence requirement. | https://www.sec.gov/Archives/edgar/data/1045810/000104581025000209/nvda-20250727.htm | Nvidia Form 10-Q, SEC | opened |
| 15 April 2025 | Nvidia's first estimate of the H20 hit was "up to approximately $5.5 billion" of charges; the charge it actually took was $4.5 billion. | https://www.sec.gov/Archives/edgar/data/1045810/000104581025000082/nvda-20250409.htm | Nvidia Form 8-K, SEC | opened |
| FY2026 | Nvidia generated about $60 million of H20 revenue under the August 2025 licences. | https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm | Nvidia Form 10-K FY2026, SEC | opened |
| FY2026 | US officials "expressed an expectation" that the US government would receive 15% or more of the revenue from licensed Nvidia sales, but no regulation codifying that was published. | https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm | Nvidia Form 10-K FY2026, SEC | opened |
| FY2026 | Any H200 shipped under the February 2026 licence would face a 25% tariff on import into the United States. | https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm | Nvidia Form 10-K FY2026, SEC | opened |
| FY2026 | Nvidia's revenue from customers headquartered outside the United States was 31% of total, against 41% in FY2025 and 48% in FY2024. | https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm | Nvidia Form 10-K FY2026, SEC | opened |
| 9 August 2022 | The CHIPS and Science Act appropriates $52.7 billion: $39 billion of factory subsidies, $13 billion of research and training, and 25% investment tax credits for manufacturing equipment. | https://en.wikipedia.org/wiki/CHIPS_and_Science_Act | Wikipedia | opened |
| 8 April 2024 | TSMC's US award: $6.6 billion in subsidies plus $5 billion in possible loans, against a $65 billion Arizona plan. | https://www.bbc.co.uk/news/business-68763232 | BBC News | opened |
| 16 July 2026 | TSMC's total committed US investment reached $265 billion after a further $100 billion pledge; it said the increase would likely mean four more plants in Arizona. | https://www.bbc.co.uk/news/articles/c62x8ldxr7eo | BBC News | opened |
| April to June 2026 | TSMC's quarterly net profit was $22 billion, up 77% from $12.4 billion a year earlier. | https://www.bbc.co.uk/news/articles/c62x8ldxr7eo | BBC News | opened |
| 2025 (explainer updated 7 August 2025) | TSMC provides more than half of the world's semiconductor supply, according to the BBC's explainer. | https://www.bbc.co.uk/news/articles/cly3r664q1eo | BBC News | opened |
| 2024 | ASML's total net sales were €28.3 billion and net income €7.6 billion; it guided 2025 sales to €30 billion to €35 billion. | https://web.archive.org/web/2025/https://www.asml.com/en/news/press-releases/2025/q4-2024-financial-results | ASML press release, 29 January 2025 (archive copy) | archive copy |
| FY2024 to 2026 | Nvidia's China revenue fell from about 20% of total in FY2024 to about 9% in FY2026 on the restated basis (my division of the figures above). | https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm | Nvidia Form 10-K FY2026, SEC | opened |
| November 2024 | Intel's CHIPS Act grant was cut from an announced $8.5 billion to $7.86 billion. | https://en.wikipedia.org/wiki/CHIPS_and_Science_Act | Wikipedia | opened |
| FY2026 | Nvidia's top country by revenue in FY2026 was the United States at $149,617 million, followed by Taiwan at $42,345 million and China at $19,677 million. | https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm | Nvidia Form 10-K FY2026, SEC | opened |
| FY2026 | Of Nvidia's data centre revenue from Taiwan-headquartered customers in FY2026, it estimates 76% went to end customers based in the United States and Europe. | https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm | Nvidia Form 10-K FY2026, SEC | opened |
| 15 January 2026 | Taiwanese semiconductor and technology firms committed to at least $250 billion of new direct investment in the US as part of the tariff deal. | https://www.bbc.co.uk/news/articles/c3dmpr37yxlo | BBC News | opened |
| 22 August 2025 | Intel: the US government took a 10% stake, announced on 22 August 2025. | https://www.bbc.co.uk/news/articles/cvg3zpdl3xdo | BBC News | opened |

---

## Table C. People and books a reader could start with

| Title or person | Author | Year | URL | One line on what it covers | Checked |
|---|---|---|---|---|---|
| *Chip War: The Fight for the World's Most Critical Technology* | Chris Miller | 2022 | https://en.wikipedia.org/wiki/Chip_War | History of the chip industry and the US-China contest over it; 464 pages, published by Scribner in October 2022. | opened |
| *The Thinking Machine: Jensen Huang, Nvidia and the World's Most Coveted Microchip* | Stephen Witt | 2025 | https://en.wikipedia.org/wiki/The_Thinking_Machine:_Jensen_Huang,_Nvidia_and_the_World%27s_Most_Coveted_Microchip | A biography of Jensen Huang and Nvidia; the page says it won the Financial Times Business Book of the Year. | opened |
| *The Soul of a New Machine* | Tracy Kidder | 1981 | https://en.wikipedia.org/wiki/The_Soul_of_a_New_Machine | How a team designed a new computer at Data General; published by Little, Brown in July 1981, 293 pages. | opened |
| Morris Chang | — | born 1931 | https://en.wikipedia.org/wiki/Morris_Chang | Founded TSMC and chaired it from 1987 to 2018; the foundry model that made Taiwan central to chip making. | opened |
| Jensen Huang | — | born 1963 | https://en.wikipedia.org/wiki/Jensen_Huang | Co-founder and chief executive of Nvidia, the company whose chips the export rules mostly target. | opened |
| Chris Miller | — | American historian | https://en.wikipedia.org/wiki/Chris_Miller_(academic) | The historian who wrote *Chip War*; the page is his short biography. | opened |

---

## Not found / doubts

1. **Huawei Entity List, 2019 — affiliate count.** The Federal Register rule states that BIS added Huawei
   Technologies and "non-U.S. affiliates" to the Entity List, effective 16 May 2019 (published 21 May 2019), but the
   page I opened did not state the number of affiliates. A count of 68 affiliates appears in search results and in
   some news copy; I did not open a page stating it, so the count is not in Table A.
   https://www.federalregister.gov/documents/2019/05/21/2019-10616/addition-of-entities-to-the-entity-list

2. **The AI Diffusion Rule's real start date.** The Federal Register dates field for the 15 January 2025 rule says
   "effective January 13. 2025", which cannot be right for a rule published on 15 January. BIS's 13 May 2025 press
   release says its compliance requirements were "set to come into effect on May 15, 2025". I have used BIS's own
   description and left the Federal Register field as published.

3. **TSMC's March 2025 announcement of $100 billion.** The July 2026 BBC report says TSMC pledged "another $100bn"
   and that this took the total to $265bn. That arithmetic implies an earlier $165bn commitment, but I did not open a
   page that states the March 2025 announcement itself, so the timeline carries the July 2026 figure only.

4. **ASML's China share of sales.** Company press releases and the 2024 annual report opened only through
   web.archive.org, and neither page I read gave the China share of system sales for 2024 or 2025. asml.com refuses
   fetches from this machine. No ASML China-share row is in Table B. Only ASML's group sales and profit are there.

5. **CHIPS Act grant totals by company (Samsung, Micron, GlobalFoundries, SK hynix).** commerce.gov and nist.gov
   press-release pages refused fetches (403/404) for the individual award announcements I tried, and the chips.gov
   home page did not list them. Intel's cut from $8.5 billion to $7.86 billion is in Table B from Wikipedia, and the
   TSMC award is there from the BBC; the other companies' awards are not in this file.

6. **China customs guidance against buying Nvidia chips, September 2025.** The stop-buying order is reported in the
   BBC's 8 December 2025 article, which says Beijing "reportedly ordered" it, and that row is in Table A with that
   wording. I found no page for a reported Chinese anti-dumping probe into US analogue chips.

7. **Section 232 semiconductor tariff investigation, April 2025.** Only the 100% tariff plan of 7 August 2025 and the
   15% polysilicon tariff of 7 August 2026 are in Table A. The formal investigation notice is not.

8. **Japan's METI page for the 23 items.** meti.go.jp returned 403 on every attempt in this run. The Japan row rests
   on the BBC report of 31 March 2023 and does not give the full list of the 23 items.

9. **`The Chip` by T. R. Reid (1985).** The Wikipedia article titles I tried returned 404, so the book is not in
   Table C. It would be a good first book if a page stating it can be found.

10. **Nvidia's later China-specific chips.** The brief asked about H20 and later China-specific parts. This file has
    the H20 licence, the 15% revenue arrangement and the H200 decision. It has nothing on any chip designed after
    the H200 for the Chinese market, because no page I opened named one.

11. **Pages that refused a fetch in this run:** reuters.com, cnbc.com, apnews.com, commerce.gov, congress.gov,
    asml.com, intel.com, meti.go.jp (intermittent), axios.com, politico.com, scmp.com, japantimes.co.jp. The AP story
    on the 15% revenue-share deal and the commerce.gov CHIPS award pages were therefore replaced by the BBC and SEC
    pages listed above.

### Search pages used only to find addresses

DuckDuckGo's HTML search refused requests from this machine after the first few queries (HTTP 202 with no results),
so later addresses came from the BBC's own site search and from the Federal Register's document API, which lists
documents by agency and date. Neither is used as a source for any row; every row above cites the page I opened.

### Counts

- Pages opened and read for content: 60 (excluding the search and document-listing pages used only to find
  addresses).
- Rows in Table A: 46. Rows in Table B: 22. Rows in Table C: 6.
