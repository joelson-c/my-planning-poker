defmodule VoteServer.Repo do
  use Ecto.Repo,
    otp_app: :vote_server,
    adapter: Ecto.Adapters.Postgres
end
