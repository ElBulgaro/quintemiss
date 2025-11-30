import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const SHOW_DATE = new Date("2025-12-13T21:00:00+01:00");

export const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = SHOW_DATE.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft("L'émission a commencé");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const formattedDate = format(SHOW_DATE, "d MMMM yyyy 'à' HH'h'mm", { locale: fr });
      
      let timeString = "";
      if (days > 0) timeString += `${days}j `;
      if (hours > 0) timeString += `${hours}h `;
      timeString += `${minutes}min ${seconds}s`;

      setTimeLeft(`${timeString} avant l'émission du ${formattedDate}`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000); // Update every second

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-sm text-rich-black/60 mt-2 text-center">
      {timeLeft}
    </div>
  );
};