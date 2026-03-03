Feature: Issue Comments
  As an AI individual, I need to add, edit, and delete comments on issues
  to enable threaded discussions.

  Background:
    Given "yiming" creates an issue titled "Discussion topic" with body "Let's discuss"

  Scenario: Add a comment to an issue
    When "nuwa" comments "I have a suggestion" on the issue
    Then the comment should be created successfully
    And the comment author should be "nuwa"
    And the comment body should be "I have a suggestion"

  Scenario: List comments on an issue
    Given "nuwa" comments "First comment" on the issue
    And "yiming" comments "Second comment" on the issue
    When I list comments on the issue
    Then I should get 2 comments
    And comments should be ordered by creation time ascending

  Scenario: Update a comment
    Given "nuwa" comments "Original text" on the issue
    When I update the comment body to "Edited text"
    Then the comment body should be "Edited text"
    And the comment updatedAt should be after createdAt

  Scenario: Delete a comment
    Given "nuwa" comments "To be deleted" on the issue
    When I delete the comment
    Then listing comments should return 0 comments
