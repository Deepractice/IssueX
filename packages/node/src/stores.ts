import type {
  Comment,
  CommentStore,
  CreateCommentInput,
  CreateIssueInput,
  CreateLabelInput,
  Issue,
  IssueFilter,
  IssueStore,
  Label,
  LabelStore,
  UpdateIssueInput,
  UpdateLabelInput,
} from "@issuexjs/core";

/** Database interface — minimal subset for bun:sqlite and better-sqlite3 compatibility */
export interface Database {
  run(sql: string, ...params: unknown[]): void;
  get<T = unknown>(sql: string, ...params: unknown[]): T | null;
  all<T = unknown>(sql: string, ...params: unknown[]): T[];
}

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// --- Issue row mapping ---

interface IssueRow {
  id: string;
  number: number;
  title: string;
  body: string;
  status: string;
  author: string;
  assignee: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

function rowToIssue(row: IssueRow, labels: string[]): Issue {
  return {
    id: row.id,
    number: row.number,
    title: row.title,
    body: row.body,
    status: row.status as Issue["status"],
    author: row.author,
    assignee: row.assignee,
    labels,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    closedAt: row.closed_at,
  };
}

function getIssueLabels(db: Database, issueId: string): string[] {
  const rows = db.all<{ label_id: string }>(
    "SELECT label_id FROM issue_labels WHERE issue_id = ?",
    issueId
  );
  return rows.map((r) => r.label_id);
}

// --- SQLite Store Implementations ---

export class SQLiteIssueStore implements IssueStore {
  constructor(private db: Database) {}

  async create(input: CreateIssueInput): Promise<Issue> {
    const id = generateId();
    const ts = now();

    // Get next number
    const max = this.db.get<{ n: number }>("SELECT COALESCE(MAX(number), 0) as n FROM issues");
    const number = (max?.n ?? 0) + 1;

    this.db.run(
      "INSERT INTO issues (id, number, title, body, status, author, assignee, created_at, updated_at) VALUES (?, ?, ?, ?, 'open', ?, ?, ?, ?)",
      id,
      number,
      input.title,
      input.body,
      input.author,
      input.assignee ?? null,
      ts,
      ts
    );

    // Attach labels
    if (input.labels) {
      for (const labelId of input.labels) {
        this.db.run(
          "INSERT OR IGNORE INTO issue_labels (issue_id, label_id) VALUES (?, ?)",
          id,
          labelId
        );
      }
    }

    const labels = getIssueLabels(this.db, id);
    return {
      id,
      number,
      title: input.title,
      body: input.body,
      status: "open",
      author: input.author,
      assignee: input.assignee ?? null,
      labels,
      createdAt: ts,
      updatedAt: ts,
      closedAt: null,
    };
  }

  async get(id: string): Promise<Issue | null> {
    const row = this.db.get<IssueRow>("SELECT * FROM issues WHERE id = ?", id);
    if (!row) return null;
    return rowToIssue(row, getIssueLabels(this.db, id));
  }

  async getByNumber(number: number): Promise<Issue | null> {
    const row = this.db.get<IssueRow>("SELECT * FROM issues WHERE number = ?", number);
    if (!row) return null;
    return rowToIssue(row, getIssueLabels(this.db, row.id));
  }

  async list(filter?: IssueFilter): Promise<Issue[]> {
    let sql = "SELECT * FROM issues";
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filter?.status) {
      conditions.push("status = ?");
      params.push(filter.status);
    }
    if (filter?.author) {
      conditions.push("author = ?");
      params.push(filter.author);
    }
    if (filter?.assignee) {
      conditions.push("assignee = ?");
      params.push(filter.assignee);
    }
    if (filter?.label) {
      conditions.push("id IN (SELECT issue_id FROM issue_labels WHERE label_id = ?)");
      params.push(filter.label);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }
    sql += " ORDER BY number DESC";

    const rows = this.db.all<IssueRow>(sql, ...params);
    return rows.map((row) => rowToIssue(row, getIssueLabels(this.db, row.id)));
  }

  async update(id: string, input: UpdateIssueInput): Promise<Issue> {
    const ts = now();
    const sets: string[] = ["updated_at = ?"];
    const params: unknown[] = [ts];

    if (input.title !== undefined) {
      sets.push("title = ?");
      params.push(input.title);
    }
    if (input.body !== undefined) {
      sets.push("body = ?");
      params.push(input.body);
    }
    if (input.assignee !== undefined) {
      sets.push("assignee = ?");
      params.push(input.assignee);
    }

    params.push(id);
    this.db.run(`UPDATE issues SET ${sets.join(", ")} WHERE id = ?`, ...params);

    const row = this.db.get<IssueRow>("SELECT * FROM issues WHERE id = ?", id);
    if (!row) throw new Error(`Issue not found: ${id}`);
    return rowToIssue(row, getIssueLabels(this.db, id));
  }

  async close(id: string): Promise<Issue> {
    const ts = now();
    this.db.run(
      "UPDATE issues SET status = 'closed', closed_at = ?, updated_at = ? WHERE id = ?",
      ts,
      ts,
      id
    );
    const row = this.db.get<IssueRow>("SELECT * FROM issues WHERE id = ?", id);
    if (!row) throw new Error(`Issue not found: ${id}`);
    return rowToIssue(row, getIssueLabels(this.db, id));
  }

  async reopen(id: string): Promise<Issue> {
    const ts = now();
    this.db.run(
      "UPDATE issues SET status = 'open', closed_at = NULL, updated_at = ? WHERE id = ?",
      ts,
      id
    );
    const row = this.db.get<IssueRow>("SELECT * FROM issues WHERE id = ?", id);
    if (!row) throw new Error(`Issue not found: ${id}`);
    return rowToIssue(row, getIssueLabels(this.db, id));
  }

  async addLabel(issueId: string, labelId: string): Promise<void> {
    this.db.run(
      "INSERT OR IGNORE INTO issue_labels (issue_id, label_id) VALUES (?, ?)",
      issueId,
      labelId
    );
    const ts = now();
    this.db.run("UPDATE issues SET updated_at = ? WHERE id = ?", ts, issueId);
  }

  async removeLabel(issueId: string, labelId: string): Promise<void> {
    this.db.run("DELETE FROM issue_labels WHERE issue_id = ? AND label_id = ?", issueId, labelId);
    const ts = now();
    this.db.run("UPDATE issues SET updated_at = ? WHERE id = ?", ts, issueId);
  }
}

export class SQLiteCommentStore implements CommentStore {
  constructor(private db: Database) {}

  async create(input: CreateCommentInput): Promise<Comment> {
    const id = generateId();
    const ts = now();
    this.db.run(
      "INSERT INTO comments (id, issue_id, body, author, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      id,
      input.issueId,
      input.body,
      input.author,
      ts,
      ts
    );
    return {
      id,
      issueId: input.issueId,
      body: input.body,
      author: input.author,
      createdAt: ts,
      updatedAt: ts,
    };
  }

  async list(issueId: string): Promise<Comment[]> {
    const rows = this.db.all<{
      id: string;
      issue_id: string;
      body: string;
      author: string;
      created_at: string;
      updated_at: string;
    }>("SELECT * FROM comments WHERE issue_id = ? ORDER BY created_at ASC", issueId);
    return rows.map((r) => ({
      id: r.id,
      issueId: r.issue_id,
      body: r.body,
      author: r.author,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  async update(id: string, body: string): Promise<Comment> {
    const ts = now();
    this.db.run("UPDATE comments SET body = ?, updated_at = ? WHERE id = ?", body, ts, id);
    const row = this.db.get<{
      id: string;
      issue_id: string;
      body: string;
      author: string;
      created_at: string;
      updated_at: string;
    }>("SELECT * FROM comments WHERE id = ?", id);
    if (!row) throw new Error(`Comment not found: ${id}`);
    return {
      id: row.id,
      issueId: row.issue_id,
      body: row.body,
      author: row.author,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async delete(id: string): Promise<void> {
    this.db.run("DELETE FROM comments WHERE id = ?", id);
  }
}

export class SQLiteLabelStore implements LabelStore {
  constructor(private db: Database) {}

  async create(input: CreateLabelInput): Promise<Label> {
    const id = generateId();
    this.db.run(
      "INSERT INTO labels (id, name, description, color) VALUES (?, ?, ?, ?)",
      id,
      input.name,
      input.description ?? "",
      input.color ?? "#ededed"
    );
    return {
      id,
      name: input.name,
      description: input.description ?? "",
      color: input.color ?? "#ededed",
    };
  }

  async list(): Promise<Label[]> {
    return this.db.all<Label>("SELECT * FROM labels ORDER BY name ASC");
  }

  async get(id: string): Promise<Label | null> {
    return this.db.get<Label>("SELECT * FROM labels WHERE id = ?", id);
  }

  async getByName(name: string): Promise<Label | null> {
    return this.db.get<Label>("SELECT * FROM labels WHERE name = ?", name);
  }

  async update(id: string, input: UpdateLabelInput): Promise<Label> {
    const sets: string[] = [];
    const params: unknown[] = [];

    if (input.name !== undefined) {
      sets.push("name = ?");
      params.push(input.name);
    }
    if (input.description !== undefined) {
      sets.push("description = ?");
      params.push(input.description);
    }
    if (input.color !== undefined) {
      sets.push("color = ?");
      params.push(input.color);
    }

    if (sets.length > 0) {
      params.push(id);
      this.db.run(`UPDATE labels SET ${sets.join(", ")} WHERE id = ?`, ...params);
    }

    const row = this.db.get<Label>("SELECT * FROM labels WHERE id = ?", id);
    if (!row) throw new Error(`Label not found: ${id}`);
    return row;
  }

  async delete(id: string): Promise<void> {
    this.db.run("DELETE FROM issue_labels WHERE label_id = ?", id);
    this.db.run("DELETE FROM labels WHERE id = ?", id);
  }
}
