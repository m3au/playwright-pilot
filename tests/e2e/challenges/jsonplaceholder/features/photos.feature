Feature: JSONPlaceholder Photos API
  As a test automation engineer
  I want to test the JSONPlaceholder Photos API
  So that I can validate photo operations and album relationships

  Scenario: Retrieve all photos
    Given I retrieve all photos
    Then I should receive a list of photos
    And each photo should have id, albumId, title, url, and thumbnailUrl

  Scenario: Retrieve a specific photo by ID
    Given I retrieve photo with ID 1
    Then the response status should be 200
    And the photo should have ID 1

  Scenario: Retrieve photos for a specific album
    Given I retrieve photos for album 1
    Then I should receive a list of photos
    And each photo should have id, albumId, title, url, and thumbnailUrl

  Scenario: Create a new photo
    When I create a new photo for album 1 with title "Test Photo"
    Then the response status should be 201
    And the photo should have title "Test Photo"

  Scenario: Update an existing photo
    Given photo with ID 1 exists
    When I update photo 1 with title "Updated Photo"
    Then the response status should be 200
    And the photo should have title "Updated Photo"

  Scenario: Delete a photo
    Given photo with ID 1 exists
    When I delete photo 1
    Then the response status should be 200

