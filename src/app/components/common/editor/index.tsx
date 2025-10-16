"use client";
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css";

const SunEditor = dynamic(() => import("suneditor-react").then(mod => mod.default), { ssr: false });

const editorOptions = {
  height: "400px",
  buttonList: [
    ["undo", "redo"],
    ["removeFormat"],
    ["bold", "underline", "italic", "fontSize"],
    ["fontColor", "hiliteColor"],
    ["align", "horizontalRule", "list"],
    ["table", "link", "image", "imageGallery"],
    ["showBlocks", "codeView", "fullScreen"]
  ],
  defaultStyle: "font-family: Roboto, sans-serif; font-size: 14px;",
  fontSize: [12, 14, 16, 18, 20],
  imageUploadUrl: "/api/upload",
  imageAccept: "image/*",
  imageUploadSizeLimit: 5000000,
  imageRotation: true,
  imageMultipleFile: true,
  imageFileInput: true,
  imageUrlInput: true,
  imageUploadHeader: { 'Accept': 'application/json' }
};

interface TextEditorProps {
  value?: string;
  onChange: (content: string) => void;
  onImageUploadSuccess?: (image: { url: string; name: string; size: number }) => void; // callback to parent
  imageArray?: Array<{ url: string; name: string; size: number }>;
}

const TextEditor: React.FC<TextEditorProps> = ({ value = "", onChange, onImageUploadSuccess,imageArray }) => {
  const editorRef = useRef<any>(null);
  const [editorLoaded, setEditorLoaded] = useState(false);

  const onChangeHandler = (content: string) => {
    onChange(content);
  };

  // Called when image upload succeeds
  const handleImageUpload = (
    targetElement: any,
    index: number,
    state: string,
    info: any,
    remainingFilesCount: number
  ) => {
    if (state === "create") {
      // console.log("✅ Image uploaded:", targetElement.src);
      // Pass uploaded image info to parent
      if (onImageUploadSuccess) {
        onImageUploadSuccess({
          url: targetElement.src,
          name: info?.name || `image-${index}`,
          size: info?.size || 0
        });
      }
    }
  };

  const handleImageUploadError = (errorMessage: string, result: any) => {
    console.error("❌ Image upload error:", { errorMessage, result });
  };

  const handleEditorReady = (editorInstance: any) => {
    editorRef.current = editorInstance;
    setEditorLoaded(true);
  };

  useEffect(() => {
    if (editorLoaded && editorRef.current && value) {
      const currentContent = editorRef.current.getContents();
      if (value !== currentContent) {
        editorRef.current.setContents(value);
      }
    }
  }, [value, editorLoaded]);

    useEffect(() => {
  if (editorLoaded && editorRef.current && imageArray && imageArray.length > 0) {
    const editor = editorRef.current;
    
    // Insert images if not already in content
    imageArray.forEach((img) => {
      if (!editor.getContents().includes(img.url)) {
        editor.insertHTML(`<img src="${img.url}" alt="${img.name}" style="max-width:100%;" />`);
      }
    });
  }
}, [imageArray, editorLoaded]);

  return (
    <div>
      <SunEditor
        getSunEditorInstance={(sunEditor) => {
          editorRef.current = sunEditor;
          handleEditorReady(sunEditor);
        }}
        setOptions={editorOptions}
        defaultValue={value}
        onChange={onChangeHandler}
        onImageUpload={handleImageUpload}
        onImageUploadError={handleImageUploadError}
      />
    </div>
  );
};

export default TextEditor;
