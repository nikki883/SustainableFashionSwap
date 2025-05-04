import { memo } from "react"
import { Link } from "react-router-dom"
import "./ItemCard.css"

const ItemCard = memo(({ _id, img, title, size, price }) => {
  return (
    <Link to={`/items/${_id}`} className="item-card-link">
      <div className="item-card">
        <div className="item-card-img-container">
           <img
            className="item-card-img"
          src={img || "https://via.placeholder.com/300x300?text=No+Image"}
          alt={title}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x300?text=No+Image"
          }}
          loading="lazy" // Enable lazy loading
        />
        </div>
        <div className="item-card-content">
          <h2 className="item-card-title">{title}</h2>
          <p className="item-card-size">{size}</p>
          <p className="item-card-price">{price}</p>
        </div>
      </div>
    </Link>
  )
})

// Add display name for debugging
ItemCard.displayName = "ItemCard"

export default ItemCard
