defmodule VoteServerWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :vote_server

  # The session will be stored in the cookie and signed,
  # this means its contents can be read but not tampered with.
  # Set :encryption_salt if you would also like to encrypt it.
  @session_options [
    store: :cookie,
    key: "_server_key",
    signing_salt: "Jq5bYkP9",
    same_site: "Lax"
  ]

  socket "/live", Phoenix.LiveView.Socket,
    websocket: [connect_info: [session: @session_options]],
    longpoll: [connect_info: [session: @session_options]]

  socket "/room", VoteServerWeb.UserSocket,
    websocket: [max_frame_size: 20_000],
    longpool: false

  plug RemoteIp
  plug :global_rate_limit

  # Serve at "/" the static files from "priv/static" directory.
  #
  # You should set gzip to true if you are running phx.digest
  # when deploying your static files in production.
  plug Plug.Static,
    at: "/",
    from: :vote_server,
    gzip: false,
    only: VoteServerWeb.static_paths()

  # Code reloading can be explicitly enabled under the
  # :code_reloader configuration of your endpoint.
  if code_reloading? do
    plug Phoenix.CodeReloader
    # plug Phoenix.Ecto.CheckRepoStatus, otp_app: :vote_server
  end

  plug Phoenix.LiveDashboard.RequestLogger,
    param_key: "request_logger",
    cookie_key: "request_logger"

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.Session, @session_options
  plug VoteServerWeb.Router

  def global_rate_limit(conn, _opts) do
    config =
      Application.get_env(:vote_server, VoteServer.RateLimiter)

    apply_rate_limit(config, conn)
  end

  defp apply_rate_limit(config, conn) when is_list(config) do
    key = "web_requests:#{:inet.ntoa(conn.remote_ip)}"

    case VoteServer.RateLimiter.hit(key, config[:scale], config[:limit]) do
      {:allow, _count} ->
        conn

      {:deny, retry_after} ->
        conn
        |> put_resp_header("retry-after", Integer.to_string(div(retry_after, 1000)))
        |> send_resp(429, [])
        |> halt()
    end
  end

  defp apply_rate_limit(_config, conn) do
    conn
  end
end
