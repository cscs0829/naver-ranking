import { test, expect } from '@playwright/test'

test.describe('Responsive UI', () => {
  test('Panels visible and readable at multiple widths', async ({ page }) => {
    await page.goto('/')

    // Desktop wide
    await page.setViewportSize({ width: 1440, height: 900 })
    await expect(page.getByText('네이버 쇼핑 순위 분석')).toBeVisible()
    await expect(page.getByText('검색 결과')).toBeVisible()
    await expect(page.getByText('API 키 관리')).toBeVisible()

    // MacBook 13"
    await page.setViewportSize({ width: 1280, height: 800 })
    await expect(page.getByText('네이버 쇼핑 순위 분석')).toBeVisible()
    await expect(page.getByText('검색 결과')).toBeVisible()

    // Tablet-ish
    await page.setViewportSize({ width: 1024, height: 800 })
    await expect(page.getByText('네이버 쇼핑 순위 분석')).toBeVisible()

    // Mobile
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.getByText('네이버 쇼핑 순위 분석')).toBeVisible()

    // Ensure buttons are clickable
    await expect(page.getByRole('button', { name: /순위 분석/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /데이터 저장/ })).toBeVisible()
  })
})


