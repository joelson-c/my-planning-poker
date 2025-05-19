defmodule Game.Result do
  alias VoteServer.Room

  @spec get_total_votes([Room.vote()]) :: non_neg_integer()
  def get_total_votes(votes), do: length(votes)

  @spec get_distribution([Room.vote()]) :: Room.distribution()
  def get_distribution(votes) do
    Enum.frequencies_by(votes, & &1.vote)
  end

  @spec get_average([Room.vote()]) :: float()
  def get_average(votes) do
    numeric_votes = get_numeric_votes(votes)
    Enum.sum(numeric_votes) / max(length(numeric_votes), 1)
  end

  @spec get_median([Room.vote()]) :: number()
  def get_median(votes) do
    numeric_votes = Enum.sort(get_numeric_votes(votes))
    vote_length = length(numeric_votes)
    middle_value = floor(vote_length / 2)

    case rem(vote_length, 2) do
      0 ->
        (Enum.at(numeric_votes, middle_value - 1, 0) +
           Enum.at(numeric_votes, middle_value, 0)) / 2

      1 ->
        Enum.at(numeric_votes, middle_value, 0)
    end
  end

  @spec get_numeric_votes([Room.vote()]) :: [number()]
  defp get_numeric_votes(votes) do
    Enum.flat_map(votes, fn %{vote: vote} ->
      case Integer.parse(vote) do
        :error -> []
        {numeric, _rest} -> [numeric]
      end
    end)
  end
end
