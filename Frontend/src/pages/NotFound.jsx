import { Link } from "react-router-dom";

import {
  ArrowBack,
  ArrowForward,
  Home,
  SearchOff,
} from "@mui/icons-material";

import { Box, Button, Typography } from "@mui/material";

export default function NotFound() {
  return (
    <Box className="min-h-[calc(100vh-80px)] bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center">
        <div className="w-full text-center">
          {/* Icon */}
          <Box className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <SearchOff sx={{ fontSize: 32 }} />
          </Box>

          {/* 404 */}
          <Typography
            component="h1"
            className="!text-8xl !font-extrabold !leading-none !tracking-tight !text-slate-900 sm:!text-9xl"
          >
            404
          </Typography>

          {/* Heading */}
          <Typography
            component="h2"
            className="mt-6 !text-2xl !font-bold !text-slate-950 sm:!text-3xl"
          >
            Page Not Found
          </Typography>

          {/* Description */}
          <Typography className="mx-auto mt-3 max-w-lg !text-sm !leading-6 !text-slate-600 sm:!text-base">
            The page you&apos;re looking for doesn&apos;t exist or may have
            been moved. Let&apos;s get you back to where you need to be.
          </Typography>

          {/* Actions */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              component={Link}
              to="/"
              variant="contained"
              startIcon={<Home />}
              className="!min-h-11 !rounded-xl !bg-blue-600 !px-6 !font-semibold !normal-case !shadow-none hover:!bg-blue-700"
            >
              Back to Home
            </Button>

            <Button
              component={Link}
              to="/courses"
              variant="outlined"
              endIcon={<ArrowForward />}
              className="!min-h-11 !rounded-xl !border-slate-300 !px-6 !font-semibold !normal-case !text-slate-700 hover:!border-blue-600 hover:!bg-blue-50 hover:!text-blue-600"
            >
              Explore Courses
            </Button>
          </div>

          {/* Back */}
          <Button
            onClick={() => window.history.back()}
            variant="text"
            startIcon={<ArrowBack />}
            className="!mt-5 !font-medium !normal-case !text-slate-500 hover:!bg-transparent hover:!text-blue-600"
          >
            Go Back
          </Button>

          {/* Small helper */}
          <div className="mt-10 border-t border-slate-200 pt-6">
            <Typography className="!text-xs !text-slate-400">
              ApnaAcademy • Learn. Build. Grow.
            </Typography>
          </div>
        </div>
      </div>
    </Box>
  );
}