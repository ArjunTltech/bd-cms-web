import { useState, useEffect, useCallback } from "react";
import { Search, Globe, Calendar, ArrowUpDown, ExternalLink, Edit, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import ClientForm from "./ClientForm";
import axiosInstance from "../../config/axios";
import { toast } from "react-toastify";
import Loader from "../../components/loader/Loader";

function ClientsLayout() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [mode, setMode] = useState("add");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const itemsPerPage = 6;

  // Fetch Clients
  const refreshClientList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/client/view-clients");
      setClients(response.data.data);
    } catch (err) {
      setError("Failed to load clients");
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const totalClientCount = clients?.length

  useEffect(() => {
    refreshClientList();
  }, [refreshClientList]);

  // Handle Add New Client
  const handleAddNewClient = () => {
    setEditClient(null);
    setMode("add");
    setIsDrawerOpen(true);
  };

  // Handle Edit Client
  const handleEditClient = (client) => {
    setEditClient(client);
    setMode("edit");
    setIsDrawerOpen(true);
  };


  // Handle Delete Confirmation Modal
  const openDeleteModal = (client) => {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setClientToDelete(null);
    setIsDeleteModalOpen(false);
  };


  // Handle Delete Client
  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    try {
      setSubmitting(true);
      await axiosInstance.delete(`/client/delete-client/${clientToDelete.id}`);
      await refreshClientList();
      closeDeleteModal();
      toast.success("Client deleted successfully")
    } catch (err) {
      console.error("Error deleting client:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Page Change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Sort clients
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort clients
  const filteredAndSortedClients = clients
    .filter(
      (client) =>
        client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.description?.toLowerCase().includes(searchQuery.toLowerCase()) 
    )
    .sort((a, b) => {
      const aValue = (a[sortField] || "").toLowerCase();
      const bValue = (b[sortField] || "").toLowerCase();
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedClients.length / itemsPerPage);
  const paginatedClients = filteredAndSortedClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortField, sortDirection]);




  return (
    <div className="h-screen flex flex-col">
      {/* Fixed Header Section */}
      <div className="bg-base-100 p-4 border-b border-base-300">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-neutral-content">Clients</h1>
            <p>Total Clients : {totalClientCount}</p>
          </div>
          <button
            className="btn btn-primary text-white gap-2"
            onClick={handleAddNewClient}
            disabled={submitting}
          >
            + New Client
          </button>
        </div>

        {/* Search Section */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 w-5 h-5" />
          <input
            type="text"
            placeholder="Search clients by name or description"
            className="input input-bordered w-full pl-10 bg-base-100 text-base-content"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
  {/* Conditional Rendering based on Loading State */}
      {loading ? (
   <Loader text="Loading Clients..." />
      ) : error ? (
        <div className="flex justify-center items-center h-full text-error">
          {error}
          <button 
            onClick={refreshClientList} 
            className="btn btn-primary ml-4"
          >
            Retry
          </button>
        </div>
      ) : (

      <div className="flex-grow overflow-auto">
        <div className="min-w-full">
          {/* Table Header */}
          <div className="bg-base-200 text-sm font-medium text-base-content sticky top-0 z-10">
            <div className="grid grid-cols-12 gap-2 px-4 py-4 items-center">
              <div className="col-span-1">Logo</div>
              <div className="col-span-2 flex items-center cursor-pointer hover:text-primary" onClick={() => handleSort("name")}>
                Client Name <ArrowUpDown size={14} className="ml-1" />
              </div>
              <div className="col-span-3">Description</div>
              <div className="col-span-2 flex items-center cursor-pointer hover:text-primary" onClick={() => handleSort("createdAt")}>
                Created At <ArrowUpDown size={14} className="ml-1" />
              </div>
              <div className="col-span-2 flex items-center ">
                Website <Globe size={14} className="ml-1" />
              </div>
              <div className="col-span-2 text-center">Actions</div>
            </div>
          </div>


          {/* Client List */}
          <div className="divide-y-4 divide-base-300">
            {paginatedClients.length > 0 ? (
              paginatedClients.map((client) => (
                <div
                  key={client.id}
                  className="grid grid-cols-12 gap-2 px-4 py-[1.2rem] items-center hover:bg-base-200 bg-base-100"
                >
                  <div className="col-span-1">
                    {client.logo ? (
                      <img
                        src={client.logo}
                        alt="Logo"
                        className="h-8 w-8 object-cover rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                        {client.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 font-medium truncate">
                    {client.name || "Unnamed Client"}
                  </div>
                  <div className="col-span-3 text-sm text-base-content/70 truncate">
                    {client.description || "No description"}
                  </div>
                  <div className="col-span-2 text-sm text-base-content/70">
                    {client.createdAt
                      ? new Date(client.createdAt).toLocaleDateString("en-GB")
                      : "N/A"}
                  </div>
                  <div className="col-span-2 truncate">
                    {client.website ? (
                      <a
                        href={
                          client.website.startsWith("http")
                            ? client.website
                            : `https://${client.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-info/65 hover:text-info/80 flex items-center"
                      >
                        {client.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        <ExternalLink size={14} className="ml-1" />
                      </a>
                    ) : (
                      <span className="text-base-content/50">No website</span>
                    )}
                  </div>
                  <div className="col-span-2 flex justify-center space-x-2 flex-nowrap">
                    <button
                      onClick={() => handleEditClient(client)}
                      className="btn btn-ghost btn-sm text-warning"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(client)}
                      className="btn btn-ghost btn-sm text-error"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-base-content/60 text-2xl font-extrabold">No Clients Found</div>
            )}
          </div>



          {/* Delete Confirmation Modal */}
          {isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-sm w-full">
                <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
                <p className="text-base-content/80">
                  Are you sure you want to delete <strong>{clientToDelete?.name}</strong>?
                </p>
                <div className="flex justify-end space-x-4 mt-4">
                  <button onClick={closeDeleteModal} className="btn btn-ghost">Cancel</button>
                  <button onClick={handleDeleteClient} className="btn btn-error" disabled={submitting}>
                    {submitting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
     )}

     {/* Rest of your existing code (Pagination, Drawer, etc.) */}
      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="py-4 px-6 border-t border-base-300 bg-base-100">
          <div className="flex justify-between items-center">
            <div className="text-sm text-base-content/70">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredAndSortedClients.length)} of{" "}
              {filteredAndSortedClients.length} clients
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || submitting}
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  className={`btn btn-sm ${currentPage === idx + 1
                    ? "btn-primary text-primary-content"
                    : "btn-ghost"
                    }`}
                  onClick={() => handlePageChange(idx + 1)}
                  disabled={submitting}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || submitting}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
          <div className="w-full max-w-2xl bg-base-100 h-screen overflow-y-auto p-6">
            <button
              className="absolute top-4 right-4 text-base-content hover:text-error"
              onClick={() => setIsDrawerOpen(false)}
            >
              ✖
            </button>
            <h2 className="text-2xl font-semibold text-base-content mb-6">
              {mode === "edit" ? "Edit Client" : "Add New Client"}
            </h2>
            <ClientForm
              onClientUpdated={refreshClientList}
              initialData={editClient}
              mode={mode}
              refreshClientList={refreshClientList}
              setIsDrawerOpen={setIsDrawerOpen}
              submitting={submitting}
              setSubmitting={setSubmitting}
            />
          </div>
        </div>
      )}

    </div>
  );
}

export default ClientsLayout;