import { configure } from "@deepracticex/bdd";

await configure({
  features: "features/**/*.feature",
  steps: ["support/**/*.ts", "steps/**/*.ts"],
});
