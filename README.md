# My Planning Poker

## 📌 Introduction

My Planning Poker is a real-time agile estimation tool designed to help teams collaboratively estimate the effort required for tasks using Planning Poker methodology.

## 🚀 Features

-   🔄 **Real-time collaboration** via WebSockets
-   🃏 **Multiple deck options** (Fibonacci, T-Shirt sizes, etc.)
-   👥 **Support for up to 20 users per room**
-   🛠️ **Cost-effective, serverless architecture**
-   📊 **Automatic result aggregation**

## 🖥️ Screenshots

_(Add relevant images or GIFs showcasing the UI and functionalities)_

## 📂 Project Structure

```
/my-planning-poker
│── /client      # Frontend application
│── /server      # Backend services
│── /docs        # Documentation files
│── .env.example # Environment variable example file
│── docker-compose.yml # Docker setup
│── README.md    # This file
```

## ⚡ Getting Started

### Prerequisites

Ensure you have the following installed:

-   [Node.js](https://nodejs.org/)
-   [Docker](https://www.docker.com/)

### Installation

```bash
git clone https://github.com/joelson-c/my-planning-poker.git
cd my-planning-poker
cp .env.example .env  # Configure environment variables
```

### Running Locally

Using Docker:

```bash
docker compose -f compose.dev.yml watch
```

Access the application at `https://localhost`.

## 🚀 Deployment

To deploy in production:

```bash
docker compose -f compose.yml up --build -d
```

Ensure your `.env` file is correctly configured for the production environment.

## 🎮 Usage

1. **Create a session**
2. **Invite participants** by sharing the session link
3. **Vote on tasks**
4. **View results** and reach consensus

## 🤝 Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

For any inquiries, feel free to reach out via [GitHub Issues](https://github.com/joelson-c/my-planning-poker/issues).
