import { QRCodeSVG } from "qrcode.react";

interface qrCodeProps {
  information: string;
}

const QrcodeComponent = ({ information }: qrCodeProps) => {
  return <QRCodeSVG value={information} />;
};

export default QrcodeComponent;
