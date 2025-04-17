defmodule Server.GameState do
  alias Server.Room
  use GenServer

  @spec start_link(Room.id()) :: GenServer.on_start()
  def start_link(room_id) do
    GenServer.start_link(__MODULE__, %Room{}, name: via_tuple(room_id))
  end

  @spec via_tuple(Room.id()) :: tuple()
  def via_tuple(room_id) do
    {:via, Registry, {Server.GameRegistry, room_id}}
  end

  @spec get_status(Room.id()) :: Room.status()
  def get_status(room_id) do
    GenServer.call(via_tuple(room_id), :get_status)
  end

  @spec get_room_data(Room.id()) :: Room.t()
  def get_room_data(room_id) do
    GenServer.call(via_tuple(room_id), :get_room_data)
  end

  @spec get_votes(Room.id()) :: [Room.vote()]
  def get_votes(room_id) do
    case get_status(room_id) do
      :reveal -> GenServer.call(via_tuple(room_id), :get_votes)
      _ -> {:error, "room is not in reveal state: #{get_status(room_id)}"}
    end
  end

  @spec update_status(Room.id(), Room.status()) :: :ok
  def update_status(room_id, new_state) when new_state === :voting when new_state === :reveal do
    GenServer.cast(via_tuple(room_id), {:update_status, new_state})
  end

  @spec set_vote(Room.id(), Room.vote()) :: :ok | {:error, term()}
  def set_vote(room_id, vote) do
    case get_status(room_id) do
      :voting -> GenServer.cast(via_tuple(room_id), {:set_vote, vote})
      _ -> {:error, "room is not in voting state: #{get_status(room_id)}"}
    end
  end

  @spec get_total_votes(Room.id()) :: non_neg_integer()
  def get_total_votes(room_id) do
    length(get_votes(room_id))
  end

  @spec get_distribution(Room.id()) :: Room.distribution()
  def get_distribution(room_id) do
    Enum.frequencies_by(get_votes(room_id), & &1.vote)
  end

  @spec get_average(Room.id()) :: float()
  def get_average(room_id) do
    votes = get_numeric_votes(room_id)
    Enum.sum(votes) / length(votes)
  end

  @spec get_median(Room.id()) :: number()
  def get_median(room_id) do
    numeric_votes = get_numeric_votes(room_id)
    vote_length = length(numeric_votes)

    case rem(vote_length, 2) do
      0 ->
        (Enum.at(numeric_votes, floor(vote_length / 2), 0) +
           Enum.at(numeric_votes, floor(vote_length / 2) + 1, 0)) / 2

      1 ->
        Enum.at(numeric_votes, floor(vote_length / 2))
    end
  end

  @spec get_numeric_votes(Room.id()) :: [number()]
  defp get_numeric_votes(room_id) do
    Enum.flat_map(get_votes(room_id), fn %{vote: vote} ->
      case Integer.parse(vote) do
        :error -> []
        {numeric, _rest} -> [numeric]
      end
    end)
  end

  @spec show_results?(Room.id()) :: boolean()
  def show_results?(room_id) do
    case get_status(room_id) do
      :reveal -> true
      _ -> false
    end
  end

  @spec reset(Room.id()) :: :ok
  def reset(room_id) do
    GenServer.cast(via_tuple(room_id), :reset)
  end

  @spec init(Room.t()) :: {:ok, Room.t()}
  def init(initial_state) do
    {:ok, initial_state}
  end

  def handle_call(:get_status, _from, state) do
    {:reply, state.status, state}
  end

  def handle_call(:get_room_data, _from, state) do
    {:reply, state, Map.drop(state, ["votes"])}
  end

  def handle_call(:get_votes, _from, state) do
    {:reply, state.votes, state}
  end

  def handle_cast({:update_status, new_status}, state) do
    new_state = %{state | status: new_status}
    {:noreply, new_state}
  end

  def handle_cast({:set_vote, vote}, state) do
    new_state = put_in(state.votes, [vote | state.votes])
    {:noreply, new_state}
  end

  def handle_cast(:reset, state) do
    new_state = %{state | votes: [], status: :voting}
    {:noreply, new_state}
  end
end
