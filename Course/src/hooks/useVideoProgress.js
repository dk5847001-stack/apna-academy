import { useCallback, useEffect, useRef } from "react";

import {
  LEARNING_RULES,
} from "../constants/config";

import {
  updateVideoProgress,
} from "../services/progress.service";

/* =========================================================
   VIDEO PROGRESS TRACKER

   Responsibilities:
   1. Save current watching position
   2. Mark video complete at 80%
   3. Avoid excessive API requests
   4. Save final position when leaving video
   5. Prevent duplicate completion requests
========================================================= */

const SAVE_INTERVAL = 10000;

export default function useVideoProgress({
  courseId,
  video = null,
  initialPosition = 0,
  onProgressUpdated,
  onCompleted,
}) {
  const lastSavedPosition =
    useRef(0);

  const lastSaveTime =
    useRef(0);

  const completionSent =
    useRef(false);

  const saving =
    useRef(false);

  /* =======================================================
     RESET TRACKER WHEN VIDEO CHANGES
  ======================================================= */

  useEffect(() => {
    lastSavedPosition.current =
      Number(initialPosition) || 0;

    lastSaveTime.current = 0;

    completionSent.current =
      Boolean(video?.isCompleted);

    saving.current = false;
}, [
  video?._id,
  video?.id,
  video?.isCompleted,
  initialPosition,
]);

  /* =======================================================
     SAVE PROGRESS
  ======================================================= */

  const saveProgress = useCallback(
    async ({
      position,
      completed = false,
      force = false,
    }) => {
      if (!courseId || !video) {
        return;
      }

      const videoId =
        video._id || video.id;

      if (!videoId) {
        return;
      }

      const safePosition =
        Math.max(
          0,
          Number(position) || 0
        );

      const now = Date.now();

      if (
        !force &&
        now - lastSaveTime.current <
          SAVE_INTERVAL
      ) {
        return;
      }

      if (saving.current) {
        return;
      }

      saving.current = true;

      try {
        const updatedProgress =
          await updateVideoProgress({
            courseId,
            videoId,
            position: safePosition,
            completed,
          });

        lastSavedPosition.current =
          safePosition;

        lastSaveTime.current =
          Date.now();

        if (
          completed
        ) {
          completionSent.current =
            true;
        }

        onProgressUpdated?.(
          updatedProgress
        );

        if (completed) {
          onCompleted?.(
            updatedProgress
          );
        }
      } catch (error) {
        console.error(
          "Unable to save video progress:",
          error
        );
      } finally {
        saving.current = false;
      }
    },
    [
      courseId,
      video,
      onProgressUpdated,
      onCompleted,
    ]
  );

  /* =======================================================
     VIDEO TIME UPDATE
  ======================================================= */

  const handleTimeUpdate =
    useCallback(
      async (player) => {
        if (!player || !video) {
          return;
        }

        const duration =
          Number(player.duration);

        const currentTime =
          Number(player.currentTime);

        if (
          !Number.isFinite(
            duration
          ) ||
          duration <= 0 ||
          !Number.isFinite(
            currentTime
          )
        ) {
          return;
        }

        const watchedPercentage =
          (currentTime / duration) *
          100;

        /*
         * Mark video complete at the configured
         * completion percentage.
         */
        if (
          watchedPercentage >=
            LEARNING_RULES.VIDEO_COMPLETION_PERCENTAGE &&
          !completionSent.current
        ) {
          await saveProgress({
            position: currentTime,
            completed: true,
            force: true,
          });

          return;
        }

        /*
         * Periodically save the current position.
         */
        await saveProgress({
          position: currentTime,
          completed: false,
          force: false,
        });
      },
      [video, saveProgress]
    );

  /* =======================================================
     VIDEO ENDED
  ======================================================= */

  const handleEnded =
    useCallback(
      async (player) => {
        const duration =
          Number(player?.duration) || 0;

        const finalPosition =
          duration > 0
            ? duration
            : Number(
                player?.currentTime
              ) || 0;

        if (
          completionSent.current
        ) {
          await saveProgress({
            position: finalPosition,
            completed: true,
            force: true,
          });

          return;
        }

        await saveProgress({
          position: finalPosition,
          completed: true,
          force: true,
        });
      },
      [saveProgress]
    );

  /* =======================================================
     VIDEO PAUSE
  ======================================================= */

  const handlePause =
    useCallback(
      async (player) => {
        const currentTime =
          Number(
            player?.currentTime
          ) || 0;

        const duration =
          Number(
            player?.duration
          ) || 0;

        if (
          duration > 0 &&
          currentTime >=
            duration *
              (LEARNING_RULES.VIDEO_COMPLETION_PERCENTAGE /
                100)
        ) {
          await saveProgress({
            position: currentTime,
            completed: true,
            force: true,
          });

          return;
        }

        await saveProgress({
          position: currentTime,
          completed:
            completionSent.current,
          force: true,
        });
      },
      [saveProgress]
    );

  /* =======================================================
     VIDEO LOAD

     Restore position is handled by the player component.
  ======================================================= */

  const handleLoadedMetadata =
    useCallback(
      (player) => {
        if (!player) {
          return;
        }

        const position =
          Number(initialPosition) || 0;

        const duration =
          Number(player.duration) || 0;

        if (
          position > 0 &&
          duration > 0 &&
          position < duration
        ) {
          try {
            player.currentTime =
              position;
          } catch (error) {
            console.warn(
              "Unable to restore video position:",
              error
            );
          }
        }
      },
      [initialPosition]
    );

  /* =======================================================
     CLEANUP

     Save latest position if user changes lesson,
     navigates away, or component unmounts.
  ======================================================= */

  useEffect(() => {
    return () => {
      /*
       * We intentionally don't make an async request
       * during React cleanup because the component may
       * already be unmounted.
       *
       * The player pause/time-update handlers already
       * persist the latest position.
       */
    };
  }, []);

  return {
    handleTimeUpdate,
    handleEnded,
    handlePause,
    handleLoadedMetadata,
  };
}