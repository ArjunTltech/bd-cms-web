import { useState, useEffect, useCallback } from "react";
import { Search, Plus, PenLine, Trash } from "lucide-react";
import axiosInstance from "../../config/axios";
import { toast } from "react-toastify";

function CategoryLayout() {
  // Active category tab
  const [activeTab, setActiveTab] = useState("business");
  
  // Data states
  const [businesses, setBusinesses] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [mode, setMode] = useState("add");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data for the active tab
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let endpoint;
      switch (activeTab) {
        case "business":
          endpoint = "/category/get-business";
          break;
        case "service":
          endpoint = "/category/get-service";
          break;
        case "product":
          endpoint = "/category/get-product";
          break;
        default:
          endpoint = "/category/get-business";
      }
      
      const response = await axiosInstance.get(endpoint);
      
      switch (activeTab) {
        case "business":
          setBusinesses(response.data.business || []);
          break;
        case "service":
          setServices(response.data.services || []);
          break;
        case "product":
            
          setProducts(response.data.products || []);
          break;
      }
    } catch (err) {
      setError(`Failed to load ${activeTab} data`);
      console.error(`Error fetching ${activeTab} data:`, err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle CRUD operations
  const handleDelete = async (id) => {    
    try {
      let endpoint;
      switch (activeTab) {
        case "business":
          endpoint = `/category/delete-business/${id}`;
          setBusinesses((prev) => prev.filter((item) => item.id !== id));
          break;
        case "service":
          endpoint = `/category/delete-service/${id}`;
          setServices((prev) => prev.filter((item) => item.id !== id));
          break;
        case "product":
          endpoint = `/category/delete-product/${id}`;
          setProducts((prev) => prev.filter((item) => item.id !== id));
          break;
      }
      
    let response=  await axiosInstance.delete(endpoint);
          toast.success(response.data.message);

      
      
    } catch (err) {
      console.error(`Error deleting ${activeTab}:`, err);
      setError(`Failed to delete ${activeTab}`);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setMode("edit");
    setIsDrawerOpen(true);
  };

  const handleAddNew = () => {
    setEditItem(null);
    setMode("add");
    setIsDrawerOpen(true);
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "business":
        return businesses;
      case "service":
        return services;
      case "product":
        return products;
      default:
        return [];
    }
  };

  // Filter data based on search query
  const filteredData = getCurrentData().filter((item) => {
    const searchField = activeTab === "business" ? item.business : 
                        activeTab === "service" ? item.service : 
                        item.products;
    
    return searchField?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen relative">
      {/* Tab Navigation */}
      <div className="tabs tabs-boxed mb-6">
        <button 
          className={`tab ${activeTab === "business" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("business")}
        >
          Business
        </button>
        <button 
          className={`tab ${activeTab === "service" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("service")}
        >
          Service
        </button>
        <button 
          className={`tab ${activeTab === "product" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("product")}
        >
          Products
        </button>
      </div>
      
      {/* Drawer */}
      <div className="drawer drawer-end">
        <input
          id="category-drawer"
          type="checkbox"
          className="drawer-toggle"
          checked={isDrawerOpen}
          onChange={() => setIsDrawerOpen(!isDrawerOpen)}
        />
        <div className="drawer-content">
          {/* Header Section */}
          <div className="md:flex space-y-2 md:space-y-0 block justify-between items-center mb-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-neutral-content">
                {activeTab === "business" ? "Business" : 
                 activeTab === "service" ? "Services" : "Products"}
              </h1>
              <p>Total {activeTab === "business" ? "Businesses" : 
                        activeTab === "service" ? "Services" : "Products"}: {filteredData.length}</p>
            </div>
            <button
              className="btn btn-primary text-white gap-2"
              onClick={handleAddNew}
            >
              <Plus size={16} /> Add new {activeTab === "business" ? "business" : 
                                          activeTab === "service" ? "service" : "product"}
            </button>
          </div>

          {/* Search Section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                className="input input-bordered w-full focus:outline-none pl-10 bg-base-100 text-neutral-content"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Data Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="card bg-base-100 animate-pulse transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  <div className="h-24 bg-base-200 rounded-lg transition-colors duration-300"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map((item) => (
                <CategoryCard
                  key={item.id}
                  item={item}
                  type={activeTab}
                  onDelete={() => handleDelete(item.id)}
                  onEdit={() => handleEdit(item)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Drawer Sidebar - Reduced size */}
        <div className="drawer-side">
          <label htmlFor="category-drawer" className="drawer-overlay"></label>
          <div className="p-4 md:w-[30%] w-full sm:w-1/2 overflow-y-auto bg-base-100 h-auto max-h-[60vh] text-base-content absolute bottom-4 right-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">
              {mode === "edit" ? `Edit ${activeTab}` : `Add New ${activeTab}`}
            </h2>
            <CategoryForm
              type={activeTab}
              onSubmitSuccess={fetchData}
              initialData={editItem}
              mode={mode}
              setIsDrawerOpen={setIsDrawerOpen}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Card Component for displaying category items
function CategoryCard({ item, type, onDelete, onEdit }) {
  const displayName = type === "business" ? item.business : 
                     type === "service" ? item.service : item.products;
  
  return (
    <div className="card bg-base-100 shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl">
      <div className="card-body">
        <h2 className="card-title">{displayName}</h2>
        <p className="text-sm text-gray-500">ID: {item.id.substring(0, 8)}...</p>
        <p className="text-sm text-gray-500">Created: {new Date(item.createdAt).toLocaleDateString()}</p>
        <div className="card-actions justify-end mt-4">
          <button 
            className="btn btn-sm btn-outline"
            onClick={onEdit}
          >
            <PenLine size={16} /> Edit
          </button>
          <button 
            className="btn btn-sm btn-error btn-outline"
            onClick={onDelete}
          >
            <Trash size={16} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Form Component for adding/editing categories
function CategoryForm({ type, onSubmitSuccess, initialData, mode, setIsDrawerOpen }) {
  const [formData, setFormData] = useState({
    [type]: initialData ? (
      type === "business" ? initialData.business :
      type === "service" ? initialData.service : initialData.products
    ) : ""
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setFormError(null);
      
      // Use the correct route based on the mode and type
      let endpoint;
      if (mode === "edit" && initialData) {
        // For editing, it seems your backend routes are not provided for update
        // You may need to add these or use a general update endpoint
        endpoint = `/${type}/${initialData.id}`;
      } else {
        // For adding new items, use the create routes
        endpoint = type === "business" ? "/category/create-business" :
                  type === "service" ? "/category/create-service" : "/category/create-product";
      }
      
      // Use POST for both create and update (based on your routes)
     let response = await axiosInstance.post(endpoint, formData);
     toast.success(response.data.message);
      
      onSubmitSuccess();
      setIsDrawerOpen(false);
    } catch (err) {
      console.error(`Error submitting ${type}:`, err);
      setFormError(`Failed to ${mode} ${type}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">
            {type === "business" ? "Business Name" : 
             type === "service" ? "Service Name" : "Product Name"}
          </span>
        </label>
        <input
          type="text"
          name={type}
          placeholder={`Enter ${type} name`}
          className="input input-bordered w-full"
          value={formData[type]}
          onChange={handleChange}
          required
        />
      </div>
      
      {formError && (
        <div className="alert alert-error text-sm">
          <span>{formError}</span>
        </div>
      )}
      
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="btn btn-sm btn-outline"
          onClick={() => setIsDrawerOpen(false)}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-sm btn-primary"
          disabled={submitting}
        >
          {submitting ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            mode === "edit" ? "Update" : "Create"
          )}
        </button>
      </div>
    </form>
  );
}

export default CategoryLayout;