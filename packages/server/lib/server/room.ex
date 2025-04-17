defmodule Server.Room do
  @type status :: :voting | :reveal
  @type id :: String.t()
  @type vote :: %{nickname: String.t(), vote: String.t()}
  @type distribution :: %{String.t() => non_neg_integer()}

  defstruct [:id, votes: [], status: :voting]
  @type t :: %__MODULE__{id: id(), votes: [vote()], status: status()}
end
