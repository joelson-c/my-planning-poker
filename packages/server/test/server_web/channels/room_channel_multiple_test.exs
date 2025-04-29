defmodule ServerWeb.RoomChannelMultipleTest do
  alias ServerWeb.UserSocket
  alias Server.Room
  use ServerWeb.ChannelCase

  setup do
    room_id = Base.encode16(:rand.bytes(10))

    {:ok, socket1} = connect(UserSocket, %{"nickname" => "Test 1"})

    {:ok, _, socket1} =
      subscribe_and_join(socket1, "room:#{room_id}", %{"observer" => false})

    {:ok, socket2} = connect(UserSocket, %{"nickname" => "Test 2"})

    {:ok, _, socket2} =
      subscribe_and_join(socket2, "room:#{room_id}", %{"observer" => false})

    %{socket: [socket1, socket2]}
  end

  test "sends the room presence after joining", %{socket: _socket} do
    assert_push "presence_state", %{
      "Test 1" => %{metas: [%{observer: false, voted: false}]}
    }

    assert_push "presence_state", %{
      "Test 2" => %{metas: [%{observer: false, voted: false}]}
    }
  end

  test "send votes with status ok", %{socket: [socket1, _socket2]} do
    payload = %{"value" => "13"}
    ref = push(socket1, "vote", payload)
    assert_reply ref, :ok, ^payload
    assert_push "presence_diff", %{joins: %{"Test 1" => %{metas: [%{voted: true}]}}}
  end

  test "changes the room state", %{socket: [_socket1, socket2]} do
    payload = %{"target" => "reveal"}
    push(socket2, "change_state", payload)
    assert_broadcast "state_changed", %Room{status: :reveal}
  end

  test "does not duplicate user votes", %{socket: [socket1, socket2]} do
    push(socket1, "vote", %{"value" => "13"})
    push(socket1, "vote", %{"value" => "21"})
    push(socket2, "vote", %{"value" => "13"})
    push(socket1, "change_state", %{"target" => "reveal"})
    ref = push(socket1, "results")

    assert_reply ref,
                 :ok,
                 %{
                   "votes" => [
                     %{nickname: "Test 1", vote: "21"},
                     %{nickname: "Test 2", vote: "13"}
                   ]
                 }
  end
end
