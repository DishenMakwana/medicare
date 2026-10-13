import { execFile } from "child_process";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import { ExtractedReportResult } from "@/types";

const execFileAsync = promisify(execFile);

export async function runPythonExtraction(
  imagePath: string,
  outputDir?: string,
): Promise<ExtractedReportResult> {
  const rootDir = process.cwd();
  // Construct path dynamically so bundlers do not treat .venv as bundled asset
  const venvDir = [rootDir, ".v" + "env", "bin", "python3"].join(path.sep);
  const pythonPath =
    process.env.PYTHON_PATH || (fs.existsSync(venvDir) ? venvDir : "python3");
  const scriptPath = path.join(rootDir, "scripts", "extract_report.py");

  try {
    const args = [scriptPath, imagePath];
    if (outputDir) {
      args.push(outputDir);
    }

    const { stdout, stderr } = await execFileAsync(pythonPath, args, {
      timeout: 45000,
      maxBuffer: 15 * 1024 * 1024,
    });

    if (stderr && stderr.trim().length > 0) {
      console.warn("Python extractor stderr warning:", stderr);
    }

    const parsed = JSON.parse(stdout);
    if (parsed.error) {
      throw new Error(parsed.error);
    }

    return parsed as ExtractedReportResult;
  } catch (error: any) {
    console.error("Python extraction failed:", error);
    return {
      raw_patient_name: "",
      clean_patient_name: "",
      age: null,
      gender: null,
      lab_name: "",
      registration_no: "",
      report_date: null,
      collection_date: null,
      raw_text: "",
      parameters: [],
      unparsed_lines: [],
      extraction_quality: "EMPTY",
    };
  }
}
