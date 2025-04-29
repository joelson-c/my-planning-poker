defmodule ServerWeb.RoomChannel do
  use ServerWeb, :channel
  alias ServerWeb.Presence
  require Logger

  intercept ["state_changed"]

  @impl true
  def join("room:" <> room_id, %{"observer" => observer}, socket) do
    case DynamicSupervisor.start_child(Game.Supervisor, {Game.State, room_id}) do
      {:ok, _pid} -> :ok
      {:error, {:already_started, _pid}} -> :ok
      error -> error
    end

    send(self(), :after_join)
    room = Game.State.get_room_data(room_id)

    {:ok, %{room: room, id: socket.id},
     socket |> assign(:room_id, room_id) |> assign(:observer, observer)}
  end

  @impl true
  def handle_in("vote", %{"value" => vote}, socket) do
    %{room_id: room_id, nickname: nickname} = socket.assigns

    :ok = Game.State.set_vote(room_id, socket.id, %{nickname: nickname, vote: vote})

    {:ok, _} =
      Presence.update(socket, nickname, %{
        voted: true
      })

    {:reply, {:ok, %{"value" => vote}}, socket |> assign(:vote, vote)}
  end

  @impl true
  def handle_in("change_state", %{"target" => target}, socket)
      when target in ["voting", "reveal"] do
    %{room_id: room_id} = socket.assigns

    Game.State.update_status(room_id, String.to_existing_atom(target))

    state = Game.State.get_room_data(room_id)
    broadcast!(socket, "state_changed", state)

    {:noreply, socket}
  end

  @impl true
  def handle_in("results", _payload, socket) do
    %{room_id: room_id} = socket.assigns
    votes = Game.State.get_votes(room_id)

    with true <- Game.State.show_results?(room_id),
         total <- Game.Result.get_total_votes(votes),
         distribution <- Game.Result.get_distribution(votes),
         average <- Game.Result.get_average(votes),
         median <- Game.Result.get_median(votes) do
      {:reply,
       {:ok,
        %{
          "total" => total,
          "votes" => votes,
          "distribution" => distribution,
          "average" => average,
          "median" => median
        }}, socket}
    end
  end

  @impl true
  def handle_info(:after_join, socket) do
    {:ok, _} =
      Presence.track(socket, socket.assigns.nickname, %{
        socket_id: socket.id,
        online_at: inspect(System.system_time(:second)),
        observer: socket.assigns[:observer],
        voted: false
      })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  @impl true
  def handle_out("state_changed", %{status: status} = payload, socket) when status == :voting do
    %{room_id: room_id, nickname: nickname} = socket.assigns

    :ok = Game.State.reset(room_id)

    {:ok, _} =
      Presence.update(socket, nickname, %{
        voted: false
      })

    push(socket, "state_changed", payload)

    {:noreply, socket}
  end

  @impl true
  def handle_out("state_changed", %{status: status} = payload, socket) when status == :reveal do
    push(socket, "state_changed", payload)

    {:noreply, socket}
  end
end
