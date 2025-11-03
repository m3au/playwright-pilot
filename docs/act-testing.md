# Act Configuration for Local GitHub Actions Testing

## Prerequisites

- Docker installed and running (`docker ps` should work)
- `act` installed (`brew install act` or see <https://github.com/nektos/act>)

**Note:** If Docker isn't running, start it first:

- Docker Desktop: Open Docker Desktop app
- Colima: `colima start`
- Other: Start your Docker daemon according to your setup

## Usage

```bash
# Show available commands (or just run 'make')
make help
# or simply:
make

# List all available workflows (use act directly)
act -l

# Test individual workflows
make test          # Test E2E tests workflow
make lighthouse     # Test Lighthouse audit workflow
make axe           # Test Axe audit workflow
make publish       # Test publish reports workflow

# Test main CI workflow (push event)
make ci

# Dry run (list what would run without executing)
make test-dryrun
```

## Secrets

Secrets are stored in `.secrets` file (not committed to git).
Current secrets:

- `BASE_URL`: Base URL for the application being tested

## Limitations

- Reusable workflows (`workflow_call`) are not fully supported by act
- Use individual workflow files directly for testing
- The main `ci.yml` workflow uses reusable workflows, so test individual workflows separately

## Platform Configuration

The `.actrc` file specifies the platform image. Using `catthehacker/ubuntu:act-latest` for better compatibility.

Common act flags (`--secret-file .secrets --container-architecture linux/amd64`) are centralized in the `ACT_FLAGS` Makefile variable, ensuring consistent configuration across all targets. The `--container-architecture linux/amd64` flag provides Apple Silicon Mac compatibility.

## Troubleshooting

- **Docker not running**:
  - Check with `docker ps`
  - Start Docker Desktop or run `colima start`
- **Apple Silicon Mac issues**:
  - Scripts already include `--container-architecture linux/amd64`
  - If issues persist, verify Docker is using correct architecture
- **Platform image fails**:
  - Try `act -P ubuntu-latest=ubuntu:latest`
  - Or use `catthehacker/ubuntu:act-latest` (already configured)
- **Bun setup issues**:
  - The `setup-bun` action should work with the configured platform
  - May need to wait for Docker image to download on first run
- **Workflow validation**:
  - Use `make test-dryrun` to validate without running
  - The `test` target always runs with verbose output (`-v`)
- **Secret file issues**:
  - Ensure `.secrets` file exists with `BASE_URL=...`
  - File is gitignored, create it if missing
