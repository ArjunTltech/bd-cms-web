import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../config/axios";
import playNotificationSound from "../../utils/playNotification";

function ClientForm({ onClientCreated, refreshClientList, initialData, mode, setIsDrawerOpen, submitting, setSubmitting }) {
  const [title, setTitle] = useState("");
  const [website, setWebsite] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const inputRef = useRef(null);


  // Validation constants
  const MAX_DESCRIPTION_LENGTH = 36;
  const MAX_TITLE_LENGTH = 20;
  const MAX_WEBSITE_LENGTH = 150;

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (!isNaN(title.trim())) {
      newErrors.title = "Title cannot be a number";
    } else if (title.trim().length > MAX_TITLE_LENGTH) {
      newErrors.title = `Title must be less than ${MAX_TITLE_LENGTH} characters`;
    }


    // Website validation
    if (!website.trim()) {
      newErrors.website = "Website is required";
    } else if (website.trim().length > MAX_WEBSITE_LENGTH) {
      newErrors.website = `Website must be less than ${MAX_WEBSITE_LENGTH} characters`;
    } else {
      // Basic URL validation
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(website)) {
        newErrors.website = "Please enter a valid website URL";
      }
    }

    // Description validation (only limit, not required)
    if (content.trim().length > MAX_DESCRIPTION_LENGTH) {
      newErrors.content = `Short Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`;
    }

    // Image validation (Required)
    if (!imageFile && !imagePreview) {
      newErrors.image = "Image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setTitle(initialData.name || "");
      setWebsite(initialData.website || "");
      setContent(initialData.description || "");
      setImagePreview(initialData.logo || null);
    } else if (mode === "add") {
      resetForm();
    }
  }, [mode, initialData]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      handleRemoveImage();
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const resetForm = () => {
    setTitle("");
    setWebsite("");
    setContent("");
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // if (!title || !website || !content) {
    //   toast.error("Please fill in all fields.");
    //   return;
    // }

    // Validate form before submission
    if (!validateForm()) {
      return;
    }


    const formData = new FormData();
    formData.append("name", title);
    formData.append("website", website);
    formData.append("description", content);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      setSubmitting(true);
      if (mode === "add") {
        await axiosInstance.post("/client/create-client", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Client created successfully!");
      } else if (mode === "edit" && initialData) {
        await axiosInstance.put(
          `/client/update-client/${initialData.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        playNotificationSound()
        toast.success("Client updated successfully!");
      }

      if (refreshClientList) {
        refreshClientList();
      }

      resetForm();
      setIsDrawerOpen(false);
    } catch (error) {
      console.error("Error handling client:", error);
      toast.error("Failed to save client. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Title Input */}
      <div className="form-control mb-4">
        <label className="label flex justify-start">
          <span className="label-text">Title</span>
          <span className="text-error ml-1">*</span>
        </label>
        <input
          type="text"
          placeholder="Client name"
          className={`input input-bordered ${errors.title ? 'input-error' : 'border-accent'}`}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setErrors(prev => ({ ...prev, title: '' }));
          }}
          disabled={submitting}
          maxLength={MAX_TITLE_LENGTH}
        />
        {errors.title && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.title}</span>
          </label>
        )}
      </div>

      {/* Website Input */}
      <div className="form-control mb-4">
        <label className="label flex justify-start">
          <span className="label-text">Website</span>
          <span className="text-error ml-1">*</span>

        </label>
        <input
          type="text"
          placeholder="Enter website URL"
          className={`input input-bordered ${errors.website ? 'input-error' : 'border-accent'}`}
          value={website}
          onChange={(e) => {
            setWebsite(e.target.value);
            setErrors(prev => ({ ...prev, website: '' }));
          }}
          disabled={submitting}
          maxLength={MAX_WEBSITE_LENGTH}
        />
        {errors.website && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.website}</span>
          </label>
        )}
      </div>

      {/* Content Input */}
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">Short Description</span>
          <span className="label-text-alt text-base-content/50">
            {content.trim().length}/{MAX_DESCRIPTION_LENGTH}
          </span>
        </label>
        <textarea
          className={`textarea textarea-bordered ${errors.content ? 'textarea-error' : ''}`}
          placeholder="Write client description..."
          value={content}
          onChange={(e) => {
            // Limit input to MAX_DESCRIPTION_LENGTH
            const inputValue = e.target.value;
            if (inputValue.length <= MAX_DESCRIPTION_LENGTH) {
              setContent(inputValue);
              setErrors(prev => ({ ...prev, content: '' }));
            }
          }}
          disabled={submitting}
          maxLength={MAX_DESCRIPTION_LENGTH}
        ></textarea>
        {errors.content && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.content}</span>
          </label>
        )}
      </div>

      {/* Image Upload */}
      <div className="form-control mb-4">
        <label className="label flex justify-start">
          <span className="label-text">Logo</span>
          <span className="text-error ml-1">*</span>
        </label>
        <div
          className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-base-100"
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
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-auto rounded-lg shadow-lg"
              />
              <button
                type="button"
                className="absolute top-2 right-2 btn btn-xs btn-error"
                onClick={handleRemoveImage}
              >
                Remove
              </button>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={inputRef}
            onChange={handleImageChange}
          />

        </div>
        {errors.image && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.image}</span>
          </label>
        )}

      </div>

      {/* Submit Button */}
      <div className="form-control">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="loading loading-spinner"></span>
              {mode === "add" ? "Creating..." : "Updating..."}
            </>
          ) : (
            mode === "add" ? "Create" : "Update"
          )}
        </button>
      </div>
    </form>
  );
}

export default ClientForm;
