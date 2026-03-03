import { Database as BunDatabase } from "bun:sqlite";
import type { IWorldOptions } from "@deepracticex/bdd";
import { setWorldConstructor, World } from "@deepracticex/bdd";
import type { Comment, Issue, Label } from "@issuexjs/core";
import type { Database } from "@issuexjs/node";
import { NodeProvider } from "@issuexjs/node";
import { createIssueX, type IssueX } from "issuexjs";

/** Adapt bun:sqlite API to the Database interface expected by @issuexjs/node */
function wrapBunSqlite(db: BunDatabase): Database {
  return {
    run(sql: string, ...params: unknown[]) {
      db.query(sql).run(...params);
    },
    get<T = unknown>(sql: string, ...params: unknown[]): T | null {
      return db.query(sql).get(...params) as T | null;
    },
    all<T = unknown>(sql: string, ...params: unknown[]): T[] {
      return db.query(sql).all(...params) as T[];
    },
  };
}

export class IssueXWorld extends World {
  issuex!: IssueX;
  currentIssue?: Issue;
  currentComment?: Comment;
  currentLabel?: Label;
  issues: Issue[] = [];
  comments: Comment[] = [];
  labels: Label[] = [];
  error?: Error;

  constructor(options: IWorldOptions) {
    super(options);

    const bunDb = new BunDatabase(":memory:");
    const db = wrapBunSqlite(bunDb);
    const provider = new NodeProvider({ db });
    this.issuex = createIssueX({ provider });
  }
}

setWorldConstructor(IssueXWorld);
