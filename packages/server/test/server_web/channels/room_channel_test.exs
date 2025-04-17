defmodule ServerWeb.RoomChannelTest do
  alias ServerWeb.UserSocket
  alias Server.Room
  use ServerWeb.ChannelCase

  setup do
    {:ok, socket} = connect(UserSocket, %{"nickname" => "Test"})

    room_id = Base.encode16(:rand.bytes(10))

    {:ok, _, socket} =
      subscribe_and_join(socket, "room:#{room_id}", %{"observer" => false})

    %{socket: socket}
  end

  test "sends the room presence after joining", %{socket: _socket} do
    assert_push "presence_state", %{
      "Test" => %{metas: [%{observer: false, voted: false}]}
    }
  end

  test "send votes with status ok", %{socket: socket} do
    payload = %{"value" => "13"}
    ref = push(socket, "vote", payload)
    assert_reply ref, :ok, ^payload
  end

  test "changes the room state", %{socket: socket} do
    payload = %{"target" => "reveal"}
    push(socket, "change_state", payload)
    assert_broadcast "state_changed", %Room{status: :reveal}
  end

  test "returns the room results when in reveal state", %{socket: socket} do
    push(socket, "vote", %{"value" => "13"})
    push(socket, "change_state", %{"target" => "reveal"})
    ref = push(socket, "results")

    assert_reply ref,
                 :ok,
                 %{
                   "distribution" => %{"13" => 1},
                   "total" => 1,
                   "average" => 13.0,
                   "median" => 13,
                   "votes" => [%{nickname: "Test", vote: "13"}]
                 }
  end

  test "resets the state when the status transitions from reveal to voting", %{socket: socket} do
    push(socket, "vote", %{"value" => "13"})
    push(socket, "change_state", %{"target" => "reveal"})
    push(socket, "change_state", %{"target" => "voting"})

    assert_broadcast "state_changed", %Room{status: :voting}

    assert_push "presence_state", %{
      "Test" => %{metas: [%{observer: false, voted: false}]}
    }
  end
end
