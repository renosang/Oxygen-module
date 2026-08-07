import { useState, useCallback, useEffect } from 'react';

// Extend window object to include ksu
declare global {
  interface Window {
    ksu?: {
      exec: (cmd: string) => Promise<string | { errno: number; stdout: string; stderr: string; out?: string; err?: string }>;
    };
    logMsg?: (msg: string, type?: 'info' | 'cmd' | 'success' | 'error') => void;
  }
}

export interface ExecResult {
  errno: number;
  stdout: string;
  stderr: string;
}

export function useKsu() {
  const [apiName, setApiName] = useState<string>("Unknown");
  const [hasRoot, setHasRoot] = useState<boolean>(false);

  useEffect(() => {
    const initAPI = async () => {
      if (window.ksu && typeof window.ksu.exec === 'function') {
        setApiName("KernelSU<br>WebUI API");
        setHasRoot(true);
      } else {
        setApiName("Not Detected");
        setHasRoot(false);
      }
    };
    initAPI();
  }, []);

  const exec = useCallback(async (cmd: string): Promise<ExecResult> => {
    return new Promise(async (resolve) => {
      if (!window.ksu || typeof window.ksu.exec !== 'function') {
        return resolve({ errno: -1, stdout: "", stderr: "Mất kết nối API Manager" });
      }
      try {
        let rawRes = await window.ksu.exec(cmd);
        let res: any = rawRes;
        if (typeof rawRes === 'string') {
          try { 
            res = JSON.parse(rawRes); 
          } catch (e) { 
            return resolve({ errno: 0, stdout: rawRes, stderr: "" }); 
          }
        }
        
        // Handle parsed JSON or raw object
        const parsedRes = res as any;
        resolve({
          errno: parsedRes.errno !== undefined ? Number(parsedRes.errno) : 0,
          stdout: parsedRes.stdout || parsedRes.out || "",
          stderr: parsedRes.stderr || parsedRes.err || ""
        });
      } catch (error: any) {
        resolve({ errno: -1, stdout: "", stderr: "Lỗi: " + error.toString() });
      }
    });
  }, []);

  const runShell = useCallback(async (cmd: string, timeoutMs: number = 15000): Promise<ExecResult> => {
    if (window.logMsg) {
      window.logMsg(`> Đang chạy: ${cmd}`, 'cmd');
    }
    
    const timeoutPromise = new Promise<ExecResult>((_, reject) => 
      setTimeout(() => reject(new Error("Timeout " + timeoutMs + "ms")), timeoutMs)
    );

    try {
      const result = await Promise.race([exec(cmd), timeoutPromise]);
      return result;
    } catch (error: any) {
      if (window.logMsg) {
        window.logMsg(`  └─ THẤT BẠI: ${error.message}`, 'error');
      }
      return { errno: -1, stdout: "", stderr: error.message };
    }
  }, [exec]);

  const openExternalLink = useCallback(async (url: string) => {
    if (window.logMsg) {
      window.logMsg(`Đang mở link: ${url}`);
    }
    let res = await runShell(`am start -a android.intent.action.VIEW -d "${url}"`);
    if (res.errno !== 0) {
      window.open(url, '_blank');
    }
  }, [runShell]);

  return {
    apiName,
    hasRoot,
    exec,
    runShell,
    openExternalLink
  };
}
