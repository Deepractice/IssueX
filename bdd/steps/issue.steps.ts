import { expect } from "bun:test";
import { type DataTable, defineStep, Given, Then, When } from "@deepracticex/bdd";
import type { IssueXWorld } from "../support/world";

// --- Shared steps (used as both Given and When) ---

defineStep(
  "{string} creates an issue titled {string} with body {string}",
  async function (this: IssueXWorld, author: string, title: string, body: string) {
    this.currentIssue = await this.issuex.createIssue({ title, body, author });
  }
);

// --- Given ---

Given("no issues exist", function (this: IssueXWorld) {
  // Fresh in-memory DB per scenario — nothing to do
});

Given(
  "{string} has created {int} issues",
  async function (this: IssueXWorld, author: string, count: number) {
    for (let i = 1; i <= count; i++) {
      this.currentIssue = await this.issuex.createIssue({
        title: `Issue ${i}`,
        body: `Body ${i}`,
        author,
      });
    }
  }
);

Given("the following issues exist:", async function (this: IssueXWorld, dataTable: DataTable) {
  for (const row of dataTable.hashes()) {
    const issue = await this.issuex.createIssue({
      title: row.title,
      body: "",
      author: row.author,
    });
    if (row.status === "closed") {
      await this.issuex.closeIssue(issue.id);
    }
  }
});

Given(
  "issue {string} is assigned to {string}",
  async function (this: IssueXWorld, title: string, assignee: string) {
    const issues = await this.issuex.listIssues();
    const issue = issues.find((i) => i.title === title);
    if (!issue) throw new Error(`Issue "${title}" not found`);
    await this.issuex.updateIssue(issue.id, { assignee });
  }
);

Given("the issue has been closed", async function (this: IssueXWorld) {
  if (!this.currentIssue) throw new Error("No current issue");
  this.currentIssue = await this.issuex.closeIssue(this.currentIssue.id);
});

// --- When ---

When("I get issue by number {int}", async function (this: IssueXWorld, number: number) {
  this.currentIssue = (await this.issuex.getIssueByNumber(number)) ?? undefined;
});

When("I update the issue title to {string}", async function (this: IssueXWorld, title: string) {
  if (!this.currentIssue) throw new Error("No current issue");
  this.currentIssue = await this.issuex.updateIssue(this.currentIssue.id, { title });
});

When("I assign the issue to {string}", async function (this: IssueXWorld, assignee: string) {
  if (!this.currentIssue) throw new Error("No current issue");
  this.currentIssue = await this.issuex.updateIssue(this.currentIssue.id, { assignee });
});

When("I close the issue", async function (this: IssueXWorld) {
  if (!this.currentIssue) throw new Error("No current issue");
  this.currentIssue = await this.issuex.closeIssue(this.currentIssue.id);
});

When("I reopen the issue", async function (this: IssueXWorld) {
  if (!this.currentIssue) throw new Error("No current issue");
  this.currentIssue = await this.issuex.reopenIssue(this.currentIssue.id);
});

When("I list issues with status {string}", async function (this: IssueXWorld, status: string) {
  this.issues = await this.issuex.listIssues({ status: status as "open" | "closed" });
});

When("I list issues by author {string}", async function (this: IssueXWorld, author: string) {
  this.issues = await this.issuex.listIssues({ author });
});

When("I list issues by assignee {string}", async function (this: IssueXWorld, assignee: string) {
  this.issues = await this.issuex.listIssues({ assignee });
});

When("I list all issues", async function (this: IssueXWorld) {
  this.issues = await this.issuex.listIssues();
});

// --- Then ---

Then("the issue should be created successfully", function (this: IssueXWorld) {
  expect(this.currentIssue).toBeDefined();
  expect(this.currentIssue!.id).toBeTruthy();
});

Then("the issue number should be {int}", function (this: IssueXWorld, number: number) {
  expect(this.currentIssue!.number).toBe(number);
});

Then("the issue status should be {string}", function (this: IssueXWorld, status: string) {
  expect(this.currentIssue!.status).toBe(status);
});

Then("the issue author should be {string}", function (this: IssueXWorld, author: string) {
  expect(this.currentIssue!.author).toBe(author);
});

Then("the issue title should be {string}", function (this: IssueXWorld, title: string) {
  expect(this.currentIssue!.title).toBe(title);
});

Then("the issue body should be {string}", function (this: IssueXWorld, body: string) {
  expect(this.currentIssue!.body).toBe(body);
});

Then("the issue assignee should be {string}", function (this: IssueXWorld, assignee: string) {
  expect(this.currentIssue!.assignee).toBe(assignee);
});

Then("the issue closedAt should not be null", function (this: IssueXWorld) {
  expect(this.currentIssue!.closedAt).not.toBeNull();
});

Then("the issue closedAt should be null", function (this: IssueXWorld) {
  expect(this.currentIssue!.closedAt).toBeNull();
});

Then("I should get {int} issues", function (this: IssueXWorld, count: number) {
  expect(this.issues).toHaveLength(count);
});

Then("I should get {int} issue", function (this: IssueXWorld, count: number) {
  expect(this.issues).toHaveLength(count);
});

Then("all issues should have status {string}", function (this: IssueXWorld, status: string) {
  for (const issue of this.issues) {
    expect(issue.status).toBe(status);
  }
});

Then("all issues should have author {string}", function (this: IssueXWorld, author: string) {
  for (const issue of this.issues) {
    expect(issue.author).toBe(author);
  }
});

Then("the first issue number should be {int}", function (this: IssueXWorld, number: number) {
  expect(this.issues[0].number).toBe(number);
});

Then("the last issue number should be {int}", function (this: IssueXWorld, number: number) {
  expect(this.issues[this.issues.length - 1].number).toBe(number);
});
