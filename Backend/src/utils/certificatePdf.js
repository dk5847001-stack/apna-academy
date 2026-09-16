import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

// The supplied reference certificate is a 4:3 landscape composition.
// Keeping the same aspect ratio prevents the artwork from looking stretched.
const CERTIFICATE_WIDTH = 1200;
const CERTIFICATE_HEIGHT = 900;

const COLORS = {
  paper: "#ffffff",
  navy: "#0b3768",
  navyDark: "#082f5b",
  muted: "#35577d",
  gold: "#c9b43c",
  goldLight: "#e8dfaa",
  green: "#5aa44b",
  react: "#27aee4",
  js: "#f4dc1b",
  css: "#2469a9",
  html: "#e64a2e",
  mongo: "#65b64a",
  black: "#111111",
  skin: "#f4c6a4",
};

const ensureDirectory = (directory) => {
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
};

const safeFileName = (value) => String(value || "certificate")
  .trim()
  .replace(/[^a-zA-Z0-9-_]/g, "-")
  .replace(/-+/g, "-")
  .slice(0, 120);

const formatDate = (date) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const drawPolygon = (doc, points, color, lineWidth = 1.2) => {
  if (!points.length) return;
  doc.save();
  doc.lineWidth(lineWidth).strokeColor(color).moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, y]) => doc.lineTo(x, y));
  doc.closePath().stroke();
  doc.restore();
};

const drawGeometricCluster = (doc, ox, oy, scale = 1) => {
  const p = [
    [0, 0], [60, -16], [120, 30], [185, 10], [235, 55],
    [205, 130], [125, 145], [55, 205], [5, 175], [72, 78],
    [132, 80], [95, 125],
  ].map(([x, y]) => [ox + x * scale, oy + y * scale]);

  const triangles = [
    [0, 1, 9], [1, 2, 9], [1, 3, 2], [2, 4, 5], [2, 5, 10],
    [2, 10, 9], [9, 10, 11], [9, 11, 8], [11, 6, 8], [6, 7, 8],
    [5, 6, 10], [10, 6, 11], [0, 9, 8],
  ];

  triangles.forEach(([a, b, c]) => drawPolygon(doc, [p[a], p[b], p[c]], COLORS.navy, 1.25));
  doc.save();
  doc.fillColor(COLORS.navy);
  p.forEach(([x, y], index) => doc.circle(x, y, index % 3 === 0 ? 2.6 : 1.8).fill());
  doc.restore();
};

const drawLeftArtwork = (doc) => {
  drawGeometricCluster(doc, 42, 25, 1.02);
  drawGeometricCluster(doc, 44, 330, 0.92);
};

const drawRibbon = (doc) => {
  doc.save();
  doc.rect(1084, 0, 43, 158).fill(COLORS.gold);
  doc.rect(1127, 0, 25, 158).fill(COLORS.goldLight);

  const medalX = 1099;
  const medalY = 184;
  doc.circle(medalX, medalY, 43).fill(COLORS.goldLight);
  doc.circle(medalX, medalY, 35).fill(COLORS.gold);
  doc.circle(medalX, medalY, 29).fill(COLORS.paper);
  doc.circle(medalX, medalY, 26).lineWidth(1.2).strokeColor(COLORS.navy).stroke();

  doc.moveTo(1074, 218).lineTo(1086, 320).lineTo(1100, 292).lineTo(1114, 320).lineTo(1127, 218).closePath().fill(COLORS.gold);
  doc.moveTo(1086, 218).lineTo(1100, 326).lineTo(1114, 218).closePath().fill(COLORS.goldLight);
  doc.restore();
};

const drawLogo = (doc) => {
  doc.save();
  const x = 555;
  const y = 42;

  doc.font("Helvetica-Bold").fontSize(24).fillColor(COLORS.gold).text("APNA", x, y, {
    width: 90,
    align: "center",
  });
  doc.font("Helvetica-Bold").fontSize(25).fillColor(COLORS.navy).text("COLLEGE", x - 2, y + 22, {
    width: 94,
    align: "center",
  });
  doc.restore();
};

const drawHeading = (doc) => {
  doc.save();
  doc.font("Helvetica-Bold").fontSize(57).fillColor(COLORS.navy).text("CERTIFICATE", 0, 133, {
    width: CERTIFICATE_WIDTH,
    align: "center",
    characterSpacing: 0.2,
  });
  doc.font("Helvetica").fontSize(26).fillColor(COLORS.navy).text("OF COMPLETION", 0, 194, {
    width: CERTIFICATE_WIDTH,
    align: "center",
    characterSpacing: 1.2,
  });
  doc.restore();
};

const drawStudentIllustration = (doc) => {
  const x = 88;
  const y = 655;
  doc.save();

  // Hair/head.
  doc.fillColor(COLORS.black).ellipse(x + 92, y + 42, 39, 52).fill();
  doc.fillColor(COLORS.skin).ellipse(x + 93, y + 67, 28, 36).fill();
  doc.fillColor(COLORS.black).circle(x + 92, y + 26, 16).fill();

  // Body and arms.
  doc.fillColor(COLORS.navy).roundedRect(x + 55, y + 101, 76, 105, 17).fill();
  doc.fillColor(COLORS.react).moveTo(x + 56, y + 117).lineTo(x + 31, y + 177).lineTo(x + 57, y + 181).lineTo(x + 76, y + 138).closePath().fill();
  doc.fillColor(COLORS.react).moveTo(x + 130, y + 117).lineTo(x + 151, y + 179).lineTo(x + 127, y + 181).lineTo(x + 111, y + 138).closePath().fill();

  // Laptop.
  doc.fillColor("#171717").roundedRect(x + 9, y + 170, 148, 76, 8).fill();
  doc.fillColor(COLORS.navy).roundedRect(x + 20, y + 180, 126, 57, 4).fill();
  doc.fillColor(COLORS.paper).font("Helvetica-Bold").fontSize(9).text("APNA", x + 61, y + 200, { width: 45, align: "center" });
  doc.fillColor(COLORS.react).font("Helvetica-Bold").fontSize(6.5).text("COLLEGE", x + 55, y + 213, { width: 58, align: "center" });
  doc.restore();
};

const drawTechIcon = (doc, type, x, y) => {
  doc.save();
  if (type === "react") {
    doc.strokeColor(COLORS.react).lineWidth(2);
    doc.ellipse(x, y, 22, 8).stroke();
    doc.save();
    doc.rotate(60, { origin: [x, y] });
    doc.ellipse(x, y, 22, 8).stroke();
    doc.rotate(60, { origin: [x, y] });
    doc.ellipse(x, y, 22, 8).stroke();
    doc.restore();
    doc.circle(x, y, 3).fill(COLORS.react);
  } else if (type === "js") {
    doc.rect(x - 17, y - 17, 34, 34).fill(COLORS.js);
    doc.font("Helvetica-Bold").fontSize(16).fillColor(COLORS.black).text("JS", x - 17, y - 8, { width: 34, align: "center" });
  } else if (type === "node") {
    doc.font("Helvetica-Bold").fontSize(17).fillColor(COLORS.black).text("n", x - 25, y - 8, { continued: true });
    doc.fillColor(COLORS.green).text("ode");
  } else if (type === "mongo") {
    doc.fillColor(COLORS.mongo).ellipse(x, y + 2, 9, 19).fill();
    doc.fillColor(COLORS.mongo).ellipse(x, y - 14, 5, 11).fill();
  } else if (type === "css") {
    doc.fillColor(COLORS.css).polygon?.();
    doc.fillColor(COLORS.css).moveTo(x, y - 20).lineTo(x + 18, y - 14).lineTo(x + 15, y + 17).lineTo(x, y + 22).lineTo(x - 15, y + 17).lineTo(x - 18, y - 14).closePath().fill();
    doc.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.paper).text("3", x - 7, y - 5, { width: 14, align: "center" });
  } else if (type === "html") {
    doc.fillColor(COLORS.html).moveTo(x - 18, y - 18).lineTo(x + 18, y - 18).lineTo(x + 13, y + 19).lineTo(x, y + 24).lineTo(x - 13, y + 19).closePath().fill();
    doc.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.paper).text("5", x - 7, y - 5, { width: 14, align: "center" });
  }
  doc.restore();
};

const drawTechBadges = (doc) => {
  drawTechIcon(doc, "react", 165, 622);
  drawTechIcon(doc, "js", 255, 620);
  drawTechIcon(doc, "node", 91, 675);
  drawTechIcon(doc, "mongo", 90, 720);
  drawTechIcon(doc, "css", 325, 675);
  drawTechIcon(doc, "html", 325, 725);
};

const drawSignature = (doc) => {
  doc.save();
  doc.font("Helvetica-Oblique").fontSize(29).fillColor(COLORS.navy).text("Shradha Khapra", 785, 675, {
    width: 275,
    align: "center",
  });
  doc.moveTo(800, 722).lineTo(1045, 722).lineWidth(0.9).strokeColor(COLORS.navy).stroke();
  doc.font("Helvetica-Bold").fontSize(14).fillColor(COLORS.navy).text("CO-FOUNDER", 800, 737, {
    width: 245,
    align: "center",
  });
  doc.font("Helvetica-Bold").fontSize(13).fillColor(COLORS.navy).text("Shradha Khapra", 800, 758, {
    width: 245,
    align: "center",
  });
  doc.restore();
};

const drawDynamicText = (doc, { recipientName, courseTitle }) => {
  // White-out only the sample's dynamic text from the supplied reference layout.
  doc.save();
  doc.fillColor(COLORS.paper).rect(355, 315, 490, 72).fill();
  doc.fillColor(COLORS.paper).rect(365, 405, 470, 58).fill();

  const nameSize = String(recipientName).length > 30 ? 27 : 34;
  doc.font("Helvetica").fontSize(nameSize).fillColor(COLORS.black).text(recipientName, 320, 326, {
    width: 560,
    align: "center",
    ellipsis: true,
  });
  doc.moveTo(360, 374).lineTo(840, 374).lineWidth(1.2).strokeColor(COLORS.navy).stroke();

  doc.font("Helvetica").fontSize(17).fillColor(COLORS.muted).text("for successfully completing the course of", 0, 397, {
    width: CERTIFICATE_WIDTH,
    align: "center",
  });

  const title = String(courseTitle);
  const titleSize = title.length > 48 ? 14 : title.length > 34 ? 16 : 18;
  doc.font("Helvetica").fontSize(titleSize).fillColor(COLORS.navy).text(title, 310, 426, {
    width: 580,
    align: "center",
    ellipsis: true,
  });
  doc.restore();
};

const drawQrAndMetadata = (doc, { qrCodePath, certificateId, issueDate, verificationUrl }) => {
  // Deliberately reserved center-bottom zone. It does not overlap the illustration or signature.
  const qrX = 565;
  const qrY = 665;
  const qrSize = 82;

  if (qrCodePath && fs.existsSync(qrCodePath)) {
    doc.image(qrCodePath, qrX, qrY, {
      fit: [qrSize, qrSize],
      align: "center",
      valign: "center",
    });
  }

  doc.save();
  doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.muted).text("SCAN TO VERIFY", 548, 751, {
    width: 116,
    align: "center",
    characterSpacing: 0.7,
  });

  // Metadata stays below the scanner, so neither the QR nor the text collides with the artwork.
  doc.font("Helvetica-Bold").fontSize(7).fillColor(COLORS.muted).text("ISSUED ON", 505, 782, {
    width: 205,
    align: "center",
    characterSpacing: 1,
  });
  doc.font("Helvetica").fontSize(8).fillColor(COLORS.navy).text(formatDate(issueDate), 505, 797, {
    width: 205,
    align: "center",
  });
  doc.font("Helvetica-Bold").fontSize(7).fillColor(COLORS.muted).text("CERTIFICATE ID", 505, 817, {
    width: 205,
    align: "center",
    characterSpacing: 1,
  });
  doc.font("Helvetica").fontSize(6.5).fillColor(COLORS.navy).text(certificateId, 485, 831, {
    width: 245,
    align: "center",
    ellipsis: true,
  });
  if (verificationUrl) {
    doc.font("Helvetica").fontSize(4.5).fillColor("#7890a8").text(verificationUrl, 440, 849, {
      width: 320,
      align: "center",
      ellipsis: true,
    });
  }
  doc.restore();
};

export const generateCertificatePdf = async ({
  outputDirectory,
  certificateId,
  recipientName,
  courseTitle,
  issueDate,
  verificationUrl,
  qrCodePath = "",
}) => {
  if (!outputDirectory) throw new Error("Certificate output directory is required.");
  if (!certificateId) throw new Error("Certificate ID is required.");
  if (!recipientName) throw new Error("Certificate recipient name is required.");
  if (!courseTitle) throw new Error("Course title is required.");

  ensureDirectory(outputDirectory);
  const fileName = `${safeFileName(certificateId)}.pdf`;
  const outputPath = path.join(outputDirectory, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT],
      margin: 0,
      info: {
        Title: "Apna College Certificate of Completion",
        Author: "Apna College",
        Subject: `Certificate ${certificateId}`,
        Keywords: "Apna College, Certificate, Completion, Verification",
      },
    });

    const stream = fs.createWriteStream(outputPath);
    stream.on("finish", () => resolve({ fileName, filePath: outputPath }));
    stream.on("error", reject);
    doc.on("error", reject);
    doc.pipe(stream);

    doc.rect(0, 0, CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT).fill(COLORS.paper);
    drawLeftArtwork(doc);
    drawRibbon(doc);
    drawLogo(doc);
    drawHeading(doc);

    doc.font("Helvetica").fontSize(17).fillColor(COLORS.muted).text("This certificate is proudly presented to", 0, 281, {
      width: CERTIFICATE_WIDTH,
      align: "center",
    });

    // The reference has the name and course in this exact central hierarchy.
    drawDynamicText(doc, { recipientName, courseTitle });
    drawTechBadges(doc);
    drawStudentIllustration(doc);
    drawQrAndMetadata(doc, { qrCodePath, certificateId, issueDate, verificationUrl });
    drawSignature(doc);

    doc.end();
  });
};
