import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const MyComponent: React.FC = () => {
  const componentRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!componentRef.current) return;
    
    const canvas = await html2canvas(componentRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    
    // Calculate dimensions to fit A4 page
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    
    pdf.save("download.pdf");
  };

  return (
    <div>
      <div ref={componentRef}>
        {/* Your component content here */}
        <h1>Hello PDF!</h1>
      </div>
      <button onClick={generatePDF}>Download PDF</button>
    </div>
  );
};

export default MyComponent;
