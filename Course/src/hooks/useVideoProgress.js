import { useCallback, useEffect, useRef } from "react";

import { LEARNING_RULES } from "../constants/config";
import { updateVideoProgress } from "../services/progress.service";

const SAVE_INTERVAL = 10000;

const getPlayerMetrics = (player) => {
  if (!player) {
    return { currentTime: 0, duration: 0 };
  }

  const currentTime =
    typeof player === "object" && "currentTime" in player
      ? Number(player.currentTime)
      : 0;

  const duration =
    typeof player === "object" && "duration" in player
      ? Number(player.duration)
      : 0;

  return {
    currentTime: Number.isFinite(currentTime) ? Math.max(0, currentTime) : 0,
    duration: Number.isFinite(duration) ? Math.max(0, duration) : 0,
  };
};

export default function useVideoProgress({
  courseId,
  video = null,
  initialPosition = 0,
  onProgressUpdated,
  onCompleted,
}) {
  const lastSavedPosition = useRef(0);
  const lastSaveTime = useRef(0);
  const completionSent = useRef(false);
  const saving = useRef(false);
  const queuedSave = useRef(null);

  useEffect(() => {
    lastSavedPosition.current = Number(initialPosition) || 0;
    lastSaveTime.current = 0;
    completionSent.current = Boolean(video?.isCompleted);
    saving.current = false;
    queuedSave.current = null;
  }, [video?._id, video?.id, video?.isCompleted, initialPosition]);

  const saveProgress = useCallback(
    async ({ position, duration = 0, completed = false, force = false }) => {
      if (!courseId || !video) return;

      const videoId = video._id || video.id;
      if (!videoId) return;

      const safePosition = Math.max(0, Number(position) || 0);
      const safeDuration = Math.max(0, Number(duration) || 0);
      const request = {
        position: safePosition,
        duration: safeDuration,
        completed,
        force,
      };
      const now = Date.now();

      if (!force && now - lastSaveTime.current < SAVE_INTERVAL) return;

      if (saving.current) {
        const previous = queuedSave.current;
        queuedSave.current =
          !previous ||
          completed ||
          safePosition >= previous.position
            ? request
            : previous;
        return;
      }

      saving.current = true;

      try {
        const updatedProgress = await updateVideoProgress({
          courseId,
          videoId,
          position: safePosition,
          duration: safeDuration,
          completed,
        });

        lastSavedPosition.current = safePosition;
        lastSaveTime.current = Date.now();

        if (completed) completionSent.current = true;

        onProgressUpdated?.(updatedProgress);
        if (completed) onCompleted?.(updatedProgress);
      } catch (error) {
        console.error("Unable to save video progress:", error);
      } finally {
        saving.current = false;

        const nextRequest = queuedSave.current;
        queuedSave.current = null;

        if (nextRequest) {
          await saveProgress({ ...nextRequest, force: true });
        }
      }
    },
    [courseId, video, onProgressUpdated, onCompleted]
  );

  const handleTimeUpdate = useCallback(
    async (player) => {
      if (!player || !video) return;

      const { duration, currentTime } = getPlayerMetrics(player);

      if (duration <= 0 || !Number.isFinite(currentTime)) return;

      const watchedPercentage = (currentTime / duration) * 100;

      if (
        watchedPercentage >= LEARNING_RULES.VIDEO_COMPLETION_PERCENTAGE &&
        !completionSent.current
      ) {
        await saveProgress({
          position: currentTime,
          duration,
          completed: true,
          force: true,
        });
        return;
      }

      await saveProgress({
        position: currentTime,
        duration,
        completed: false,
        force: false,
      });
    },
    [video, saveProgress]
  );

  const handleEnded = useCallback(
    async (player) => {
      const { duration, currentTime } = getPlayerMetrics(player);
      const finalPosition = duration > 0 ? duration : currentTime;

      await saveProgress({
        position: finalPosition,
        duration,
        completed: true,
        force: true,
      });
    },
    [saveProgress]
  );

  const handlePause = useCallback(
    async (player) => {
      const { currentTime, duration } = getPlayerMetrics(player);
      const completionThreshold =
        duration *
        (LEARNING_RULES.VIDEO_COMPLETION_PERCENTAGE / 100);

      if (duration > 0 && currentTime >= completionThreshold) {
        await saveProgress({
          position: currentTime,
          duration,
          completed: true,
          force: true,
        });
        return;
      }

      await saveProgress({
        position: currentTime,
        duration,
        completed: completionSent.current,
        force: true,
      });
    },
    [saveProgress]
  );

  const handleLoadedMetadata = useCallback(
    (player) => {
      if (!player) return;

      const position = Number(initialPosition) || 0;
      const { duration } = getPlayerMetrics(player);

      if (position > 0 && duration > 0 && position < duration) {
        if (typeof player.setCurrentTime === "function") {
          player.setCurrentTime(position);
          return;
        }

        if ("currentTime" in Object(player)) {
          try {
            player.currentTime = position;
          } catch (error) {
            console.warn("Unable to restore video position:", error);
          }
        }
      }
    },
    [initialPosition]
  );

  return {
    handleTimeUpdate,
    handleEnded,
    handlePause,
    handleLoadedMetadata,
  };
}
