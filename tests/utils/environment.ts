function environment(name: string): string {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}

export { environment };
