"use client";

import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

export default function ImageGalleryComponent({
  images,
}: {
  images: { original: string; thumbnail: string }[];
}) {
  return (
    <>
      <style>
        {`.image-gallery-thumbnail img {
  object-position: center;
  object-fit: cover;
  height: 80px;
}

.image-gallery-content:not(.fullscreen)
  .image-gallery-slide
  .image-gallery-image {
  height: 450px;
}

.image-gallery-icon:hover {
  color: #fff;
}

.image-gallery-thumbnail:hover {
  border-color: #fff;
}

`}
      </style>
      <ImageGallery
        items={images}
        showPlayButton={false}
        preventDefaultTouchmoveEvent={false}
      />
    </>
  );
}
