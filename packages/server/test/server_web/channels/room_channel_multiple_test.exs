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

  test "sends the room presence after joining", %{socket: [socket1, socket2]} do
    socket1_id = socket1.id

    assert_push "presence_state", %{
      ^socket1_id => %{metas: [%{nickname: "Test 1", observer: false, voted: false}]}
    }

    socket2_id = socket2.id

    assert_push "presence_state", %{
      ^socket2_id => %{metas: [%{nickname: "Test 2", observer: false, voted: false}]}
    }
  end

  test "send votes with status ok", %{socket: [socket1, _socket2]} do
    payload = %{"value" => "13"}
    ref = push(socket1, "vote", payload)
    assert_reply ref, :ok, ^payload
    assert_push "presence_diff", %{joins: %{}}
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
                 %{"votes" => [%{}, %{}]}
  end

  test "removes a user and clear its data", %{socket: [socket1, socket2]} do
    Process.unlink(socket2.channel_pid)
    Process.monitor(socket2.channel_pid)

    push(socket1, "vote", %{"value" => "5"})
    push(socket2, "vote", %{"value" => "13"})
    push(socket1, "remove_user", %{"user_id" => socket2.id})

    assert_broadcast "user_removed", %{src_nickname: "Test 1", dest_nickname: "Test 2"}
    assert_receive {:DOWN, _, _, _, {:shutdown, "You have been removed from the channel"}}

    push(socket1, "change_state", %{"target" => "reveal"})
    ref = push(socket1, "results")

    assert_reply ref,
                 :ok,
                 %{
                   "votes" => [
                     %{nickname: "Test 1", vote: "5"}
                   ]
                 }
  end
end
