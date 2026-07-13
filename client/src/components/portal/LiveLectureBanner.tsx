import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { Video, ExternalLink, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LiveLectureBannerProps {
  isTeacher?: boolean;
}

export default function LiveLectureBanner({ isTeacher = false }: LiveLectureBannerProps) {
  const { data: settings } = trpc.settings.get.useQuery();

  const isEnabled = Boolean(settings?.liveRoomEnabled);
  const url = settings?.liveRoomUrl ?? "";
  const title = settings?.liveRoomTitle ?? "حصة مباشرة";

  if (!isEnabled || !url) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-red-600 to-rose-500 text-white p-4 shadow-lg"
      >
        {/* Pulsing background circle */}
        <div className="absolute -left-6 -top-6 w-32 h-32 rounded-full bg-white/10 animate-pulse" />
        <div className="absolute -left-2 -top-2 w-16 h-16 rounded-full bg-white/10" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-1 shrink-0">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-bold tracking-wide">LIVE</span>
            </div>
            <div>
              <p className="font-bold text-sm">{title}</p>
              <p className="text-xs text-white/80">
                {isTeacher ? "الحصة المباشرة نشطة — الطلاب يمكنهم الانضمام الآن" : "انضم الآن للحصة المباشرة مع الأستاذ"}
              </p>
            </div>
          </div>
          <Button
            asChild
            size="sm"
            className="bg-white text-red-600 hover:bg-white/90 shrink-0 gap-1.5 font-bold shadow-sm"
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Video className="w-4 h-4" />
              {isTeacher ? "فتح الغرفة" : "انضم الآن"}
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
