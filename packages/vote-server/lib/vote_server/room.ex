defmodule VoteServer.Room do
  @type status :: :voting | :reveal
  @type id :: String.t()
  @type vote :: %{nickname: String.t(), vote: String.t()}
  @type distribution :: %{String.t() => non_neg_integer()}

  @derive {Jason.Encoder, except: [:votes]}
  defstruct [:id, votes: %{}, status: :voting]
  @type t :: %__MODULE__{id: id(), votes: %{term() => vote()}, status: status()}
end
