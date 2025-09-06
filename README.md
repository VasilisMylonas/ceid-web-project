
# Theseus - Thesis Management System

Theseus is a web-based platform designed to streamline the management of theses for academic institutions. It provides tools for faculty members, students, and administrators to manage thesis topics, assignments, progress tracking, and statistics efficiently.

---

## Features

- **Thesis Management**: Create, assign, and track thesis topics.
- **Faculty Tools**: View and manage invitations to committees, track thesis statistics, and analyze performance.
- **Student Tools**: Browse available thesis topics and track progress.
- **Statistics and Insights**: Visualize data such as average completion times, grades, and thesis distributions.
- **Role-Based Access Control**: Secure access for students, faculty, and administrators.

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) or [Podman](https://podman.io/)
- [Docker Compose](https://docs.docker.com/compose/) or [Podman Compose](https://github.com/containers/podman-compose)

---

### Installation

1. **Clone the repository**:

   ```bash
      git clone https://github.com/yourusername/ceid-web-project.git
   ```

2. **Run the containers**:

   ```bash
      cd ceid-web-project
      docker compose up theseus-nginx
   ```

The entire system should now be running at <http://localhost:8080> and <https://localhost:8443>.

Of course, you can change ports and other environment variables in [compose.yaml](./compose.yaml).

## Development

### Project Structure

TODO

### Running the server

```bash
docker compose up theseus-dev
```

The server should now be running at <http://localhost:3000>.

The API is documented using Postman. You can import the provided Postman collection to explore and test the API endpoints. You can access it [here](https://vasilismylonas-6137673.postman.co/workspace/Vasilis-Mylonas's-Workspace~bdb1c1e8-077b-415a-8162-22e0b9bd75ec/collection/44259023-63d0ae2b-e09c-49fe-a222-e0101989a819?action=share&creator=44259023&active-environment=44259023-a78b3f97-8acb-4fdb-8ac2-2b5e6e229a23)

## TODOs

- Maybe autoIncrement should be autoIncrementIdentity for postgres (see models)
- Authentication middleware should attach role info/id
