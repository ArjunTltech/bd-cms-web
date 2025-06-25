import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../config/axios";

function BrochureForm({ mode, initialData, onSaved, setIsDrawerOpen }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setTitle(initialData.title || "");
      setFile(null); // Don't prefill file input
    } else {
      setTitle("");
      setFile(null);
    }
  }, [initialData, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || (mode === "add" && !file)) {
      toast.error("Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      if (file) formData.append("pdf", file);

      if (mode === "add") {
        await axiosInstance.post("/brochure/create", formData);
        toast.success("Brochure added!");
      } else if (mode === "edit") {
        await axiosInstance.put(`/brochure/update/${initialData.id}`, formData);
        toast.success("Brochure updated!");
      }

      onSaved();
      setIsDrawerOpen(false);
    } catch (err) {
      toast.error("Failed to save brochure.");
      console.error("Brochure save error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="label font-medium">Title</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="label font-medium">PDF File</label>
        <input
          type="file"
          accept="application/pdf"
          className="file-input file-input-bordered w-full"
          onChange={(e) => setFile(e.target.files[0])}
          required={mode === "add"}
        />
      </div>

      <button
        type="submit"
        className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
      >
        {mode === "edit" ? "Update Brochure" : "Add Brochure"}
      </button>
    </form>
  );
}

export default BrochureForm;
