import { Link } from "react-router-dom";

import {
  ArrowBack,
  ArrowForward,
  Home,
  SearchOff,
} from "@mui/icons-material";

import { Box, Button, Typography } from "@mui/material";

export default function NotFound() {
  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = "/";
  };

  return (
    <Box className="min-h-[calc(100vh-72px)] overflow-hidden bg-white text-slate-900">
      <main className="relative flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        {/* =====================================================
            SUBTLE BACKGROUND
        ====================================================== */}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-50/70 blur-3xl sm:h-[500px] sm:w-[500px]"
        />

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <section className="relative z-10 w-full max-w-2xl text-center">
          {/* Icon */}

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 shadow-sm sm:h-20 sm:w-20">
            <SearchOff
              sx={{
                fontSize: {
                  xs: 30,
                  sm: 36,
                },
              }}
            />
          </div>

          {/* 404 */}

          <Typography
            component="p"
            aria-label="404"
            className="!mt-7 !text-[88px] !font-black !leading-none !tracking-[-0.06em] !text-slate-950 sm:!text-[120px]"
          >
            404
          </Typography>

          {/* Heading */}

          <Typography
            component="h1"
            className="!mt-5 !text-2xl !font-black !tracking-tight !text-slate-950 sm:!text-3xl"
          >
            Page Not Found
          </Typography>

          {/* Description */}

          <Typography
            component="p"
            className="!mx-auto !mt-4 !max-w-xl !text-sm !leading-7 !text-slate-600 sm:!text-base"
          >
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
            It may have been moved, removed, or the URL may be incorrect.
          </Typography>

          {/* =================================================
              ACTIONS
          ================================================== */}

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button
              component={Link}
              to="/"
              variant="contained"
              startIcon={<Home />}
              className="!min-h-11 !rounded-xl !bg-blue-600 !px-6 !font-bold !normal-case !shadow-sm hover:!bg-blue-700"
            >
              Back to Home
            </Button>

            <Button
              component={Link}
              to="/courses"
              variant="outlined"
              endIcon={<ArrowForward />}
              className="!min-h-11 !rounded-xl !border-slate-300 !px-6 !font-bold !normal-case !text-slate-700 hover:!border-blue-300 hover:!bg-blue-50 hover:!text-blue-700"
            >
              Explore Courses
            </Button>
          </div>

          {/* Go Back */}

          <Button
            type="button"
            onClick={handleGoBack}
            variant="text"
            startIcon={<ArrowBack />}
            className="!mt-4 !rounded-xl !px-4 !font-semibold !normal-case !text-slate-500 hover:!bg-slate-50 hover:!text-blue-600"
          >
            Go Back
          </Button>

          {/* =================================================
              QUICK NAVIGATION
          ================================================== */}

          <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-12 sm:p-5">
            <Typography
              component="p"
              className="!text-xs !font-bold !uppercase !tracking-wider !text-slate-400"
            >
              You can continue from here
            </Typography>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Button
                component={Link}
                to="/"
                variant="text"
                className="!rounded-xl !py-2.5 !text-xs !font-bold !normal-case !text-slate-600 hover:!bg-slate-50 hover:!text-blue-600"
              >
                Home
              </Button>

              <Button
                component={Link}
                to="/courses"
                variant="text"
                className="!rounded-xl !py-2.5 !text-xs !font-bold !normal-case !text-slate-600 hover:!bg-slate-50 hover:!text-blue-600"
              >
                Courses
              </Button>

              <Button
                component={Link}
                to="/contact"
                variant="text"
                className="!col-span-2 !rounded-xl !py-2.5 !text-xs !font-bold !normal-case !text-slate-600 hover:!bg-slate-50 hover:!text-blue-600 sm:!col-span-1"
              >
                Contact
              </Button>
            </div>
          </div>

          {/* Footer text */}

          <Typography
            component="p"
            className="!mt-8 !text-xs !font-medium !text-slate-400"
          >
            ApnaAcademy • Learn • Build • Grow
          </Typography>
        </section>
      </main>
    </Box>
  );
}