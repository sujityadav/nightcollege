'use client';
import { useState } from "react";
import { Editor, EditorTextChangeEvent } from "primereact/editor";


export default function TextEditor() {
const [text, setText] = useState<string>('');

 
  return (
    <>
    
       <Editor value={text} onTextChange={(e: EditorTextChangeEvent) => setText(e.htmlValue)} style={{ height: '320px' }} />
    </>
  );
}
