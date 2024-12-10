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
        console.log('Loading face detection models...');
        // Load models from the correct path
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        console.log('Face detection models loaded successfully');
        setModelsLoaded(true);
      } catch (error) {
        console.error('Error loading face detection models:', error);
        // Log more details about the error
        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
        }
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    const detectFace = async () => {
      if (!imgRef.current || !modelsLoaded) {
        console.log('Image ref or models not ready:', { 
          imageReady: !!imgRef.current, 
          modelsLoaded 
        });
        return;
      }

      try {
        console.log('Starting face detection...');
        const detections = await faceapi.detectSingleFace(
          imgRef.current,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224 })
        );

        if (detections) {
          console.log('Face detected:', detections.box);
          const { x, y, width, height } = detections.box;
          const imgWidth = imgRef.current.width;
          const imgHeight = imgRef.current.height;
          
          // Calculate center of face relative to image dimensions
          const centerX = ((x + width / 2) / imgWidth) * 100;
          const centerY = ((y + height / 2) / imgHeight) * 100;
          
          console.log('Setting face position:', { centerX, centerY });
          setFacePosition({ x: centerX, y: centerY });
        } else {
          console.log('No face detected, using default position');
        }
      } catch (error) {
        console.error('Error detecting face:', error);
        if (error instanceof Error) {
          console.error('Detection error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
        }
      }
    };

    if (imgRef.current?.complete && modelsLoaded) {
      console.log('Image is complete, running face detection');
      detectFace();
    } else if (imgRef.current) {
      console.log('Image not complete, waiting for load event');
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