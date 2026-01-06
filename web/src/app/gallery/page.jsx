import ImageMasonry from "components/ImageMasonry";

const FILESERVER_URL = process.env.FILESERVER_URL || "http://files";

export const metadata = {
  title: "Gallery | Life @ IIIT-H",
};

export default async function Gallery({ limit = undefined }) {
  const response = await fetch(`${FILESERVER_URL}/files/gallery/list`, {
    next: { revalidate: 1200 }, // 20 minutes
  });

  const galleryJSON = await response.json();
  const galleryItems = galleryJSON["gallery"].map(
    (item) => `${FILESERVER_URL}${item.url}`,
  );

  return <ImageMasonry images={galleryItems} limit={limit} />;
}
