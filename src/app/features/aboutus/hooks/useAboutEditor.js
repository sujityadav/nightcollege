import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { extractTableData } from '../../../utils/extractTableData';
import { saveAboutTable, getAboutTable } from '../actions/saveAboutTable';
import { jsonToTableHtml } from "../../../utils/jsonToTableHtml";
export const useAboutEditor = (type) => {
  const [editorContent, setEditorContent] = useState('');
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
      console.log("result",result)
      if (result?.data) {
         const tableHtml = jsonToTableHtml(result.data.data[0].Aboutusdata);
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
      await saveAboutTable(
        {
          data: tableData,
          content: editorContent,
          type:type,
          _id: existingId, // if present, update instead of create
        },
        user?.token
      );

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
    setEditorContent
  };
};
