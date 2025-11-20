Feature: JSONPlaceholder Users API
  As a test automation engineer
  I want to test the JSONPlaceholder Users API
  So that I can validate user management operations

  Scenario: Retrieve all users
    Given I retrieve all users
    Then I should receive a list of users
    And each user should have id, name, username, and email

  Scenario: Retrieve a specific user by ID
    Given I retrieve user with ID 1
    Then the response status should be 200
    And the user should have ID 1
    And the user should have name "Leanne Graham"

  Scenario: Create a new user
    When I create a new user with name "Test User" and email "test@example.com"
    Then the response status should be 201
    And the user should have name "Test User"
    And the user should have email "test@example.com"

  Scenario: Update an existing user
    Given user with ID 1 exists
    When I update user 1 with name "Updated User"
    Then the response status should be 200
    And the user should have name "Updated User"

  Scenario: Delete a user
    Given user with ID 1 exists
    When I delete user 1
    Then the response status should be 200

