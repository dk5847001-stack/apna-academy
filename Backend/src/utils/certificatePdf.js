import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const CERTIFICATE_WIDTH = 1280;
const CERTIFICATE_HEIGHT = 720;

const COLORS = {
  paper: "#fffef8",
  navy: "#0d4d73",
  blue: "#1788c9",
  muted: "#5e788a",
  gold: "#d2bb59",
  goldLight: "#eee5bd",
  green: "#4f9d59",
  yellow: "#f5d516",
  orange: "#ef6a32",
  white: "#ffffff",
  black: "#111111",
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
  return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
};

const drawNetworkCluster = (doc, points, triangles = []) => {
  doc.save();
  doc.lineWidth(1.5).strokeColor(COLORS.navy);
  triangles.forEach(([a, b, c]) => {
    const p1 = points[a]; const p2 = points[b]; const p3 = points[c];
    if (!p1 || !p2 || !p3) return;
    doc.moveTo(p1[0], p1[1]).lineTo(p2[0], p2[1]).lineTo(p3[0], p3[1]).lineTo(p1[0], p1[1]).stroke();
  });
  doc.lineWidth(0.8).strokeColor("#7aa6bd");
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const [x1, y1] = points[i]; const [x2, y2] = points[j];
      if (Math.hypot(x2 - x1, y2 - y1) < 145) doc.moveTo(x1, y1).lineTo(x2, y2).stroke();
    }
  }
  points.forEach(([x, y], index) => doc.circle(x, y, index % 3 === 0 ? 3.2 : 2.2).fill(index % 3 === 0 ? COLORS.blue : COLORS.navy));
  doc.restore();
};

const drawCornerGraphics = (doc) => {
  drawNetworkCluster(doc,
    [[-10, 35], [58, 4], [115, 76], [190, 40], [245, 96], [208, 170], [105, 145], [52, 216], [-8, 184]],
    [[0, 1, 2], [1, 2, 3], [2, 3, 4], [2, 4, 5], [2, 5, 6], [5, 6, 7], [6, 7, 8], [0, 2, 8]]
  );
  drawNetworkCluster(doc,
    [[-5, 275], [48, 230], [102, 300], [171, 268], [225, 322], [168, 388], [86, 360], [20, 430], [-8, 382]],
    [[0, 1, 2], [1, 2, 3], [2, 3, 4], [2, 4, 5], [2, 5, 6], [5, 6, 7], [6, 7, 8], [0, 2, 8]]
  );
};

const drawGoldRibbon = (doc) => {
  doc.save();
  doc.rect(1178, 0, 54, 166).fill(COLORS.gold);
  doc.rect(1232, 0, 32, 166).fill(COLORS.goldLight);
  const medalX = 1205; const medalY = 145;
  doc.circle(medalX, medalY, 56).fill(COLORS.goldLight);
  doc.circle(medalX, medalY, 47).fill(COLORS.gold);
  doc.circle(medalX, medalY, 38).fill(COLORS.paper);
  doc.circle(medalX, medalY, 34).lineWidth(1.5).strokeColor(COLORS.navy).stroke();
  doc.font("Helvetica-Bold").fontSize(14).fillColor(COLORS.navy).text("★", medalX - 8, medalY - 26, { width: 16, align: "center" });
  doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.navy).text("APNA", medalX - 24, medalY - 5, { width: 48, align: "center" });
  doc.font("Helvetica").fontSize(7).fillColor(COLORS.navy).text("COLLEGE", medalX - 29, medalY + 8, { width: 58, align: "center" });
  doc.moveTo(1172, 190).lineTo(1192, 300).lineTo(1205, 275).lineTo(1220, 300).lineTo(1240, 190).closePath().fill(COLORS.gold);
  doc.moveTo(1185, 190).lineTo(1205, 305).lineTo(1225, 190).closePath().fill(COLORS.goldLight);
  doc.restore();
};

const drawLogo = (doc) => {
  const center = CERTIFICATE_WIDTH / 2;
  doc.save();
  doc.roundedRect(center - 116, 36, 62, 62, 15).fill(COLORS.blue);
  doc.fillColor(COLORS.white).moveTo(center - 104, 60).lineTo(center - 85, 49).lineTo(center - 66, 60).lineTo(center - 85, 71).closePath().fill();
  doc.rect(center - 82, 70, 14, 4).fill();
  doc.circle(center - 85, 79, 3).fill();
  doc.font("Helvetica-Bold").fontSize(30).fillColor(COLORS.navy).text("Apna", center - 43, 43, { continued: true });
  doc.fillColor(COLORS.blue).text("College");
  doc.font("Helvetica").fontSize(10).fillColor(COLORS.navy).text("Learn  •  Build  •  Achieve", center - 43, 79, { width: 210, align: "center", characterSpacing: 1.4 });
  doc.restore();
};

const drawTitle = (doc) => {
  const center = CERTIFICATE_WIDTH / 2;
  doc.save();
  doc.font("Helvetica-Bold").fontSize(58).fillColor(COLORS.navy).text("CERTIFICATE", 0, 125, { width: CERTIFICATE_WIDTH, align: "center", characterSpacing: 0.5 });
  doc.font("Helvetica").fontSize(27).fillColor(COLORS.navy).text("OF COMPLETION", 0, 190, { width: CERTIFICATE_WIDTH, align: "center", characterSpacing: 1.8 });
  doc.moveTo(center - 185, 235).lineTo(center + 185, 235).lineWidth(1).strokeColor(COLORS.navy).stroke();
  doc.circle(center, 235, 3).fill(COLORS.navy);
  doc.restore();
};

const drawStudentIllustration = (doc) => {
  const x = 112; const y = 505;
  doc.save();
  doc.fillColor(COLORS.black).ellipse(x + 90, y + 24, 43, 53).fill();
  doc.fillColor("#f4c6a4").ellipse(x + 91, y + 53, 31, 39).fill();
  doc.fillColor(COLORS.black).circle(x + 89, y + 13, 16).fill();
  doc.fillColor(COLORS.navy).roundedRect(x + 54, y + 91, 77, 105, 18).fill();
  doc.fillColor(COLORS.blue).moveTo(x + 54, y + 112).lineTo(x + 33, y + 171).lineTo(x + 58, y + 174).lineTo(x + 75, y + 132).closePath().fill();
  doc.fillColor(COLORS.blue).moveTo(x + 131, y + 112).lineTo(x + 151, y + 174).lineTo(x + 126, y + 176).lineTo(x + 110, y + 132).closePath().fill();
  doc.fillColor("#1f2937").roundedRect(x + 12, y + 161, 145, 78, 8).fill();
  doc.fillColor(COLORS.navy).roundedRect(x + 23, y + 170, 123, 58, 5).fill();
  doc.fillColor(COLORS.white).font("Helvetica-Bold").fontSize(10).text("APNA", x + 63, y + 192, { width: 45, align: "center" });
  doc.fillColor(COLORS.blue).font("Helvetica-Bold").fontSize(7).text("COLLEGE", x + 56, y + 206, { width: 64, align: "center" });
  doc.restore();
};

const drawTechBadges = (doc) => {
  const items = [
    { x: 130, y: 450, label: "⚛", color: "#2fb8ec", size: 26 },
    { x: 235, y: 437, label: "JS", color: COLORS.yellow, size: 13 },
    { x: 48, y: 530, label: "node", color: COLORS.green, size: 16 },
    { x: 292, y: 518, label: "3", color: "#2676c9", size: 22 },
  ];
  items.forEach((item) => {
    doc.save();
    if (item.label === "JS") {
      doc.rect(item.x, item.y, 38, 38).fill(item.color);
      doc.font("Helvetica-Bold").fontSize(19).fillColor(COLORS.black).text("JS", item.x, item.y + 9, { width: 38, align: "center" });
    } else if (item.label === "node") {
      doc.font("Helvetica-Bold").fontSize(item.size).fillColor(COLORS.black).text("n", item.x, item.y, { continued: true });
      doc.fillColor(COLORS.green).text("ode");
    } else {
      doc.font("Helvetica").fontSize(42).fillColor(item.color).text(item.label, item.x, item.y - 10, { width: 55, align: "center" });
    }
    doc.restore();
  });
};

const drawQrImage = (doc, qrCodePath) => {
  if (!qrCodePath || !fs.existsSync(qrCodePath)) return;
  doc.image(qrCodePath, 592, 548, { fit: [78, 78], align: "center", valign: "center" });
  doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.muted).text("SCAN TO VERIFY", 578, 632, { width: 106, align: "center", characterSpacing: 0.7 });
};

const drawSignature = (doc) => {
  doc.save();
  doc.font("Helvetica-Oblique").fontSize(25).fillColor(COLORS.navy).text("Shreela Kapoor", 855, 578, { width: 195, align: "center" });
  doc.moveTo(850, 617).lineTo(1055, 617).lineWidth(0.8).strokeColor(COLORS.navy).stroke();
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(COLORS.muted).text("AUTHORIZED SIGNATORY", 855, 630, { width: 195, align: "center", characterSpacing: 1.5 });
  doc.font("Helvetica").fontSize(8).fillColor(COLORS.muted).text("APNA COLLEGE", 855, 646, { width: 195, align: "center", characterSpacing: 2 });
  doc.restore();
};

const drawFooterMetadata = (doc, { certificateId, issueDate, verificationUrl }) => {
  doc.save();
  doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.muted).text("ISSUED ON", 470, 588, { width: 180, align: "center", characterSpacing: 1.2 });
  doc.font("Helvetica").fontSize(9).fillColor(COLORS.navy).text(formatDate(issueDate), 470, 606, { width: 180, align: "center" });
  doc.font("Helvetica-Bold").fontSize(8).fillColor(COLORS.muted).text("CERTIFICATE ID", 470, 635, { width: 180, align: "center", characterSpacing: 1.2 });
  doc.font("Helvetica").fontSize(7.5).fillColor(COLORS.navy).text(certificateId, 445, 653, { width: 230, align: "center" });
  doc.font("Helvetica").fontSize(5.8).fillColor("#91a5b2").text(verificationUrl || "Certificate verification available online", 430, 688, { width: 420, align: "center" });
  doc.restore();
};

export const generateCertificatePdf = async ({ outputDirectory, certificateId, recipientName, courseTitle, issueDate, verificationUrl, qrCodePath = "" }) => {
  if (!outputDirectory) throw new Error("Certificate output directory is required.");
  if (!certificateId) throw new Error("Certificate ID is required.");
  if (!recipientName) throw new Error("Certificate recipient name is required.");
  if (!courseTitle) throw new Error("Course title is required.");
  ensureDirectory(outputDirectory);
  const fileName = `${safeFileName(certificateId)}.pdf`;
  const outputPath = path.join(outputDirectory, fileName);
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT], margin: 0, info: { Title: "Apna College Certificate of Completion", Author: "Apna College", Subject: `Certificate ${certificateId}`, Keywords: "Apna College, Certificate, Completion, Verification" } });
    const stream = fs.createWriteStream(outputPath);
    stream.on("finish", () => resolve({ fileName, filePath: outputPath }));
    stream.on("error", reject);
    doc.on("error", reject);
    doc.pipe(stream);
    doc.rect(0, 0, CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT).fill(COLORS.paper);
    doc.save();
    doc.circle(650, 360, 330).fill("#f8fcfd");
    doc.circle(650, 360, 250).fill("#fbfdf9");
    doc.restore();
    drawCornerGraphics(doc);
    drawGoldRibbon(doc);
    drawLogo(doc);
    drawTitle(doc);
    doc.font("Helvetica").fontSize(17).fillColor(COLORS.muted).text("This certificate is proudly presented to", 0, 282, { width: CERTIFICATE_WIDTH, align: "center" });
    doc.font("Helvetica").fontSize(34).fillColor(COLORS.black).text(recipientName, 330, 323, { width: 620, align: "center" });
    doc.moveTo(360, 372).lineTo(920, 372).lineWidth(1.2).strokeColor(COLORS.navy).stroke();
    doc.font("Helvetica").fontSize(17).fillColor(COLORS.muted).text("for successfully completing the course of", 0, 397, { width: CERTIFICATE_WIDTH, align: "center" });
    const courseSize = String(courseTitle).length > 52 ? 19 : String(courseTitle).length > 35 ? 22 : 25;
    doc.font("Helvetica-Bold").fontSize(courseSize).fillColor(COLORS.navy).text(courseTitle, 300, 428, { width: 680, align: "center", lineGap: 3 });
    drawTechBadges(doc);
    drawStudentIllustration(doc);
    drawSignature(doc);
    drawFooterMetadata(doc, { certificateId, issueDate, verificationUrl });
    drawQrImage(doc, qrCodePath);
    doc.end();
  });
};
