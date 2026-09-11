import { useState } from "react";

import {
  AccessTime,
  ArrowForward,
  CheckCircle,
  Email,
  LocationOn,
  Person,
  Phone,
  QuestionAnswer,
  Send,
  Security,
  SupportAgent,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const contactInfo = [
  {
    icon: Email,
    title: "Email Support",
    value: "support@apnaacademy.in",
    description: "For general questions and support.",
  },
  {
    icon: SupportAgent,
    title: "Student Support",
    value: "support@apnaacademy.in",
    description: "Get help with courses and learning.",
  },
  {
    icon: AccessTime,
    title: "Support Hours",
    value: "Mon – Sat, 10 AM – 6 PM",
    description: "We usually respond within 24 hours.",
  },
  {
    icon: LocationOn,
    title: "Location",
    value: "India",
    description: "Serving learners across India.",
  },
];

const helpTopics = [
  "Course related questions",
  "Account and login assistance",
  "Payment related queries",
  "Learning and progress support",
  "Certificate related questions",
  "General platform assistance",
];

export default function Contact() {
  const [formData, setFormData] = useState(initialForm);

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    const name = formData.name.trim();
    const email = formData.email.trim();
    const subject = formData.subject.trim();
    const message = formData.message.trim();

    if (!name) {
      nextErrors.name = "Please enter your full name.";
    } else if (name.length < 2) {
      nextErrors.name = "Name must contain at least 2 characters.";
    }

    if (!email) {
      nextErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!subject) {
      nextErrors.subject = "Please enter a subject.";
    } else if (subject.length < 3) {
      nextErrors.subject =
        "Subject must contain at least 3 characters.";
    }

    if (!message) {
      nextErrors.message = "Please enter your message.";
    } else if (message.length < 10) {
      nextErrors.message =
        "Message should contain at least 10 characters.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    /*
      IMPORTANT:
      The current Backend source does not have a confirmed
      contact/support API endpoint in the available project
      specification.

      Therefore we do NOT make up an API endpoint here.

      The form currently opens the user's email client with
      the submitted information. Later, when the Backend
      support-ticket endpoint is implemented, this function
      can be connected to the real API.
    */

    setLoading(true);

    try {
      const subject = encodeURIComponent(
        formData.subject.trim()
      );

      const body = encodeURIComponent(
        `Name: ${formData.name.trim()}\n` +
          `Email: ${formData.email.trim()}\n\n` +
          `Message:\n${formData.message.trim()}`
      );

      window.location.href =
        `mailto:support@apnaacademy.in?subject=${subject}&body=${body}`;

      setSnackbar({
        open: true,
        severity: "success",
        message:
          "Your email client has been opened with your message.",
      });

      setFormData(initialForm);
      setErrors({});
    } catch (error) {
      console.error("Contact form error:", error);

      setSnackbar({
        open: true,
        severity: "error",
        message:
          "Unable to prepare your message. Please email our support team directly.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <Container maxWidth="lg">
          <div className="py-16 text-center sm:py-20 lg:py-24">
            <Chip
              icon={<QuestionAnswer fontSize="small" />}
              label="Contact ApnaAcademy"
              variant="outlined"
              className="!border-blue-200 !bg-blue-50 !font-semibold !text-blue-700"
            />

            <Typography
              component="h1"
              className="!mx-auto !mt-5 !max-w-4xl !text-4xl !font-black !leading-tight !tracking-tight !text-slate-950 sm:!text-5xl lg:!text-6xl"
            >
              Let&apos;s start a conversation.
            </Typography>

            <Typography
              component="p"
              className="!mx-auto !mt-5 !max-w-2xl !text-base !leading-8 !text-slate-600 sm:!text-lg"
            >
              Have a question about courses, your account, payments,
              certificates, or learning? We&apos;re here to help.
            </Typography>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <CheckCircle className="!text-[18px] !text-blue-600" />
                Student Support
              </div>

              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <CheckCircle className="!text-[18px] !text-blue-600" />
                Quick Assistance
              </div>

              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <CheckCircle className="!text-[18px] !text-blue-600" />
                Secure Communication
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================
          CONTACT CONTENT
      ====================================================== */}

      <section className="bg-slate-50">
        <Container maxWidth="lg">
          <div className="grid gap-7 py-12 sm:py-16 lg:grid-cols-[0.8fr_1.2fr]">
            {/* =================================================
                LEFT SIDE
            ================================================== */}

            <div>
              <Typography
                component="h2"
                className="!text-2xl !font-black !text-slate-950 sm:!text-3xl"
              >
                We&apos;re here to help
              </Typography>

              <Typography className="!mt-3 !text-sm !leading-7 !text-slate-600 sm:!text-base">
                Choose the option that works best for you or send us a
                detailed message using the form.
              </Typography>

              {/* Contact cards */}

              <div className="mt-7 space-y-3">
                {contactInfo.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Card
                      key={item.title}
                      elevation={0}
                      className="!rounded-2xl !border !border-slate-200 !bg-white !shadow-sm !transition-shadow !duration-200 hover:!shadow-md"
                    >
                      <CardContent className="!p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Icon fontSize="small" />
                          </div>

                          <div className="min-w-0">
                            <Typography className="!text-sm !font-bold !text-slate-900">
                              {item.title}
                            </Typography>

                            <Typography className="!mt-1 !break-words !text-sm !font-semibold !text-blue-600">
                              {item.value}
                            </Typography>

                            <Typography className="!mt-1 !text-xs !leading-5 !text-slate-500">
                              {item.description}
                            </Typography>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Quick help */}

              <Card
                elevation={0}
                className="!mt-5 !overflow-hidden !rounded-2xl !border !border-blue-100 !bg-blue-50"
              >
                <CardContent className="!p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <SupportAgent />
                  </div>

                  <Typography className="!mt-5 !text-lg !font-black !text-slate-950">
                    Need quick help?
                  </Typography>

                  <Typography className="!mt-2 !text-sm !leading-6 !text-slate-600">
                    For urgent assistance, contact our support team
                    directly through email.
                  </Typography>

                  <Button
                    href="mailto:support@apnaacademy.in"
                    variant="text"
                    endIcon={<ArrowForward />}
                    className="!mt-3 !px-0 !font-bold !normal-case !text-blue-600 hover:!bg-transparent"
                  >
                    Email Support
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* =================================================
                RIGHT SIDE — FORM
            ================================================== */}

            <Card
              elevation={0}
              className="!rounded-3xl !border !border-slate-200 !bg-white !shadow-sm"
            >
              <CardContent className="!p-5 sm:!p-7 lg:!p-9">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Send />
                  </div>

                  <div>
                    <Typography
                      component="h2"
                      className="!text-2xl !font-black !text-slate-950"
                    >
                      Send us a message
                    </Typography>

                    <Typography className="!mt-1 !text-sm !leading-6 !text-slate-600">
                      Tell us how we can help you.
                    </Typography>
                  </div>
                </div>

                <Divider className="!my-7 !border-slate-200" />

                <form onSubmit={handleSubmit} noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* Name */}

                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={Boolean(errors.name)}
                      helperText={errors.name}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Email */}

                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={Boolean(errors.email)}
                      helperText={errors.email}
                      placeholder="you@example.com"
                      autoComplete="email"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Subject */}

                    <div className="sm:col-span-2">
                      <TextField
                        fullWidth
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        error={Boolean(errors.subject)}
                        helperText={errors.subject}
                        placeholder="What can we help you with?"
                      />
                    </div>

                    {/* Message */}

                    <div className="sm:col-span-2">
                      <TextField
                        fullWidth
                        multiline
                        minRows={6}
                        label="Message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        error={Boolean(errors.message)}
                        helperText={
                          errors.message ||
                          `${formData.message.length}/1000 characters`
                        }
                        placeholder="Write your message here..."
                        inputProps={{
                          maxLength: 1000,
                        }}
                      />
                    </div>
                  </div>

                  {/* Submit */}

                  <div className="mt-7 border-t border-slate-200 pt-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-2">
                        <Security className="mt-0.5 !text-[18px] !text-blue-600" />

                        <Typography className="!max-w-md !text-xs !leading-5 !text-slate-500">
                          Your information is used only to respond to
                          your support request.
                        </Typography>
                      </div>

                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        endIcon={
                          loading ? (
                            <CircularProgress
                              size={18}
                              color="inherit"
                            />
                          ) : (
                            <Send />
                          )
                        }
                        className="!min-h-11 !rounded-xl !bg-blue-600 !px-6 !font-bold !normal-case !shadow-sm hover:!bg-blue-700"
                      >
                        {loading ? "Preparing..." : "Send Message"}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* =====================================================
          HELP TOPICS
      ====================================================== */}

      <section className="bg-white">
        <Container maxWidth="lg">
          <div className="py-14 sm:py-18">
            <div className="mx-auto max-w-2xl text-center">
              <Chip
                label="What can we help with?"
                variant="outlined"
                className="!border-blue-200 !bg-blue-50 !font-semibold !text-blue-700"
              />

              <Typography
                component="h2"
                className="!mt-4 !text-2xl !font-black !text-slate-950 sm:!text-3xl"
              >
                Common support topics
              </Typography>

              <Typography className="!mt-3 !text-sm !leading-7 !text-slate-600">
                You can contact us for assistance with any of the
                following areas.
              </Typography>
            </div>

            <div className="mx-auto mt-9 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {helpTopics.map((topic) => (
                <div
                  key={topic}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <CheckCircle className="shrink-0 !text-[19px] !text-blue-600" />

                  <Typography className="!text-sm !font-semibold !text-slate-700">
                    {topic}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="border-t border-slate-200 bg-slate-50">
        <Container maxWidth="lg">
          <div className="py-14 sm:py-16">
            <div className="rounded-[2rem] border border-blue-100 bg-blue-50 px-6 py-10 text-center sm:px-10">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                <Phone />
              </div>

              <Typography
                component="h2"
                className="!mt-5 !text-2xl !font-black !text-slate-950 sm:!text-3xl"
              >
                We&apos;re here for your learning journey.
              </Typography>

              <Typography className="!mx-auto !mt-3 !max-w-2xl !text-sm !leading-7 !text-slate-600 sm:!text-base">
                Whether you are just getting started or already learning
                with ApnaAcademy, our support team is here to help.
              </Typography>

              <Button
                href="mailto:support@apnaacademy.in"
                variant="contained"
                endIcon={<ArrowForward />}
                className="!mt-6 !rounded-xl !bg-blue-600 !px-6 !py-3 !font-bold !normal-case !shadow-sm hover:!bg-blue-700"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================
          SNACKBAR
      ====================================================== */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() =>
          setSnackbar((previous) => ({
            ...previous,
            open: false,
          }))
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() =>
            setSnackbar((previous) => ({
              ...previous,
              open: false,
            }))
          }
          className="!rounded-xl"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}