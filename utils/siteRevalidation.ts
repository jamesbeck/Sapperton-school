import type { CollectionConfig, GlobalConfig } from "payload";

// Content is shared across menus, cards, related articles and rich text. Invalidate
// the public layout conservatively so renamed/deleted records cannot leave stale
// references elsewhere. Keep admin/user operations outside this policy.
export function withSiteRevalidation(
  collection: CollectionConfig,
  invalidate: () => void,
): CollectionConfig {
  return {
    ...collection,
    hooks: {
      ...collection.hooks,
      afterChange: [
        ...(collection.hooks?.afterChange ?? []),
        ({ doc, req }) => {
          if (!req.context.skipRevalidation) invalidate();
          return doc;
        },
      ],
      afterDelete: [
        ...(collection.hooks?.afterDelete ?? []),
        ({ doc, req }) => {
          if (!req.context.skipRevalidation) invalidate();
          return doc;
        },
      ],
    },
  };
}

export function withGlobalSiteRevalidation(
  global: GlobalConfig,
  invalidate: () => void,
): GlobalConfig {
  return {
    ...global,
    hooks: {
      ...global.hooks,
      afterChange: [
        ...(global.hooks?.afterChange ?? []),
        ({ doc, req }) => {
          if (!req.context.skipRevalidation) invalidate();
          return doc;
        },
      ],
    },
  };
}
