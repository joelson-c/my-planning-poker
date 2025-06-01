defmodule Game.ResultTest do
  use ExUnit.Case, async: true
  alias Game.Result

  describe "get_total_votes/1" do
    test "returns the total number of votes" do
      votes = [%{vote: "1"}, %{vote: "2"}]
      assert Result.get_total_votes(votes) == 2
    end
  end

  describe "get_distribution/1" do
    test "returns the distribution of votes" do
      votes = [%{vote: "1"}, %{vote: "2"}, %{vote: "1"}]
      assert Result.get_distribution(votes) == %{"1" => 2, "2" => 1}
    end
  end

  describe "get_average/1" do
    test "returns the average of numeric votes" do
      votes = [%{vote: "1"}, %{vote: "2"}, %{vote: "3"}]
      assert Result.get_average(votes) == 2.0
    end

    test "average returns 0 when there are no numeric votes" do
      votes = [%{vote: "a"}, %{vote: "b"}]
      assert Result.get_average(votes) == 0.0
    end
  end

  describe "get_median/1" do
    test "returns the median of numeric votes (odd count)" do
      votes = [%{vote: "1"}, %{vote: "3"}, %{vote: "2"}]
      assert Result.get_median(votes) == 2
    end

    test "returns the median of numeric votes (even count)" do
      votes = [
        %{vote: "1"},
        %{vote: "2"},
        %{vote: "3"},
        %{vote: "4"}
      ]

      assert Result.get_median(votes) == 2.5
    end

    test "median returns 0 when there are no numeric votes" do
      votes = [%{vote: "a"}, %{vote: "b"}]
      assert Result.get_median(votes) == 0
    end
  end
end
