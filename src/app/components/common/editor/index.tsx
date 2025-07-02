"use client";
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css";

// ✅ Correct dynamic import (with .default!)
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
    ["showBlocks", "codeView"]
  ],
  fontSize: [12, 14, 16, 18, 20],
  imageRotation: false,
  imageUploadUrl: "http://localhost:8080/chazki-gateway/orders/upload",
  imageGalleryUrl: "http://localhost:8080/chazki-gateway/orders/gallery"
};

const TextEditor: React.FC = ({onChange}) => {
  const editorRef = useRef<any>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    if (editorRef.current) {
      console.log("Editor instance:", editorRef.current);
    }
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = value;
    }
  }, [value]);

  const onChangeHandler = (content: string) => {
    console.log("content",content)
    setValue(content);
    onChange(content); 
  };

 

  return (
    <div>
      <SunEditor
        ref={editorRef}
        setOptions={editorOptions}
        onChange={onChangeHandler}
        defaultValue=""
      />
      <div ref={contentRef} className="mt-4 p-2 border border-gray-300" />
    </div>
  );
};
export default TextEditor;