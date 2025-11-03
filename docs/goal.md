# Goal <!-- omit from toc -->

This document summarizes the technical goal submission: a complete Playwright E2E test automation solution with BDD.

![Placeholder](https://placecats.com/neo/400/200)

## Table of Contents <!-- omit from toc -->

- [Objective](#objective)
- [Requirements](#requirements)
- [Task Details](#task-details)
- [Technical Requirements](#technical-requirements)

---

## Objective

Create a test scenario using Playwright that navigates through the company website, selecting random categories, sub-categories, and products. Ensure proper documentation and code quality.

## Requirements

**Task**: Create a Playwright test scenario for company website cable selection

- Navigate through Cable Guy tool
- Select random categories and products
- Validate product counts and basket functionality
- Implement Page Object pattern
- Generate test reports

## Task Details

Navigate to the specific webpage

Execute the following actions as part of a single test scenario:

| Step | Description                         | Action                                                                                        | Validation                                                                                                         |
| ---- | ----------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1    | Cable Beginning Selection           | Click on the "Cable Beginning" section<br>Select a random Cable Type<br>Select a random Cable | -                                                                                                                  |
| 2    | Cable End Selection                 | Click on the "Cable End" section<br>Select another random Cable Type<br>Select a random Cable | -                                                                                                                  |
| 3    | Manufacturer Selection & Validation | Choose a random Manufacturer from the available options                                       | Validate that the number of products displayed matches the expected number indicated below the manufacturer's logo |
| 4    | Product Navigation Verification     | Click on one of the products filtered by the selection                                        | Verify that the correct product page is opened                                                                     |
| 5    | Shopping Basket Validation          | Add the selected product (cable) to the shopping basket                                       | Verify the Basket Notification Popup for accuracy                                                                  |

## Technical Requirements

- **Recommended**: TypeScript
- **Acceptable**: Pure JavaScript
- **Framework**: Playwright
