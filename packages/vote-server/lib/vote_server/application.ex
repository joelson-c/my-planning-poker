defmodule VoteServer.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      VoteServerWeb.Telemetry,
      # VoteServer.Repo,
      {DNSCluster, query: Application.get_env(:vote_server, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: VoteServer.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: VoteServer.Finch},
      # Start a worker by calling: VoteServer.Worker.start_link(arg)
      # {VoteServer.Worker, arg},
      # Start to serve requests, typically the last entry
      VoteServerWeb.Endpoint,
      VoteServerWeb.Presence,
      {Registry, keys: :unique, name: Game.Registry},
      {DynamicSupervisor, name: Game.Supervisor, strategy: :one_for_one},
      VoteServer.RateLimiter
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: VoteServer.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    VoteServerWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
