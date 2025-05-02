defmodule ServerWeb.RoomChannel do
  use ServerWeb, :channel
  alias ServerWeb.Presence
  require Logger

  intercept ["state_changed", "remove_user"]

  @impl true
  def join("room:" <> room_id, %{"observer" => observer}, socket) do
    case DynamicSupervisor.start_child(Game.Supervisor, {Game.State, room_id}) do
      {:ok, _pid} -> :ok
      {:error, {:already_started, _pid}} -> :ok
      error -> error
    end

    send(self(), :after_join)
    room = Game.State.get_room_data(room_id)

    {
      :ok,
      %{room: room, id: socket.id},
      socket
      |> assign(:room_id, room_id)
      |> assign(:observer, observer)
    }
  end

  @impl true
  def handle_in("vote", %{"value" => vote}, socket) do
    %{room_id: room_id, nickname: nickname} = socket.assigns

    :ok = Game.State.set_vote(room_id, socket.id, %{nickname: nickname, vote: vote})

    {:ok, _} =
      Presence.update(
        socket,
        socket.id,
        get_socket_meta(socket, %{
          voted: true
        })
      )

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
  def handle_in("remove_user", %{"user_id" => dest_id}, socket) do
    %{room_id: room_id, nickname: nickname} = socket.assigns

    if Game.State.get_status(room_id) == :voting do
      broadcast(socket, "remove_user", %{
        src_nickname: nickname,
        src_id: socket.id,
        dest_id: dest_id
      })
    end

    {:noreply, socket}
  end

  @impl true
  def handle_out("state_changed", %{status: status} = payload, socket) when status == :voting do
    %{room_id: room_id} = socket.assigns

    :ok = Game.State.reset(room_id)

    {:ok, _} =
      Presence.update(
        socket,
        socket.id,
        get_socket_meta(socket, %{
          voted: false
        })
      )

    push(socket, "state_changed", payload)

    {:noreply, socket}
  end

  @impl true
  def handle_out("state_changed", %{status: status} = payload, socket) when status == :reveal do
    push(socket, "state_changed", payload)

    {:noreply, socket}
  end

  @impl true
  def handle_out(
        "remove_user",
        %{src_id: src_id, dest_id: dest_id, src_nickname: src_nickname},
        socket
      )
      when src_id != dest_id and dest_id == socket.id do
    %{nickname: nickname, room_id: room_id} = socket.assigns

    :ok = Game.State.remove_vote(room_id, socket.id)
    broadcast_from(socket, "user_removed", %{src_nickname: src_nickname, dest_nickname: nickname})
    {:stop, {:shutdown, "You have been removed from the channel"}, socket}
  end

  @impl true
  def handle_out("remove_user", %{src_id: src_id, dest_id: dest_id}, socket)
      when src_id != dest_id,
      do: {:noreply, socket}

  @impl true
  def handle_info(:after_join, %Phoenix.Socket{id: id} = socket) do
    {:ok, _} = Presence.track(socket, id, get_socket_meta(socket))

    push(socket, "presence_state", Presence.list(socket))

    {:noreply, socket}
  end

  defp get_socket_meta(
         %Phoenix.Socket{assigns: %{nickname: nickname, observer: observer}},
         extra_metas \\ %{}
       ) do
    Map.merge(
      %{
        nickname: nickname,
        observer: observer,
        voted: false
      },
      extra_metas
    )
  end
end
