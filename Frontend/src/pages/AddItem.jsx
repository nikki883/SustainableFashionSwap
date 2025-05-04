// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "./AddItem.css";

// const AddItem = () => {
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [category, setCategory] = useState("");
//   const [condition, setCondition] = useState("");
//   const [size, setSize] = useState("");
//   const [price, setPrice] = useState("");
//   const [brand, setBrand] = useState("");
//   const [color, setColor] = useState("");
//   const [availableFor, setAvailableFor] = useState("");
//   const [images, setImages] = useState([]); // Files
//   const [uploading, setUploading] = useState(false);

//   const navigate = useNavigate();

//   const categories = [
//     "Clothing",
//     "Footwear",
//     "Accessories",
//     "Jewelry",
//     "Bags",
//     "Ethnic Wear",
//     "Winter Wear",
//   ];
//   const conditions = ["New", "Like New", "Gently Used", "Well Used"];
//   const sizes = ["XS", "S", "M", "L", "XL", "Free Size"];
//   const priceOptions = ["Free", "Under ₹500", "₹500–₹1000", "Above ₹1000"];

//   const handleImageChange = (e) => {
//     const selectedFiles = Array.from(e.target.files);
//     if (selectedFiles.length < 2 || selectedFiles.length > 3) {
//       alert("Please upload 2 to 3 images.");
//       return;
//     }
//     setImages(selectedFiles);
//   };

//   const uploadImagesToCloudinary = async () => {
//     const uploadPromises = images.map((image) => {
//       const formData = new FormData();
//       formData.append("file", image);
//       formData.append("upload_preset", "item_upload");
//       formData.append("folder", "items");

//       return axios.post(
//         "https://api.cloudinary.com/v1_1/dgmeakxlk/image/upload",
//         formData
//       );
//     });

//     try {
//       setUploading(true);
//       const responses = await Promise.all(uploadPromises);
//       setUploading(false);
//       return responses.map((res) => res.data.secure_url);
//     } catch (err) {
//       setUploading(false);
//       console.error("Image upload failed:", err);
//       return null;
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (
//       !name ||
//       !description ||
//       !category ||
//       !condition ||
//       !size ||
//       !price ||
//       images.length < 2
//     ) {
//       alert("All fields are required and please upload 2–3 images.");
//       return;
//     }

//     const imageUrls = await uploadImagesToCloudinary();
//     if (!imageUrls) {
//       alert("Image upload failed");
//       return;
//     }

//     try {
//       const response = await fetch("http://localhost:5000/api/items/add", {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name,
//           description,
//           category,
//           condition,
//           size,
//           price,
//           imageUrls,
//           brand,
//           color,
//           availableFor,
//         }),
//       });

//       if (response.ok) {
//         navigate("/items");
//       } else {
//         alert("Failed to add item");
//       }
//     } catch (error) {
//       console.error("Error adding item:", error);
//     }
//   };

//   return (
//     <div className="form-container">
//       <div className="form-wrapper">
//         <h2 className="form-title">Add New Item</h2>
//         <form onSubmit={handleSubmit} className="form-body">
//           <input
//             type="text"
//             placeholder="Item Name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             required
//             className="form-input"
//           />

//           <textarea
//             placeholder="Description"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             required
//             rows={4}
//             className="form-textarea"
//           ></textarea>
//           <input
//             type="text"
//             placeholder="Color (optional)"
//             value={color}
//             onChange={(e) => setColor(e.target.value)}
//             className="form-input"
//           />
//           <input
//             type="text"
//             placeholder="Brand (optional)"
//             value={brand}
//             onChange={(e) => setBrand(e.target.value)}
//             className="form-input"
//           />

//           <div className="form-grid">
//             <select
//               value={category}
//               onChange={(e) => setCategory(e.target.value)}
//               required
//               className="form-select"
//             >
//               <option value="">Select Category</option>
//               {categories.map((cat) => (
//                 <option key={cat} value={cat}>
//                   {cat}
//                 </option>
//               ))}
//             </select>

//             <select
//               value={condition}
//               onChange={(e) => setCondition(e.target.value)}
//               required
//               className="form-select"
//             >
//               <option value="">Select Condition</option>
//               {conditions.map((c) => (
//                 <option key={c} value={c}>
//                   {c}
//                 </option>
//               ))}
//             </select>

//             <select
//               value={size}
//               onChange={(e) => setSize(e.target.value)}
//               required
//               className="form-select"
//             >
//               <option value="">Select Size</option>
//               {sizes.map((s) => (
//                 <option key={s} value={s}>
//                   {s}
//                 </option>
//               ))}
//             </select>

//             <select
//               value={price}
//               onChange={(e) => setPrice(e.target.value)}
//               required
//               className="form-select"
//             >
//               <option value="">Select Price Range</option>
//               {priceOptions.map((p) => (
//                 <option key={p} value={p}>
//                   {p}
//                 </option>
//               ))}
//             </select>
//             <select
//               value={availableFor}
//               onChange={(e) => setAvailableFor(e.target.value)}
//               required
//               className="form-select"
//             >
//               <option value="">Available For</option>
//               <option value="Buy">Buy</option>
//               <option value="Swap">Swap</option>
//               <option value="Both">Both</option>
//             </select>
//           </div>

//           <div className="form-upload">
//             <label>Upload Images</label>
//             <input
//               type="file"
//               accept="image/*"
//               multiple
//               onChange={handleImageChange}
//               required
//             />
//           </div>

//           {images.length > 0 && (
//             <div className="image-preview">
//               {images.map((img, index) => (
//                 <img
//                   key={index}
//                   src={URL.createObjectURL(img)}
//                   alt={`Preview ${index + 1}`}
//                   className="preview-img"
//                 />
//               ))}
//             </div>
//           )}

//           <button type="submit" disabled={uploading} className="form-submit">
//             {uploading ? "Uploading..." : "Add Item"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddItem;



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
  const [brand, setBrand] = useState("")
  const [color, setColor] = useState("")
  const [availableFor, setAvailableFor] = useState("")
  const [images, setImages] = useState([]) // Files
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const navigate = useNavigate()

  const categories = ["Clothing", "Footwear", "Accessories", "Jewelry", "Bags", "Ethnic Wear", "Winter Wear"]
  const conditions = ["New", "Like New", "Gently Used", "Well Used"]
  const sizes = ["XS", "S", "M", "L", "XL", "Free Size"]
  const priceOptions = ["Free", "Under ₹500", "₹500–₹1000", "Above ₹1000"]

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length < 2 || selectedFiles.length > 3) {
      setError("Please upload 2 to 3 images.")
      return
    }
    setImages(selectedFiles)
    setError("")
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!name || !description || !category || !condition || !size || !price || images.length < 2) {
      setError("All fields are required and please upload 2–3 images.")
      return
    }

    const imageUrls = await uploadImagesToCloudinary()
    if (!imageUrls) {
      return
    }

    try {
      const response = await fetch("http://localhost:5000/api/items/add", {
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
          price,
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
                <select id="price" value={price} onChange={(e) => setPrice(e.target.value)} required>
                  <option value="">Select Price Range</option>
                  {priceOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="availableFor">Available For</label>
              <select id="availableFor" value={availableFor} onChange={(e) => setAvailableFor(e.target.value)} required>
                <option value="">Select Option</option>
                <option value="Buy">Buy</option>
                <option value="Swap">Swap</option>
                <option value="Both">Both</option>
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

            {images.length > 0 && (
              <div className="image-preview-container">
                {images.map((img, index) => (
                  <div key={index} className="image-preview">
                    <img src={URL.createObjectURL(img) || "/placeholder.svg"} alt={`Preview ${index + 1}`} />
                    <span className="image-number">{index + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? "Uploading..." : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddItem
