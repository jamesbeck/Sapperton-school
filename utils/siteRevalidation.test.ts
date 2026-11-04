import assert from "node:assert/strict";
import test from "node:test";
import type { CollectionConfig, GlobalConfig, PayloadRequest } from "payload";
import { withSiteRevalidation, withGlobalSiteRevalidation } from "./siteRevalidation";

const req = (skipRevalidation = false) =>
  ({ context: { skipRevalidation } }) as unknown as PayloadRequest;

test("content saves and deletions invalidate, including unpublish and slug changes", async () => {
  let calls = 0;
  const config = withSiteRevalidation({ slug: "pages", fields: [] }, () => calls++);
  const change = config.hooks!.afterChange!.at(-1)!;
  const remove = config.hooks!.afterDelete!.at(-1)!;
  const doc = { id: 1, slug: "new", _status: "draft" };
  const result = await change({ doc, previousDoc: { slug: "old", _status: "published" },
    req: req(), context: {}, collection: config, operation: "update" } as Parameters<typeof change>[0]);
  assert.equal(result, doc);
  await remove({ doc, id: 1, req: req(), collection: config, context: {} } as Parameters<typeof remove>[0]);
  assert.equal(calls, 2);
});

test("bulk migrations can skip both collection and global invalidation", async () => {
  let calls = 0;
  const config = withSiteRevalidation({ slug: "pages", fields: [] }, () => calls++);
  const global = withGlobalSiteRevalidation({ slug: "welcome", fields: [] }, () => calls++);
  for (const hook of [config.hooks!.afterChange!.at(-1)!, config.hooks!.afterDelete!.at(-1)!, global.hooks!.afterChange!.at(-1)!]) {
    await hook({ doc: {}, req: req(true) } as never);
  }
  assert.equal(calls, 0);
  const hook = global.hooks!.afterChange!.at(-1)!;
  await hook({ doc: {}, req: req() } as Parameters<typeof hook>[0]);
  assert.equal(calls, 1);
});

test("registration preserves existing hooks and does not mutate source configs", () => {
  const change = () => undefined;
  const remove = () => undefined;
  const collection: CollectionConfig = { slug: "clubs", fields: [], hooks: { afterChange: [change], afterDelete: [remove] } };
  const global: GlobalConfig = { slug: "welcome", fields: [], hooks: { afterChange: [change] } };
  const wrapped = withSiteRevalidation(collection, () => {});
  assert.equal(wrapped.hooks!.afterChange![0], change);
  assert.equal(wrapped.hooks!.afterDelete![0], remove);
  assert.equal(collection.hooks!.afterChange!.length, 1);
  assert.equal(withGlobalSiteRevalidation(global, () => {}).hooks!.afterChange![0], change);
  assert.equal(global.hooks!.afterChange!.length, 1);
});
