import { companies, deals, LAST_DAY, useDataset, values } from "../lib/data.ts";
import type { DatasetId } from "../lib/data.ts";
import { dayLayouts } from "../lib/layout.ts";

self.onmessage = (event: MessageEvent<DatasetId>) => {
  useDataset(event.data);
  self.postMessage(dayLayouts(companies, values, deals, LAST_DAY));
};
