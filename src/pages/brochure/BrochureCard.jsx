import { Download, Edit, Trash2 } from "lucide-react";
import axiosInstance from "../../config/axios";
import { toast } from "react-hot-toast";

function BrochureCard({ brochure, onEdit, onDelete }) {
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this brochure?")) return;

    try {
      await axiosInstance.delete(`/brochure/delete/${brochure.id}`);
      toast.success("Brochure deleted!");
      onDelete(brochure.id);
    } catch (err) {
      toast.error("Failed to delete brochure");
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl transition-transform hover:scale-105">
      <div className="card-body space-y-2">
        <h2 className="card-title">{brochure.title}</h2>
        <p className="text-sm text-gray-400">{brochure.description}</p>

        <div className="flex gap-3 mt-4">
          <a
            href={brochure.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            View
          </a>
          <button onClick={onEdit} className="btn btn-outline btn-sm">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={handleDelete} className="btn btn-outline btn-sm btn-error">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default BrochureCard;
