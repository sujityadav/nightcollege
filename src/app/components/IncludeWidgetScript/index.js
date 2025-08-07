'use client';

import { useEffect } from "react";
import Script from "next/script";

function IncludeWidgetScript() {
  useEffect(() => {
    const mainColor = '#af251c';

    const applyStylesToMenuBtn = (button) => {
      if (!button) return;
      button.style.setProperty('outline', `5px solid ${mainColor}`, 'important');
      button.style.setProperty('background', `linear-gradient(96deg, ${mainColor} 0, ${mainColor} 100%)`, 'important');
    };

    const applyStylesToMenuHeader = (header) => {
      if (!header) return;
      header.style.setProperty('background-color', mainColor, 'important');
    };

    const applyShadowStyles = () => {
      const widget = document.querySelector('asw-widget')?.shadowRoot;
      if (widget) {
        const style = document.createElement('style');
        style.textContent = `
          * {
            font-size: 15px !important;
            font-family: 'Roboto', sans-serif !important;
          }
        `;
        widget.appendChild(style);
      }
    };

    const checkAndStyleElements = () => {
      const menuBtn = document.querySelector('.asw-menu-btn');
      const menuHeader = document.querySelector('.asw-menu-header');

      applyStylesToMenuBtn(menuBtn);
      applyStylesToMenuHeader(menuHeader);
      applyShadowStyles();

      if (menuBtn && menuHeader) {
        observer.disconnect();
      }
    };

    const observer = new MutationObserver(checkAndStyleElements);

    if (typeof window !== 'undefined') {
      observer.observe(document.body, { childList: true, subtree: true });
      checkAndStyleElements();
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Script
        src="https://website-widgets.pages.dev/dist/sienna.min.js"
        strategy="lazyOnload"
      />
      <style jsx global>{`
        :root {
          --main-color: #af251c;
        }

        .asw-footer {
          display: none !important;
        }

        .asw-menu-content {
          max-height: 100% !important;
          padding-bottom: 40px !important;
        }

        .asw-menu-header svg,
        .asw-menu-header svg path {
          fill: var(--main-color) !important;
        }

        .asw-lang-switch {
          display: none !important;
        }

        [class^="asw-"],
        [class*=" asw-"] {
          font-size: 15px !important;
          font-family: 'Roboto', sans-serif !important;
        }
      `}</style>
    </>
  );
}

export default IncludeWidgetScript;
