// // src/pages/SearchResults.jsx
// import React, { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";

// const SearchResults = () => {
//   const location = useLocation();
//   const queryParams = new URLSearchParams(location.search);
//   const searchQuery = queryParams.get("search");

//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchItems = async () => {
//       try {
//         const res = await fetch(`/api/items/search?search=${searchQuery}`);
//         const data = await res.json();
//         setItems(data);
//       } catch (err) {
//         console.error("Search error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (searchQuery) {
//       fetchItems();
//     }
//   }, [searchQuery]);

//   if (loading) return <div className="p-4">Loading...</div>;

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-semibold mb-4">
//         Results for "<span className="text-blue-600">{searchQuery}</span>"
//       </h2>
//       {items.length === 0 ? (
//         <p>No matching items found.</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//           {items.map((item) => (
//             <div key={item._id} className="border rounded-xl shadow p-4">
//               <img
//                 src={item.imageUrls[0]}
//                 alt={item.name}
//                 className="w-full h-48 object-cover rounded mb-2"
//               />
//               <h3 className="font-medium text-lg">{item.name}</h3>
//               <p className="text-sm text-gray-600">{item.brand}</p>
//               <p className="text-sm">{item.category} - {item.condition}</p>
//               <p className="text-sm font-semibold mt-1">
//                 {item.price === "Free" ? "Free" : `₹${item.price}`}
//               </p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default SearchResults;

"use client"

// src/pages/SearchResults.jsx
import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import "../styles/SearchResults.css"

const SearchResults = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const searchQuery = queryParams.get("search")

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/items/search?search=${searchQuery}`)

        if (!res.ok) {
          throw new Error("Failed to fetch search results")
        }

        const data = await res.json()
        setItems(data)
      } catch (err) {
        console.error("Search error:", err)
      } finally {
        setLoading(false)
      }
    }

    if (searchQuery) {
      fetchItems()
    }
  }, [searchQuery])

  return (
    <div className="main search-results-container">
      <h2>
        Results for "<span className="search-query">{searchQuery}</span>"
      </h2>

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : items.length === 0 ? (
        <p className="no-results">No matching items found.</p>
      ) : (
        <div className="item-grid">
          {items.map((item) => (
            <div
              key={item._id}
              className="search-item-card"
              onClick={() => (window.location.href = `/items/${item._id}`)}
            >
              <img src={item.imageUrls[0] || "/placeholder.svg"} alt={item.name} className="search-item-image" />
              <div className="search-item-details">
                <h3>{item.name}</h3>
                {item.brand && <p className="search-item-brand">{item.brand}</p>}
                <p className="search-item-meta">
                  {item.category} • {item.condition}
                </p>
                <p className="search-item-price">{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchResults
