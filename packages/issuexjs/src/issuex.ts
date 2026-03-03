import type {
  Comment,
  CommentStore,
  CreateIssueInput,
  CreateLabelInput,
  Issue,
  IssueFilter,
  IssueStore,
  IssueXProvider,
  Label,
  LabelStore,
  UpdateIssueInput,
  UpdateLabelInput,
} from "@issuexjs/core";

export interface IssueXOptions {
  provider: IssueXProvider;
}

/**
 * IssueX client — the main entry point for all issue operations.
 */
export class IssueX {
  private issueStore: IssueStore;
  private commentStore: CommentStore;
  private labelStore: LabelStore;

  constructor(options: IssueXOptions) {
    const stores = options.provider.createStores();
    this.issueStore = stores.issueStore;
    this.commentStore = stores.commentStore;
    this.labelStore = stores.labelStore;
  }

  // --- Issue operations ---

  async createIssue(input: CreateIssueInput): Promise<Issue> {
    return this.issueStore.create(input);
  }

  async getIssue(id: string): Promise<Issue | null> {
    return this.issueStore.get(id);
  }

  async getIssueByNumber(number: number): Promise<Issue | null> {
    return this.issueStore.getByNumber(number);
  }

  async listIssues(filter?: IssueFilter): Promise<Issue[]> {
    return this.issueStore.list(filter);
  }

  async updateIssue(id: string, input: UpdateIssueInput): Promise<Issue> {
    return this.issueStore.update(id, input);
  }

  async closeIssue(id: string): Promise<Issue> {
    return this.issueStore.close(id);
  }

  async reopenIssue(id: string): Promise<Issue> {
    return this.issueStore.reopen(id);
  }

  // --- Comment operations ---

  async createComment(issueId: string, body: string, author: string): Promise<Comment> {
    return this.commentStore.create({ issueId, body, author });
  }

  async listComments(issueId: string): Promise<Comment[]> {
    return this.commentStore.list(issueId);
  }

  async updateComment(id: string, body: string): Promise<Comment> {
    return this.commentStore.update(id, body);
  }

  async deleteComment(id: string): Promise<void> {
    return this.commentStore.delete(id);
  }

  // --- Label operations ---

  async createLabel(input: CreateLabelInput): Promise<Label> {
    return this.labelStore.create(input);
  }

  async listLabels(): Promise<Label[]> {
    return this.labelStore.list();
  }

  async getLabel(id: string): Promise<Label | null> {
    return this.labelStore.get(id);
  }

  async getLabelByName(name: string): Promise<Label | null> {
    return this.labelStore.getByName(name);
  }

  async updateLabel(id: string, input: UpdateLabelInput): Promise<Label> {
    return this.labelStore.update(id, input);
  }

  async deleteLabel(id: string): Promise<void> {
    return this.labelStore.delete(id);
  }

  // --- Issue-Label operations ---

  async addLabel(issueId: string, labelId: string): Promise<void> {
    return this.issueStore.addLabel(issueId, labelId);
  }

  async removeLabel(issueId: string, labelId: string): Promise<void> {
    return this.issueStore.removeLabel(issueId, labelId);
  }
}

/** Factory function to create an IssueX client */
export function createIssueX(options: IssueXOptions): IssueX {
  return new IssueX(options);
}
