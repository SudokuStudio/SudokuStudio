import bugReportMd from "../../../../.github/ISSUE_TEMPLATE/bug_report.md";
import featureRequestMd from "../../../../.github/ISSUE_TEMPLATE/feature_request.md";

export const SUDOKU_STUDIO_VERSION = process.env.SUDOKU_STUDIO_VERSION || 'DEV';

function issueTemplateToUrl(md: string): string {
    console.log(md);
    const title = encodeURIComponent(/^title:\s*['"]?(.*?)['"]?$/m.exec(md)?.[1] || '');

    let body = md.slice(3 + md.lastIndexOf('---'));
    body = body.replace('Sudoku Studio version:', `Sudoku Studio version: ${SUDOKU_STUDIO_VERSION}`);
    body = body.replace('Browser version:', `Browser version: ${navigator.userAgent}`);
    body = body.replace('Operating system:', `Operating system: ${navigator.platform}`);
    body = encodeURIComponent(body);

    const labels = /^labels:\s*['"]?(.*?)['"]?$/m.exec(md)?.[1] || ''

    return `https://github.com/SudokuStudio/SudokuStudio/issues/new?title=${title}&body=${body}&labels=${labels}`;
}

export const URL_BUG_REPORT = issueTemplateToUrl(bugReportMd);
export const URL_FEATURE_REQUEST = issueTemplateToUrl(featureRequestMd);

console.log(URL_BUG_REPORT);
console.log(URL_FEATURE_REQUEST);
