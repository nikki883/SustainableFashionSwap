import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./AddItem.css"

const AddItem = () => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [condition, setCondition] = useState("")
  const [size, setSize] = useState("")
  const [price, setPrice] = useState("")
  const [customPrice, setCustomPrice] = useState("")
  const [isPriceCustom, setIsPriceCustom] = useState(false)
  const [brand, setBrand] = useState("")
  const [color, setColor] = useState("")
  const [availableFor, setAvailableFor] = useState("")
  const [images, setImages] = useState([]) // Files
  const [imagePreviews, setImagePreviews] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()

  const categories = ["Clothing", "Footwear", "Accessories", "Jewelry", "Bags", "Ethnic Wear", "Winter Wear","Western Wear","Other"]
  const conditions = ["New", "Like New", "Good", "Fair", "Poor"]
  const sizes = ["XS", "S", "M", "L", "XL", "Free Size"]
  const priceOptions = ["Free", "Under ₹500", "₹500–₹1000", "Above ₹1000", "Custom"]

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files)

    // Check if adding these files would exceed the limit
    if (images.length + selectedFiles.length > 3) {
      setError("Maximum 3 images allowed.")
      return
    }

    // Add the new files to the existing ones
    const updatedImages = [...images, ...selectedFiles]
    setImages(updatedImages)

    // Create previews for the new images
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file))
    setImagePreviews((prev) => [...prev, ...newPreviews])

    setError("")
  }

  const removeImage = (index) => {
    // Remove the image and its preview
    const updatedImages = [...images]
    updatedImages.splice(index, 1)
    setImages(updatedImages)

    const updatedPreviews = [...imagePreviews]
    URL.revokeObjectURL(updatedPreviews[index]) // Clean up the URL
    updatedPreviews.splice(index, 1)
    setImagePreviews(updatedPreviews)
  }

  const uploadImagesToCloudinary = async () => {
    const uploadPromises = images.map((image) => {
      const formData = new FormData()
      formData.append("file", image)
      formData.append("upload_preset", "item_upload")
      formData.append("folder", "items")

      return axios.post("https://api.cloudinary.com/v1_1/dgmeakxlk/image/upload", formData)
    })

    try {
      setUploading(true)
      const responses = await Promise.all(uploadPromises)
      setUploading(false)
      return responses.map((res) => res.data.secure_url)
    } catch (err) {
      setUploading(false)
      console.error("Image upload failed:", err)
      setError("Image upload failed. Please try again.")
      return null
    }
  }

  const handlePriceChange = (e) => {
    const value = e.target.value
    setPrice(value)

    // If "Custom" is selected, show the custom price input
    if (value === "Custom") {
      setIsPriceCustom(true)
    } else {
      setIsPriceCustom(false)
    }
  }

  const handleCustomPriceChange = (e) => {
    setCustomPrice(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (isSubmitting) return // Prevent double submission

    if (!name || !description || !category || !condition || !size || !price || images.length < 1) {
      setError("All fields are required and please upload at least one image.")
      return
    }

    setIsSubmitting(true) // Set submitting state

    try {
      const imageUrls = await uploadImagesToCloudinary()
      if (!imageUrls) {
        setIsSubmitting(false)
        return
      }

      const finalPrice = isPriceCustom ? `₹${customPrice}` : price

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/items/add`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          category,
          condition,
          size,
          price: finalPrice,
          imageUrls,
          brand,
          color,
          availableFor,
        }),
      })

      if (response.ok) {
        setSuccess("Item added successfully!")
        setTimeout(() => {
          navigate("/items")
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.message || "Failed to add item")
      }
    } catch (error) {
      console.error("Error adding item:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false) // Reset submitting state
    }
  }

  return (
    <div className="add-item-container">
      <div className="add-item-card">
        <div className="add-item-header">
          <h2>Add New Item</h2>
          <p>Share your pre-loved fashion items with the community</p>
        </div>

        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <form onSubmit={handleSubmit} className="add-item-form">
          <div className="form-section">
            <h3>Basic Information</h3>

            <div className="form-group">
              <label htmlFor="name">Item Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Vintage Denim Jacket"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your item, including any notable features or flaws"
                rows={4}
                required
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="brand">Brand (optional)</label>
                <input
                  id="brand"
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g., Zara"
                />
              </div>

              <div className="form-group">
                <label htmlFor="color">Color (optional)</label>
                <input
                  id="color"
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g., Blue"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Item Details</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required>
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="condition">Condition</label>
                <select id="condition" value={condition} onChange={(e) => setCondition(e.target.value)} required>
                  <option value="">Select Condition</option>
                  {conditions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="size">Size</label>
                <select id="size" value={size} onChange={(e) => setSize(e.target.value)} required>
                  <option value="">Select Size</option>
                  {sizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="price">Price Range</label>
                <select id="price" value={price} onChange={handlePriceChange} required>
                  <option value="">Select Price Range</option>
                  {priceOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>

                {isPriceCustom && (
                  <div className="custom-price-input">
                    <label htmlFor="customPrice">Enter Price (₹)</label>
                    <input
                      id="customPrice"
                      type="number"
                      min="0"
                      value={customPrice}
                      onChange={handleCustomPriceChange}
                      placeholder="Enter exact price"
                      required={isPriceCustom}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="availableFor">Available For</label>
              <select id="availableFor" value={availableFor} onChange={(e) => setAvailableFor(e.target.value)} required>
                <option value="">Select Option</option>
                <option value="Swap">Swap</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Images</h3>
            <p className="form-hint">Please upload 2-3 clear images of your item</p>

            <div className="image-upload-container">
              <label htmlFor="images" className="image-upload-label">
                <div className="upload-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </div>
                <span>Click to upload images</span>
              </label>
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                required
                className="image-upload-input"
              />
            </div>

            {imagePreviews.length > 0 && (
              <div className="image-preview-container">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-preview">
                    <img src={preview || "/placeholder.svg"} alt={`Preview ${index + 1}`} />
                    <button type="button" className="remove-image-btn" onClick={() => removeImage(index)}>
                      ×
                    </button>
                    <span className="image-number">{index + 1}</span>
                  </div>
                ))}

                {/* Add more images button */}
                {imagePreviews.length < 3 && (
                  <div className="add-more-image">
                    <label htmlFor="more-images" className="add-image-label">
                      <div className="add-icon">+</div>
                      <span>Add Image</span>
                    </label>
                    <input
                      id="more-images"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="image-upload-input"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={uploading || isSubmitting}>
              {uploading ? "Uploading..." : isSubmitting ? "Adding Item..." : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddItem
