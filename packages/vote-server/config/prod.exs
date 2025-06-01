import Config

# Configures Swoosh API Client
config :swoosh, api_client: Swoosh.ApiClient.Finch, finch_name: VoteServer.Finch

# Disable Swoosh Local Memory Storage
config :swoosh, local: false

# Do not print debug messages in production
config :logger, level: :info

# Rate Limiter
config :vote_server, VoteServer.RateLimiter,
  scale: :timer.minutes(1),
  limit: 50

# Runtime production configuration, including reading
# of environment variables, is done on config/runtime.exs.
