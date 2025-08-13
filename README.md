# CEID Web Project

## Getting Started

### Prerequisites

- node.js
- npm
- Docker or Podman

### Installation

1. Clone the repository:

```bash
   git clone https://github.com/yourusername/ceid-web-project.git
   cd ceid-web-project
```

2. Install dependencies:

```bash
   npm install
```

### Running the Application

To start the development server:

```bash
docker compose up
```

or

```bash
podman compose up
```

The application should now be running at `http://localhost:3000` (or another port if specified).

## Project Structure

```text
ceid-web-project/
|-- public/ # Static assets (frontend)
|-- src/ # Source code (backend)
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|-- tests/
```
