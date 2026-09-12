import fs from "fs";
import path from "path";
import QRCode from "qrcode";

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

/* =========================================================
   GENERATE CERTIFICATE QR CODE
========================================================= */

export const generateCertificateQr = async ({
  outputDirectory,
  certificateId,
  verificationUrl,
}) => {
  if (!outputDirectory) {
    throw new Error(
      "QR output directory is required."
    );
  }

  if (!certificateId) {
    throw new Error(
      "Certificate ID is required."
    );
  }

  if (!verificationUrl) {
    throw new Error(
      "Certificate verification URL is required."
    );
  }

  ensureDirectory(outputDirectory);

  const fileName = `${safeFileName(
    certificateId
  )}-qr.png`;

  const outputPath = path.join(
    outputDirectory,
    fileName
  );

  await QRCode.toFile(
    outputPath,
    verificationUrl,
    {
      type: "png",
      width: 500,
      margin: 2,
      errorCorrectionLevel: "H",
    }
  );

  return {
    fileName,
    filePath: outputPath,
  };
};