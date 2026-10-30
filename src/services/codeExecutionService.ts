import { execFile } from 'child_process';
import vm from 'vm';

export interface CodeExecutionResult {
  language: 'python' | 'javascript';
  success: boolean;
  stdout: string;
  stderr?: string;
  executionTimeMs: number;
}

export class CodeExecutionService {
  /**
   * Executes Python code safely via python3 process with strict timeout
   */
  public async executePython(code: string, timeoutMs: number = 2500): Promise<CodeExecutionResult> {
    const startTime = Date.now();

    // Prevent hazardous system operations
    const blockedKeywords = [
      'rm -rf',
      'shutil.rmtree',
      'os.system',
      'subprocess.Popen',
      'os.remove',
      'sys.exit'
    ];
    for (const kw of blockedKeywords) {
      if (code.includes(kw)) {
        return {
          language: 'python',
          success: false,
          stdout: '',
          stderr: `Execution blocked: ${kw} is restricted in educational sandbox.`,
          executionTimeMs: Date.now() - startTime
        };
      }
    }

    return new Promise((resolve) => {
      const child = execFile(
        'python3',
        ['-c', code],
        { timeout: timeoutMs, maxBuffer: 1024 * 1024 },
        (error, stdout, stderr) => {
          const duration = Date.now() - startTime;
          if (error) {
            resolve({
              language: 'python',
              success: false,
              stdout: stdout ? stdout.trim() : '',
              stderr: (stderr || error.message || 'Execution error').trim(),
              executionTimeMs: duration
            });
          } else {
            resolve({
              language: 'python',
              success: true,
              stdout: stdout ? stdout.trim() : '(No output returned)',
              executionTimeMs: duration
            });
          }
        }
      );
    });
  }

  /**
   * Executes JavaScript code in an isolated Node vm context
   */
  public async executeJavaScript(code: string, timeoutMs: number = 2000): Promise<CodeExecutionResult> {
    const startTime = Date.now();
    const logs: string[] = [];

    const sandbox = {
      console: {
        log: (...args: any[]) => logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
        error: (...args: any[]) => logs.push('[ERROR] ' + args.join(' ')),
        warn: (...args: any[]) => logs.push('[WARN] ' + args.join(' '))
      },
      Math,
      Date,
      parseInt,
      parseFloat,
      Array,
      Object,
      String,
      Number,
      Boolean,
      JSON
    };

    try {
      const script = new vm.Script(code);
      const context = vm.createContext(sandbox);
      const result = script.runInContext(context, { timeout: timeoutMs });

      let output = logs.join('\n');
      if (!output && result !== undefined) {
        output = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
      }

      return {
        language: 'javascript',
        success: true,
        stdout: output || '(Code executed with no output)',
        executionTimeMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        language: 'javascript',
        success: false,
        stdout: logs.join('\n'),
        stderr: err?.message || 'JavaScript runtime evaluation error',
        executionTimeMs: Date.now() - startTime
      };
    }
  }

  /**
   * Automatically detects and executes code extracted from markdown
   */
  public async executeSnippet(codeSnippet: string, lang?: string): Promise<CodeExecutionResult | null> {
    const language = (lang || '').toLowerCase().trim();
    if (language === 'python' || language === 'py') {
      return this.executePython(codeSnippet);
    }
    if (language === 'javascript' || language === 'js' || language === 'typescript' || language === 'ts') {
      return this.executeJavaScript(codeSnippet);
    }

    // Default fallback to Python if pythonic keywords present
    if (codeSnippet.includes('def ') || codeSnippet.includes('print(') || codeSnippet.includes('import ')) {
      return this.executePython(codeSnippet);
    }

    return this.executeJavaScript(codeSnippet);
  }
}

export const codeExecutionService = new CodeExecutionService();
