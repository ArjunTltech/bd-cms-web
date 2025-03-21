import { Pencil, Trash2 } from "lucide-react";
import React, { useState } from "react";
import axiosInstance from "../../config/axios";
import { toast } from "react-toastify";
import { format } from "date-fns";
import DeleteConfirmModal from "../../components/ui/modal/DeleteConfirmModal";

function SliderCard({ slider, onDelete, onEdit }) {
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {      
     const response = await axiosInstance.delete(`/slider/delete-slider/${slider.id}`); 
      onDelete(slider.id);
      toast.success(response.data.message?response.data.message:"slider deleted successfully!");
    } catch (error) {
      console.error("Error deleting slider:", error);
      toast.error(error.response.data.message?error.response.data.message:"Failed to delete the slider. Please try again.");
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div className="card bg-base-200 transition-all duration-300 overflow-hidden group relative">
        <figure className="relative h-48 overflow-hidden">
          <img
            src={slider.image}
            alt={slider.heading}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </figure>

        <div className="card-body p-4">
          <h2 className="card-title text-neutral-content text-lg font-bold">
            {slider.heading}  {/* Assuming `provider` instead of `author` */}
          </h2>
          <p className="text-neutral-content text-sm">{slider.subheading}</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-neutral-content">
              {/* <span className="text-sm">
                {service.createdAt
                  ? format(new Date(slider.createdAt), "dd MMM, yyyy")
                  : "N/A"}
              </span> */}
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 flex gap-2">
          <button className="btn btn-sm btn-square btn-ghost" onClick={onEdit}>
            <Pencil className="w-6 h-6 text-success" />
          </button>
          <button
            className="btn btn-sm btn-square text-white btn-error"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={isLoading} 
        title="Delete Slider"
        message="Are you sure you want to delete this slider?"
      />
    </>
  );
}

export default SliderCard;
