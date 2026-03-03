import { expect } from "bun:test";
import { type DataTable, Given, Then, When } from "@deepracticex/bdd";
import type { IssueXWorld } from "../support/world";

// --- Given ---

Given("the following labels exist:", async function (this: IssueXWorld, dataTable: DataTable) {
  for (const row of dataTable.hashes()) {
    this.currentLabel = await this.issuex.createLabel({
      name: row.name,
      color: row.color,
    });
  }
});

Given(
  "a label named {string} with color {string} exists",
  async function (this: IssueXWorld, name: string, color: string) {
    this.currentLabel = await this.issuex.createLabel({ name, color });
  }
);

Given("the label is added to the issue", async function (this: IssueXWorld) {
  if (!this.currentIssue || !this.currentLabel) throw new Error("No current issue or label");
  await this.issuex.addLabel(this.currentIssue.id, this.currentLabel.id);
  this.currentIssue = (await this.issuex.getIssue(this.currentIssue.id))!;
});

Given("the label is added to issue {string}", async function (this: IssueXWorld, title: string) {
  if (!this.currentLabel) throw new Error("No current label");
  const issues = await this.issuex.listIssues();
  const issue = issues.find((i) => i.title === title);
  if (!issue) throw new Error(`Issue "${title}" not found`);
  await this.issuex.addLabel(issue.id, this.currentLabel.id);
});

// --- When ---

When(
  "I create a label named {string} with color {string}",
  async function (this: IssueXWorld, name: string, color: string) {
    this.currentLabel = await this.issuex.createLabel({ name, color });
  }
);

When(
  "I create a label named {string} with description {string} and color {string}",
  async function (this: IssueXWorld, name: string, description: string, color: string) {
    this.currentLabel = await this.issuex.createLabel({ name, description, color });
  }
);

When("I list all labels", async function (this: IssueXWorld) {
  this.labels = await this.issuex.listLabels();
});

When("I get the label by name {string}", async function (this: IssueXWorld, name: string) {
  this.currentLabel = (await this.issuex.getLabelByName(name)) ?? undefined;
});

When("I update the label color to {string}", async function (this: IssueXWorld, color: string) {
  if (!this.currentLabel) throw new Error("No current label");
  this.currentLabel = await this.issuex.updateLabel(this.currentLabel.id, { color });
});

When("I delete the label", async function (this: IssueXWorld) {
  if (!this.currentLabel) throw new Error("No current label");
  await this.issuex.deleteLabel(this.currentLabel.id);
});

When("I add the label to the issue", async function (this: IssueXWorld) {
  if (!this.currentIssue || !this.currentLabel) throw new Error("No current issue or label");
  await this.issuex.addLabel(this.currentIssue.id, this.currentLabel.id);
  this.currentIssue = (await this.issuex.getIssue(this.currentIssue.id))!;
});

When("I remove the label from the issue", async function (this: IssueXWorld) {
  if (!this.currentIssue || !this.currentLabel) throw new Error("No current issue or label");
  await this.issuex.removeLabel(this.currentIssue.id, this.currentLabel.id);
  this.currentIssue = (await this.issuex.getIssue(this.currentIssue.id))!;
});

When("I list issues with label {string}", async function (this: IssueXWorld, labelName: string) {
  const label = await this.issuex.getLabelByName(labelName);
  if (!label) throw new Error(`Label "${labelName}" not found`);
  this.issues = await this.issuex.listIssues({ label: label.id });
});

// --- Then ---

Then("the label should be created successfully", function (this: IssueXWorld) {
  expect(this.currentLabel).toBeDefined();
  expect(this.currentLabel!.id).toBeTruthy();
});

Then("the label name should be {string}", function (this: IssueXWorld, name: string) {
  expect(this.currentLabel!.name).toBe(name);
});

Then("the label color should be {string}", function (this: IssueXWorld, color: string) {
  expect(this.currentLabel!.color).toBe(color);
});

Then("the label description should be {string}", function (this: IssueXWorld, desc: string) {
  expect(this.currentLabel!.description).toBe(desc);
});

Then("I should get {int} labels", function (this: IssueXWorld, count: number) {
  expect(this.labels).toHaveLength(count);
});

Then(
  "listing labels should return {int} labels",
  async function (this: IssueXWorld, count: number) {
    const labels = await this.issuex.listLabels();
    expect(labels).toHaveLength(count);
  }
);

Then("the issue should have {int} label", async function (this: IssueXWorld, count: number) {
  expect(this.currentIssue!.labels).toHaveLength(count);
});

Then("the issue should have {int} labels", async function (this: IssueXWorld, count: number) {
  expect(this.currentIssue!.labels).toHaveLength(count);
});
