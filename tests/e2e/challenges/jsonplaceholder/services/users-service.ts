import type { APIRequestContext } from '@playwright/test';
import { ResponseVerifier } from '../utils/response-verifier';
import { setLastResponse } from '../utils/response-tracker';
import { expect, Fixture, Given, Then, When, Step } from '@world';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

@Fixture('UsersService')
export class UsersService {
  constructor(private request: APIRequestContext) {}

  private readonly usersEndpoint = '/users';
  private readonly userByIdEndpoint = (id: number) => `/users/${id}`;

  private lastResponse: Awaited<ReturnType<APIRequestContext['get'] | APIRequestContext['post'] | APIRequestContext['put'] | APIRequestContext['delete']>> | null = null;
  private lastUsers: User[] | null = null;
  private lastUser: User | null = null;

  @Given('I retrieve all users')
  async getAllUsers(): Promise<void> {
    const response = await this.request.get(this.usersEndpoint);
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
    this.lastUsers = await response.json();
  }

  @Given('I retrieve user with ID {int}')
  async getUserById(id: number): Promise<void> {
    const response = await this.request.get(this.userByIdEndpoint(id));
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
    this.lastUser = await response.json();
  }

  @Given('user with ID {int} exists')
  async verifyUserExists(id: number): Promise<void> {
    await this.getUserById(id);
  }

  @When('I create a new user with name {string} and email {string}')
  async createUser(name: string, email: string): Promise<void> {
    const response = await this.request.post(this.usersEndpoint, {
      data: { name, email, username: name.toLowerCase().replace(/\s+/g, ''), phone: '1-234-567-8900', website: 'example.com' },
    });
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseStatus(response, 201);
    this.lastUser = await response.json();
  }

  @When('I update user {int} with name {string}')
  async updateUser(id: number, name: string): Promise<void> {
    const response = await this.request.put(this.userByIdEndpoint(id), {
      data: { id, name, username: 'updated', email: 'updated@example.com', phone: '1-234-567-8900', website: 'example.com' },
    });
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
    this.lastUser = await response.json();
  }

  @When('I delete user {int}')
  async deleteUser(id: number): Promise<void> {
    const response = await this.request.delete(this.userByIdEndpoint(id));
    this.lastResponse = response;
    setLastResponse(response);
    await ResponseVerifier.verifyResponseIsOk(response);
  }

  @Then('I should receive a list of users')
  async verifyUsersList(): Promise<void> {
    if (!this.lastUsers) {
      throw new Error('No users retrieved. Call "I retrieve all users" first.');
    }
    await this.iVerifyUsersList(this.lastUsers);
  }

  @Then('the user should have ID {int}')
  async verifyUserId(expectedId: number): Promise<void> {
    if (!this.lastUser) {
      throw new Error('No user retrieved. Call "I retrieve user with ID" first.');
    }
    await this.iVerifyUserId(this.lastUser, expectedId);
  }

  @Then('the user should have name {string}')
  async verifyUserName(expectedName: string): Promise<void> {
    if (!this.lastUser) {
      throw new Error('No user retrieved. Perform a user operation first.');
    }
    await this.iVerifyUserName(this.lastUser, expectedName);
  }

  @Then('the user should have email {string}')
  async verifyUserEmail(expectedEmail: string): Promise<void> {
    if (!this.lastUser) {
      throw new Error('No user retrieved. Perform a user operation first.');
    }
    await this.iVerifyUserEmail(this.lastUser, expectedEmail);
  }

  @Then('each user should have id, name, username, and email')
  async verifyUsersStructure(): Promise<void> {
    if (!this.lastUsers) {
      throw new Error('No users retrieved. Call "I retrieve all users" first.');
    }
    await this.iVerifyUsersStructure(this.lastUsers);
  }

  @Step
  private async iVerifyUsersList(users: User[]): Promise<void> {
    expect(Array.isArray(users)).toBeTruthy();
    expect(users.length).toBeGreaterThan(0);
  }

  @Step
  private async iVerifyUserId(user: User, expectedId: number): Promise<void> {
    expect(user).toHaveProperty('id');
    expect(user.id).toBe(expectedId);
  }

  @Step
  private async iVerifyUserName(user: User, expectedName: string): Promise<void> {
    expect(user).toHaveProperty('name');
    expect(user.name).toBe(expectedName);
  }

  @Step
  private async iVerifyUserEmail(user: User, expectedEmail: string): Promise<void> {
    expect(user).toHaveProperty('email');
    expect(user.email).toBe(expectedEmail);
  }

  @Step
  private async iVerifyUsersStructure(users: User[]): Promise<void> {
    for (const user of users) {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('email');
      expect(typeof user.id).toBe('number');
      expect(typeof user.name).toBe('string');
      expect(typeof user.username).toBe('string');
      expect(typeof user.email).toBe('string');
    }
  }
}
