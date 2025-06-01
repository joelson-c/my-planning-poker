defmodule VoteServerWeb.RoomChannelTest do
  alias VoteServerWeb.UserSocket
  alias VoteServer.Room
  use VoteServerWeb.ChannelCase, async: true

  describe "when a single user votes" do
    setup [:setup_single_user]

    test "sends the room presence after joining", %{socket: socket} do
      socket_id = socket.id

      assert_push "presence_state", %{
        ^socket_id => %{metas: [%{nickname: "Test", observer: false, voted: false}]}
      }
    end

    test "send a vote successfully", %{socket: socket} do
      payload = %{"value" => "13"}
      ref = push(socket, "vote", payload)
      assert_reply ref, :ok, ^payload
    end

    test "changes the room state with single user", %{socket: socket} do
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

      socket_id = socket.id

      assert_push "presence_state", %{
        ^socket_id => %{metas: [%{observer: false, voted: false}]}
      }
    end

    test "does not duplicate user votes", %{socket: socket} do
      push(socket, "vote", %{"value" => "13"})
      push(socket, "vote", %{"value" => "21"})
      push(socket, "change_state", %{"target" => "reveal"})
      ref = push(socket, "results")

      assert_reply ref,
                   :ok,
                   %{
                     "votes" => [%{nickname: "Test", vote: "21"}]
                   }
    end
  end

  describe "when multiple users vote" do
    setup [:setup_multiple_user]

    test "sends the room presence after users join", %{socket: [socket1, socket2]} do
      socket1_id = socket1.id

      assert_push "presence_state", %{
        ^socket1_id => %{metas: [%{nickname: "Test 1", observer: false, voted: false}]}
      }

      socket2_id = socket2.id

      assert_push "presence_state", %{
        ^socket2_id => %{metas: [%{nickname: "Test 2", observer: false, voted: false}]}
      }
    end

    test "send multiple votes successfully", %{socket: [socket1, socket2]} do
      payload1 = %{"value" => "13"}
      ref1 = push(socket1, "vote", payload1)
      assert_reply ref1, :ok, ^payload1

      payload2 = %{"value" => "21"}
      ref2 = push(socket2, "vote", payload2)
      assert_reply ref2, :ok, ^payload2
    end

    test "changes the room state with multiple users", %{socket: [_socket1, socket2]} do
      payload = %{"target" => "reveal"}
      push(socket2, "change_state", payload)
      assert_broadcast "state_changed", %Room{status: :reveal}
    end

    test "does not duplicate user votes with multuple users", %{socket: [socket1, socket2]} do
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

  defp setup_single_user(_context) do
    {:ok, socket} = connect(UserSocket, %{"nickname" => "Test"})

    room_id = Base.encode16(:rand.bytes(10))

    {:ok, _, socket} =
      subscribe_and_join(socket, "room:#{room_id}", %{"observer" => false})

    %{socket: socket}
  end

  defp setup_multiple_user(_context) do
    room_id = Base.encode16(:rand.bytes(10))

    {:ok, socket1} = connect(UserSocket, %{"nickname" => "Test 1"})

    {:ok, _, socket1} =
      subscribe_and_join(socket1, "room:#{room_id}", %{"observer" => false})

    {:ok, socket2} = connect(UserSocket, %{"nickname" => "Test 2"})

    {:ok, _, socket2} =
      subscribe_and_join(socket2, "room:#{room_id}", %{"observer" => false})

    %{socket: [socket1, socket2]}
  end
end
