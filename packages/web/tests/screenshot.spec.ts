import { buffer } from 'node:stream/consumers';
import { test, expect } from '@playwright/test';
import { sudokuStudioBoards, sudokuStudioCoverageBoards } from '@sudoku-studio/board-examples/src';

test('full page', async ({ page }) => {
    const [_name, board, _solution] = sudokuStudioCoverageBoards[0];
    await page.goto(`?b=${board}`);
    await expect(page).toHaveScreenshot();
});

test.describe('board', () => {
    for (const [name, board, _solution] of sudokuStudioBoards) {
        test(name, async ({ page }) => {
            page.setViewportSize({ width: 800, height: 800 });
            await page.goto(`?b=${board}`);
            await expect(page.locator('svg')).toHaveScreenshot();
        });
    }
});

test.describe('save image', () => {
    for (const [name, board, _solution] of sudokuStudioCoverageBoards) {
        test(name, async ({ page }) => {
            await page.goto(`?b=${board}`);
            const downloadPromise = page.waitForEvent('download');
            const saveImageButton = page.getByRole('button', { name: 'Save Image' });
            await saveImageButton.click();
            const download = await downloadPromise;
            expect(await buffer(await download.createReadStream())).toMatchSnapshot();
        });
    }
});
