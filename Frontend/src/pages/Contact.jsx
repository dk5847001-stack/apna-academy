import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";

import {
 AccessTime,
  ArrowForward,
  Email,
  LocationOn,
  Person,
  Phone,
  QuestionAnswer,
  Send,
  SupportAgent,
} from "@mui/icons-material";

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
    description: "For general questions and support",
  },
  {
    icon: SupportAgent,
    title: "Student Support",
    value: "support@apnaacademy.in",
    description: "Get help with courses and learning",
  },
  {
    icon: AccessTime,
    title: "Support Hours",
    value: "Mon – Sat, 10 AM – 6 PM",
    description: "We usually respond within 24 hours",
  },
  {
    icon: LocationOn,
    title: "Our Location",
    value: "India",
    description: "Serving learners across India",
  },
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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please enter your name.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Please enter a subject.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Please enter your message.";
    } else if (formData.message.trim().length < 10) {
      newErrors.message =
        "Message should contain at least 10 characters.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    /*
      Backend contact API can be connected here later.

      Example:
      await api.post("/contact", formData);

      For now we show a successful UI state without
      making a fake API request.
    */

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      setSnackbar({
        open: true,
        severity: "success",
        message:
          "Your message has been received. Our support team will get back to you soon.",
      });

      setFormData(initialForm);
      setErrors({});
    } catch (error) {
      setSnackbar({
        open: true,
        severity: "error",
        message:
          "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen bg-white text-slate-900">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 flex justify-center">
              <Box className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <QuestionAnswer sx={{ fontSize: 28 }} />
              </Box>
            </div>

            <Typography
              component="h1"
              className="!text-4xl !font-extrabold !tracking-tight !text-slate-950 sm:!text-5xl"
            >
              Let&apos;s Start a Conversation
            </Typography>

            <Typography className="mx-auto mt-5 max-w-2xl !text-base !leading-7 !text-slate-600 sm:!text-lg">
              Have a question about a course, your account, payments,
              certificates, or anything else? Our team is here to help.
            </Typography>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <Typography
                  component="h2"
                  className="!text-2xl !font-bold !text-slate-950"
                >
                  Contact Information
                </Typography>

                <Typography className="mt-2 !text-sm !leading-6 !text-slate-600">
                  Choose the most convenient way to reach our team.
                </Typography>
              </div>

              <div className="space-y-4">
                {contactInfo.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Card
                      key={item.title}
                      elevation={0}
                      className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
                    >
                      <CardContent className="!p-5">
                        <div className="flex gap-4">
                          <Box className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Icon fontSize="small" />
                          </Box>

                          <div className="min-w-0">
                            <Typography className="!text-sm !font-semibold !text-slate-900">
                              {item.title}
                            </Typography>

                            <Typography className="mt-1 !break-words !text-sm !font-medium !text-blue-600">
                              {item.value}
                            </Typography>

                            <Typography className="mt-1 !text-xs !leading-5 !text-slate-500">
                              {item.description}
                            </Typography>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Support Card */}
              <Card
                elevation={0}
                className="mt-5 overflow-hidden rounded-2xl border border-blue-100 bg-blue-50"
              >
                <CardContent className="!p-6">
                  <Box className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <SupportAgent />
                  </Box>

                  <Typography className="!text-lg !font-bold !text-slate-950">
                    Need quick help?
                  </Typography>

                  <Typography className="mt-2 !text-sm !leading-6 !text-slate-600">
                    Check our support resources or send us a message.
                    We&apos;ll help you find the right solution.
                  </Typography>

                  <Button
                    href="mailto:support@apnaacademy.in"
                    variant="text"
                    endIcon={<ArrowForward />}
                    className="!mt-3 !px-0 !font-semibold !normal-case !text-blue-600 hover:!bg-transparent"
                  >
                    Email Support
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card
                elevation={0}
                className="rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <CardContent className="!p-5 sm:!p-7 lg:!p-9">
                  <div className="mb-7">
                    <Typography
                      component="h2"
                      className="!text-2xl !font-bold !text-slate-950"
                    >
                      Send Us a Message
                    </Typography>

                    <Typography className="mt-2 !text-sm !leading-6 !text-slate-600">
                      Fill in the details below and our team will get
                      back to you as soon as possible.
                    </Typography>
                  </div>

                  <Divider className="!mb-7" />

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={Boolean(errors.name)}
                        helperText={errors.name}
                        placeholder="Enter your name"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />

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
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <div className="sm:col-span-2">
                        <TextField
                          fullWidth
                          label="Subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          error={Boolean(errors.subject)}
                          helperText={errors.subject}
                          placeholder="How can we help you?"
                        />
                      </div>

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

                    <div className="mt-7 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <Typography className="!text-xs !leading-5 !text-slate-500">
                        By submitting this form, you agree to be contacted
                        regarding your request.
                      </Typography>

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
                        className="!min-h-11 !rounded-xl !bg-blue-600 !px-6 !font-semibold !normal-case !shadow-none hover:!bg-blue-700"
                      >
                        {loading ? "Sending..." : "Send Message"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <Box className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Phone />
          </Box>

          <Typography
            component="h2"
            className="!text-2xl !font-bold !text-slate-950 sm:!text-3xl"
          >
            We&apos;re here to support your learning journey
          </Typography>

          <Typography className="mx-auto mt-3 max-w-2xl !text-sm !leading-6 !text-slate-600 sm:!text-base">
            Whether you&apos;re just getting started or already learning
            with us, ApnaAcademy is here to help you move forward.
          </Typography>
        </div>
      </section>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() =>
          setSnackbar((prev) => ({
            ...prev,
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
            setSnackbar((prev) => ({
              ...prev,
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