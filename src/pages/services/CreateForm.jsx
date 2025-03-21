
import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../config/axios";
import playNotificationSound from "../../utils/playNotification";

function ServiceForm({ onServiceCreated, initialData, mode, setIsDrawerOpen }) {
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [tagline, setTagline] = useState("");
  const [subHeading, setSubHeading] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const inputRef = useRef(null);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setHeading(initialData.title || "");
      setSubHeading(initialData.shortDescription || "");
      setTagline(initialData.tagline || "");
      setDescription(initialData.description || "")
      setImagePreview(initialData.image || null);
    } else {
      setHeading("");
      setDescription("");
      setTagline("");
      setSubHeading("")
      setHeading("");
      setImageFile(null);
      setImagePreview(null);
    }
    // Reset errors when mode or initialData changes
    setErrors({});
    setIsSubmitting(false);
  }, [mode, initialData]);

  const validateField = (name, value, mode) => {
    switch (name) {
      case 'title':
        return value.trim().length >= 3 
          ? null 
          : "Title must be at least 3 characters long";
      case 'description':
        return value.trim().length >= 10 
          ? null 
          : "Description must be at least 10 characters long";
    
      case 'image':
        // Skip image validation in edit mode if no new image is provided
        if (mode === 'edit' && (value === undefined || value === null)) {
          return null;
        }
        return value 
          ? null 
          : "Image is required";
      case 'tagline':
        return value.trim().length === 0 || value.trim().length >= 5
          ? null
          : "Tagline must be at least 5 characters long";
      case 'description':
        return value.trim().length === 0 || value.trim().length >= 10
          ? null
          : "Tagline description must be at least 10 characters long";
      default:
        return null;
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
    const headingError = validateField('heading', heading);
    if (headingError) newErrors.headingError = headingError;

    const subHeadingError = validateField('subHeading', description,mode);
    if (subHeadingError) newErrors.subHeadingError = subHeadingError;

    const imageError = validateField('image', imageFile,mode);
    if (imageError) newErrors.image = imageError;

    const taglineError = validateField('tagline', tagline,mode);
    if (taglineError) newErrors.tagline = taglineError;

    const descriptionError = validateField('description', description,mode);
    if (descriptionError) newErrors.descriptionError = descriptionError;

    // If there are any errors, set them and prevent submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      console.log("hello");
      
      const formData = new FormData();
      formData.append("heading", heading);
      formData.append("description", description);
      formData.append("tagline", tagline);
      formData.append("subheading",subHeading);

      if (imageFile) {
        formData.append("image5", imageFile);
      }
      console.log(mode);
      
      let response;
      if (mode === "add") {
        if(!imagePreview)return
        response = await axiosInstance.post("/slider/add-slider", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log(response);
        
        playNotificationSound()
        toast.success("Service added successfully!");
      } else if (mode === "edit" && initialData) {
        if(!imagePreview)return

        response = await axiosInstance.put(
          `/service/update-service/${initialData.id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("Service updated successfully!");
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
      toast.error("Failed to save service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`}
          value={heading}
          onChange={(e) => {
            setHeading(e.target.value);
            const headingError = validateField('heading', e.target.value,mode);
            setErrors(prev => ({
              ...prev,
              setHeading: headingError
            }));
          }}
        />
        {errors.heading && <p className="text-error text-sm mt-1">{errors.heading}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block font-medium">
          Subheading 
        </label>
        <textarea
          className={`textarea textarea-bordered w-full ${errors.subHeading ? 'textarea-error' : ''}`}
          placeholder="Slider Subheading..."
          value={subHeading}
          onChange={(e) => {
            setSubHeading(e.target.value);
            const subHeadingError = validateField('subheading', e.target.value,mode);
            setErrors(prev => ({
              ...prev,
              subHeading:subHeadingError
            }));
          }}
        ></textarea>
        {errors.subheading && <p className="text-error text-sm mt-1">{errors.subheading}</p>}
      </div>

      {/* Tagline */}
      <div>
        <label className="block font-medium">Tagline
        <span className="text-error">*</span>
        </label>
        <input
          type="text"
          placeholder="Short tagline..."
          className={`input input-bordered w-full ${errors.tagline ? 'input-error' : ''}`}
          value={tagline}
          onChange={(e) => {
            setTagline(e.target.value);
            const taglineError = validateField('tagline', e.target.value,mode);
            setErrors(prev => ({
              ...prev,
              tagline: taglineError
            }));
          }}
        />
        {errors.tagline && <p className="text-error text-sm mt-1">{errors.tagline}</p>}
      </div>

      {/* Tagline Description */}
      <div>
        <label className="block font-medium">Description
        <span className="text-error">*</span>
        </label>
        <textarea
          placeholder="description..."
          className={`textarea textarea-bordered w-full ${errors.content ? 'textarea-error' : ''}`}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            const descriptionError = validateField('description', e.target.value,mode);
            setErrors(prev => ({
              ...prev,
              descriptionError: descriptionError
            }));
          }}
          rows={2}
        ></textarea>
        {errors.description && <p className="text-error text-sm mt-1">{errors.description}</p>}
      </div>

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
      <div>
        <button 
          type="submit" 
          className="btn btn-primary w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner"></span>
              {mode === "add" ? "Adding Service..." : "Updating Service..."}
            </>
          ) : (
            mode === "add" ? "Add Service" : "Update Service"
          )}
        </button>
      </div>
    </form>
  );
}

export default ServiceForm;