import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import BrochureForm from "./BrochureForm";
import BrochureCard from "./BrochureCard";
import axiosInstance from "../../config/axios";

function BrochureLayout() {
  const [brochures, setBrochures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editBrochure, setEditBrochure] = useState(null);
  const [mode, setMode] = useState("add");
  const [searchQuery, setSearchQuery] = useState("");

  const refreshBrochureList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/brochure/get-all-brochure");
      console.log("Brochure API response:", response.data);
      setBrochures(response.data?.brochures || []); // ✅ Corrected line
    } catch (err) {
      setError("Failed to load brochures");
      console.error("Error fetching brochures:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBrochureList();
  }, [refreshBrochureList]);

  const handleDeleteBrochure = (id) => {
    setBrochures((prev) => prev.filter((b) => b.id !== id));
  };

  const handleEditBrochure = (brochure) => {
    setEditBrochure(brochure);
    setMode("edit");
    setIsDrawerOpen(true);
  };

  const handleAddNewBrochure = () => {
    setEditBrochure(null);
    setMode("add");
    setIsDrawerOpen(true);
  };

  const filteredBrochures = Array.isArray(brochures)
    ? brochures.filter((b) =>
        b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen relative">
      <div className="drawer drawer-end">
        <input
          id="brochure-drawer"
          type="checkbox"
          className="drawer-toggle"
          checked={isDrawerOpen}
          onChange={() => setIsDrawerOpen(!isDrawerOpen)}
        />
        <div className="drawer-content">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-content">Brochures</h1>
            <button
              className="btn btn-primary text-white gap-2"
              onClick={handleAddNewBrochure}
            >
              + New Brochure
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search brochure..."
                className="input input-bordered w-full pl-10 bg-base-100 text-neutral-content"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card bg-base-100 animate-pulse">
                  <div className="h-48 bg-base-200 rounded-xl"></div>
                  <div className="card-body space-y-3">
                    <div className="h-4 bg-base-300 w-1/2"></div>
                    <div className="h-6 bg-base-300 w-3/4"></div>
                    <div className="h-4 bg-base-300 w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBrochures.map((brochure) => (
                <BrochureCard
                  key={brochure.id}
                  brochure={brochure}
                  onEdit={() => handleEditBrochure(brochure)}
                  onDelete={handleDeleteBrochure}
                />
              ))}
            </div>
          )}
        </div>

        {/* Drawer Form */}
        <div className="drawer-side">
          <label htmlFor="brochure-drawer" className="drawer-overlay"></label>
          <div className="p-4 md:w-[40%] w-full sm:w-1/2 bg-base-100 h-[85vh] rounded-lg overflow-y-scroll absolute bottom-4 right-4 shadow-lg">
            <h2 className="text-lg font-bold mb-4">
              {editBrochure ? "Edit Brochure" : "Add New Brochure"}
            </h2>
            <BrochureForm
              mode={mode}
              initialData={editBrochure}
              onSaved={refreshBrochureList}
              setIsDrawerOpen={setIsDrawerOpen}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrochureLayout;
