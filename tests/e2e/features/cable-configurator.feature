Feature: Cable Configurator Selection
  As a customer needing a specific cable
  I want to select cable type, connector types, and filter by manufacturer
  So that I can find and purchase the exact cable I need

  Scenario Outline: Configure cable, filter by manufacturer and add to shopping cart
    Given I navigate to the cable guy page
    And I accept the cookies
    When I select a cable beginning of type "<cable_beginning_type>"
    And I select a cable beginning connector of type "<cable_beginning_connector>"
    And I select a cable end of type "<cable_end_type>"
    And I select a cable end connector of type "<cable_end_connector>"
    And I select a manufacturer of type "<manufacturer>"
    Then I see the available products
    When I select the product "<product>"
    Then I see the product page
    When I add the product to shopping basket
    Then I see the product in my shopping basket

    # title-format: Test run #<run>
    Examples:
      | run | cable_beginning_type | cable_beginning_connector | cable_end_type | cable_end_connector | manufacturer | product |
      |   1 | random               | random                    | random         | random              | random       | any     |
      |   2 | random               | random                    | random         | random              | random       | any     |
      |   3 | random               | random                    | random         | random              | random       | any     |
      |   4 | random               | random                    | random         | random              | random       | any     |
      |   5 | random               | random                    | random         | random              | random       | any     |
      |   6 | random               | random                    | random         | random              | random       | any     |
      |   7 | random               | random                    | random         | random              | random       | any     |
      |   8 | random               | random                    | random         | random              | random       | any     |
      |   9 | random               | random                    | random         | random              | random       | any     |
      |  10 | random               | random                    | random         | random              | random       | any     |
      |  11 | random               | random                    | random         | random              | random       | any     |
      |  12 | random               | random                    | random         | random              | random       | any     |
      |  13 | random               | random                    | random         | random              | random       | any     |
      |  14 | random               | random                    | random         | random              | random       | any     |
      |  15 | random               | random                    | random         | random              | random       | any     |
      |  16 | random               | random                    | random         | random              | random       | any     |
      |  17 | random               | random                    | random         | random              | random       | any     |
      |  18 | random               | random                    | random         | random              | random       | any     |
      |  19 | random               | random                    | random         | random              | random       | any     |
      |  20 | random               | random                    | random         | random              | random       | any     |
      |  21 | random               | random                    | random         | random              | random       | any     |
      |  22 | random               | random                    | random         | random              | random       | any     |
      |  23 | random               | random                    | random         | random              | random       | any     |
      |  24 | random               | random                    | random         | random              | random       | any     |
      |  25 | random               | random                    | random         | random              | random       | any     |
      |  26 | random               | random                    | random         | random              | random       | any     |
      |  27 | random               | random                    | random         | random              | random       | any     |
      |  28 | random               | random                    | random         | random              | random       | any     |
      |  29 | random               | random                    | random         | random              | random       | any     |
      |  30 | random               | random                    | random         | random              | random       | any     |
