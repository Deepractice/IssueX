import { expect } from "bun:test";
import { defineStep, Then, When } from "@deepracticex/bdd";
import type { IssueXWorld } from "../support/world";

// --- Shared steps (used as both Given and When) ---

defineStep(
  "{string} comments {string} on the issue",
  async function (this: IssueXWorld, author: string, body: string) {
    if (!this.currentIssue) throw new Error("No current issue");
    this.currentComment = await this.issuex.createComment(this.currentIssue.id, body, author);
  }
);

// --- When ---

When("I list comments on the issue", async function (this: IssueXWorld) {
  if (!this.currentIssue) throw new Error("No current issue");
  this.comments = await this.issuex.listComments(this.currentIssue.id);
});

When("I update the comment body to {string}", async function (this: IssueXWorld, body: string) {
  if (!this.currentComment) throw new Error("No current comment");
  this.currentComment = await this.issuex.updateComment(this.currentComment.id, body);
});

When("I delete the comment", async function (this: IssueXWorld) {
  if (!this.currentComment) throw new Error("No current comment");
  await this.issuex.deleteComment(this.currentComment.id);
});

// --- Then ---

Then("the comment should be created successfully", function (this: IssueXWorld) {
  expect(this.currentComment).toBeDefined();
  expect(this.currentComment!.id).toBeTruthy();
});

Then("the comment author should be {string}", function (this: IssueXWorld, author: string) {
  expect(this.currentComment!.author).toBe(author);
});

Then("the comment body should be {string}", function (this: IssueXWorld, body: string) {
  expect(this.currentComment!.body).toBe(body);
});

Then("I should get {int} comments", function (this: IssueXWorld, count: number) {
  expect(this.comments).toHaveLength(count);
});

Then("comments should be ordered by creation time ascending", function (this: IssueXWorld) {
  for (let i = 1; i < this.comments.length; i++) {
    expect(this.comments[i].createdAt >= this.comments[i - 1].createdAt).toBe(true);
  }
});

Then("the comment updatedAt should be after createdAt", function (this: IssueXWorld) {
  expect(this.currentComment!.updatedAt >= this.currentComment!.createdAt).toBe(true);
});

Then(
  "listing comments should return {int} comments",
  async function (this: IssueXWorld, count: number) {
    if (!this.currentIssue) throw new Error("No current issue");
    const comments = await this.issuex.listComments(this.currentIssue.id);
    expect(comments).toHaveLength(count);
  }
);
