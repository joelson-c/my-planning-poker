defmodule ServerWeb.RoomChannel do
  use ServerWeb, :channel
  alias ServerWeb.Presence
  require Logger

  intercept ["state_changed"]

  @impl true
  def join("room:" <> room_id, %{"observer" => observer}, socket) do
    case DynamicSupervisor.start_child(Server.GameSupervisor, {Server.GameState, room_id}) do
      {:ok, _pid} -> :ok
      {:error, {:already_started, _pid}} -> :ok
      error -> error
    end

    send(self(), :after_join)
    room = Server.GameState.get_room_data(room_id)

    {:ok, %{room: room, id: socket.id},
     socket |> assign(:room_id, room_id) |> assign(:observer, observer)}
  end

  @impl true
  def handle_in("vote", %{"value" => vote}, socket) do
    %{room_id: room_id, nickname: nickname} = socket.assigns

    :ok = Server.GameState.set_vote(room_id, %{nickname: nickname, vote: vote})

    {:ok, _} =
      Presence.update(socket, nickname, %{
        voted: true
      })

    {:reply, {:ok, %{"value" => vote}}, socket |> assign(:vote, vote)}
  end

  @impl true
  def handle_in("change_state", %{"target" => target}, socket)
      when target == "voting" or target == "reveal" do
    %{room_id: room_id} = socket.assigns

    Server.GameState.update_status(room_id, String.to_existing_atom(target))

    state = Server.GameState.get_room_data(room_id)
    broadcast!(socket, "state_changed", state)

    {:noreply, socket}
  end

  @impl true
  def handle_in("results", _payload, socket) do
    %{room_id: room_id} = socket.assigns

    with true <- Server.GameState.show_results?(room_id),
         total <- Server.GameState.get_total_votes(room_id),
         votes <- Server.GameState.get_votes(room_id),
         distribution <- Server.GameState.get_distribution(room_id),
         average <- Server.GameState.get_average(room_id),
         median <- Server.GameState.get_median(room_id) do
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
  def handle_out("state_changed", payload, socket) do
    %{status: status} = payload

    if status == :voting do
      reset_room(socket)

      {:ok, _} =
        Presence.update(socket, socket.assigns.nickname, %{
          voted: false
        })
    end

    push(socket, "state_changed", payload)

    {:noreply, socket}
  end

  defp reset_room(socket) do
    %{room_id: room_id} = socket.assigns

    Server.GameState.reset(room_id)
  end
end
