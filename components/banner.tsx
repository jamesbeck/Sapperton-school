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
          <img
            src={url || "/defaultBanner.jpg"}
            alt="Hero"
            className="w-full h-full object-cover"
            style={
              url
                ? { objectPosition: `${focalX}% ${focalY}%` }
                : { objectPosition: "center" }
            }
          />
        </div>
      </div>
    </div>
  );
}
