import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../config/axios";

function BrochureForm({ mode, initialData, onSaved, setIsDrawerOpen }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [existingPdfRemoved, setExistingPdfRemoved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setTitle(initialData.title || "");
      setFile(null);
      setExistingPdfRemoved(false);
    } else {
      setTitle("");
      setFile(null);
    }
  }, [initialData, mode]);

  const handleRemoveExistingPDF = async () => {
    if (!initialData?.id) return;

    try {
      await axiosInstance.delete(`/brochure/delete-pdf/${initialData.id}`);
      toast.success("PDF removed");
      setExistingPdfRemoved(true);
    } catch (error) {
      toast.error("Failed to remove PDF");
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());

    if (file) {
      formData.append("file", file);
    }

    if (mode === "edit" && initialData?.id) {
      formData.append("id", initialData.id);
    }

    setLoading(true);

    try {
      await axiosInstance.post("/brochure/add-brochure", formData);
      toast.success(`Brochure ${mode === "edit" ? "updated" : "added"}!`);
      onSaved();
      setIsDrawerOpen(false);
    } catch (err) {
      console.error("Brochure save error:", err);
      toast.error("Failed to save brochure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title Input */}
      <div>
        <label className="label font-medium">Title</label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter brochure title"
          
        />
      </div>

      {/* PDF Upload */}
      <div>
        <label className="label font-medium">PDF File (optional)</label>
        <input
          type="file"
          accept="application/pdf"
          className="file-input file-input-bordered w-full"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <small className="text-sm text-gray-500">
          You can upload or change the PDF later.
        </small>

        {file && (
          <button
            type="button"
            className="btn btn-sm btn-error mt-2"
            onClick={() => setFile(null)}
          >
            Remove selected PDF
          </button>
        )}
      </div>

      {/* Existing PDF (edit mode only) */}
      {mode === "edit" && initialData?.pdfFileUrl && !existingPdfRemoved && (
        <div>
          <label className="label font-medium">Existing PDF</label>
          <div className="flex items-center gap-4">
            <a
              href={initialData.pdfFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary"
            >
              View PDF
            </a>
            <button
              type="button"
              className="btn btn-sm btn-error"
              onClick={handleRemoveExistingPDF}
            >
              Remove PDF
            </button>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
        disabled={loading}
      >
        {loading
          ? mode === "edit"
            ? "Updating..."
            : "Adding..."
          : mode === "edit"
          ? "Update Brochure"
          : "Add Brochure"}
      </button>
    </form>
  );
}

export default BrochureForm;
