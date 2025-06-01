import Config

# Configure your database
#
# The MIX_TEST_PARTITION environment variable can be used
# to provide built-in test partitioning in CI environment.
# Run `mix help test` for more information.
config :vote_server, VoteServer.Repo,
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  database: "server_test#{System.get_env("MIX_TEST_PARTITION")}",
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: System.schedulers_online() * 2

# We don't run a VoteServer during test. If one is required,
# you can enable the VoteServer option below.
config :vote_server, VoteServerWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "D4qcf/kH2E99YVqJkez4yiiHJhB63s0iIeC9cI30SLuHuPMpt1Ke2oOibm2qHYS3",
  VoteServer: false

# In test we don't send emails
config :vote_server, VoteServer.Mailer, adapter: Swoosh.Adapters.Test

# Disable swoosh api client as it is only required for production adapters
config :swoosh, :api_client, false

# Print only warnings and errors during test
config :logger, level: :warning

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime
