import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import type { Candidate } from "@/data/types";

interface SortableCandidateProps {
  candidate: Candidate;
  index: number;
  onRemove: () => void;
}

export function SortableCandidate({ candidate, index, onRemove }: SortableCandidateProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: candidate.id });
  
  const imgRef = useRef<HTMLImageElement>(null);
  const [facePosition, setFacePosition] = useState({ x: 50, y: 35 });
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        setModelsLoaded(true);
      } catch (error) {
        console.error('Error loading face detection models:', error);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    const detectFace = async () => {
      if (!imgRef.current || !modelsLoaded) return;

      try {
        const detections = await faceapi.detectSingleFace(
          imgRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );

        if (detections) {
          const { x, y, width, height } = detections.box;
          const imgWidth = imgRef.current.width;
          const imgHeight = imgRef.current.height;
          
          // Calculate center of face relative to image dimensions
          const centerX = ((x + width / 2) / imgWidth) * 100;
          const centerY = ((y + height / 2) / imgHeight) * 100;
          
          setFacePosition({ x: centerX, y: centerY });
        }
      } catch (error) {
        console.error('Error detecting face:', error);
      }
    };

    if (imgRef.current?.complete && modelsLoaded) {
      detectFace();
    } else if (imgRef.current) {
      imgRef.current.onload = detectFace;
    }
  }, [modelsLoaded]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 bg-white/50 rounded-lg border border-white/20 shadow-sm"
    >
      <button
        className="touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-rich-black/40" />
      </button>
      <div className="flex-1 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
          <img
            ref={imgRef}
            src={candidate.official_photo_url || candidate.image_url}
            alt={candidate.name}
            className="w-[150%] h-[150%] object-cover"
            style={{
              objectPosition: `${facePosition.x}% ${facePosition.y}%`,
              transform: 'translate(-16%, -16%)'
            }}
            crossOrigin="anonymous"
          />
        </div>
        <div>
          <p className="font-medium text-rich-black">
            {index + 1}. {candidate.name}
          </p>
          <p className="text-sm text-rich-black/60">{candidate.region}</p>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="p-1 hover:bg-rich-black/5 rounded-full transition-colors"
      >
        <X className="h-5 w-5 text-rich-black/40" />
      </button>
    </div>
  );
}