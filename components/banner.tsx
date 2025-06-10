import Container from "@/components/container";
import { bodoniModa } from "@/fonts";

export default function Banner({
  title,
  url,
  focalX,
  focalY,
}: {
  title: string;
  url?: string;
  focalX?: number;
  focalY?: number;
}) {
  return (
    <div>
      <div className="w-full h-[300px] md:h-[400px] relative">
        <div className="absolute w-full h-full -z-10 bg-sapperton-green">
          {url && (
            <img
              src={url}
              alt="Hero"
              className="w-full h-full object-cover"
              style={{ objectPosition: `${focalX}% ${focalY}%` }}
            />
          )}
        </div>

        <div className="px-8 md:px-16 pt-24 w-full h-full">
          <div className="flex items-center justify-center w-full">
            <Container>
              <h1
                className={`text-center text-3xl md:text-7xl text-white font-extralight tracking-tighter text-shadow-md text-shadow-black/70 ${bodoniModa.className}`}
              >
                {title}
              </h1>
            </Container>
          </div>
        </div>
      </div>
    </div>
  );
}
