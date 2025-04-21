# CEID Web Project

## Getting Started

### Prerequisites

- Node.js (v20 or later)
- npm
- A running PostgreSQL database (for example, via Docker)

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
npm start
```

The application should now be running at `http://localhost:3000` (or another port if specified).

Check out the API documentation at `http://localhost:3000/api-docs` for available endpoints.

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
