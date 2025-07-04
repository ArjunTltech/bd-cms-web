
import { Inbox } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../config/axios';
import playNotificationSound from '../../utils/playNotification';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Controller } from 'react-hook-form';
import { useTheme } from '../../context/ThemeContext';

const organizationSchema = yup.object().shape({
  email: yup.string()
    .required('Email is required')
    .email('Enter a valid email address')
    .max(100, 'Email must be at most 100 characters'),
  companyname: yup.string()
    .required('Companyname is required')
    .max(200, 'Companyname must be at most 200 characters'),
  phone: yup.string()
    .required('Phone number is required')
    .matches(/^\+?[0-9]{10,14}$/, 'Phone number must be 10-14 digits')
});

const OrganizationDetails = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [organizationDetails, setOrganizationDetails] = useState(null)
  const inputRef = useRef(null);
  const [imageError, setImageError] = useState("")
  let organizationId;
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    resolver: yupResolver(organizationSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/organization/organization-details');


        const organizationData = response.data.organization[0];
        setOrganizationDetails(organizationData)
      
        reset({
          email: organizationData.email || '',
          companyname: organizationData.companyName || '',
          phone: organizationData.phoneNumber || '',
        });

        if (organizationData.logo) {
          setImagePreview(organizationData.logo);
        }
      } catch (error) {
        console.error('Error fetching organization details:', error);
        toast.error('Failed to load organization details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setImagePreview(URL.createObjectURL(file));
      setLogoFile(file);
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImagePreview(null);
    setLogoFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const onSubmit = async (formData) => {
    const submitData = new FormData();
    
    // Append all form data, including empty/null values
    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value === undefined ? '' : value);
    });
    if (!imagePreview ) {
      setImageError("Image is required")
      return
    }
    setIsLoading(true);
    // If there is a logo file, append it
    if (logoFile) {
      setImageError("")
      submitData.append('image', logoFile);
    }

    const toastId = toast.loading('Saving organization details...');

    let response
    try {

      if (!organizationDetails?.id) {

        response = await axiosInstance.post('/organization/add-organization', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await axiosInstance.put(`/organization/edit-organization/${organizationDetails.id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      playNotificationSound()
      toast.update(toastId, {
        render: response.data.message || 'Organization details saved successfully',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });

      // const organizationData = response.data.organization[0];
      // reset({
      //   email: organizationData.email || '',
      //   companyname: organizationData.companyName || '',
      //   phone: organizationData.phoneNumber || '',
      // });

      // if (updatedData.logo) {
      //   setImagePreview(updatedData.logo);
      // }


    } catch (error) {
      console.error('Error saving organization details:', error);
      toast.update(toastId, {
        render: error.response?.data?.message || 'Failed to save organization details',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const FormField = ({
    label,
    name,
    register,
    control,
    errors,
    type = 'text',
    placeholder,
    mandatory = false
  }) => {
    // Get the theme from your context
    const { theme } = useTheme();

    const isDarkTheme = theme === "dark";

    // Custom dropdown styles based on theme
    const dropdownStyles = {
      backgroundColor: isDarkTheme ? '#1a1a1a' : '#fff', // Ensures full dark theme support
      color: isDarkTheme ? '#fff' : '#000',
      border: `1px solid ${isDarkTheme ? '#444' : '#ccc'}`,
    };
    // Add hover styles for dropdown items
    const dropdownItemStyles = `
  .react-tel-input .flag-dropdown:hover, 
  .react-tel-input .country-list .country:hover,
  .react-tel-input .country-list .country.highlight { 
    background-color: ${isDarkTheme ? '#444' : '#e0e0e0'} !important; 
    color: ${isDarkTheme ? '#fff' : '#000'} !important; /* Ensure visible text color */
  }
`;


    return (
      <div className="form-control mb-4">
        <style>{dropdownItemStyles}</style>

        <label className="label">
          <span className="label-text">
            {label}
            {mandatory && <span className="text-error ml-1">*</span>}
          </span>
        </label>

        {name === "phone" ? (
          <div>
            <Controller
              name={name}
              control={control}
              render={({ field }) => (
                <PhoneInput
                  country={'in'}
                  enableSearch={false}
                  disableSearchIcon={true}
                  value={field.value}
                  onChange={(phone) => field.onChange(phone)}
                  inputProps={{
                    name: field.name,
                    placeholder: placeholder || 'Enter phone number',
                    className: `input input-bordered ${errors[name] ? 'input-error' : ''}`
                  }}
                  containerStyle={{
                    width: '100%'
                  }}
                  buttonStyle={{
                    border: 'none',
                    background: 'transparent',
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                  inputStyle={{
                    width: '100%',
                    height: '50px',
                    paddingLeft: '60px',
                    paddingRight: '16px',
                    borderRadius: 'var(--rounded-btn, 0.5rem)',
                    color: 'currentColor',
                    fontSize: '1rem'
                  }}
                  dropdownStyle={dropdownStyles}
                  // searchStyle={searchStyles}
                  containerClass={isDarkTheme ? 'dark-theme-phone' : 'light-theme-phone'}
                />
              )}
            />
            {errors[name] && <span className="text-red-500 text-sm mt-1">{errors[name].message}</span>}
          </div>
        ) : (
          <>
            <input
              type={type}
              placeholder={placeholder}
              className={`input input-bordered ${errors[name] ? 'input-error' : ''} h-[50px] px-4 text-base`}
              {...register(name)}
            />
            {errors[name] && <span className="text-red-500 text-sm mt-1">{errors[name].message}</span>}
          </>
        )}
      </div>
    );
  };
  return (
    <div className="p-6 bg-base-100 rounded-lg space-y-6">
      <div className="flex items-center gap-3">
        <Inbox className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-neutral-content">Organization Details</h1>
      </div>
      <div className="bg-base-200 rounded-lg shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Upload Section */}
            <div className="form-control col-span-1 md:col-span-2 flex justify-center mb-4">
              <label className="label">
                <span className="label-text">Logo
                <span className="text-error ml-1">*</span>
                </span>
              </label>
              <div
                className="border-2 w-full md:w-96 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-base-100"
                onClick={() => inputRef.current?.click()}
              >
                {!imagePreview ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-primary mb-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M4 3a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v3.586l-1.293-1.293a1 1 0 00-1.414 0L10 12l-2.293-2.293a1 1 0 00-1.414 0L4 12V5zm0 10v-1.586l2.293-2.293a1 1 0 011.414 0L10 13l3.293-3.293a1 1 0 011.414 0L16 12.414V15H4z" />
                    </svg>
                    <p className="text-neutral-content">Drag and drop or click to upload</p>
                  </>
                ) : (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-32 rounded-lg shadow-lg" />
                    <button
                      type="button"
                      className="absolute top-2 right-0 btn btn-xs btn-error"
                      onClick={handleRemoveImage}
                    >
                      Remove
                    </button>
                  </div>
                )}
                <input
                
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={inputRef}
                  onChange={handleImageUpload}

                />

              </div>
              {setImageError && <span className="text-red-500 text-sm mt-1">{imageError}</span>}

            </div>

            <FormField
              label="Email"
              name="email"
              register={register}
              errors={errors}
              placeholder="Ex: your@email.com"
              mandatory={true}
            />

            <FormField
              label="Phone"
              name="phone"
              register={register}
              control={control}
              errors={errors}
              placeholder="Ex: 1234567890"
              mandatory={true}
            />

            <FormField
              label="Company Name"
              name="companyname"
              register={register}
              errors={errors}
              placeholder="Enter Company name"
              mandatory={true}
            />

            {/* <FormField
              label="Map URL"
              name="mapUrl"
              register={register}
              errors={errors}
              placeholder="Ex: https://maps.google.com/..."
            /> */}

          </div>
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className={`btn ${isLoading ? 'btn-disabled' : 'btn-primary'} ${isLoading ? 'loading' : ''
                }`}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizationDetails;