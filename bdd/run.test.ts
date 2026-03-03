import "./support/world";
import "./steps/issue.steps";
import "./steps/comment.steps";
import "./steps/label.steps";
import { loadFeature } from "@deepracticex/bdd";

loadFeature("features/issue-lifecycle.feature");
loadFeature("features/issue-filtering.feature");
loadFeature("features/comments.feature");
loadFeature("features/labels.feature");
