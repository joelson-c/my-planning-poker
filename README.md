# My Planning Poker

## 📌 Introduction

My Planning Poker is a modern agile estimation tool designed to help teams collaboratively estimate the effort required for tasks. It leverages a real-time tech stack to provide seamless collaboration and accurate result aggregation.

## 🚀 Features

-   🔄 **Real-time collaboration** powered by WebSockets
-   👥 **Support for large teams**
-   📊 **Dynamic result aggregation**
-   🌐 **Scalable architecture with modern technologies**

## 🖥️ Tech Stack

-   **Frontend**: React with TypeScript
-   **Backend**: Elixir with Phoenix Framework
-   **Real-time Communication**: WebSockets
-   **Containerization**: Docker

## 📂 Project Structure

```
/my-planning-poker
│── /packages
│    ├── /vote-client   # Frontend application
│    ├── /vote-server   # Backend services
│── /docs               # Documentation files
│── .env.example        # Environment variable example file
│── docker-compose.yml  # Docker setup
│── README.md           # This file
```

## ⚡ Getting Started

### Prerequisites

Ensure you have the following installed:

-   [Node.js 22+](https://nodejs.org/)
-   [Elixir 1.18.3 with Erlang/OTP 27](https://elixir-lang.org/)
-   [Docker 28+](https://www.docker.com/)

### Quick Start

1. **Clone the repository**:

    ```bash
    git clone https://github.com/joelson-c/my-planning-poker.git
    cd my-planning-poker
    ```

2. **Set up environment variables**:

    ```bash
    cp .env.example .env
    ```

3. **Generate a secret key** and add it to the `.env` file:

    ```bash
    openssl rand -hex 32 | sed 's/^/SECRET_KEY_BASE=/' | tee -a .env
    ```

4. **Start Docker containers**:

    ```bash
    docker compose up
    ```

5. **Access the application** at `https://localhost`.

## 🛠️ Local Development

To run the application in development mode, install the client and server dependencies locally.

Refer to the [Phoenix Framework](https://www.phoenixframework.org) and [React Router](https://reactrouter.com/home) documentation for further instructions and API references.

1. **Install dependencies**:

    ```bash
    pwd # <...>/my-planning-poker
    npm install
    cd packages/vote-server
    mix deps.get
    ```

2. **Run each package individually**:

    - **vote-server**:

        ```bash
        cd packages/vote-server
        mix phx.server
        ```

    - **vote-client**:

        ```bash
        cd packages/vote-client
        cp .env.example .env
        npm run dev
        ```

### Running Tests

-   **Server tests**:

    ```bash
    cd packages/vote-server
    mix test
    ```

-   **End-to-End (E2E) tests**:

    1. Ensure both `vote-client` and `vote-server` are running.
    2. Add the `E2E_URL` to the `.env` file in the `vote-client` folder, pointing to the local `vote-client` instance (default: `E2E_URL=http://localhost:5173`).

    ```bash
    cd packages/vote-client
    npm run e2e
    ```

## 🎮 Usage

1. **Create a session**
2. **Invite participants** by sharing the session link
3. **Vote on tasks**
4. **View results** and reach consensus

## 🤝 Contributing

We welcome contributions! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

For detailed guidelines, see the [CONTRIBUTING.md](CONTRIBUTING.md) file.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 📧 Contact

For any inquiries, feel free to reach out via [GitHub Issues](https://github.com/joelson-c/my-planning-poker/issues).
