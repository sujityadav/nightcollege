import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { extractTableData } from '../../../utils/extractTableData';
import { saveAboutTable, getAboutTable } from '../actions/saveAboutTable';
import { jsonToTableHtml } from "../../../utils/jsonToTableHtml";
import  storeImage  from '../../../utils/imagStoreService';
import imageGetService from '@/app/utils/imageGetService';
export const useAboutEditor = (type) => {
  const [editorContent, setEditorContent] = useState('');
  const [imageArray, setImageArray] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [existingId, setExistingId] = useState(null); // For edit mode
  const toast = useRef(null);
  const user = useSelector((state) => state.auth.user);

  const handleEditorChange = (content) => {
    setEditorContent(content);
  };


  const fetchInitialData = async () => {
    try {
      const result = await getAboutTable(user?.token,type);
      if (result?.data) {
         const tableHtml = jsonToTableHtml(result.data.data[0].Aboutusdata);

         const response = await imageGetService(result.data.data[0]?._id);
         console.log("response",response)
          const image = {
            url: "http://localhost:3000/" + response?.imageData?.url,
            name:response?.imageData?.name,
            size: response?.imageData?.size,
          }
         setImageArray([])
        console.log("image",image)
        setImageArray((prev) => [...prev, image]);

         if(tableHtml){

        setEditorContent(tableHtml);

         }else{
        setEditorContent(result.data.data[0].Aboutusdata.content);

         }
        setExistingId(result.data._id); // for update
      }
    } catch (err) {
      console.warn('No existing about-us data found');
    }
  };
  const handleSave = async (type) => {
    const tableData = extractTableData(editorContent);
   
    setIsLoading(true);
    try {
    const response =  await saveAboutTable(
        {
          data: tableData,
          content: editorContent,
          type:type,
          _id: existingId, // if present, update instead of create
        },
        user?.token
      );
      console.log("response",response)
      if(response?.data?.entry?._id){
        imageArray.map(async(file)=>{
         const uploadedFile = await storeImage(file.name, response?.data?.entry?._id);
          console.log("uploadedFile",uploadedFile)
        })
      }

      toast.current.show({
        severity: 'success',
        summary: existingId ? 'Updated' : 'Saved',
        detail: `Content ${existingId ? 'updated' : 'saved'} successfully ✅`,
        life: 3000,
      });

      if (!existingId) {
        fetchInitialData(); // set new id if first time
      }
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Unknown error';
      alert(`❌ Failed to save:\n${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  return {
    editorContent,
    handleEditorChange,
    handleSave,
    isLoading,
    toast,
    setEditorContent,
    setImageArray,
    imageArray
  };
};
