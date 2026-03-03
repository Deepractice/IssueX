Feature: Issue Filtering
  As an AI individual, I need to filter issues by various criteria
  to find relevant issues quickly.

  Background:
    Given the following issues exist:
      | author  | title          | status |
      | yiming  | Bug in parser  | open   |
      | yiming  | Add dark mode  | closed |
      | nuwa    | Fix typo       | open   |
      | nuwa    | Update docs    | closed |

  Scenario: Filter issues by status open
    When I list issues with status "open"
    Then I should get 2 issues
    And all issues should have status "open"

  Scenario: Filter issues by status closed
    When I list issues with status "closed"
    Then I should get 2 issues
    And all issues should have status "closed"

  Scenario: Filter issues by author
    When I list issues by author "yiming"
    Then I should get 2 issues
    And all issues should have author "yiming"

  Scenario: Filter issues by assignee
    Given issue "Bug in parser" is assigned to "nuwa"
    When I list issues by assignee "nuwa"
    Then I should get 1 issue

  Scenario: List all issues without filter
    When I list all issues
    Then I should get 4 issues

  Scenario: List issues ordered by number descending
    When I list all issues
    Then the first issue number should be 4
    And the last issue number should be 1
