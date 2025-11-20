# JSONPlaceholder API Challenge

## Overview

The JSONPlaceholder API Challenge demonstrates comprehensive API testing using Playwright's API testing capabilities. This challenge covers all 6 JSONPlaceholder resources (Posts, Users, Comments, Albums, Photos, Todos) with full CRUD operations and relationship queries.

**Base URL**: `https://jsonplaceholder.typicode.com`

## Challenge Statistics

- **Total Scenarios**: 34
- **Resources Covered**: 6 (Posts, Users, Comments, Albums, Photos, Todos)
- **Operations**: GET, POST, PUT, DELETE
- **Test Coverage**: All CRUD operations + relationship queries

## Architecture

### Directory Structure

```text
tests/e2e/challenges/jsonplaceholder/
├── features/
│   ├── posts.feature          # 5 scenarios
│   ├── users.feature          # 5 scenarios
│   ├── comments.feature       # 6 scenarios
│   ├── albums.feature         # 6 scenarios
│   ├── photos.feature         # 6 scenarios
│   └── todos.feature          # 6 scenarios
├── services/                   # API Object Models
│   ├── posts-service.ts
│   ├── users-service.ts
│   ├── comments-service.ts
│   ├── albums-service.ts
│   ├── photos-service.ts
│   └── todos-service.ts
├── utils/                      # Shared utilities
│   ├── response-verifier.ts   # Common response verification
│   ├── response-tracker.ts    # Shared response state
│   ├── response-validator.ts  # Response structure validation
│   └── data-generator.ts      # Test data generation
└── world.ts                    # API-specific fixtures
```

### API Object Model (AOM) Pattern

Similar to Page Object Model (POM) for UI tests, API tests use an **API Object Model (AOM)** pattern:

```typescript
@Fixture('PostsService')
export class PostsService {
  constructor(private request: APIRequestContext) {}

  @Given('I retrieve all posts')
  async getAllPosts(): Promise<void> {
    const response = await this.request.get('/posts');
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
    this.lastPosts = await response.json();
  }
}
```

### Key Differences from POM

| Aspect          | POM (UI)      | AOM (API)                      |
| --------------- | ------------- | ------------------------------ |
| **Dependency**  | `Page`        | `APIRequestContext`            |
| **Interaction** | DOM elements  | HTTP requests/responses        |
| **Assertions**  | DOM state     | Response status, body, headers |
| **Fixtures**    | Page fixtures | API context fixtures           |
| **Components**  | UI components | API service classes            |

## Service Classes

### PostsService

Tests CRUD operations for blog posts:

- `GET /posts` - Retrieve all posts
- `GET /posts/:id` - Retrieve specific post
- `POST /posts` - Create new post
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post

**Scenarios**: 5

### UsersService

Tests user management operations:

- `GET /users` - Retrieve all users
- `GET /users/:id` - Retrieve specific user
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

**Scenarios**: 5

### CommentsService

Tests comment operations with post relationships:

- `GET /comments` - Retrieve all comments
- `GET /comments/:id` - Retrieve specific comment
- `GET /posts/:id/comments` - Retrieve comments for post
- `POST /comments` - Create new comment
- `PUT /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment

**Scenarios**: 6

### AlbumsService

Tests album operations with user relationships:

- `GET /albums` - Retrieve all albums
- `GET /albums/:id` - Retrieve specific album
- `GET /users/:id/albums` - Retrieve albums for user
- `POST /albums` - Create new album
- `PUT /albums/:id` - Update album
- `DELETE /albums/:id` - Delete album

**Scenarios**: 6

### PhotosService

Tests photo operations with album relationships:

- `GET /photos` - Retrieve all photos
- `GET /photos/:id` - Retrieve specific photo
- `GET /albums/:id/photos` - Retrieve photos for album
- `POST /photos` - Create new photo
- `PUT /photos/:id` - Update photo
- `DELETE /photos/:id` - Delete photo

**Scenarios**: 6

### TodosService

Tests todo operations with completion status:

- `GET /todos` - Retrieve all todos
- `GET /todos/:id` - Retrieve specific todo
- `GET /users/:id/todos` - Retrieve todos for user
- `POST /todos` - Create new todo
- `PUT /todos/:id` - Update todo with completion status
- `DELETE /todos/:id` - Delete todo

**Scenarios**: 6

## Utilities

### ResponseVerifier

Common response verification methods extracted to utils:

```typescript
export class ResponseVerifier {
  @Step
  static async verifyResponseIsOk(response: APIResponse): Promise<void> {
    expect(response.ok()).toBeTruthy();
  }

  @Step
  static async verifyResponseStatus(response: APIResponse, status: number): Promise<void> {
    expect(response.status()).toBe(status);
  }
}
```

### ResponseTracker

Shared response state management for cross-service step definitions:

```typescript
export function setLastResponse(response: APIResponse): void;
export function getLastResponse(): APIResponse | null;
export function clearLastResponse(): void;
```

### ResponseValidator

Response structure validation utilities:

```typescript
export class ResponseValidator {
  static validatePostResponse(post: Post): void;
  static validatePostsArray(posts: Post[]): void;
}
```

### DataGenerator

Test data generation utilities:

```typescript
export class PostDataGenerator {
  static generatePost(overrides?: Partial<Post>): Omit<Post, 'id'>;
}
```

## Running Tests

### Run All JSONPlaceholder Tests

```bash
bun run test -- --project=jsonplaceholder-api
```

### Run Specific Feature

```bash
bun run test -- --project=jsonplaceholder-api --grep "Posts API"
```

### Run Specific Scenario

```bash
bun run test -- --project=jsonplaceholder-api --grep "Retrieve all posts"
```

## Feature Files

### Posts Feature

```gherkin
Feature: JSONPlaceholder Posts API

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
```

## Best Practices

### 1. Service Isolation

Each service class is independent and can be used in any feature file:

```typescript
// Can use any service in any feature
Given I retrieve all posts
When I create a new comment for post 1 with name "Test" and body "Body"
```

### 2. Shared Step Definitions

Common steps like "the response status should be {int}" are shared across all services via `ResponseTracker`.

### 3. Response State Management

Services maintain their own state (`lastPost`, `lastPosts`) while also updating shared state via `ResponseTracker` for cross-service steps.

### 4. Error Handling

All services include proper error messages when state is missing:

```typescript
if (!this.lastPost) {
  throw new Error('No post retrieved. Call "I retrieve post with ID" first.');
}
```

## Integration with Existing Patterns

- ✅ Same challenge isolation pattern as UI challenges
- ✅ Same BDD/Gherkin approach
- ✅ Same world fixture pattern (adapted for API)
- ✅ Same feature file organization
- ✅ Same CI/CD integration
- ✅ Same bug reporting mechanism

## Next Steps

- Phase 3: Add ReqRes.in challenge (authentication patterns)
- Phase 4: Add RESTful-Booker challenge (complex workflows)
- Phase 5: Add HTTPBin challenge (edge cases)

