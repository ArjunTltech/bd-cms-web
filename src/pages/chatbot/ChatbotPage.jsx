import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import axiosInstance from '../../config/axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'react-toastify';
import DeleteConfirmModal from '../../components/ui/modal/DeleteConfirmModal';
import ChatbotForm from './ChatbotForm';

const ChatbotPage = () => {
  const [chatbots, setChatbots] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editChatbot, setEditChatbot] = useState(null);
  const [mode, setMode] = useState("add");
  const [chatbotToDelete, setChatbotToDelete] = useState(null);
  const [deleteModal,setDelelemodal]=useState(false)
  const [isDeleting, setIsDeleting] = useState(false);
  const [dragIndex,setDragIndex]=useState({sourceIndex:'',destinationIndex:''})
  const refreshChatbotList = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/chatbot/get-all-question');

      
      if (response.data) {        
        setChatbots(response.data.chat);
      }
    } catch (err) {
      console.error('Error fetching chatbot questions:', err);
      // toast.error('Failed to load chatbot questions');
    }
  }, []);

  useEffect(() => {
    refreshChatbotList();

  }, [refreshChatbotList]);

  const handleAddNewChatbot = () => {
    setEditChatbot(null);
    setMode("add");
    setIsDrawerOpen(true);
  };

  const handleEditChatbot = (chatbot) => {
    setEditChatbot(chatbot);
    setMode("edit");
    setIsDrawerOpen(true);
  };

  const handleDeleteChatbot = async (id) => {
    setIsDeleting(true);
    try {
      const response = await axiosInstance.delete(`/chatbot/delete-question/${id}`);
      if (response.data) {
        setChatbotToDelete(null);
        setChatbots(chatbots.filter(q => q.id !== id));
        toast.success('Chatbot question deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting chatbot question:', err);
      toast.error('Failed to delete chatbot question');
    } finally {
      setIsDeleting(false);
      setDelelemodal(false)
    }
  };

const handleDragEnd = async (result) => {
  const { source, destination } = result;
  
  if (!destination || source.index === destination.index) return;

  try {
    // Optimistic UI update
    const reordered = Array.from(chatbots);
    const [removed] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, removed);
    
    const updated = reordered.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    setChatbots(updated);

    // Send only the necessary data to backend
    const response = await axiosInstance.put('/chatbot/change-order', {
      sourceIndex: source.index,
      destinationIndex: destination.index
    });

    toast.success(response.data.message);
    
    // If backend responds with updated data, use that instead
    if (response.data.data) {
      setChatbots(response.data.data);
    }

  } catch (err) {
    console.error('Error updating order:', err);
    toast.error('Failed to update order');
    // Revert to original state if error occurs
    setChatbots(chatbots);
  }
};

  return (
    <div className="min-h-screen relative">
      <div className="drawer drawer-end">
        <input
          id="faq-drawer"
          type="checkbox"
          className="drawer-toggle"
          checked={isDrawerOpen}
          onChange={() => setIsDrawerOpen(!isDrawerOpen)}
        />
        <div className="drawer-content">
          <div className="md:flex space-y-2 md:space-y-0 block justify-between items-center mb-8">
            <div className='space-y-2'>
              <h1 className="text-3xl font-bold text-neutral-content">Chatbot Questions</h1>
              <p>Total Questions: {chatbots.length}</p>
  <p className="text-sm text-gray-500">Tip: Drag and drop items to change their order</p>
            </div>
            <button
              className="btn btn-primary gap-2"
              onClick={handleAddNewChatbot}
            >
              <Plus className="w-5 h-5" />
              Add Question
            </button>
          </div>

          {chatbots.length > 0 ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="chatbot-list">
                {(provided) => (
                  <div
                    className="mx-auto space-y-4"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {chatbots.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-base-200 p-4 rounded-lg flex justify-between items-center"
                          >
                            <div className="flex-1 select-none">
                              <div className="text-xl font-bold text-accent">{item.question}</div>
                              <p className="text-base-content">{item.answer}</p>

                              <span className="text-sm opacity-70 ml-2">Order: {item.order}</span>
                           
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                className="btn btn-sm btn-square btn-ghost"
                                onClick={() => handleEditChatbot(item)}
                              >
                                <Pencil className="w-6 h-6 text-success" />
                              </button>
                              <button
                                className="btn btn-sm btn-square text-white btn-error"
                                onClick={() => {setChatbotToDelete(item.id);setDelelemodal(true)}}
                              >
                                <Trash2 className="w-6 h-6" />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="w-full h-96 flex justify-center items-center">
              <p>No chatbot questions available</p>
            </div>
          )}
        </div>

        <div className="drawer-side">
          <label htmlFor="faq-drawer" className="drawer-overlay"></label>
          <div className="p-4 md:w-[40%] w-full sm:w-1/2 overflow-y-scroll bg-base-100 h-[50vh] text-base-content absolute bottom-4 right-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4">{mode === "edit" ? 'Edit Question' : 'Add New Question'}</h2>
            <ChatbotForm
              onFAQCreated={refreshChatbotList}
              initialData={editChatbot}
              mode={mode}
              faqs={chatbots}
              setIsDrawerOpen={setIsDrawerOpen}
              chatLength={chatbots.length}
            />
          </div>
        </div>
      </div>

      {deleteModal && (
        <DeleteConfirmModal
          isOpen={chatbotToDelete !== null}
          chats={chatbots}
          onClose={() => setChatbotToDelete(null)}
          onConfirm={() => handleDeleteChatbot(chatbotToDelete)}
          title="Delete Question?"
          message="Are you sure you want to delete this chatbot question? This action cannot be undone."
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

export default ChatbotPage;
