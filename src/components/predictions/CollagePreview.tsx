import { forwardRef } from "react";

interface Candidate {
  id: string;
  region: string;
  name: string;
  image_url?: string | null;
  portrait_url?: string | null;
  official_photo_url?: string | null;
}

interface CollagePreviewProps {
  candidates: Candidate[];
}

export const CollagePreview = forwardRef<HTMLDivElement, CollagePreviewProps>(
  ({ candidates }, ref) => {
    const winner = candidates[0];
    const dauphines = candidates.slice(1, 5);

    const getImageUrl = (candidate: Candidate) => {
      return candidate.portrait_url || candidate.official_photo_url || candidate.image_url || "/placeholder.svg";
    };

    return (
      <div
        ref={ref}
        style={{
          width: "1080px",
          height: "1080px",
          background: "linear-gradient(135deg, #1a0a0a 0%, #4a1c1c 30%, #8b1538 60%, #c9a227 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "40px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 50% 30%, rgba(201, 162, 39, 0.15) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        />

        {/* Title */}
        <h1
          style={{
            fontSize: "52px",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "30px",
            textShadow: "2px 2px 8px rgba(0,0,0,0.5)",
            letterSpacing: "2px",
          }}
        >
          Mon TOP 5 Miss France 2026
        </h1>

        {/* Winner Section */}
        {winner && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                position: "relative",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: "280px",
                  height: "360px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "4px solid #c9a227",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                }}
              >
                <img
                  src={getImageUrl(winner)}
                  alt={winner.region}
                  crossOrigin="anonymous"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center 15%",
                  }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "-20px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: "48px",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                👑
              </div>
            </div>
            <span
              style={{
                fontSize: "24px",
                fontWeight: "600",
                textShadow: "1px 1px 4px rgba(0,0,0,0.5)",
                color: "#c9a227",
              }}
            >
              {winner.region}
            </span>
          </div>
        )}

        {/* Dauphines Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          {dauphines.map((candidate, index) => (
            <div
              key={candidate.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  position: "relative",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "3px solid rgba(201, 162, 39, 0.7)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                  }}
                >
                  <img
                    src={getImageUrl(candidate)}
                    alt={candidate.region}
                    crossOrigin="anonymous"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center 20%",
                    }}
                  />
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "-5px",
                    right: "-5px",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #c9a227, #8b6914)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: "bold",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  {index + 2}
                </div>
              </div>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  textAlign: "center",
                  maxWidth: "140px",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                {candidate.region}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            fontSize: "20px",
            opacity: 0.8,
            letterSpacing: "1px",
          }}
        >
          quintemiss.lovable.app
        </div>
      </div>
    );
  }
);

CollagePreview.displayName = "CollagePreview";
