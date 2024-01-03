# Planning Poker Estimation System

## Overview

This repository contains a Planning Poker Estimation System, a collaborative tool designed for agile development teams to streamline the estimation process. The system utilizes Docker Compose to manage both development and production environments. Two Docker Compose files are included:

- **docker-compose.yml:** Configures development containers.
- **docker-compose.production.yml:** Configures production containers using Dockerfiles to maintain isolation.

## Development Workflow

### Prerequisites

- Docker (v23+) and Docker Compose (v2.16+) installed on your machine.

### Starting the Development Environment

1. Clone the repository:

   ```bash
   git clone https://github.com/joelson-c/my-planning-poker.git
   ```

2. Navigate to the project directory:

   ```bash
   cd my-planning-poker
   ```

3. Install the dependencies:

   ```bash
   docker compose run app npm install
   ```

4. Create a `.env` file in `client` folder from the `.env.example` and set the `VITE_SOCKET_URL` variable to `http://localhost`

5. Start the development environment:

   ```bash
   docker compose up -d
   ```

6. Access the application at [http://localhost:5173](http://localhost:5173).

## Production Workflow

### Prerequisites

- Docker (v23+) and Docker Compose (v2.16+) installed on your machine.

### Starting the Production Environment

1. Clone the repository:

   ```bash
   git clone https://github.com/joelson-c/my-planning-poker.git
   ```

2. Navigate to the project directory:

   ```bash
   cd my-planning-poker
   ```

3. Start the production environment:

   ```bash
   docker compose -f docker-compose.production.yml up -d
   ```

4. Access the application at [https://localhost](https://localhost). Note that an SSL certificate is required.

### SSL Certificate Configuration

To use a dummy SSL certificate during development, follow these steps:

1. Create a dummy SSL certificate.

2. Map the certificate using Docker volumes. Update the `docker-compose.production.yml` file:

   ```yaml
   services:
     web:
       volumes:
         - /path/to/dummy-cert:/etc/nginx/ssl/live/socket.myplanningpoker.dev
   ```

Replace `/path/to/dummy-cert` with the actual path to your dummy SSL certificate. The `/path/to/dummy-cert` must have the files:
- `fullchain.pem`
- `privkey.pem`

## Contributing

We welcome contributions from the community. If you have ideas for improvements, feature requests, or find any issues, feel free to open an [issue](https://github.com/joelson-c/my-planning-poker/issues) or submit a [pull request](https://github.com/joelson-c/my-planning-poker/pulls).

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

Special thanks to the open-source community for their contributions and inspiration.

Happy Planning Poker Estimations! 🚀
