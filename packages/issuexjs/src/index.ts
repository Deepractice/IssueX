// Re-export core types for convenience
export type {
  Comment,
  CommentStore,
  CreateCommentInput,
  CreateIssueInput,
  CreateLabelInput,
  Issue,
  IssueFilter,
  IssueStatus,
  IssueStore,
  IssueXProvider,
  Label,
  LabelStore,
  ProviderStores,
  UpdateIssueInput,
  UpdateLabelInput,
} from "@issuexjs/core";
export { getProvider, setProvider } from "@issuexjs/core";
export type { IssueXOptions } from "./issuex.js";
export { createIssueX, IssueX } from "./issuex.js";
