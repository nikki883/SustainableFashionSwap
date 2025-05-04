// src/pages/SearchResults.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const SearchResults = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("search");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(`/api/items/search?search=${searchQuery}`);
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery) {
      fetchItems();
    }
  }, [searchQuery]);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        Results for "<span className="text-blue-600">{searchQuery}</span>"
      </h2>
      {items.length === 0 ? (
        <p>No matching items found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item._id} className="border rounded-xl shadow p-4">
              <img
                src={item.imageUrls[0]}
                alt={item.name}
                className="w-full h-48 object-cover rounded mb-2"
              />
              <h3 className="font-medium text-lg">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.brand}</p>
              <p className="text-sm">{item.category} - {item.condition}</p>
              <p className="text-sm font-semibold mt-1">
                {item.price === "Free" ? "Free" : `₹${item.price}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
