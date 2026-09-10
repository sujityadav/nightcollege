"use client";
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css";

const SunEditor = dynamic(() => import("suneditor-react"), { ssr: false });

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
  onImageUploadSuccess?: (image: { url: string; name: string; size: number }) => void;
  imageArray?: Array<{ url: string; name: string; size: number }>;
}

const TextEditor: React.FC<TextEditorProps> = ({ value = "", onChange, onImageUploadSuccess, imageArray }) => {
  const editorRef = useRef<any>(null);
  const syncedValueRef = useRef(value);
  const [editorKey, setEditorKey] = useState(0);
  const [defaultValue, setDefaultValue] = useState(value);
  const [editorReady, setEditorReady] = useState(false);

  const onChangeHandler = (content: string) => {
    syncedValueRef.current = content;
    onChange(content);
  };

  const handleImageUpload = (
    targetElement: any,
    index: number,
    state: string,
    info: any,
    remainingFilesCount: number
  ) => {
    if (state === "create" && editorRef.current) {
      const updatedContent = editorRef.current.getContents();
      syncedValueRef.current = updatedContent;
      onChange(updatedContent);

      if (onImageUploadSuccess) {
        onImageUploadSuccess({
          url: targetElement.src,
          name: info?.name || `image-${index}`,
          size: info?.size || 0,
        });
      }
    }
  };

  const handleImageUploadError = (errorMessage: string, result: any) => {
    console.error("❌ Image upload error:", { errorMessage, result });
  };

  const handleEditorReady = (sunEditor: any) => {
    editorRef.current = sunEditor;
    setEditorReady(true);
  };

  // Remount the editor when value changes externally (e.g. async fetch).
  // Calling setContents after mount triggers a SunEditor bug in Next.js.
  useEffect(() => {
    if (value === syncedValueRef.current) return;

    syncedValueRef.current = value;
    setDefaultValue(value);
    setEditorReady(false);
    setEditorKey((key) => key + 1);
  }, [value]);

  useEffect(() => {
    if (!editorReady || !editorRef.current || !imageArray?.length) return;

    const editor = editorRef.current;

    imageArray.forEach((img) => {
      if (!img?.url || img.url.includes("undefined")) return;
      if (!editor.getContents().includes(img.url)) {
        editor.insertHTML(
          `<img src="${img.url}" alt="${img.name || ""}" style="max-width:100%;" />`
        );
      }
    });
  }, [imageArray, editorReady]);

  return (
    <div>
      <SunEditor
        key={editorKey}
        getSunEditorInstance={handleEditorReady}
        setOptions={editorOptions}
        defaultValue={defaultValue}
        onChange={onChangeHandler}
        onImageUpload={handleImageUpload}
        onImageUploadError={handleImageUploadError}
      />
    </div>
  );
};

export default TextEditor;
