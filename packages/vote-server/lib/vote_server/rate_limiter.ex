defmodule VoteServer.RateLimiter do
  use Hammer, backend: :ets
end
