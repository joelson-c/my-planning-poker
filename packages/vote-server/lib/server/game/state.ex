defmodule Game.State do
  alias Server.Room
  use GenServer

  @spec start_link(Room.id()) :: GenServer.on_start()
  def start_link(room_id) do
    GenServer.start_link(__MODULE__, %Room{id: room_id}, name: via_tuple(room_id))
  end

  @spec via_tuple(Room.id()) :: tuple()
  def via_tuple(room_id) do
    {:via, Registry, {Game.Registry, room_id}}
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
  def update_status(room_id, new_state) when new_state in [:voting, :reveal] do
    GenServer.call(via_tuple(room_id), {:update_status, new_state})
  end

  @spec set_vote(Room.id(), term(), Room.vote()) :: :ok | {:error, term()}
  def set_vote(room_id, user_id, vote) do
    case get_status(room_id) do
      :voting -> GenServer.call(via_tuple(room_id), {:set_vote, user_id, vote})
      _ -> {:error, "room is not in voting state: #{get_status(room_id)}"}
    end
  end

  @spec remove_vote(Room.id(), term()) :: :ok | {:error, term()}
  def remove_vote(room_id, user_id) do
    case get_status(room_id) do
      :voting -> GenServer.call(via_tuple(room_id), {:remove_vote, user_id})
      _ -> {:error, "room is not in voting state: #{get_status(room_id)}"}
    end
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
    GenServer.call(via_tuple(room_id), :reset)
  end

  @spec init(Room.t()) :: {:ok, Room.t()}
  def init(initial_state) do
    {:ok, initial_state}
  end

  def handle_call(:get_status, _from, state) do
    {:reply, state.status, state}
  end

  def handle_call(:get_room_data, _from, state) do
    {:reply, Map.drop(state, [:votes]), state}
  end

  def handle_call(:get_votes, _from, state) do
    {:reply, Map.values(state.votes), state}
  end

  def handle_call({:update_status, new_status}, _from, state) do
    new_state = %{state | status: new_status}
    {:reply, :ok, new_state}
  end

  def handle_call({:set_vote, user_id, vote}, _from, state) do
    new_state = %{state | votes: put_in(state.votes, [user_id], vote)}
    {:reply, :ok, new_state}
  end

  def handle_call({:remove_vote, user_id}, _from, state) do
    {_, votes} = pop_in(state.votes, [user_id])
    new_state = %{state | votes: votes}
    {:reply, :ok, new_state}
  end

  def handle_call(:reset, _from, %{id: id}) do
    {:reply, :ok, %Room{id: id}}
  end
end
