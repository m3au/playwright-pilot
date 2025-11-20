Feature: JSONPlaceholder Comments API
  As a test automation engineer
  I want to test the JSONPlaceholder Comments API
  So that I can validate comment operations and relationships

  Scenario: Retrieve all comments
    Given I retrieve all comments
    Then I should receive a list of comments
    And each comment should have id, postId, name, email, and body

  Scenario: Retrieve a specific comment by ID
    Given I retrieve comment with ID 1
    Then the response status should be 200
    And the comment should have ID 1
    And the comment should have postId 1

  Scenario: Retrieve comments for a specific post
    Given I retrieve comments for post 1
    Then I should receive a list of comments
    And each comment should have id, postId, name, email, and body

  Scenario: Create a new comment
    When I create a new comment for post 1 with name "Test Comment" and body "This is a test comment"
    Then the response status should be 201
    And the comment should have postId 1
    And the comment should have body "This is a test comment"

  Scenario: Update an existing comment
    Given comment with ID 1 exists
    When I update comment 1 with body "Updated comment body"
    Then the response status should be 200
    And the comment should have body "Updated comment body"

  Scenario: Delete a comment
    Given comment with ID 1 exists
    When I delete comment 1
    Then the response status should be 200

