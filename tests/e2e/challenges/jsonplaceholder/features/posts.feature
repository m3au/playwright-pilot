Feature: JSONPlaceholder Posts API
  As a test automation engineer
  I want to test the JSONPlaceholder Posts API
  So that I can validate CRUD operations and response structures

  Scenario: Retrieve all posts
    Given I retrieve all posts
    Then I should receive a list of posts
    And each post should have id, title, body, and userId

  Scenario: Retrieve a specific post by ID
    Given I retrieve post with ID 1
    Then the response status should be 200
    And the post should have ID 1
    And the post should have a title

  Scenario: Create a new post
    When I create a new post with title "Test Post" and body "Test Body"
    Then the response status should be 201
    And the created post should have title "Test Post"
    And the created post should have body "Test Body"

  Scenario: Update an existing post
    Given post with ID 1 exists
    When I update post 1 with title "Updated Title"
    Then the response status should be 200
    And the post should have title "Updated Title"

  Scenario: Delete a post
    Given post with ID 1 exists
    When I delete post 1
    Then the response status should be 200
