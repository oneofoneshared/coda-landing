import {
  AlertTriangle,
  CheckCircle,
  Download,
  FileText,
  Loader,
  Upload,
  X,
} from "lucide-react";
import React, { useState } from "react";

// Type definitions
interface UploadedFile {
  file: File;
  id: number;
  name: string;
  size: number;
  type: string;
}

interface ContainerInfo {
  number: string;
  seal: string;
  size: string;
  vessel: string;
  voyage: string;
}

interface RoutingInfo {
  pol: string;
  pod: string;
  carrier: string;
}

interface HBLInfo {
  hbl: string;
  shipper: string;
  consignee: string;
  commodity: string;
  pieces: { count: number; type: string };
  weight: { value: number; uom: string };
  volume: { value: number; uom: string };
  marks: string;
}

interface ExtractedData {
  container: ContainerInfo;
  routing: RoutingInfo;
  hbls: HBLInfo[];
  sourceFiles: string[];
}

const App = () => {
  const [step, setStep] = useState<
    "upload" | "processing" | "review" | "output"
  >("upload");
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null
  );
  const [xmlOutput, setXmlOutput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Sample extracted data structure (used for demo purposes)
  const sampleExtractedData: ExtractedData = {
    container: {
      number: "BMOU5520012",
      seal: "CV770708",
      size: "40HC",
      vessel: "COSCO HARMONY",
      voyage: "081E",
    },
    routing: {
      pol: "SHANGHAI",
      pod: "NEW YORK",
      carrier: "COSCO",
    },
    hbls: [
      {
        hbl: "FPSMFSH25009603",
        shipper: "HENAN CANCHE INDUSTRY CO., LTD.",
        consignee: "JEVONI",
        commodity: "KIOSK",
        pieces: { count: 1, type: "CARTONS" },
        weight: { value: 650.0, uom: "KGM" },
        volume: { value: 20.5, uom: "CBM" },
        marks: "HENAN CANCHE",
      },
      {
        hbl: "FPSMFSH25009673",
        shipper: "GLC OCEAN LINES LIMITED",
        consignee: "NIPPON EXPRESS U.S.A.,INC.",
        commodity: "BALL BEARING",
        pieces: { count: 14, type: "CARTONS" },
        weight: { value: 188.0, uom: "KGM" },
        volume: { value: 0.243, uom: "CBM" },
        marks: "AST NEW YORK NO.1-1",
      },
      {
        hbl: "FPSMFSH25009678",
        shipper: "WILDER INTERNATIONAL LOGISTICS(CHINA)CO.,LTD",
        consignee: "AMERASIA LINE INC.",
        commodity: "PLASTIC BAG",
        pieces: { count: 99, type: "CARTONS" },
        weight: { value: 1016.8, uom: "KGM" },
        volume: { value: 3.0, uom: "CBM" },
        marks: "N/M (2PALLETS)",
      },
    ],
    sourceFiles: [],
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const pdfFiles = files.filter((file) => file.type === "application/pdf");
    if (pdfFiles.length !== files.length) {
      alert("Please only upload PDF files.");
      return;
    }

    const newFiles: UploadedFile[] = pdfFiles.map((file) => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: number) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const generateXML = (data: ExtractedData) => {
    const currentDate = new Date().toISOString();
    const messageId = `${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Calculate totals
    const totalPieces = data.hbls.reduce(
      (sum: number, hbl: HBLInfo) => sum + hbl.pieces.count,
      0
    );
    const totalWeight = data.hbls.reduce(
      (sum: number, hbl: HBLInfo) => sum + hbl.weight.value,
      0
    );
    const totalVolume = data.hbls.reduce(
      (sum: number, hbl: HBLInfo) => sum + hbl.volume.value,
      0
    );

    return `<?xml version="1.0" encoding="UTF-8"?>
<Message>
  <ID>${messageId}</ID>
  <SenderID>PLACEHOLDER001</SenderID>
  <ReceiverID>CODA</ReceiverID>
  <Date>${currentDate}</Date>
  <Type>Manifest</Type>
  <Version>2.0</Version>
  <Test>Yes</Test>
  
  <File>
    <Service>
      <Type>ImportCFS</Type>
      <Contact>
        <Name>AI Generated Contact</Name>
        <Email>contact@example.com</Email>
        <Telephone>1234567890</Telephone>
      </Contact>
    </Service>
    
    <ReferenceNo Type="Sender">AUTO-GEN-${Date.now()}</ReferenceNo>
    
    <Unit Type="ISO">
      <Number>${data.container.number}</Number>
      <Size Type="ISO">45G0</Size>
      <Description>40 Foot High Cube Dry Container</Description>
      <SealNo>${data.container.seal}</SealNo>
      <Date Type="COB"/>
    </Unit>
    
    <Transportation Mode="Ocean">
      <Carrier>
        <Name>${data.routing.carrier}</Name>
        <Code Type="SCAC">COSU</Code>
        <ReferenceNo>${data.container.voyage}</ReferenceNo>
      </Carrier>
      <Vessel>
        <Name>${data.container.vessel}</Name>
        <IMO>9555125</IMO>
        <MMSI>563187400</MMSI>
        <Callsign>9V7410</Callsign>
      </Vessel>
      <Routing>
        <Location Type="POL">
          <Code Type="UN">CNSHA</Code>
          <Name>${data.routing.pol}</Name>
          <Date Type="STD">2025-06-01</Date>
          <Date Type="ATD">2025-06-01</Date>
        </Location>
        <Location Type="POD">
          <Code Type="UN">USNYC</Code>
          <Name>${data.routing.pod}</Name>
          <Date Type="STA">2025-06-26</Date>
          <Date Type="ETA">2025-06-26</Date>
          <Date Type="ATA"/>
        </Location>
        <Location Type="FD">
          <Code Type="UN">USNYC</Code>
          <Name>${data.routing.pod}</Name>
          <Date Type="STA">2025-06-26</Date>
          <Date Type="ETA">2025-06-26</Date>
          <Date Type="ATA"/>
          <Pier>
            <Code Type="FIRMS">N775</Code>
            <Name>APM</Name>
          </Pier>
        </Location>
      </Routing>
    </Transportation>
    
    <Warehouse>
      <Code Type="FIRMS">EAY8</Code>
      <Name>CODA Logistics</Name>
    </Warehouse>
    
    <Commodity>FAK</Commodity>
    <Pallets>0</Pallets>
    <Pieces>
      <Code Type="UN">CT</Code>
      <Count>${totalPieces}</Count>
    </Pieces>
    <Volume UOM="CBM">${totalVolume.toFixed(3)}</Volume>
    <Weight UOM="KGM">${totalWeight.toFixed(3)}</Weight>
    
    <Lots>
${data.hbls
  .map(
    (hbl, index) => `      <Lot>
        <ReferenceNo Type="Sender">SENDER-${index + 1}</ReferenceNo>
        <ReferenceNo Type="MBL">${data.container.number}</ReferenceNo>
        <ReferenceNo Type="HBL">${hbl.hbl}</ReferenceNo>
        <ReferenceNo Type="AMSHBL">${hbl.hbl}N</ReferenceNo>
        <PaymentTerms/>
        <HeadLoad>No</HeadLoad>
        <Pallets>0</Pallets>
        <Pieces>
          <Code Type="UN">CT</Code>
          <Count>${hbl.pieces.count}</Count>
        </Pieces>
        <Volume UOM="${hbl.volume.uom}">${hbl.volume.value}</Volume>
        <Weight UOM="${hbl.weight.uom}">${hbl.weight.value}</Weight>
        <MarksAndNos>${hbl.marks}</MarksAndNos>
        <Commodity>${hbl.commodity}</Commodity>
        <Instructions/>
        <FreightRelease>
          <Release>No</Release>
        </FreightRelease>
        <Customs/>
        <Parties>
          <Party Type="Shipper">
            <Name>${hbl.shipper}</Name>
            <Address/>
            <Contact/>
          </Party>
          <Party Type="Consignee">
            <Name>${hbl.consignee}</Name>
            <Address/>
            <Contact/>
          </Party>
        </Parties>
        <Routing>
          <Location Type="FD">
            <Code Type="UN">USNYC</Code>
            <Name>NEW YORK</Name>
          </Location>
        </Routing>
      </Lot>`
  )
  .join("\n")}
    </Lots>
  </File>
</Message>`;
  };

  const simulateAIProcessing = async () => {
    if (uploadedFiles.length === 0) {
      alert("Please upload at least one PDF file before processing.");
      return;
    }

    setStep("processing");

    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // In a real implementation, this would process the uploaded files
    // For now, we'll use the sample data but show the uploaded file names
    const processedData = {
      ...sampleExtractedData,
      sourceFiles: uploadedFiles.map((f) => f.name),
    };

    setExtractedData(processedData);
    setStep("review");
  };

  const generateEDIXML = () => {
    if (!extractedData) return;
    const xml = generateXML(extractedData);
    setXmlOutput(xml);
    setStep("output");
  };

  const downloadXML = () => {
    if (!extractedData) return;
    const blob = new Blob([xmlOutput], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `manifest-${extractedData.container.number}-${Date.now()}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetProcess = () => {
    setStep("upload");
    setExtractedData(null);
    setXmlOutput("");
    setUploadedFiles([]);
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload size={48} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">Upload PDF Manifests</h3>
        <p className="text-gray-600 mb-4">
          Drag and drop your PDF files here, or click to select files
        </p>
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block"
        >
          Select PDF Files
        </label>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">
            Uploaded Files ({uploadedFiles.length})
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between bg-white p-3 rounded border"
              >
                <div className="flex items-center space-x-3">
                  <FileText size={20} className="text-red-600" />
                  <div>
                    <div className="font-medium text-sm">{file.name}</div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="text-center">
          <button
            onClick={simulateAIProcessing}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Process {uploadedFiles.length} File
            {uploadedFiles.length !== 1 ? "s" : ""}
          </button>
        </div>
      )}

      <div className="text-sm text-gray-500">
        <p>
          <strong>Expected Documents:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Master Manifest PDF (container level)</li>
          <li>Individual House Bill PDFs (shipment level)</li>
          <li>Optional: Hazardous documentation</li>
        </ul>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="text-center space-y-6">
      <Loader size={48} className="mx-auto animate-spin text-blue-600" />
      <h3 className="text-lg font-semibold">
        Processing {uploadedFiles.length} Document
        {uploadedFiles.length !== 1 ? "s" : ""}...
      </h3>
      <div className="space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle size={20} className="text-green-600" />
          <span>Extracting container information</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle size={20} className="text-green-600" />
          <span>Processing vessel and routing data</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <Loader size={20} className="animate-spin text-blue-600" />
          <span>Analyzing house bills of lading...</span>
        </div>
      </div>
      <div className="text-sm text-gray-500">
        <p>Processing files: {uploadedFiles.map((f) => f.name).join(", ")}</p>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center">
        <CheckCircle className="text-green-600 mr-2" />
        Extraction Complete - Review Data
      </h3>

      {extractedData && extractedData.sourceFiles && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Source Files Processed</h4>
          <div className="text-sm text-blue-700">
            {extractedData.sourceFiles.join(", ")}
          </div>
        </div>
      )}

      {extractedData && (
        <>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Container Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Container:</strong> {extractedData.container.number}
              </div>
              <div>
                <strong>Seal:</strong> {extractedData.container.seal}
              </div>
              <div>
                <strong>Vessel:</strong> {extractedData.container.vessel}
              </div>
              <div>
                <strong>Voyage:</strong> {extractedData.container.voyage}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">
              House Bills ({extractedData.hbls.length})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {extractedData.hbls.map((hbl, index) => (
                <div
                  key={index}
                  className="bg-white p-3 rounded border text-sm"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <strong>HBL:</strong> {hbl.hbl}
                    </div>
                    <div>
                      <strong>Commodity:</strong> {hbl.commodity}
                    </div>
                    <div>
                      <strong>Pieces:</strong> {hbl.pieces.count}{" "}
                      {hbl.pieces.type}
                    </div>
                    <div>
                      <strong>Weight:</strong> {hbl.weight.value}{" "}
                      {hbl.weight.uom}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex space-x-4">
        <button
          onClick={generateEDIXML}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          Generate CFS Import Manifest XML
        </button>
        <button
          onClick={resetProcess}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  );

  const renderOutputStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center">
        <CheckCircle className="text-green-600 mr-2" />
        CFS Import Manifest Generated
      </h3>

      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-96 overflow-y-auto">
        <pre>{xmlOutput}</pre>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={downloadXML}
          className="flex items-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download size={20} />
          <span>Download XML</span>
        </button>
        <button
          onClick={resetProcess}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Process Another Manifest
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertTriangle
            className="text-yellow-600 flex-shrink-0 mt-0.5"
            size={20}
          />
          <div className="text-sm">
            <p className="font-semibold text-yellow-800">
              Next Steps for Logiware Integration:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-yellow-700">
              <li>Validate XML against CODA EDI XSD schema</li>
              <li>Submit via SFTP/FTP to CODA systems</li>
              <li>Monitor for CFS Status responses</li>
              <li>Handle freight release workflows</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          PDF to CFS Import Manifest Converter
        </h1>
        <p className="text-gray-600">
          AI-powered document processing:{" "}
          <strong>PDFs → AI IDP → CFS Import Manifest (XML) → Logiware</strong>
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          {["Upload", "Process", "Review", "Generate"].map(
            (stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    ["upload", "processing", "review", "output"][index] ===
                      step ||
                    (["processing", "review", "output"].includes(step) &&
                      index <
                        ["upload", "processing", "review", "output"].indexOf(
                          step
                        ))
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`ml-2 text-sm ${
                    ["upload", "processing", "review", "output"][index] === step
                      ? "text-blue-600 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {stepName}
                </span>
                {index < 3 && <div className="w-16 h-0.5 bg-gray-300 ml-4" />}
              </div>
            )
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {step === "upload" && renderUploadStep()}
        {step === "processing" && renderProcessingStep()}
        {step === "review" && renderReviewStep()}
        {step === "output" && renderOutputStep()}
      </div>

      <div className="mt-6 text-xs text-gray-500">
        <p>
          <strong>Technical Details:</strong> This prototype demonstrates the AI
          IDP workflow with real file upload capability. In production, this
          would integrate with document processing APIs (Azure Document
          Intelligence, AWS Textract) for OCR and data extraction from the
          uploaded PDF files. Currently uses sample data for demonstration
          purposes.
        </p>
      </div>
    </div>
  );
};

export default App;
