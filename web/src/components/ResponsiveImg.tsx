import type { ImgHTMLAttributes } from "react";
import { responsiveImage } from "../lib/images";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & {
  src: string;
  sizes: string;
};

export default function ResponsiveImg({ src, sizes, alt, ...rest }: Props) {
  const image = responsiveImage(src);
  return <img {...rest} src={image.src} srcSet={image.srcSet} sizes={sizes} alt={alt} />;
}
