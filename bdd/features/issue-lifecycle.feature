Feature: Issue Lifecycle Management
  As an AI individual, I need to create, view, update, and close issues
  to enable structured communication between individuals.

  Scenario: Create a new issue
    Given no issues exist
    When "yiming" creates an issue titled "Design IssueX data model" with body "Define types for Issue, Comment, Label"
    Then the issue should be created successfully
    And the issue number should be 1
    And the issue status should be "open"
    And the issue author should be "yiming"

  Scenario: Issue numbers auto-increment
    Given "yiming" has created 2 issues
    When "nuwa" creates an issue titled "Third issue" with body "Testing numbering"
    Then the issue number should be 3

  Scenario: Get issue by number
    Given "yiming" creates an issue titled "Test retrieval" with body "Detailed description"
    When I get issue by number 1
    Then the issue title should be "Test retrieval"
    And the issue body should be "Detailed description"

  Scenario: Update issue title
    Given "yiming" creates an issue titled "Old title" with body "Content"
    When I update the issue title to "New title"
    Then the issue title should be "New title"

  Scenario: Assign issue to another individual
    Given "yiming" creates an issue titled "Needs assignment" with body "Task"
    When I assign the issue to "nuwa"
    Then the issue assignee should be "nuwa"

  Scenario: Close an issue
    Given "yiming" creates an issue titled "To be closed" with body "Done"
    When I close the issue
    Then the issue status should be "closed"
    And the issue closedAt should not be null

  Scenario: Reopen a closed issue
    Given "yiming" creates an issue titled "Was closed" with body "Needs reopen"
    And the issue has been closed
    When I reopen the issue
    Then the issue status should be "open"
    And the issue closedAt should be null
