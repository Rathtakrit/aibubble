# The physical side of the AI boom: data centres, electricity and chips, 2022 to November 2026

Research file, 15 November 2026. Sourced numbers only, for the parts of the AI boom you can weigh: buildings, power
stations and chips.

Every row was written after opening a page that states the fact. Each row gives the date the source gives, the fact
with its number, the page I opened, the publisher, and a Checked cell: `opened` means the page loaded in this run,
`archive copy` means the live page refused this machine and I read the archived copy at web.archive.org. A search
result on its own was never used as a source; anything I only saw in a search result is in the last section.

This file states facts and dates only. It takes no view on what any of it is worth or what happens next.

Terms used below, explained once:

- **Gigawatt (GW)**: 1,000 megawatts (MW); 1,000 GW is a terawatt. A GW is a rate of flow, like a pipe's width — how
  much power a site can draw at once, not how much it uses over a year.
- **Terawatt-hour (TWh)**: a quantity of energy — one GW running for 1,000 hours. Electricity use over a year is
  measured in TWh, so "415 TWh in 2024" and "945 TWh in 2030" are yearly totals, not sizes.
- **IT load / IT power**: the power that reaches the computers, excluding cooling and losses.
- **Data centre campus**: one site with several buildings, counted together here.
- **Behind the meter**: a power plant wired straight into a data centre, not through the public grid.
- **Co-located**: a data centre built next to a power plant and buying its output directly.
- **Power purchase agreement (PPA)**: a long contract to buy electricity at agreed terms.
- **Uprate**: raising an existing power plant's output without building a new plant.
- **Small modular reactor (SMR)**: a factory-built nuclear reactor, smaller than a conventional one.
- **Useful life**: the number of years a company spreads the cost of an asset over in its accounts. A shorter life
  means more depreciation each year.
- **CoWoS**: chip-on-wafer-on-substrate, TSMC's advanced packaging. It is the step that joins an AI chip to its
  memory; without a slot in it, a GPU cannot ship.
- **HBM**: high bandwidth memory, the memory stacked beside an AI chip.
- **Trainium / TPU / GB200, GB300, Vera Rubin**: names of AI chips and the rack-sized systems built from them.

---

## Table A. Announced AI data-centre projects of 1 GW or more

"Size" is what the page says, in the page's own words where the wording matters. Where a company gives no gigawatt
figure, the row says so rather than filling the gap.

| Date | Who | Place | Size and stated cost | Status as the page says | URL | Publisher | Checked |
|---|---|---|---|---|---|---|---|
| 4 December 2024 | Meta (through subsidiary Laidley LLC) | Richland Parish, Louisiana (Hyperion) | Announced at over $10 billion; construction site 2,250 acres, 4 million sq ft of floor area; later financed through a Blue Owl joint venture providing at least $27 billion | Under construction; ground broken December 2024; year built 2024–2032 | https://en.wikipedia.org/wiki/Hyperion_Data_Center | Wikipedia | opened |
| 13 July 2026 | Meta | Richland Parish, Louisiana (Hyperion) | Expanded to **5 GW of compute capacity**, investment "more than $50 billion"; 7,500+ construction jobs at peak, 1,000 operational jobs | Expansion announced; site already under construction | https://datacenters.atmeta.com/2026/07/deepening-our-investment-in-richland-parish-louisiana/ | Meta Data Centers | opened |
| 21 January 2025 | Stargate LLC: OpenAI, SoftBank, Oracle, MGX | United States (multiple sites) | Up to **$500 billion** and **10 GW** by 2029; launched with $100 billion initial investment | Announced at the White House; sites to follow | https://en.wikipedia.org/wiki/Stargate_LLC | Wikipedia | opened |
| 18 March 2025 | Crusoe, Lancium, for Oracle/OpenAI | Abilene, Texas (Lancium Clean Campus) | Second phase adds six buildings to reach eight buildings, ~4 million sq ft and **1.2 GW** total power capacity; each building designed for up to 50,000 NVIDIA GB200 NVL72 systems; Crusoe's total footprint then 1.6 GW under operation and construction with 10 GW+ in development | Construction under way, phase two due mid-2026 | https://www.crusoe.ai/resources/newsroom/crusoe-expands-ai-data-center-campus-in-abilene-to-1-2-gigawatts | Crusoe | opened |
| July 2025 (reported 23 September 2025) | OpenAI and Oracle | United States | Agreement for up to **4.5 GW** of additional Stargate capacity; a partnership "that exceeds $300 billion" over five years | Agreement signed; sites named in September 2025 | https://group.softbank/en/news/press/20250924 | SoftBank Group | opened |
| 23 September 2025 | OpenAI, Oracle, SoftBank | Shackelford County, Texas; Doña Ana County, New Mexico; one Midwest site; Lordstown, Ohio; Milam County, Texas | The five new sites, plus the Abilene flagship and work with CoreWeave, bring Stargate to **nearly 7 GW** of planned capacity and **over $400 billion** of investment over three years. The three Oracle sites plus a possible 600 MW expansion at Abilene "can deliver over 5.5 gigawatts". The two SoftBank sites (Lordstown, Milam County) "can scale to 1.5 gigawatts over the next 18 months" | Sites selected; Lordstown ground broken and "on track to be operational next year" | https://group.softbank/en/news/press/20250924 | SoftBank Group | opened |
| 19 October 2026 | Meta | New Albany, Ohio (Prometheus) | "Gigawatt-scale supercluster"; first phase complete; currently "hundreds of thousands of GPUs"; at full scale **roughly 1 million GPUs** across multiple buildings; each GB300 NVL72 rack ~135 kW, each GB200 NVL72 two-rack pair ~120 kW | First phase complete and used to train Meta's Muse models; still scaling | https://engineering.fb.com/2026/10/19/data-center-engineering/inside-prometheus-meta-gigawatt-scale-supercluster/ | Engineering at Meta | opened |
| Mid-2026 (page last edited 31 October 2026) | xAI (later SpaceXAI) | Memphis, Tennessee and Southaven, Mississippi (Colossus 1 and Colossus 2) | Combined sites "on the order of **1 gigawatt**" of AI compute by mid-2026; a permanent ~1.2 GW simple-cycle gas plant (41 turbines) permitted in Mississippi in March 2026 | Operating and expanding; temporary gas turbines being phased out, removal due by July 2027 | https://en.wikipedia.org/wiki/Colossus_(data_center) | Wikipedia | opened |
| 18 September 2025 (page introduced the site) | Microsoft | Mount Pleasant, Wisconsin (Fairwater) | Page states 315 acres, three buildings, 1.2 million sq ft, "hundreds of thousands of the latest NVIDIA GPUs", 72 GPUs per rack, "10X the performance of the world's fastest supercomputer today". **No gigawatt figure and no cost are given on Microsoft's page** | Described as the newest US AI datacenter and the largest Microsoft has built; identical Fairwater datacenters under construction elsewhere in the US | https://blogs.microsoft.com/blog/2025/09/18/inside-the-worlds-most-powerful-ai-datacenter/ | Microsoft (Official Microsoft Blog) | opened |
| 29 October 2025 (updated) | Amazon Web Services, for Anthropic | New Carlisle, Indiana (Project Rainier) | "Nearly half a million Trainium2 chips" and more than five times the compute Anthropic used for its previous models; Claude expected on more than 1 million Trainium2 chips by year end; the site is described as spread across multiple data centres. **AWS's page gives no gigawatt figure**; the $11 billion cost is reported elsewhere (see doubts) | "Now fully operational", deployed less than one year after announcement | https://www.aboutamazon.com/news/aws/aws-project-rainier-ai-trainium-chips-compute-cluster | About Amazon | opened |
| 27 October 2026 | CoreWeave | 51 data centres worldwide (company total, not one campus) | **More than 1.5 GW of active power** as of 30 June 2026 and **approximately 4.2 GW of contracted power** as of the 11 August 2026 earnings call; 22.5 MW of IT capacity at atNorth's DEN01 in Copenhagen; 240 MW planned in Navi Mumbai with AdaniConneX | Operating; expanding into Denmark, India, the Middle East and Asia Pacific | https://www.coreweave.com/news/coreweave-expands-global-ai-cloud-platform-with-new-capacity-in-denmark-and-first-ai-network-backbone | CoreWeave | opened |

---

## Table B. Data-centre share of electricity use, by year, and forecasts

Where a figure is a share of electricity, the row says whose electricity (US or world). Forecasts are labelled as
the source labels them.

| Date | Figure | URL | Publisher | Checked |
|---|---|---|---|---|
| Published 10 April 2025 (report *Energy and AI*) | Data centres accounted for around **1.5% of the world's electricity consumption in 2024, or 415 TWh**. The United States took 45% of that, China 25% and Europe 15%. Data-centre use has grown about **12% a year since 2017**, more than four times faster than total electricity use. Investment in data centres "nearly doubled since 2022" and reached half a trillion dollars in 2024 | https://web.archive.org/web/20261115162221/https://www.iea.org/reports/energy-and-ai/executive-summary | International Energy Agency | archive copy |
| Published 10 April 2025 (report *Energy and AI*) | Data-centre electricity use is set "to more than double to around **945 TWh by 2030**" — slightly more than Japan's total use today — and around **1,200 TWh by 2035** in the Base Case, with a 2035 range of **700 to 1,700 TWh** across cases. Data centres are about one tenth of global demand growth to 2030, but **more than 20% of demand growth in advanced economies**; in the United States they are nearly half of electricity demand growth to 2030 | https://web.archive.org/web/20261115162221/https://www.iea.org/reports/energy-and-ai/executive-summary | International Energy Agency | archive copy |
| 20 December 2024 (report dated December 2024) | US data centres used **176 TWh in 2023, about 4.4% of total US electricity**, up from 58 TWh in 2014; projected to reach **325 to 580 TWh by 2028, or 6.7% to 12% of US electricity** | https://www.energy.gov/articles/doe-releases-new-report-evaluating-increase-electricity-demand-data-centers | US Department of Energy (on the Lawrence Berkeley National Laboratory report) | opened |
| Published June 2026 (2025 update to the same report) | Data centres "could account for **11.8% of total U.S. electricity by 2030**", with a scenario range of **9.5% to 15.3%**; Reference Case **649 TWh in 2030**; bounds of **521 to 843 TWh** in 2030. The 2024 report's range was 6.7% to 12.0% by 2028 | https://web.archive.org/web/20261112033358/https://eta.lbl.gov/publications/united-states-data-center-energy-2025 | Lawrence Berkeley National Laboratory (Energy Technologies Area) | archive copy |
| 19 May 2026 | In the *Annual Energy Outlook 2026*, data-centre servers alone were an estimated **7% of US commercial-sector electricity in 2025**, rising to **22%–33% by 2050**; server consumption reaches **446 to 818 billion kWh by 2050** | https://www.eia.gov/todayinenergy/detail.php?id=67704 | US Energy Information Administration | opened |
| 13 January 2026 | EIA expects US electricity use to grow **1% in 2026 and 3% in 2027**, the first four years in a row of rising demand since 2007 and the strongest four-year growth since 2000, "driven largely by increasing demand from large computing facilities, including data centers" | https://www.eia.gov/pressroom/releases/press582.php | US Energy Information Administration | opened |
| 14 January 2026 (2026 Long-Term Load Forecast) | PJM expects its summer peak to rise about **85,000 MW, to over 241,000 MW, over 15 years**; 222,000 MW by 2036 and over 253,000 MW by 2046. The 10-year growth rate is **3.6% a year**, against 0.3% in the 2021 forecast. Near-term years were revised **down** because of "improved vetting of requested adjustments for data centers and large loads" (summer 2026 peak -0.7% from large loads). Current generating capacity about 182,000 MW | https://insidelines.pjm.com/pjms-updated-20-year-forecast-continues-to-see-significant-long-term-load-growth/ | PJM Interconnection (PJM Inside Lines) | opened |
| 16 April 2025 | ERCOT's long-term forecast put Texas peak demand "as high as **218 GW in 2031**", against a record 85.5 GW in August 2023; an adjusted forecast, discounting speculative requests, gave **145 GW**; data-centre demand is expected to rise to **78 GW by 2031** | https://www.datacenterdynamics.com/en/news/ercot-electricity-demand-in-texas-set-to-soar-to-218gw-by-2031-fueled-by-data-center-growth/ | Data Center Dynamics (reporting ERCOT's forecast) | opened |

---

## Table C. Power deals by AI and cloud companies

| Date | Who | Deal, with its number | URL | Publisher | Checked |
|---|---|---|---|---|---|
| 20 September 2024 | Constellation and Microsoft | 20-year power purchase agreement that restarts Three Mile Island Unit 1 as the **Crane Clean Energy Center**: **approximately 835 MW** of carbon-free power, 3,400 direct and indirect jobs, more than $3 billion in state and federal taxes; plant **expected online in 2028**; Constellation to seek licence renewal to at least 2054 | https://www.constellationenergy.com/news/2024/Constellation-to-Launch-Crane-Clean-Energy-Center-Restoring-Jobs-and-Carbon-Free-Power-to-The-Grid.html | Constellation Energy | opened |
| 14 October 2024 | Google and Kairos Power | Master Plant Development Agreement for a US fleet of advanced reactors totalling **500 MW by 2035**, first deployment by 2030, energy sold to Google under power purchase agreements; described as the first corporate agreement for multiple deployments of a single advanced reactor design | https://www.kairospower.com/updates/google-and-kairos-power-partner-to-deploy-500-mw-of-clean-electricity-generation | Kairos Power | opened |
| 16 October 2024 | Amazon and X-energy | Amazon anchors a **$500 million** X-energy financing round; the two aim to bring **more than 5 GW** of new nuclear projects online in the US **by 2039**; first project is a four-unit **320 MW** plant with Energy Northwest in central Washington, with an option to go to 12 units and **960 MW**. Each Xe-100 unit is 80 MW | https://x-energy.com/news/amazon-invests-in-x-energy-to-support-advanced-small-modular-nuclear-reactors-and-expand-carbon-free-power/ | X-energy | opened |
| 3 June 2025 | Constellation and Meta | 20-year power purchase agreement for the output of the Clinton Clean Energy Center in Illinois: **1,121 MW** of emissions-free nuclear energy from June 2027, plus **30 MW** from uprates; preserves 1,100 jobs and $13.5 million a year in tax revenue; replaces the state zero-emission credit programme with a market deal | https://www.constellationenergy.com/news/2025/constellation-meta-sign-20-year-deal-for-clean-reliable-nuclear-energy-in-illinois.html | Constellation Energy | opened |
| 11 June 2025 | Talen Energy and Amazon (AWS) | New power purchase agreement under which Talen supplies Amazon with **1,920 MW** of carbon-free nuclear power from Susquehanna **through 2042**, ramping to full volume no later than 2032; the two will also explore SMRs and plant uprates, and the co-located arrangement moves "front of the meter" after transmission work expected in spring 2026. AWS describes a **$20 billion** Pennsylvania investment | https://web.archive.org/web/20261027185719/https://ir.talenenergy.com/news-releases/news-release-details/talen-energy-expands-nuclear-energy-relationship-amazon | Talen Energy (investor release) | archive copy |
| 13 July 2026 | Meta and Entergy Louisiana | Meta's agreement with Entergy funds **seven new natural gas-fueled generating plants, three grid-scale batteries, nuclear uprates** and other purchased power, and is expected to deliver about **$2 billion** in customer savings on top of $650 million previously announced; Meta contributes **$215 million** to bill-assistance and efficiency programmes and commits to help fund generation of **up to 2.5 GW** of clean and renewable energy | https://datacenters.atmeta.com/2026/07/deepening-our-investment-in-richland-parish-louisiana/ | Meta Data Centers | opened |

---

## Table C note: what a data centre site says about its own power supply

One extra row, because it is the only first-hand account of what sits behind a gigawatt-scale site.

| Date | Who | Fact | URL | Publisher | Checked |
|---|---|---|---|---|---|
| 19 October 2026 | Meta | Prometheus in New Albany runs behind "rack-level battery backup (BBU) modules", capacitor trays, "facility-level battery energy storage systems (BESS)" and "deep coordination with utility providers"; training jobs can shift loads "of more than tens of megawatts in just seconds", and cluster power swings of 30-40% | https://engineering.fb.com/2026/10/19/data-center-engineering/inside-prometheus-meta-gigawatt-scale-supercluster/ | Engineering at Meta | opened |

---

## Table D. Chips: shipments, capacity, cost per gigawatt and depreciation lives

### D1. How long a GPU and its servers are depreciated, from the annual reports on sec.gov

The table below quotes each company's own 10-K. These are the useful lives used in the accounts, not the physical life
of the equipment.

| Date (filing) | Company | Figure | URL | Publisher | Checked |
|---|---|---|---|---|---|
| FY2026 10-K, filed 29 July 2026 | Microsoft | "servers and network equipment, **two to six years**"; software for internal use three years; buildings and improvements five to 15 years | https://www.sec.gov/Archives/edgar/data/789019/000119312526323660/msft-20260630.htm | Microsoft Form 10-K, SEC | opened |
| FY2025 10-K, filed 5 February 2026 | Alphabet (Google) | "We depreciate servers and network equipment generally over a period of **six years**"; data centre and office buildings seven to 40 years | https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm | Alphabet Form 10-K, SEC | opened |
| FY2025 10-K, filed 6 February 2026 | Amazon | Servers and networking equipment **five to six years**. "Effective January 1, 2025 we changed our estimate of the useful lives of a subset of our servers and networking equipment from six years to five years", because of "the increased pace of technology development, particularly in the area of artificial intelligence and machine learning"; the change raised 2025 depreciation by **$1.4 billion** and cut net income by **$1.0 billion** ($0.10 a share). Effective 1 January 2024 the company had gone from five to six years | https://www.sec.gov/Archives/edgar/data/1018724/000101872426000004/amzn-20251231.htm | Amazon Form 10-K, SEC | opened |
| FY2025 10-K, filed 29 January 2026 | Meta | "In January 2025, we completed an assessment of the useful lives of property and equipment, which resulted in an increase in the estimated useful lives of most servers and network assets to **5.5 years**, effective January 1, 2025" | https://www.sec.gov/Archives/edgar/data/1326801/000162828026003942/meta-20251231.htm | Meta Platforms Form 10-K, SEC | opened |
| FY2026 10-K, filed 22 June 2026 | Oracle | Property, plant and equipment depreciated over lives of one to 40 years; the note states the category is "comprised primarily of servers and networking equipment with estimated useful life of **six years**"; fiscal 2026 depreciation $7.6 billion, against $3.9 billion in fiscal 2025 | https://www.sec.gov/Archives/edgar/data/1341439/000119312526277521/orcl-20260531.htm | Oracle Form 10-K, SEC | opened |
| FY2025 10-K, filed 2 March 2026 | CoreWeave | "Effective January 1, 2023, the Company changed its estimate of the useful life for its **computing equipment utilized in data centers from five to six years**", citing hardware performance, software optimisation and data centre design | https://www.sec.gov/Archives/edgar/data/1769628/000176962826000104/crwv-20251231.htm | CoreWeave Form 10-K, SEC | opened |

### D2. Nvidia shipment and capacity statements, chips per site, and AI packaging capacity

| Date | Figure | URL | Publisher | Checked |
|---|---|---|---|---|
| 26 August 2026 (quarter ended 26 July 2026) | Nvidia revenue **$96.2 billion**, up 106% from a year earlier; **Data Center revenue $89.0 billion, up 117%**; "Vera Rubin, now in full production"; Vera Rubin racks "running at partners including CoreWeave, Google Cloud, Microsoft Azure, Oracle Cloud Infrastructure and Nebius"; outlook for the next quarter $108.0 billion, assuming no Data Center compute revenue from China | https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-second-quarter-fiscal-2027 | Nvidia Newsroom | opened |
| 26 August 2026 | Nvidia announced "strategic partnerships to establish independent compute financing platforms with Apollo, BlackRock, Blackstone, Brookfield, Goldman Sachs and KKR to mobilize **over $500 billion** of third-party capital for the buildout of AI infrastructure over time"; and that it "secured land, power and shell capacity" with SB Energy at the PORTS-Pike Technology Campus in Ohio | https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-second-quarter-fiscal-2027 | Nvidia Newsroom | opened |
| 16 March 2026 (GTC keynote, as reported by Nvidia) | Huang: "I believe computing demand has increased by **1 million times** over the last few years"; he "now sees **at least $1 trillion in revenue from 2025 through 2027**" | https://blogs.nvidia.com/blog/gtc-2026-news/ | Nvidia Blog | opened |
| 16 March 2026 | AWS "will deploy NVIDIA AI infrastructure including LPUs and **more than 1 million NVIDIA GPUs**", deployment beginning in 2026 across AWS regions | https://blogs.nvidia.com/blog/gtc-2026-news/ | Nvidia Blog | opened |
| 16 March 2026 | Microsoft "has deployed **hundreds of thousands of GPUs** liquid-cooled NVIDIA Grace Blackwell GPUs across its global data centers in less than a year"; Azure was the first hyperscale cloud to power up Vera Rubin NVL72 systems | https://blogs.nvidia.com/blog/gtc-2026-news/ | Nvidia Blog | opened |
| 19 October 2026 | Meta's Prometheus: "hundreds of thousands of GPUs" today, "roughly **1 million distributed GPUs**" at full scale; for a 32,768 active-GPU training run Meta provisions 523 NVL72 racks, or 37,656 GPUs, about 13% above the active footprint | https://engineering.fb.com/2026/10/19/data-center-engineering/inside-prometheus-meta-gigawatt-scale-supercluster/ | Engineering at Meta | opened |
| Late September 2026 (as recorded 31 October 2026) | xAI/SpaceXAI's Colossus: **440,000 GB300 GPUs in use**, with "a further **660,000 GPUs** expected to come online by the end of 2026" | https://en.wikipedia.org/wiki/Colossus_(data_center) | Wikipedia | opened |
| 16 April 2026 | TSMC's CoWoS advanced packaging capacity: **around 115,000 to 140,000 wafers a month by the end of 2026**, rising to **approximately 170,000 wafers a month in 2027** — an estimate TrendForce attributes to institutional investors cited by TechNews, not a figure TSMC itself disclosed | https://www.trendforce.com/news/2026/04/16/news-tsmc-says-cowos-offers-industrys-largest-reticle-size-packaging-amid-intel-emib-rivalry-copos-advances/ | TrendForce | opened |

---

## Not found / doubts

1. **Cost per gigawatt as Nvidia states it.** Search results repeatedly put Jensen Huang's figure at "$50 billion per
   gigawatt" (and, in later retellings, $50–60 billion rising toward $80–100 billion), but every page carrying it that I
   tried was a secondary summary I could not open, or a social-media post. Nvidia's own GTC blog posts for 2026 that I
   did open do not state a cost per gigawatt. **No row written.** Nothing about cost per GW appears in Table D2.
2. **Microsoft Fairwater's size in gigawatts and its cost.** Microsoft's page gives acres, square feet, GPU counts and
   rack power, but no GW and no dollar figure. A search result quoted an Epoch AI estimate of about 369 MW of IT load
   and other estimates near one gigawatt per building; I did not open those pages, so none is used.
3. **Amazon Project Rainier's gigawatts and its $11 billion.** About Amazon's page gives chip counts and no GW figure
   and no cost. The $11 billion price and a "2.25 GW grid draw" appear only in search excerpts (CNBC, a Substack).
   The $11 billion is probably right but is not in this file as a sourced row.
4. **Stargate's later numbers.** OpenAI's own pages (openai.com) refuse this machine. Search excerpts said a Michigan
   site (Saline Township) takes Stargate "to over 8 gigawatts of planned capacity and more than $450 billion" and that
   the Oracle agreement was "$30 billion". Neither could be opened, so Table A stops at the SoftBank release's
   "nearly 7 GW" and "over $400 billion".
5. **The Crusoe/Blue Owl $15 billion joint venture for Abilene.** The Crusoe release I opened gives 1.2 GW and the
   building count but not the $15 billion; that figure came from search excerpts of other pages.
6. **CoreWeave's price per megawatt.** CoreWeave's 16 September 2026 release says it signed short contracts at
   "approximately $40 million per megawatt" of annualised revenue — which would be $40 billion per gigawatt. The
   release returned a 403 and I did not read it, so it is not a row.
7. **Meta's New Albany "over 1 gigawatt" wording.** Meta's New Albany information sheet is a PDF, which the fetch tool
   refused ("Unsupported fetched file content type: application/pdf"). The engineering blog I did open says
   "gigawatt-scale" without a number.
8. **Microsoft takes over a Texas expansion after OpenAI backs away (AP).** The AP article refused a direct fetch; the
   archived copy opened but the article text did not come through the extractor. No row.
9. **PJM's own load-forecast PDF, LBNL's report PDF and the House fact sheet on Oracle/OpenAI sites
   (arrington.house.gov) are PDFs** and could not be read with this tool.
10. **xAI's Colossus cost.** No page I opened states what the Memphis/Southaven cluster cost. Wikipedia gives the
    ~$80 million warehouse purchase for Colossus 2 only.
11. **Sites refused outright, and worked around only where a row needed them:** iea.org (403 — used web.archive.org),
    eta.lbl.gov (403 — archive), ir.talenenergy.com (403 — archive), investors.coreweave.com (403 — not used),
    apnews.com (403 — archive opened but text not readable), openai.com (excluded by the brief). reuters.com, cnbc.com,
    bloomberg.com and the other blocked publishers were never used as sources.
