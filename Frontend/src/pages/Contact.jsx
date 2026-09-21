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
  Security,
  Send,
  SupportAgent,
} from "@mui/icons-material";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  InputAdornment,
  Snackbar,
  TextField,
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
    setFormData((previous) => ({ ...previous, [name]: value }));

    if (errors[name]) {
      setErrors((previous) => ({ ...previous, [name]: "" }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    const name = formData.name.trim();
    const email = formData.email.trim();
    const subject = formData.subject.trim();
    const message = formData.message.trim();

    if (!name) nextErrors.name = "Please enter your full name.";
    else if (name.length < 2) nextErrors.name = "Name must contain at least 2 characters.";

    if (!email) nextErrors.email = "Please enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!subject) nextErrors.subject = "Please enter a subject.";
    else if (subject.length < 3) nextErrors.subject = "Subject must contain at least 3 characters.";

    if (!message) nextErrors.message = "Please enter your message.";
    else if (message.length < 10) nextErrors.message = "Message should contain at least 10 characters.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const subject = encodeURIComponent(formData.subject.trim());
      const body = encodeURIComponent(
        `Name: ${formData.name.trim()}\nEmail: ${formData.email.trim()}\n\nMessage:\n${formData.message.trim()}`
      );

      window.location.href = `mailto:support@apnaacademy.in?subject=${subject}&body=${body}`;

      setSnackbar({
        open: true,
        severity: "success",
        message: "Your email client has been opened with your message.",
      });
      setFormData(initialForm);
      setErrors({});
    } catch (error) {
      console.error("Contact form error:", error);
      setSnackbar({
        open: true,
        severity: "error",
        message: "Unable to prepare your message. Please email our support team directly.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8fbff] text-slate-900">
      <section className="relative overflow-hidden border-b border-blue-100/70 bg-gradient-to-br from-white via-blue-50/80 to-indigo-50/70">
        <div className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="pointer-events-none absolute right-[-6rem] top-[-5rem] h-80 w-80 rounded-full bg-indigo-200/35 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-cyan-100/40 blur-3xl" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/70 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-blue-600 shadow-sm backdrop-blur-xl">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <QuestionAnswer fontSize="inherit" />
              </span>
              Support
            </div>

            <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-[48px] lg:leading-[1.08]">
              Let&apos;s start a <span className="text-blue-600">conversation.</span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Have a question about courses, your account, payments, certificates, or learning? Our support team is here to help.
            </p>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              {["Student Support", "Quick Assistance", "Secure Communication"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs font-bold text-slate-600 sm:text-sm">
                  <CheckCircle className="!text-[18px] !text-blue-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden min-h-[190px] items-center justify-center lg:flex" aria-hidden="true">
            <div className="absolute h-44 w-72 rotate-[-8deg] rounded-2xl border border-white/90 bg-white/65 shadow-[0_24px_60px_rgba(37,99,235,0.12)] backdrop-blur-xl" />
            <div className="absolute -left-2 top-10 flex h-16 w-16 rotate-[-8deg] items-center justify-center rounded-2xl border border-white/90 bg-blue-100/80 text-blue-600 shadow-lg">
              <Email />
            </div>
            <div className="absolute left-10 top-1 h-44 w-56 rotate-[-8deg] rounded-2xl border border-blue-100 bg-white/85 p-6 shadow-xl backdrop-blur-xl">
              <div className="space-y-3">
                <div className="h-3 w-28 rounded-full bg-blue-100" />
                <div className="h-2 w-40 rounded-full bg-slate-200" />
                <div className="h-2 w-32 rounded-full bg-slate-200" />
                <div className="h-2 w-36 rounded-full bg-slate-200" />
                <div className="mt-4 h-7 w-20 rounded-lg bg-blue-50" />
              </div>
            </div>
            <div className="relative z-10 ml-36 flex h-32 w-28 items-center justify-center rounded-[32px] bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_24px_50px_rgba(37,99,235,0.3)]">
              <div className="absolute inset-3 rounded-[24px] border border-white/20" />
              <SupportAgent className="!text-6xl !text-white" />
            </div>
            <div className="absolute bottom-2 right-16 h-7 w-7 rounded-full bg-blue-500 shadow-lg" />
            <div className="absolute left-20 top-4 h-4 w-4 rounded-full bg-blue-400" />
          </div>
        </div>
      </section>

      <section className="relative bg-[#f8fbff]">
        <div className="pointer-events-none absolute left-0 top-20 h-64 w-64 rounded-full bg-blue-100/40 blur-3xl" />
        <div className="pointer-events-none absolute right-0 bottom-20 h-72 w-72 rounded-full bg-indigo-100/35 blur-3xl" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-4 px-4 py-5 sm:px-6 sm:py-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
          <aside className="h-fit rounded-2xl border border-blue-100 bg-white/85 p-4 shadow-[0_12px_40px_rgba(37,99,235,0.07)] backdrop-blur-xl lg:sticky lg:top-24">
            <div className="flex items-center gap-3 px-1 py-1">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <SupportAgent fontSize="small" />
              </span>
              <div>
                <h2 className="text-sm font-black text-slate-900">Contact Support</h2>
                <p className="text-[10px] text-slate-500">Choose a support option</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {contactInfo.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.title}
                    href={item.title.includes("Email") || item.title.includes("Student") ? "mailto:support@apnaacademy.in" : undefined}
                    className="group flex items-start gap-3 rounded-xl border border-transparent p-2.5 no-underline transition hover:border-blue-100 hover:bg-blue-50/70"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Icon fontSize="small" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-extrabold text-slate-800">{item.title}</span>
                      <span className="mt-0.5 block break-words text-[10px] leading-4 text-slate-500">{item.value}</span>
                    </span>
                  </a>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
                  <Security fontSize="small" />
                </span>
                <div>
                  <p className="text-xs font-black text-slate-900">Secure support</p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-600">
                    Never share passwords, OTPs, CVV or complete card numbers.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <Card elevation={0} className="!rounded-2xl !border !border-blue-100 !bg-white/90 !shadow-[0_12px_40px_rgba(37,99,235,0.07)] !backdrop-blur-xl">
              <CardContent className="!p-4 sm:!p-6 lg:!p-7">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-11 sm:w-11">
                    <Send fontSize="small" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-950 sm:text-base">Send us a message</h2>
                    <p className="mt-1 text-[11px] leading-5 text-slate-500 sm:text-xs">
                      Your message goes directly to the ApnaAcademy support email.
                    </p>
                  </div>
                </div>

                <Divider className="!my-5 !border-slate-100" />

                <form onSubmit={handleSubmit} noValidate>
                  <div className="grid gap-4 sm:grid-cols-2">
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
                      InputProps={{ startAdornment: <InputAdornment position="start"><Person fontSize="small" /></InputAdornment> }}
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
                      autoComplete="email"
                      InputProps={{ startAdornment: <InputAdornment position="start"><Email fontSize="small" /></InputAdornment> }}
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
                        placeholder="What can we help you with?"
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
                        helperText={errors.message || `${formData.message.length}/1000 characters`}
                        placeholder="Write your message here..."
                        inputProps={{ maxLength: 1000 }}
                      />
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-2">
                        <Security className="mt-0.5 !text-[18px] !text-blue-600" />
                        <p className="max-w-xl text-[11px] leading-5 text-slate-600 sm:text-xs">
                          Your information is used only to prepare and respond to your support request.
                        </p>
                      </div>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Send />}
                        className="!min-h-11 !rounded-xl !bg-blue-600 !px-6 !font-bold !normal-case !shadow-sm hover:!bg-blue-700"
                      >
                        {loading ? "Preparing..." : "Send Message"}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="mt-4 rounded-2xl border border-blue-100 bg-white/85 p-4 shadow-[0_12px_40px_rgba(37,99,235,0.05)] backdrop-blur-xl sm:p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <QuestionAnswer fontSize="small" />
                </span>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Common support topics</h2>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">You can contact us for assistance with these areas.</p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {helpTopics.map((topic) => (
                  <div key={topic} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                    <CheckCircle className="shrink-0 !text-[18px] !text-blue-600" />
                    <span className="text-[11px] font-semibold leading-4 text-slate-700">{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/90 to-indigo-50/80 p-5 shadow-[0_12px_40px_rgba(37,99,235,0.06)] sm:p-6">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-950">We&apos;re here for your learning journey.</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">
                    Need direct assistance? Reach our support team by email.
                  </p>
                </div>
                <Button
                  href="mailto:support@apnaacademy.in"
                  variant="contained"
                  endIcon={<ArrowForward />}
                  className="!rounded-xl !bg-blue-600 !px-5 !py-2.5 !font-bold !normal-case !shadow-sm hover:!bg-blue-700"
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((previous) => ({ ...previous, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((previous) => ({ ...previous, open: false }))}
          className="!rounded-xl"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </main>
  );
}
