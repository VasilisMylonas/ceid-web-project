# Theseus - Thesis Management System

## Getting Started

### Prerequisites

- node.js
- npm
- docker or podman
- docker-compose or podman-compose

### Installation

1. Clone the repository:

```bash
   git clone https://github.com/yourusername/ceid-web-project.git
```

2. Install dependencies:

```bash
   cd ceid-web-project/server
   npm install
```

### Running the Application

To start the server:

```bash
docker compose up
```

The application should now be running at `http://localhost:3000` (or another port if specified).

See [compose.yaml](./compose.yaml) for environment configuration.

Stop the server with: `docker compose down`.

### Running Tests

To run tests, use the following command:

```bash
npm test
```

Tests use an in-memory SQLite database. Environment can be configured in [.env.test](./.env.test).

## API Structure

See Postman collection: [LINK](https://vasilismylonas-6137673.postman.co/workspace/Vasilis-Mylonas's-Workspace~bdb1c1e8-077b-415a-8162-22e0b9bd75ec/collection/44259023-63d0ae2b-e09c-49fe-a222-e0101989a819?action=share&creator=44259023&active-environment=44259023-a78b3f97-8acb-4fdb-8ac2-2b5e6e229a23)

## TODOs

Maybe autoIncrement should be autoIncrementIdentity for postgres (see models)
Authentication middleware should attach role info/id
