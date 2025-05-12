import { buffer } from 'node:stream/consumers';
import { test, expect } from '@playwright/test';
import { fPuzzlesBoards, sudokuStudioBoards, sudokuStudioCoverageBoards } from '@sudoku-studio/board-examples/src';

test('full page', async ({ page }) => {
    const [_name, board, _solution] = sudokuStudioCoverageBoards[0];
    await page.goto(`/?b=${board}`);
    await page.waitForSelector('svg');
    await expect(page).toHaveScreenshot();
});

test.describe('board', () => {
    test.describe('Sudoku Studio', () => {
        for (const [name, board, _solution] of sudokuStudioBoards) {
            test(name, async ({ page }) => {
                page.setViewportSize({ width: 800, height: 800 });
                await page.goto(`/?b=${board}`);
                await expect(page.locator('svg')).toHaveScreenshot();
            });
        }
    });

    test.describe('F-Puzzles', () => {
        for (const [name, board, _solution] of fPuzzlesBoards) {
            test(name, async ({ page }) => {
                page.setViewportSize({ width: 800, height: 800 });
                await page.goto(`/?f=${board}`);
                await page.waitForURL(/b=/);
                await expect(page.locator('svg')).toHaveScreenshot();
            });
        }
    });
});

test.describe('save image', () => {
    for (const [name, board, _solution] of sudokuStudioCoverageBoards) {
        test(name, async ({ page }) => {
            await page.goto(`/?b=${board}`);
            const downloadPromise = page.waitForEvent('download');
            const saveImageButton = page.getByRole('button', { name: 'Save Image' });
            await saveImageButton.click();
            const download = await downloadPromise;
            expect(await buffer(await download.createReadStream())).toMatchSnapshot();
        });
    }
});

test('selection/input', async ({ page }) => {
    page.setViewportSize({ width: 800, height: 800 });
    await page.goto('/');
    await page.waitForSelector('svg');
    const overlay = page.locator('div.overlay');
    const bbox = (await overlay.boundingBox())!;
    await page.mouse.move(bbox.x + bbox.width * (1 / 18), bbox.y + bbox.height * (1 / 18)); // 1,1
    await page.mouse.down();
    await page.mouse.move(bbox.x + bbox.width * (3 / 18), bbox.y + bbox.height * (3 / 18)); // 2,2
    await page.mouse.move(bbox.x + bbox.width * (3 / 18), bbox.y + bbox.height * (5 / 18)); // 2,3
    await page.mouse.move(bbox.x + bbox.width * (5 / 18), bbox.y + bbox.height * (5 / 18)); // 3,3
    await page.mouse.up();
    await expect(page.locator('svg')).toHaveScreenshot();

    await page.keyboard.press('Shift+1');
    await page.keyboard.press('Shift+2');
    await page.keyboard.press('Shift+3');
    await page.keyboard.press('ControlOrMeta+3');
    await page.keyboard.press('ControlOrMeta+4');
    await page.keyboard.press('ControlOrMeta+5');
    await expect(page.locator('svg')).toHaveScreenshot();

    await page.keyboard.press('6');
    await page.mouse.click(bbox.x + bbox.width * (1 / 18), bbox.y + bbox.height * (1 / 18)); // 1,1
    await page.keyboard.press('7');
    await expect(page.locator('svg')).toHaveScreenshot();
});
