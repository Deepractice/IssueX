/**
 * Store interfaces — the storage abstraction layer.
 * Providers implement these interfaces to back IssueX with different storage engines.
 */

import type {
  Comment,
  CreateCommentInput,
  CreateIssueInput,
  CreateLabelInput,
  Issue,
  IssueFilter,
  Label,
  UpdateIssueInput,
  UpdateLabelInput,
} from "./types.js";

/** Issue storage operations */
export interface IssueStore {
  create(input: CreateIssueInput): Promise<Issue>;
  get(id: string): Promise<Issue | null>;
  getByNumber(number: number): Promise<Issue | null>;
  list(filter?: IssueFilter): Promise<Issue[]>;
  update(id: string, input: UpdateIssueInput): Promise<Issue>;
  close(id: string): Promise<Issue>;
  reopen(id: string): Promise<Issue>;
  addLabel(issueId: string, labelId: string): Promise<void>;
  removeLabel(issueId: string, labelId: string): Promise<void>;
}

/** Comment storage operations */
export interface CommentStore {
  create(input: CreateCommentInput): Promise<Comment>;
  list(issueId: string): Promise<Comment[]>;
  update(id: string, body: string): Promise<Comment>;
  delete(id: string): Promise<void>;
}

/** Label storage operations */
export interface LabelStore {
  create(input: CreateLabelInput): Promise<Label>;
  list(): Promise<Label[]>;
  get(id: string): Promise<Label | null>;
  getByName(name: string): Promise<Label | null>;
  update(id: string, input: UpdateLabelInput): Promise<Label>;
  delete(id: string): Promise<void>;
}

/** Aggregate of all stores returned by a provider */
export interface ProviderStores {
  issueStore: IssueStore;
  commentStore: CommentStore;
  labelStore: LabelStore;
}
