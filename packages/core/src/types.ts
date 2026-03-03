/**
 * Core data types for IssueX.
 * Models follow the GitHub Issues pattern:
 * Issue (with labels) + Comment + Label.
 */

/** Issue status */
export type IssueStatus = "open" | "closed";

/** Core Issue entity */
export interface Issue {
  /** Internal unique identifier */
  id: string;
  /** User-facing auto-increment number (like GitHub #1, #2) */
  number: number;
  title: string;
  body: string;
  status: IssueStatus;
  /** Individual id of the issue author */
  author: string;
  /** Individual id of the assignee, if any */
  assignee: string | null;
  /** Label ids attached to this issue */
  labels: string[];
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

/** Comment on an issue */
export interface Comment {
  id: string;
  issueId: string;
  body: string;
  /** Individual id of the comment author */
  author: string;
  createdAt: string;
  updatedAt: string;
}

/** Label for categorizing issues */
export interface Label {
  id: string;
  name: string;
  description: string;
  color: string;
}

/** Filter parameters for listing issues */
export interface IssueFilter {
  status?: IssueStatus;
  author?: string;
  assignee?: string;
  label?: string;
}

/** Input for creating a new issue */
export interface CreateIssueInput {
  title: string;
  body: string;
  author: string;
  assignee?: string;
  labels?: string[];
}

/** Input for updating an existing issue */
export interface UpdateIssueInput {
  title?: string;
  body?: string;
  assignee?: string | null;
}

/** Input for creating a comment */
export interface CreateCommentInput {
  issueId: string;
  body: string;
  author: string;
}

/** Input for creating a label */
export interface CreateLabelInput {
  name: string;
  description?: string;
  color?: string;
}

/** Input for updating a label */
export interface UpdateLabelInput {
  name?: string;
  description?: string;
  color?: string;
}
