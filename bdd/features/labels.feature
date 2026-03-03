Feature: Label Management
  As an AI individual, I need to create and manage labels
  to categorize issues effectively.

  Scenario: Create a label
    When I create a label named "bug" with color "#d73a4a"
    Then the label should be created successfully
    And the label name should be "bug"
    And the label color should be "#d73a4a"

  Scenario: Create a label with description
    When I create a label named "enhancement" with description "New feature request" and color "#a2eeef"
    Then the label description should be "New feature request"

  Scenario: List all labels
    Given the following labels exist:
      | name        | color   |
      | bug         | #d73a4a |
      | enhancement | #a2eeef |
      | docs        | #0075ca |
    When I list all labels
    Then I should get 3 labels

  Scenario: Get label by name
    Given a label named "bug" with color "#d73a4a" exists
    When I get the label by name "bug"
    Then the label name should be "bug"

  Scenario: Update a label
    Given a label named "bug" with color "#d73a4a" exists
    When I update the label color to "#ff0000"
    Then the label color should be "#ff0000"

  Scenario: Delete a label
    Given a label named "temporary" with color "#cccccc" exists
    When I delete the label
    Then listing labels should return 0 labels

  Scenario: Add label to an issue
    Given "yiming" creates an issue titled "Buggy feature" with body "Something broke"
    And a label named "bug" with color "#d73a4a" exists
    When I add the label to the issue
    Then the issue should have 1 label

  Scenario: Remove label from an issue
    Given "yiming" creates an issue titled "Buggy feature" with body "Something broke"
    And a label named "bug" with color "#d73a4a" exists
    And the label is added to the issue
    When I remove the label from the issue
    Then the issue should have 0 labels

  Scenario: Filter issues by label
    Given "yiming" creates an issue titled "Bug report" with body "Broken"
    And "yiming" creates an issue titled "Feature request" with body "New idea"
    And a label named "bug" with color "#d73a4a" exists
    And the label is added to issue "Bug report"
    When I list issues with label "bug"
    Then I should get 1 issue
