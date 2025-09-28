export default function Banner({
  url,
  focalX,
  focalY,
}: {
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
      </div>
    </div>
  );
}
