// AI Search Checker - Indicator Logic
// ฟังก์ชันสำหรับตรวจสอบความพร้อมของเว็บไซต์สำหรับ AI Search

export interface CheckResult {
  found: boolean;
  details?: string;
  count?: number;
}

// 1. ตรวจสอบไฟล์ robots.txt
export async function checkRobotsTxt(url: string): Promise<CheckResult> {
  try {
    const baseUrl = normalizeUrl(url);
    const robotsUrl = `${baseUrl}/robots.txt`;
    
    // ในโหมดจริงควร fetch จริง แต่ในตัวอย่างนี้จำลองผลลัพธ์
    // const response = await fetch(robotsUrl, { method: 'HEAD' });
    // return { found: response.ok };
    
    // จำลองผลลัพธ์ (สำหรับการพัฒนา)
    return { found: true, details: "พบไฟล์ robots.txt" };
  } catch (error) {
    return { found: false, details: "ไม่พบไฟล์ robots.txt" };
  }
}

// 2. ตรวจสอบไฟล์ llms.txt
export async function checkLlmsTxt(url: string): Promise<CheckResult> {
  try {
    const baseUrl = normalizeUrl(url);
    const llmsUrl = `${baseUrl}/llms.txt`;
    
    // ในโหมดจริงควร fetch จริง
    // const response = await fetch(llmsUrl, { method: 'HEAD' });
    // return { found: response.ok };
    
    // จำลองผลลัพธ์
    return { found: true, details: "พบไฟล์ llms.txt" };
  } catch (error) {
    return { found: false, details: "ไม่พบไฟล์ llms.txt" };
  }
}

// 3. ตรวจสอบ Schema JSON-LD
export async function checkSchemaJSONLD(url: string): Promise<CheckResult> {
  try {
    const baseUrl = normalizeUrl(url);
    
    // ในโหมดจริงควร fetch หน้าเว็บและ parse หา JSON-LD
    // const response = await fetch(baseUrl);
    // const html = await response.text();
    // const schemas = extractJSONLDSchemas(html);
    
    // จำลองผลลัพธ์ - พบ 4 ประเภท
    const mockSchemas = ["OnlineStore", "PostalAddress", "SearchAction", "WebSite"];
    
    return {
      found: true,
      count: mockSchemas.length,
      details: `พบ Schema JSON-LD ${mockSchemas.length} ประเภท`,
    };
  } catch (error) {
    return { found: false, details: "ไม่พบ Schema JSON-LD" };
  }
}

// 4. ตรวจสอบ Web API (ai-plugin.json)
export async function checkWebAPI(url: string): Promise<CheckResult> {
  try {
    const baseUrl = normalizeUrl(url);
    const apiUrl = `${baseUrl}/ai-plugin.json`;
    
    // จำลองผลลัพธ์ - ไม่พบ (ตามตัวอย่างในภาพ)
    return { found: false, details: "ไม่พบไฟล์ ai-plugin.json" };
  } catch (error) {
    return { found: false, details: "ไม่พบ Web API" };
  }
}

// 5. ตรวจสอบ Public GitHub Repository
export async function checkGitHubRepo(url: string): Promise<CheckResult> {
  // จำลองผลลัพธ์ - ไม่พบ (ตามตัวอย่างในภาพ)
  return { found: false, details: "ไม่พบ Public GitHub Repository" };
}

// 6. ตรวจสอบ Custom GPT Mention
export async function checkCustomGPT(url: string): Promise<CheckResult> {
  // จำลองผลลัพธ์ - ไม่พบ (ตามตัวอย่างในภาพ)
  return { found: false, details: "ไม่พบ Custom GPT Mention" };
}

// 7. ตรวจสอบ Wikidata Mention
export async function checkWikidata(url: string): Promise<CheckResult> {
  // จำลองผลลัพธ์ - ไม่พบ (ตามตัวอย่างในภาพ)
  return { found: false, details: "ไม่พบ Wikidata Mention" };
}

// 8. ตรวจสอบ Company Credential Data
export async function checkCompanyCredential(url: string): Promise<CheckResult> {
  // จำลองผลลัพธ์ - ไม่พบ (ตามตัวอย่างในภาพ)
  return { found: false, details: "ไม่พบ Company Credential Data" };
}

// ฟังก์ชันช่วย normalize URL
function normalizeUrl(url: string): string {
  let normalized = url.trim();
  
  // ลบ / ท้าย URL ถ้ามี
  normalized = normalized.replace(/\/$/, "");
  
  // เพิ่ม https:// ถ้าไม่มี protocol
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = `https://${normalized}`;
  }
  
  return normalized;
}

// ฟังก์ชันสำหรับดึง Schemas จาก HTML (สำหรับใช้จริงในอนาคต)
function extractJSONLDSchemas(html: string): string[] {
  const schemas: string[] = [];
  const regex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    try {
      const json = JSON.parse(match[1]);
      if (json["@type"]) {
        schemas.push(json["@type"]);
      }
    } catch (e) {
      // ข้ามถ้า parse ไม่ได้
    }
  }
  
  return schemas;
}

// ฟังก์ชันหลักสำหรับรันทุกการตรวจสอบ
export async function runAllChecks(url: string) {
  const [
    robotsTxt,
    llmsTxt,
    schema,
    webAPI,
    githubRepo,
    customGPT,
    wikidata,
    companyCredential,
  ] = await Promise.all([
    checkRobotsTxt(url),
    checkLlmsTxt(url),
    checkSchemaJSONLD(url),
    checkWebAPI(url),
    checkGitHubRepo(url),
    checkCustomGPT(url),
    checkWikidata(url),
    checkCompanyCredential(url),
  ]);

  return {
    robotsTxt,
    llmsTxt,
    schema,
    webAPI,
    githubRepo,
    customGPT,
    wikidata,
    companyCredential,
  };
}

// ฟังก์ชันคำนวณคะแนนรวม
export function calculateScore(results: Record<string, CheckResult>): number {
  const weights: Record<string, number> = {
    robotsTxt: 15,
    llmsTxt: 15,
    schema: 25,
    webAPI: 10,
    githubRepo: 5,
    customGPT: 10,
    wikidata: 10,
    companyCredential: 10,
  };

  let totalScore = 0;
  let maxScore = 0;

  for (const [key, result] of Object.entries(results)) {
    const weight = weights[key] || 10;
    maxScore += weight;
    
    if (result.found) {
      totalScore += weight;
      // Bonus สำหรับ schema ที่มี count มาก
      if (key === "schema" && result.count && result.count > 4) {
        totalScore += Math.min((result.count - 4) * 2, 10); // โบนัสสูงสุด 10 คะแนน
      }
    }
  }

  return Math.round((totalScore / maxScore) * 100);
}
