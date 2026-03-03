/**
 * Provider abstraction — aligns with ResourceX's provider pattern.
 * A provider creates the concrete store implementations for a specific storage engine.
 */

import type { ProviderStores } from "./store.js";

/** Provider interface — implementations supply storage-specific stores */
export interface IssueXProvider {
  /** Create and return all stores for this provider */
  createStores(): ProviderStores;
}

let currentProvider: IssueXProvider | null = null;

/** Register the active provider */
export function setProvider(provider: IssueXProvider): void {
  currentProvider = provider;
}

/** Get the active provider. Throws if none is registered. */
export function getProvider(): IssueXProvider {
  if (!currentProvider) {
    throw new Error(
      "No IssueX provider registered. Call setProvider() or import a provider package (e.g. @issuexjs/node)."
    );
  }
  return currentProvider;
}
