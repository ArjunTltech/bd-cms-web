import { useState } from "react";
import { Download, Edit, Trash2 } from "lucide-react";
import axiosInstance from "../../config/axios";
import { toast } from "react-toastify";
import DeleteConfirmModal from "../../components/ui/modal/DeleteConfirmModal";

function BrochureCard({ brochure, onEdit, refreshBrochureList }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/brochure/delete-brochure/${brochure.id}`);
      toast.success("Brochure deleted!");
      await refreshBrochureList(); // Ensure server-side refresh
    } catch (err) {
      toast.error("Failed to delete brochure");
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <div className="relative rounded-xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 shadow-xl text-white hover:scale-105 transition-transform">
        {brochure.pdfFileUrl ? (
          <embed
            src={brochure.pdfFileUrl}
            type="application/pdf"
            className="w-full h-72"
            style={{ backgroundColor: "white" }}
          />
        ) : (
          <div className="w-full h-72 flex items-center justify-center bg-white/10 text-red-500 text-sm">
            No PDF Available
          </div>
        )}

        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col justify-between p-4">
          <div>
            <h2 className="text-lg font-semibold">{brochure.title}</h2>
            {brochure.description && (
              <p className="text-sm text-white/80">{brochure.description}</p>
            )}
          </div>

          <div className="flex gap-3 mt-4 flex-wrap">
            {brochure.pdfFileUrl && (
              <a
                href={brochure.pdfFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm bg-white/10 hover:bg-white/20 text-white border border-white/30"
              >
                <Download className="w-4 h-4" />
                View
              </a>
            )}
            <button
              onClick={onEdit}
              className="btn btn-sm bg-white/10 hover:bg-white/20 text-white border border-white/30"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-sm bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-400/40"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${brochure.title}"?`}
        isLoading={isDeleting}
      />
    </>
  );
}

export default BrochureCard;
