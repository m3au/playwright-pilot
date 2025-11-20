Feature: JSONPlaceholder Albums API
  As a test automation engineer
  I want to test the JSONPlaceholder Albums API
  So that I can validate album operations and user relationships

  Scenario: Retrieve all albums
    Given I retrieve all albums
    Then I should receive a list of albums
    And each album should have id, userId, and title

  Scenario: Retrieve a specific album by ID
    Given I retrieve album with ID 1
    Then the response status should be 200
    And the album should have ID 1
    And the album should have title "quidem molestiae enim"

  Scenario: Retrieve albums for a specific user
    Given I retrieve albums for user 1
    Then I should receive a list of albums
    And each album should have id, userId, and title

  Scenario: Create a new album
    When I create a new album for user 1 with title "Test Album"
    Then the response status should be 201
    And the album should have title "Test Album"

  Scenario: Update an existing album
    Given album with ID 1 exists
    When I update album 1 with title "Updated Album"
    Then the response status should be 200
    And the album should have title "Updated Album"

  Scenario: Delete an album
    Given album with ID 1 exists
    When I delete album 1
    Then the response status should be 200

