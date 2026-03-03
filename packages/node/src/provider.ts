import type { IssueXProvider, ProviderStores } from "@issuexjs/core";
import { CREATE_TABLES } from "./schema.js";
import { type Database, SQLiteCommentStore, SQLiteIssueStore, SQLiteLabelStore } from "./stores.js";

export interface NodeProviderOptions {
  /** A database instance compatible with bun:sqlite or better-sqlite3 */
  db: Database;
}

/**
 * Node.js/Bun SQLite provider for IssueX.
 * Uses a synchronous SQLite database for local storage.
 */
export class NodeProvider implements IssueXProvider {
  private db: Database;

  constructor(options: NodeProviderOptions) {
    this.db = options.db;
    this.initSchema();
  }

  private initSchema(): void {
    // Execute each statement individually (SQLite doesn't support multi-statement exec in all drivers)
    for (const statement of CREATE_TABLES.split(";")) {
      const trimmed = statement.trim();
      if (trimmed) {
        this.db.run(`${trimmed};`);
      }
    }
  }

  createStores(): ProviderStores {
    return {
      issueStore: new SQLiteIssueStore(this.db),
      commentStore: new SQLiteCommentStore(this.db),
      labelStore: new SQLiteLabelStore(this.db),
    };
  }
}
