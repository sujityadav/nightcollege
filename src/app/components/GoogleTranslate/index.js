'use client';

import { useEffect } from "react";

export default function GoogleTranslate() {
  useEffect(() => {
    const addScript = () => {
      if (document.getElementById('google-translate-script')) return;

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);
    };

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,hi,mr,gu,kn',
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
      }, 'google_translate_element');
    };

    addScript();
  }, []);

  return (
    <>
      <div id="google_translate_element" className="custom-google-translate" />
      <style jsx global>{`
        .custom-google-translate .goog-te-gadget {
          font-size: 14px;
          color: #333;
          font-family: 'Segoe UI', sans-serif;
        }

        .custom-google-translate .goog-te-combo {
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid #ccc;
          background-color: #f9f9f9;
          font-size: 14px;
          color: #333;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .custom-google-translate .goog-te-combo:hover {
          background-color: #f0f0f0;
        }

        /* Hide Google branding */
        .goog-logo-link,
        .goog-te-gadget span {
          display: none !important;
        }

        .goog-te-banner-frame.skiptranslate {
          display: none !important;
        }

        body {
          top: 0px !important;
        }
      `}</style>
    </>
  );
}
