'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Galleria } from 'primereact/galleria';
import { classNames } from 'primereact/utils';

const PhotoGalleria = ({ images }) => {
  const galleria = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [isAutoPlayActive, setAutoPlayActive] = useState(true);
  const [isFullScreen, setFullScreen] = useState(false);

  const responsiveOptions = [
    { breakpoint: '1024px', numVisible: 5 },
    { breakpoint: '960px', numVisible: 4 },
    { breakpoint: '768px', numVisible: 3 },
    { breakpoint: '560px', numVisible: 1 }
  ];

  useEffect(() => {
    const handleFullScreenChange = () => setFullScreen(document.fullscreenElement !== null);
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);

  useEffect(() => {
    if (galleria.current) {
      setAutoPlayActive(galleria.current.isAutoPlayActive());
    }
  }, []);

  const toggleFullScreen = () => {
    const elem = document.querySelector('.custom-galleria');
    if (!document.fullscreenElement) {
      elem?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const itemTemplate = (item) =>
    isFullScreen
      ? <img src={item.itemImageSrc} alt={item.alt} />
      : <img src={item.itemImageSrc} alt={item.alt} className='max-[200px] lg:max-h-[200px] xl:max-h-[3500px] 3xl:max-h-[400px] object-fill rounded-tl-md rounded-tr-md' style={{ width: '100%',  display: 'block' }} />;

  const thumbnailTemplate = (item) => (
    <div className="grid grid-nogutter justify-content-center">
      <img src={item.thumbnailImageSrc} alt={item.alt} style={{ display: 'block' }} />
    </div>
  );

  const footer = (
    <div className="custom-galleria-footer">
      <Button icon="pi pi-list" onClick={() => setShowThumbnails(prev => !prev)} />
      <Button
        icon={isAutoPlayActive ? "pi pi-pause" : "pi pi-play"}
        onClick={() => {
          if (galleria.current) {
            if (!isAutoPlayActive) {
              galleria.current.startSlideShow();
              setAutoPlayActive(true);
            } else {
              galleria.current.stopSlideShow();
              setAutoPlayActive(false);
            }
          }
        }}
      />
      {images?.length && (
        <span className="title-container">
          <span>{activeIndex + 1}/{images.length}</span>
          <span className="title">{images[activeIndex].title}</span>
          <span>{images[activeIndex].alt}</span>
        </span>
      )}
      <Button icon={isFullScreen ? "pi pi-window-minimize" : "pi pi-window-maximize"} 
              onClick={toggleFullScreen} className="fullscreen-button" />
    </div>
  );

  const galleriaClassName = classNames('custom-galleria xl:max-w-[750px] 3xl:max-w-[44.271vw] ', { fullscreen: isFullScreen });

  return (
    <Galleria ref={galleria}
      value={images}
      activeIndex={activeIndex}
      onItemChange={(e) => setActiveIndex(e.index)}
      showThumbnails={showThumbnails}
      showItemNavigators
      showItemNavigatorsOnHover
      numVisible={5}
      circular
      autoPlay
      transitionInterval={3000}
      responsiveOptions={responsiveOptions}
      item={itemTemplate}
      thumbnail={thumbnailTemplate}
      footer={footer}
      className={galleriaClassName}
    />
  );
};

export default PhotoGalleria;
