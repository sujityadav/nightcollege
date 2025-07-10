"use client";
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css";

// ✅ Dynamic import with SSR disabled
const SunEditor = dynamic(() => import("suneditor-react").then((mod) => mod.default), {
  ssr: false
});

const editorOptions = {
  height: 200,
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
  imageRotation: false,
  imageUploadUrl: "http://localhost:8080/chazki-gateway/orders/upload",
  imageGalleryUrl: "http://localhost:8080/chazki-gateway/orders/gallery"
};

interface TextEditorProps {
  value?: string;
  onChange: (content: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ value = "", onChange }) => {
  const editorRef = useRef<any>(null);
 const [editorLoaded, setEditorLoaded] = useState(false);
  const onChangeHandler = (content: string) => {
    onChange(content);
  };
  const handleEditorReady = (editorInstance: any) => {
    editorRef.current = editorInstance;
    setEditorLoaded(true);
  };
useEffect(() => {
    if (editorLoaded && editorRef.current) {
      const currentContent = editorRef.current.getContents();
      if (value !== currentContent) {
        editorRef.current.setContents(value || "");
      }
    }
  }, [value, editorLoaded]);
  return (
    <div>
      <SunEditor
       getSunEditorInstance={handleEditorReady}
        ref={editorRef}
        height="400px"
        setOptions={editorOptions}
        defaultValue={value} // ✅ Load existing content here
        onChange={onChangeHandler}
      />
    </div>
  );
};

export default TextEditor;
