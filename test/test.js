import { cases } from "./cases.js";
import markdownToHtml from "../src/main.js";
const testCases = Object.entries(cases).map((testCase, i) => ({
    id: i,
    status: "noRun",
    markdown: testCase[0],
    expectedHtml: testCase[1],
    actualHtml: "",
    error: ""
}));
export function runTests() {
    for (const testCase of testCases) {
        test(testCase);
    }
    displayResults();
}
function test(testCase) {
    try {
        testCase.actualHtml = markdownToHtml(testCase.markdown);
    }
    catch (e) {
        testCase.status = "error";
        testCase.error = JSON.stringify(e);
    }
    testCase.status = testCase.expectedHtml === testCase.actualHtml
        ? "success"
        : "wrong";
}
function displayResults() {
    for (const testCase of testCases) {
        switch (testCase.status) {
            case "success":
                console.log(`${testCase.id}: success`);
                break;
            case "noRun":
                console.warn(`${testCase.id}: NO RUN`);
                break;
            case "error":
                console.error(`${testCase.id}: ERROR`);
                // console.error(testCase.error)
                break;
            case "wrong":
                console.error(`${testCase.id}: WRONG`);
                // console.error("markdown:")
                // console.error(testCase.markdown);
                // console.error("expected:")
                // console.error(testCase.expectedHtml);
                // console.error("actual:")
                // console.error(testCase.actualHtml);
                break;
        }
    }
}
runTests();
//# sourceMappingURL=test.js.map