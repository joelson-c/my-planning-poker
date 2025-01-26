# Planning Poker Estimation System

## Overview

This repository contains a Planning Poker Estimation System, a collaborative tool designed for agile development teams to streamline the estimation process. The system utilizes Docker Compose to manage both development and production environments. Two Docker Compose files are included:

-   **docker-compose.yml:** Configures development containers.
-   **docker-compose.production.yml:** Configures production containers using Dockerfiles to maintain isolation.

## Development Workflow

### Prerequisites

-   Docker (v23+) and Docker Compose (v2.16+) installed on your machine.

### Starting the Development Environment

1. Clone the repository:

    ```bash
    git clone https://github.com/joelson-c/my-planning-poker.git
    ```

2. Navigate to the project directory:

    ```bash
    cd my-planning-poker
    ```

3. Create a `.env` file in repository root (use the `.env.example` file as model)

4. Start the development environment:

    ```bash
    docker compose watch
    ```

5. Access the application at https://localhost.

## Production Workflow

### Prerequisites

-   Docker (v23+) and Docker Compose (v2.16+) installed on your machine.

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

4. Access the application at https://localhost. Note that an SSL certificate is required.

## Contributing

We welcome contributions from the community. If you have ideas for improvements, feature requests, or find any issues, feel free to open an [issue](https://github.com/joelson-c/my-planning-poker/issues) or submit a [pull request](https://github.com/joelson-c/my-planning-poker/pulls).

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

Special thanks to the open-source community for their contributions and inspiration.

Happy Planning Poker Estimations! 🚀
