import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyProfile = () => {
  const {userData, setUserData, token, backendUrl, loadUserProfileData} = useContext(AppContext)
  const [isEdit, setIsEdit] = useState(false)
  const [image, setImage] = useState(false)
  // Create a separate state for editing to allow full deletion
  const [editData, setEditData] = useState({})

  // Initialize edit data when entering edit mode
  const startEditing = () => {
    setEditData({
      name: userData.name || '',
      phone: userData.phone || '',
      address: {
        line1: userData.address?.line1 || '',
        line2: userData.address?.line2 || ''
      },
      dob: userData.dob || '',
      gender: userData.gender || ''
    })
    setIsEdit(true)
  }

  const updateUserProfileData = async () => {
    try{
      // Apply edited data to userData before submitting
      const updatedUserData = {
        ...userData,
        ...editData
      }

      const formData = new FormData()
      formData.append('name', editData.name)
      formData.append('phone', editData.phone)
      formData.append('address', JSON.stringify(editData.address))
      formData.append('dob', editData.dob)
      formData.append('gender', editData.gender)
      
      image && formData.append('image', image)

      const {data} = await axios.post(backendUrl + '/api/user/update-profile', formData, {headers:{token}})
      if(data.success){
        toast.success(data.message)
        setUserData(updatedUserData)
        await loadUserProfileData()
        setIsEdit(false)
        setImage(false)
      } else {
        toast.error(data.message)
      }
    } catch(error){
      console.log(error)
      toast.error(error.message)
    }
  }

  // Handle input changes with separate edit state
  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  // Handle address changes specifically
  const handleAddressChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }))
  }

  return userData && (
    <div className='mx-w-lg flex flex-col gap-2 text-sm'>
      <p className='text-2xl font-semibold'>My Profile</p>

      {
        isEdit
        ? <label htmlFor="image">
          <div className='inline-block relative cursor-pointer'>
            <img className='w-36 rounded opacity-75' src={image ? URL.createObjectURL(image): userData.image} alt=''/>
            <img className='w-10 absolute bottom-12 right-12' src={image ? '': assets.upload_icon} alt=''/>
          </div>
          <input onChange={(e)=> setImage(e.target.files[0])} type='file' id='image' hidden/>
        </label>
        : <img className='w-36 rounded' src={userData.image} alt=''/>
      }

      {
        isEdit
        ? <input 
            className='bg-gray-50 text-3xl font-medium max-w-60 mt-4' 
            type='text' 
            value={editData.name} 
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
        : <p className='font-medium text-3xl text-neutral-800 mt-4'>{userData.name}</p>
      }

      <hr className='bg-zinc-400 h-[1px] border-none'/>
      <div>
        <p className='text-neutral-500 inderline mt-3'>CONTACT INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
          <p className='font-medium'>Email id:</p>
          <p className='text-blue-500'>{userData.email}</p>
          <p className='font-medium'>Phone:</p>
          {
            isEdit
            ? <input 
                className='bg-gray-100 max-w-52' 
                type='text' 
                value={editData.phone} 
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            : <p className='text-blue-400'>{userData.phone}</p>
          }
          <p className='font-medium'>Address:</p>
          {
            isEdit
            ? <p>
              <input 
                className='bg-gray-50' 
                type='text' 
                value={editData.address?.line1} 
                onChange={(e) => handleAddressChange('line1', e.target.value)}
              />
              <br/>
              <input 
                className='bg-gray-50' 
                type='text' 
                value={editData.address?.line2} 
                onChange={(e) => handleAddressChange('line2', e.target.value)}
              />
            </p>
            : <p className='text=gray-500'>
                {userData.address?.line1} 
                <br/>
                {userData.address?.line2}
              </p>
          }
        </div>
      </div>
      <div>
        <p className='text-neutral-500 inderline mt-3'>BASIC INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
          <p className='font-medium'>Gender:</p>
          {
            isEdit
            ? <select 
                className='mx-w-20 bg-gray-100' 
                value={editData.gender} 
                onChange={(e) => handleInputChange('gender', e.target.value)}
              >
                <option value=''>Select Gender</option>
                <option value='Male'>Male</option>
                <option value='Female'>Female</option>
              </select>
            : <p className='text-gray-400'>{userData.gender}</p>
          } 
          <p className='font-medium'>Birthday:</p>
          {
            isEdit
            ? <input 
                className='max-w-28 bg-gray-100' 
                type='date' 
                value={editData.dob} 
                onChange={(e) => handleInputChange('dob', e.target.value)}
              />
            : <p className='text-gray-400'>{userData.dob}</p>
          }
        </div>
      </div>

      <div className='mt-10'>
        {
          isEdit
          ? <button className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all' onClick={updateUserProfileData}>Save information</button>
          : <button className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all' onClick={startEditing}>Edit</button>
        }
      </div>
    </div>
  )
}

export default MyProfile