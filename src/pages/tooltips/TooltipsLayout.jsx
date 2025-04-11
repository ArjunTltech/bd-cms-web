import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import axiosInstance from '../../config/axios';
import playNotificationSound from '../../utils/playNotification';

// Define field types
const fieldTypes = [
  { id: 'name', label: 'Name Field' },
  { id: 'email', label: 'Email Field' },
  { id: 'phoneNumber', label: 'Phone Number Field' },
  { id: 'country', label: 'Country Field' },
  { id: 'lineOfBusiness', label: 'Line of Business Field' },
  { id: 'products', label: 'Products Field' },
  { id: 'services', label: 'Services Field' },
  { id: 'message', label: 'Message Field' }
];

// Schema for each tooltip form
const createTooltipSchema = yup.object().shape({
  content: yup.string().required('Content is required').max(200, 'Content should be max 200 characters')
});

const TooltipLayout = () => {
  const [activeFieldType, setActiveFieldType] = useState(fieldTypes[0].id);
  const [isLoading, setIsLoading] = useState(true);
  const [tooltipData, setTooltipData] = useState({});

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    resolver: yupResolver(createTooltipSchema),
    defaultValues: {
      title: '',
      content: ''
    }
  });

  // Watch content field for character counting
  const content = watch('content', '');
  const title = watch('title', '');

  // Fetch all tooltips on initial component mount
  useEffect(() => {
    const fetchAllTooltips = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get('/tooltips/view-tooltips');
        if (response.data && response.data.tooltips && response.data.tooltips.length > 0) {
          // Create a map of fieldType to tooltip data
          const tooltipMap = {};
          response.data.tooltips.forEach(tooltip => {
            tooltipMap[tooltip.fieldType] = tooltip;
          });
          
          // Set all tooltips data
          setTooltipData(tooltipMap);
        }
      } catch (error) {
        console.error('Error fetching all tooltips:', error);
        toast.error('Failed to load tooltip data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllTooltips();
  }, []);

  // Update form values when activeFieldType changes or tooltipData updates
  useEffect(() => {
    // Check if we have data for the active field type
    if (tooltipData[activeFieldType]) {
      const tooltip = tooltipData[activeFieldType];
      setValue('title', tooltip.title || '');
      setValue('content', tooltip.content || '');
    } else {
      // If we don't have data for this field type yet, try to fetch it
      const fetchSingleTooltip = async () => {
        setIsLoading(true);
        try {
          const response = await axiosInstance.get(`/tooltips/view-tooltip/${activeFieldType}`);
          if (response.data && response.data.tooltip) {
            const tooltip = response.data.tooltip;
            
            // Update form values
            setValue('title', tooltip.title || '');
            setValue('content', tooltip.content || '');
            
            // Add to tooltipData state
            setTooltipData(prev => ({
              ...prev,
              [activeFieldType]: tooltip
            }));
          } else {
            // Reset form if no data found
            reset({
              title: '',
              content: ''
            });
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            // Reset form if tooltip doesn't exist
            reset({
              title: '',
              content: ''
            });
          } else {
            toast.error('Failed to fetch tooltip data');
            console.error(error);
          }
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchSingleTooltip();
    }
  }, [activeFieldType, tooltipData, setValue, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        title: data.title,
        content: data.content,
        fieldType: activeFieldType
      };
      
      setIsLoading(true);
      const response = await axiosInstance.post('/tooltips/create-tooltip', payload);
      
      if (response.status === 201 || response.status === 200) {
        playNotificationSound();
        toast.success(`Tooltip for ${getFieldLabel(activeFieldType)} saved successfully`);
        
        // Store the updated tooltip
        const updatedTooltip = response.data.tooltip || payload;
        setTooltipData(prev => ({
          ...prev,
          [activeFieldType]: updatedTooltip
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save tooltip');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldLabel = (fieldId) => {
    const field = fieldTypes.find(f => f.id === fieldId);
    return field ? field.label : fieldId;
  };

  return (
    <div className="w-full mx-auto bg-base-100 p-6 space-y-8">
      <div className="flex items-center justify-between pe-4">
        <h2 className="text-2xl font-bold text-neutral-content">Tooltip Management</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Field Type Navigation */}
        <div className="w-full md:w-1/4">
          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-neutral-content mb-4">Form Fields</h3>
            <ul className="menu bg-base-200 rounded-box">
              {fieldTypes.map(fieldType => (
                <li key={fieldType.id}>
                  <a 
                    className={activeFieldType === fieldType.id ? "active" : ""}
                    onClick={() => setActiveFieldType(fieldType.id)}
                  >
                    {fieldType.label}
                    {tooltipData[fieldType.id] && (
                      <span className="badge badge-sm badge-primary ml-2">✓</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tooltip Form */}
        <div className="w-full md:w-3/4">
          <div className="bg-base-200 p-4 rounded-lg">
            <div className="flex items-center space-x-2 relative group mb-4">
              <h3 className="text-lg font-semibold text-neutral-content">
                {getFieldLabel(activeFieldType)} Tooltip
              </h3>
              <span className="relative">
                <span className="w-4 h-4 bg-gray-500 text-white text-xs rounded-full flex items-center justify-center cursor-pointer">
                  ℹ️
                </span>
                <span className="absolute top-full sm:left-full sm:top-1/2 sm:-translate-y-1/2 left-1/2 -translate-x-1/2 sm:translate-x-0 mt-2 sm:mt-0 p-2 bg-gray-700 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-[90vw] sm:w-max max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg whitespace-normal break-words z-50">
                  Tooltips help users understand form fields. Keep them concise and focused on the specific information needed.
                </span>
              </span>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-neutral-content block mb-1">
                    Title
                  </label>
                  <input
                    {...register('title')}
                    className="w-full p-2 bg-base-200 border border-gray-300 rounded-md"
                    placeholder="Enter tooltip title"
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-sm text-gray-500">{title.length}/50 characters</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-content block mb-1">
                    Content <span className="text-error pl-1">*</span>
                  </label>
                  <textarea
                    {...register('content')}
                    className="w-full p-2 bg-base-200 border border-gray-300 rounded-md"
                    rows={4}
                    placeholder="Enter tooltip content"
                  />
                  <div className="flex justify-between mt-1">
                    {errors.content && (
                      <p className="text-red-500 text-sm">{errors.content.message}</p>
                    )}
                    <p className="text-sm text-gray-500">{content.length}/200 characters</p>
                  </div>
                </div>
                <div className='flex-block items-center'>
                    <h4 className="text-sm font-semibold mb-1">Preview:</h4>
                    <div className="flex items-center">
                      <div className="preview border p-4 rounded-lg flex-1 mr-4">
                        <div className="p-3 rounded shadow-sm">
                          {title && <p className="font-semibold text-sm">{title}</p>}
                          {content && <p className="text-xs font-medium">{content}</p>}
                          {!title && !content && <p className="text-xs text-gray-400">Enter content to see preview</p>}
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="loading loading-spinner loading-xs"></span>
                            Saving...
                          </>
                        ) : 'Save Tooltip'}
                      </button>
                    </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TooltipLayout;