
import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../config/axios";
import playNotificationSound from "../../utils/playNotification";

function ServiceForm({ onServiceCreated, initialData, mode, setIsDrawerOpen, sliderCount,sliderData }) {
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [tagline, setTagline] = useState("");
  const [subHeading, setSubHeading] = useState("");
  const [category, setCategory] = useState("")
  const [order,setOrder]=useState("")
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const inputRef = useRef(null);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setHeading(initialData.heading || "");
      setSubHeading(initialData.subheading || "");
      setTagline(initialData.tagline || "");
      setDescription(initialData.description || "")
      setCategory(initialData.category || "")
      setOrder(initialData.order||"")
      setImagePreview(initialData.image || null);
    } else {
      setHeading("");
      setDescription("");
      setTagline("");
      setSubHeading("")
      setHeading("");
      setCategory("")
      setOrder("")
      setImageFile(null);
      setImagePreview(null);
    }
    // Reset errors when mode or initialData changes
    setErrors({});
    setIsSubmitting(false);
  }, [mode, initialData]);
  const validateField = (name, value, mode) => {
    switch (name) {
      case 'heading':
        return value.trim().length >= 3
          ? null
          : "Heading is required and must be at least 3 characters long";

      case 'subheading':
        return value.trim().length === 0 || value.trim().length >= 3
          ? null
          : "Subheading must be at least 3 characters long"; // Not mandatory, but if provided, must be valid

      case 'description':
        return value.trim().length >= 10
          ? null
          : "Description is required and must be at least 10 characters long";

      case 'tagline':
        return value.trim().length >= 5
          ? null
          : "Tagline is required and must be at least 5 characters long";

      case 'category':
        return value.trim().length > 0
          ? null
          : "Category is required"; // Ensures a category is selected
      case 'order':
        return value.trim().length > 0
          ? null
          : "Order is required"; // Ensures a category is selected

      case 'image':
        if (mode === 'edit' && (value === undefined || value === null)) {
          return null; // Allow existing image in edit mode
        }
        return value
          ? null
          : "Image is required";

      default:
        return "This field is required";
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate image file
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type. Please upload JPEG, PNG, or GIF.");
        return;
      }

      if (file.size > maxSize) {
        toast.error("File is too large. Maximum size is 5MB.");
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));

      // Clear any previous image errors
      setErrors(prev => {
        const { image, ...rest } = prev;
        return rest;
      });
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (inputRef.current) inputRef.current.value = "";

    // Set image error when removed
    setErrors(prev => ({
      ...prev,
      image: "Image is required"
    }));

  };




  const handleSubmit = async (event) => {
    event.preventDefault();

    // Perform validation
    const newErrors = {};

    // Validate each field
    const taglineError = validateField('tagline', tagline, mode);

    if (taglineError) newErrors.taglineError = taglineError;
    const headingError = validateField('heading', heading, mode);
    if (headingError) newErrors.headingError = headingError;

    const subHeadingError = validateField('subheading', description, mode);
    if (subHeadingError) newErrors.subHeadingError = subHeadingError;

    const imageError = validateField('image', imageFile, mode);
    if (imageError) newErrors.image = imageError;


    const descriptionError = validateField('description', description, mode);
    if (descriptionError) newErrors.descriptionError = descriptionError;
    const categoryError = validateField('category', category, mode);
    if (categoryError) newErrors.categoryError = categoryError;
    const orderError = validateField('order', order, mode);
    if (orderError) newErrors.orderError = orderError;

    // If there are any errors, set them and prevent submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("heading", heading);
      formData.append("description", description);
      formData.append("tagline", tagline);
      formData.append("subheading", subHeading);
      formData.append("category", category);
      formData.append("order", order);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      let response;
      if (mode === "add") {
        if (sliderCount < 8) {
          if (!imagePreview) return
          response = await axiosInstance.post("/slider/add-slider", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          playNotificationSound()
          toast.success(response.data.message ? response.data.message : "Slider added successfully!");
        } else {
          toast.error("You can add up to 8 sliders only.");
        }
      } else if (mode === "edit" && initialData) {
        if (!imagePreview) return

        response = await axiosInstance.put(
          `/slider/update-slider/${initialData.id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success(response.data.message ? response.data.message : "Slider updated successfully!");
      }

      if (onServiceCreated) onServiceCreated();

      // Reset form on success
      setHeading("");
      setDescription("");
      setTagline("");
      setSubHeading("")
      setImageFile(null);
      setImagePreview(null);
      setIsDrawerOpen(false);
    } catch (error) {
      console.error("Error handling service:", error);
      toast.error(error.response.data.message ? error.response.data.message : "Failed to save service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const existingOrders = sliderData.map((item) => item.order); // Extract used order numbers


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block font-medium">
          Heading <span className="text-error">*</span>
        </label>
        <input
          type="text"
          placeholder="Slider heading"
          className={`input input-bordered w-full ${errors.headingError ? 'input-error' : ''}`}
          value={heading}
          onChange={(e) => {
            setHeading(e.target.value);
            const headingError = validateField('heading', e.target.value, mode);
            setErrors(prev => ({
              ...prev,
              headingError: headingError
            }));
          }}
        />
        {errors.headingError && <p className="text-error text-sm mt-1">{errors.headingError}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block font-medium">
          Subheading
        </label>
        <textarea
          className={`textarea textarea-bordered w-full ${errors.subHeadingError ? 'textarea-error' : ''}`}
          placeholder="Slider Subheading..."
          value={subHeading}
          onChange={(e) => {
            setSubHeading(e.target.value);
            const subHeadingError = validateField('subheading', e.target.value, mode);
            setErrors(prev => ({
              ...prev,
              subHeadingError: subHeadingError
            }));
          }}
        ></textarea>
        {errors.subHeadingError && <p className="text-error text-sm mt-1">{errors.subHeadingError}</p>}
      </div>

      {/* Tagline */}
      <div>
        <label className="block font-medium">Tagline
          <span className="text-error">*</span>
        </label>
        <input
          type="text"
          placeholder="Short tagline..."
          className={`input input-bordered w-full ${errors.taglineError ? 'input-error' : ''}`}
          value={tagline}
          onChange={(e) => {
            setTagline(e.target.value);
            const taglineError = validateField('tagline', e.target.value, mode);
            setErrors(prev => ({
              ...prev,
              taglineError: taglineError
            }));
          }}
        />
        {errors.taglineError && <p className="text-error text-sm mt-1">{errors.taglineError}</p>}
      </div>

      {/* Tagline Description */}
      <div>
        <label className="block font-medium">Description
          <span className="text-error">*</span>
        </label>
        <textarea
          placeholder="description..."
          className={`textarea textarea-bordered w-full ${errors.descriptionError ? 'textarea-error' : ''}`}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            const descriptionError = validateField('description', e.target.value, mode);
            setErrors(prev => ({
              ...prev,
              descriptionError: descriptionError
            }));
          }}
          rows={2}
        ></textarea>
        {errors.descriptionError && <p className="text-error text-sm mt-1">{errors.descriptionError}</p>}
      </div>
      <div>
        <label className="block font-medium">
          Category <span className="text-error">*</span>
        </label>
        <select
          className={`select select-bordered w-full ${errors.categoryError ? 'select-error' : ''}`}
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            const categoryError = validateField('category', e.target.value, mode);
            setErrors((prev) => ({
              ...prev,
              categoryError: categoryError,
            }));
          }}
        >
          <option value="">Select a category</option>
          <option value="Product">Product</option>
          <option value="Service">Service</option>
        </select>
        {errors.categoryError && <p className="text-error text-sm mt-1">{errors.categoryError}</p>}
      </div>
      
 {mode =="edit"?     <div>
  <label className="block font-medium">
    Order <span className="text-error">*</span>
  </label>
  <select
    className={`select select-bordered w-full ${errors.orderError ? 'select-error' : ''}`}
    value={order} // Ensure this is set correctly
    onChange={(e) => {
      setOrder(e.target.value);
      const orderError = validateField('order', e.target.value, mode);
      setErrors((prev) => ({
        ...prev,
        orderError: orderError,
      }));
    }}
  >
    <option value="">Select Order</option>
    {[...Array(8)].map((_, index) => (
      <option key={index + 1} value={index + 1}>
        {index + 1}
      </option>
    ))}
  </select>
  {errors.orderError && <p className="text-error text-sm mt-1">{errors.orderError}</p>}
</div>:  <div>
    <label className="block font-medium">
      Order <span className="text-error">*</span>
    </label>
    <select
      className={`select select-bordered w-full ${
        errors.orderError ? "select-error" : ""
      }`}
      value={order}
      onChange={(e) => {
        setOrder(e.target.value);
        const orderError = validateField("order", e.target.value, mode);
        setErrors((prev) => ({
          ...prev,
          orderError: orderError,
        }));
      }}
    >
      <option value="">Select Order</option>
      {[...Array(8)]
        .map((_, index) => index + 1) // Generate numbers from 1 to 8
        .filter((num) => !existingOrders.includes(num)) // Exclude already used numbers
        .map((num) => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
    </select>
    {errors.orderError && (
      <p className="text-error text-sm mt-1">{errors.orderError}</p>
    )}
  </div>}



      {/* Bullet Points */}

      {/* Image Upload */}
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">
            Image <span className="text-error">*</span>
          </span>
        </label>
        <div
          className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-base-100 ${errors.image ? 'border-error' : ''}`}
          onClick={() => inputRef.current?.click()}
        >
          {!imagePreview ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-primary mb-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M4 3a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v3.586l-1.293-1.293a1 1 0 00-1.414 0L10 12l-2.293-2.293a1 1 0 00-1.414 0L4 12V5zm0 10v-1.586l2.293-2.293a1 1 0 011.414 0L10 13l3.293-3.293a1 1 0 011.414 0L16 12.414V15H4z" />
              </svg>
              <p className="text-neutral-content">Drag and drop or click to upload</p>
            </>
          ) : (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full h-auto rounded-lg shadow-lg" />
              <button type="button" className="absolute top-2 right-2 btn btn-xs btn-error" onClick={handleRemoveImage}>
                Remove
              </button>
            </div>
          )}
          <input type="file" accept="image/*" className="hidden" ref={inputRef} onChange={handleImageChange} />
        </div>
        {errors.image && <p className="text-error text-sm mt-1">{errors.image}</p>}
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="submit"
          className="btn btn-primary w-full sm:w-1/2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner"></span>
              {mode === "add" ? "Adding Slider..." : "Updating Slider..."}
            </>
          ) : (
            mode === "add" ? "Add Slider" : "Update Slider"
          )}
        </button>
        <button
          type="button"
          className="btn btn-outline w-full sm:w-1/2 border border-gray-400  "
          onClick={() => {
            setIsDrawerOpen(false), setErrors({}), setIsSubmitting(false), setImagePreview(null)
          }}
        >
          Cancel
        </button>
      </div>

    </form>
  );
}

export default ServiceForm;