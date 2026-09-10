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
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [existingId, setExistingId] = useState(null); // For edit mode
  const toast = useRef(null);
  const user = useSelector((state) => state.auth.user);

  const handleEditorChange = (content) => {
    setEditorContent(content);
  };


  const fetchInitialData = async () => {
    try {
      const result = await getAboutTable(user?.token, type);
      const entry = result?.data?.data?.[0];
      if (!entry?.Aboutusdata) return;

      const tableHtml = jsonToTableHtml(entry.Aboutusdata);
      setTitle(entry.Aboutusdata.title || '');
      setEditorContent(tableHtml || entry.Aboutusdata.content || '');
      setExistingId(entry._id || result.data._id || null);

      try {
        const response = await imageGetService(entry._id);
        const imageUrl = response?.imageData?.url;
        if (imageUrl) {
          setImageArray([
            {
              url: imageUrl.startsWith('http')
                ? imageUrl
                : `http://localhost:3000/${imageUrl}`,
              name: response?.imageData?.name,
              size: response?.imageData?.size,
            },
          ]);
        } else {
          setImageArray([]);
        }
      } catch {
        setImageArray([]);
      }
    } catch (err) {
      console.warn('No existing about-us data found');
    } finally {
      setIsDataLoaded(true);
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
          title: title,
          type:type,
          _id: existingId, // if present, update instead of create
        },
        user?.token
      );
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
    isDataLoaded,
    toast,
    setEditorContent,
    setImageArray,
    imageArray,
    setTitle,
    title
  };
};
