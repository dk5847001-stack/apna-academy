import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const CERTIFICATE_WIDTH = 842;
const CERTIFICATE_HEIGHT = 595;

const ensureDirectory = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, {
      recursive: true,
    });
  }
};

const safeFileName = (value) => {
  return String(value || "certificate")
    .trim()
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
};

const formatDate = (date) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
};

const drawBorder = (doc) => {
  const margin = 24;

  doc
    .lineWidth(2)
    .strokeColor("#1d4ed8")
    .rect(
      margin,
      margin,
      CERTIFICATE_WIDTH - margin * 2,
      CERTIFICATE_HEIGHT - margin * 2
    )
    .stroke();

  doc
    .lineWidth(0.8)
    .strokeColor("#93c5fd")
    .rect(
      margin + 10,
      margin + 10,
      CERTIFICATE_WIDTH - (margin + 10) * 2,
      CERTIFICATE_HEIGHT - (margin + 10) * 2
    )
    .stroke();
};

const drawSeal = (doc, x, y) => {
  doc
    .save()
    .circle(x, y, 38)
    .lineWidth(2)
    .strokeColor("#1d4ed8")
    .stroke();

  doc
    .circle(x, y, 29)
    .lineWidth(1)
    .strokeColor("#60a5fa")
    .stroke();

  doc
    .fontSize(10)
    .fillColor("#1d4ed8")
    .font("Helvetica-Bold")
    .text(
      "APNA",
      x - 22,
      y - 7,
      {
        width: 44,
        align: "center",
      }
    );

  doc
    .fontSize(7)
    .font("Helvetica")
    .text(
      "ACADEMY",
      x - 25,
      y + 5,
      {
        width: 50,
        align: "center",
      }
    );

  doc.restore();
};

const drawQrImage = (
  doc,
  qrCodePath,
  x,
  y,
  size
) => {
  if (
    !qrCodePath ||
    !fs.existsSync(qrCodePath)
  ) {
    return;
  }

  doc.image(
    qrCodePath,
    x,
    y,
    {
      fit: [size, size],
      align: "center",
      valign: "center",
    }
  );
};

/* =========================================================
   GENERATE CERTIFICATE PDF
========================================================= */

export const generateCertificatePdf = async ({
  outputDirectory,
  certificateId,
  recipientName,
  courseTitle,
  issueDate,
  verificationUrl,
  qrCodePath = "",
}) => {
  if (!outputDirectory) {
    throw new Error(
      "Certificate output directory is required."
    );
  }

  if (!certificateId) {
    throw new Error(
      "Certificate ID is required."
    );
  }

  if (!recipientName) {
    throw new Error(
      "Certificate recipient name is required."
    );
  }

  if (!courseTitle) {
    throw new Error(
      "Course title is required."
    );
  }

  ensureDirectory(outputDirectory);

  const fileName = `${safeFileName(
    certificateId
  )}.pdf`;

  const outputPath = path.join(
    outputDirectory,
    fileName
  );

  const verificationText =
    verificationUrl ||
    "Certificate verification available online";

  return new Promise(
    (resolve, reject) => {
      const doc = new PDFDocument({
        size: [
          CERTIFICATE_WIDTH,
          CERTIFICATE_HEIGHT,
        ],
        margin: 0,
        info: {
          Title:
            "ApnaAcademy Certificate",
          Author:
            "ApnaAcademy",
          Subject:
            `Certificate ${certificateId}`,
          Keywords:
            "ApnaAcademy, Certificate, Verification",
        },
      });

      const stream =
        fs.createWriteStream(
          outputPath
        );

      stream.on(
        "finish",
        () => {
          resolve({
            fileName,
            filePath: outputPath,
          });
        }
      );

      stream.on(
        "error",
        (error) => {
          reject(error);
        }
      );

      doc.on(
        "error",
        (error) => {
          reject(error);
        }
      );

      doc.pipe(stream);

      /* =====================================================
         BACKGROUND
      ===================================================== */

      doc
        .rect(
          0,
          0,
          CERTIFICATE_WIDTH,
          CERTIFICATE_HEIGHT
        )
        .fill("#ffffff");

      /* =====================================================
         BORDER
      ===================================================== */

      drawBorder(doc);

      /* =====================================================
         HEADER
      ===================================================== */

      doc
        .font("Helvetica-Bold")
        .fontSize(30)
        .fillColor("#0f172a")
        .text(
          "APNAACADEMY",
          0,
          78,
          {
            width: CERTIFICATE_WIDTH,
            align: "center",
          }
        );

      doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor("#64748b")
        .text(
          "CERTIFICATE OF COMPLETION",
          0,
          116,
          {
            width: CERTIFICATE_WIDTH,
            align: "center",
            characterSpacing: 2,
          }
        );

      /* =====================================================
         INTRO
      ===================================================== */

      doc
        .font("Helvetica")
        .fontSize(13)
        .fillColor("#475569")
        .text(
          "This certificate is proudly presented to",
          0,
          165,
          {
            width: CERTIFICATE_WIDTH,
            align: "center",
          }
        );

      /* =====================================================
         RECIPIENT
      ===================================================== */

      doc
        .font("Helvetica-Bold")
        .fontSize(34)
        .fillColor("#1d4ed8")
        .text(
          recipientName,
          80,
          195,
          {
            width: CERTIFICATE_WIDTH - 160,
            align: "center",
          }
        );

      doc
        .moveTo(205, 245)
        .lineTo(637, 245)
        .lineWidth(1)
        .strokeColor("#bfdbfe")
        .stroke();

      /* =====================================================
         COURSE TEXT
      ===================================================== */

      doc
        .font("Helvetica")
        .fontSize(13)
        .fillColor("#475569")
        .text(
          "for successfully completing the course",
          0,
          270,
          {
            width: CERTIFICATE_WIDTH,
            align: "center",
          }
        );

      doc
        .font("Helvetica-Bold")
        .fontSize(22)
        .fillColor("#0f172a")
        .text(
          courseTitle,
          90,
          302,
          {
            width: CERTIFICATE_WIDTH - 180,
            align: "center",
          }
        );

      /* =====================================================
         COMPLETION STATEMENT
      ===================================================== */

      doc
        .font("Helvetica")
        .fontSize(10.5)
        .fillColor("#64748b")
        .text(
          "This certificate recognizes successful completion of the required learning program.",
          90,
          350,
          {
            width: CERTIFICATE_WIDTH - 180,
            align: "center",
          }
        );

      /* =====================================================
         ISSUE DATE
      ===================================================== */

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#334155")
        .text(
          "ISSUED ON",
          100,
          405,
          {
            width: 150,
            align: "center",
          }
        );

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#64748b")
        .text(
          formatDate(issueDate),
          100,
          423,
          {
            width: 150,
            align: "center",
          }
        );

      /* =====================================================
         CERTIFICATE ID
      ===================================================== */

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#334155")
        .text(
          "CERTIFICATE ID",
          346,
          405,
          {
            width: 150,
            align: "center",
          }
        );

      doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor("#64748b")
        .text(
          certificateId,
          300,
          423,
          {
            width: 240,
            align: "center",
          }
        );

      /* =====================================================
         VERIFICATION / QR
      ===================================================== */

      drawQrImage(
        doc,
        qrCodePath,
        665,
        385,
        75
      );

      doc
        .font("Helvetica-Bold")
        .fontSize(7)
        .fillColor("#334155")
        .text(
          "SCAN TO VERIFY",
          655,
          466,
          {
            width: 95,
            align: "center",
          }
        );

      /* =====================================================
         SEAL
      ===================================================== */

      drawSeal(
        doc,
        421,
        470
      );

      /* =====================================================
         VERIFICATION URL
      ===================================================== */

      doc
        .font("Helvetica")
        .fontSize(6.5)
        .fillColor("#94a3b8")
        .text(
          verificationText,
          90,
          515,
          {
            width: 565,
            align: "center",
          }
        );

      /* =====================================================
         FOOTER
      ===================================================== */

      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor("#64748b")
        .text(
          "ApnaAcademy • Learn. Build. Achieve.",
          0,
          548,
          {
            width: CERTIFICATE_WIDTH,
            align: "center",
          }
        );

      doc.end();
    }
  );
};