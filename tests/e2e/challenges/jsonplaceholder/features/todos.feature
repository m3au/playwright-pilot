Feature: JSONPlaceholder Todos API
  As a test automation engineer
  I want to test the JSONPlaceholder Todos API
  So that I can validate todo operations and completion status

  Scenario: Retrieve all todos
    Given I retrieve all todos
    Then I should receive a list of todos
    And each todo should have id, userId, title, and completed

  Scenario: Retrieve a specific todo by ID
    Given I retrieve todo with ID 1
    Then the response status should be 200
    And the todo should have ID 1

  Scenario: Retrieve todos for a specific user
    Given I retrieve todos for user 1
    Then I should receive a list of todos
    And each todo should have id, userId, title, and completed

  Scenario: Create a new todo
    When I create a new todo for user 1 with title "Test Todo"
    Then the response status should be 201
    And the todo should have title "Test Todo"

  Scenario: Update a todo with completion status
    Given todo with ID 1 exists
    When I update todo 1 with title "Updated Todo" and completed "true"
    Then the response status should be 200
    And the todo should have title "Updated Todo"
    And the todo should be completed

  Scenario: Delete a todo
    Given todo with ID 1 exists
    When I delete todo 1
    Then the response status should be 200

