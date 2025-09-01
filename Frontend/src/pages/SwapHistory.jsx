import { useEffect, useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import axios from "axios";
import "./SwapHistory.css";

function SwapHistory() {
  const { user } = useContext(AuthContext);
  const [swapHistory, setSwapHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchSwapHistory = async () => {
      try {
        if (!user) return;

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/swaps/history`,
          {
            withCredentials: true, // send cookies (make sure you're logged in!)
          }
        );

        setSwapHistory(response.data);
        setFilteredHistory(response.data); 
      } catch (err) {
        console.error("Error fetching swap history:", err);
        setError("Failed to fetch swap history. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSwapHistory();
  }, [user]);

  useEffect(() => {
    if (filter === "all") {
      setFilteredHistory(swapHistory);
    } else {
      setFilteredHistory(swapHistory.filter((swap) => swap.status === filter));
    }
  }, [filter, swapHistory]);

  const getSwapPartnerName = (swap) => {
    return swap.requester._id === user._id
      ? swap.owner.name
      : swap.requester.name;
  };

  return (
    <div className="swap-history main">
      <h2>Swap History</h2>

      <div className="filter-section">
        <label htmlFor="status-filter">Filter by status:</label>
        <select
          id="status-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="declined">Declined</option>
          <option value="in-progress">In Progress</option>
        </select>
      </div>

      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <ul className="swap-list">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((swap) => (
              <li key={swap._id} className="swap-card">
                {/* Added check for swap.requestedItem and swap.offeredItem */}
                <div className="swap-history-images">
                  {swap.requestedItem && swap.requestedItem.imageUrls && (
                    <img
                      src={swap.requestedItem.imageUrls[0] || "/placeholder.svg"}
                      alt={swap.requestedItem.name}
                      className="swap-image"
                    />
                  )}
                  {swap.offeredItem && swap.offeredItem.imageUrls && (
                    <img
                      src={swap.offeredItem.imageUrls[0] || "/placeholder.svg"}
                      alt={swap.offeredItem.name}
                      className="swap-image"
                    />
                  )}
                </div>
                <div className="swap-history-details">
                  <p>
                    <strong>Requested Item:</strong> {swap.requestedItem ? swap.requestedItem.name : "N/A"}
                  </p>
                  <p>
                    <strong>Offered Item:</strong> {swap.offeredItem ? swap.offeredItem.name : "N/A"}
                  </p>
                  <p>
                    <strong>Swap with:</strong> {getSwapPartnerName(swap)}
                  </p>
                  <p className={`status ${swap.status.toLowerCase()}`}>
                    <strong>Status:</strong> {swap.status}
                  </p>
                  
                  {/* Show completion status for in-progress swaps */}
                  {swap.status === "in-progress" && (
                    <div className="completion-progress">
                      <p><strong>Completion Progress:</strong></p>
                      <div className="completion-users">
                        <span className={swap.requesterConfirmed ? "confirmed" : "pending"}>
                          Requester: {swap.requesterConfirmed ? "✓" : "Pending"}
                        </span>
                        <span className={swap.ownerConfirmed ? "confirmed" : "pending"}>
                          Owner: {swap.ownerConfirmed ? "✓" : "Pending"}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(swap.updatedAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </li>
            ))
          ) : (
            <p className="no-swaps">No {filter !== "all" ? filter : ""} swaps available.</p>
          )}
        </ul>
      )}
    </div>
  );
}

export default SwapHistory;
