import { test, expect } from '@playwright/test';

// const
const PAGE_TITLE = "郵便局";
const ADDR_PREF_TXT = "東京";
const ADDR_TXT = "千代田区丸の内";
const PKG_CODE = "5533113355";
const URL_HOME = "https://www.post.japanpost.jp/";
const URL_ZIP = "https://www.post.japanpost.jp/cgi-zip/zipcode.php";
const URL_PKG = "https://trackings.post.japanpost.jp/services/srv/search/direct?reqCodeNo1="+ PKG_CODE + "&searchKind=S002&locale=ja";

/*test('test_title', async ({ page }) => {
   ログを標準出力
  page.on('console', (msg) => {
    console.log(`msg.type(): ${msg.type()}`);
    console.log(`msg.text(): ${msg.text()}`);
    console.log(`msg.args(): ${msg.args()}`);
    console.log(`msg.location(): ${msg.location()}`);
  });
});*/


// describe ////////////////////////////////
test.describe('仮テストケース', () => {
  
  test.beforeEach(async ({ page }) => {
    // アクション -----------------------------
    // ページ遷移
    await page.goto(URL_HOME);

    // チェック -------------------------------
    //  タイトルに含まれているか PAGE_TITLE
    const regex = new RegExp(PAGE_TITLE); 
    await expect(page).toHaveTitle(regex);
  });


// TC-001 //////////////////////////////////
test('TC-001 トップページから郵便番号検索', async ({ page }) => {
  // アクション -----------------------------
  // ページ遷移
  //await page.goto(URL_HOME);

  // チェック -------------------------------
  //  タイトルに含まれているか PAGE_TITLE
  //const regex = new RegExp(PAGE_TITLE); 
  //await expect(page).toHaveTitle(regex);

  // 郵便番号検索のformがあるか
  const tgtdiv = page.locator('div[class="boxBlue radius-l pdM"]');
  const tgtdiv_count = await tgtdiv.count();

  let tgtform_found = false;

  for (let i = 0; i < tgtdiv_count; i++) {
    const matched_count = await tgtdiv
      .nth(i)
      .locator('form[name="zip-pc"]')
      .count();

    if (matched_count > 0) {
      tgtform_found = true;
      break;
    }
  }

  expect(tgtform_found).toBeTruthy();

  // アクション -----------------------------
  // 郵便番号検索の都道府県選択
  const tgtPrefSel = page.locator('form[name="zip-pc"] select#select[title="prefecture"]');
  await tgtPrefSel.selectOption('13');

  // チェック -------------------------------
  //  意図した都道府県が指定されているか ADDR_PREF_TXT
  const selectedTxt = await tgtPrefSel.evaluate((el: HTMLSelectElement) => el.options[el.selectedIndex].textContent);
  if (selectedTxt != ADDR_PREF_TXT) {
    throw new Error('Prefecture, not selected ' + ADDR_PREF_TXT + " " + selectedTxt);
  }

  // アクション -----------------------------
  // 郵便番号検索の市区町村入力
  const tgtAddrinpt = page.locator('form[name="zip-pc"] input[name="addr"][title="市区町村名を入力"]');
  await tgtAddrinpt.fill(ADDR_TXT);

  // チェック -------------------------------
  //  意図した市区町村が入力されているか ADDR_TXT
  const inputTxt = await tgtAddrinpt.inputValue();
  if (inputTxt != ADDR_TXT) {
    throw new Error('Address, txt not matched ' + ADDR_TXT + " " + inputTxt);
  }

  // アクション -----------------------------
  // 検索ボタンをクリック
  await page.locator('form[name="zip-pc"]').getByRole('button', { name: '検索' }).click();

  // チェック -------------------------------
  // ページが遷移したか
  await page.waitForURL(URL_ZIP);

  // コンテンツチェック
  await expect(page.getByRole('heading', { name: '郵便番号検索', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: '100-0005' })).toBeVisible();

});


// TC-002 //////////////////////////////////
test('TC-002 トップページから荷物問合せ-無効番号-桁数違い', async ({ page }) => {
  // アクション -----------------------------
  // ページ遷移
  //await page.goto(URL_HOME);

  // チェック -------------------------------
  //  タイトルに含まれているか PAGE_TITLE
  //const regex = new RegExp(PAGE_TITLE); 
  //await expect(page).toHaveTitle(regex);

  // 荷物問い合わせのformがあるか
  const tgtdiv = page.locator('div[class="boxBlue radius-l pdM"]');
  const tgtdiv_count = await tgtdiv.count();

  let tgtform_found = false;

  for (let i = 0; i < tgtdiv_count; i++) {
    const matched_count = await tgtdiv
      .nth(i)
      .locator('form[name="tr1"]')
      .count();

    if (matched_count > 0) {
      tgtform_found = true;
      break;
    }
  }

  expect(tgtform_found).toBeTruthy();

  // アクション -----------------------------
  // 問い合わせ番号の入力
  //const tgtAddrinpt = page.locator('form[name="tr1"] input.number[name="reqCodeNo1"][title="お問い合わせ番号を入力"]');
  const tgtAddrinpt = page.getByRole('textbox', { name: 'お問い合わせ番号を入力' });
  await tgtAddrinpt.fill(PKG_CODE);

  // チェック -------------------------------
  //  意図した問い合わせ番号が入力されているか PKG_CODE
  const inputTxt = await tgtAddrinpt.inputValue();
  if (inputTxt != PKG_CODE) {
    throw new Error('Address, txt not matched ' + PKG_CODE + " " + inputTxt);
  }

  // アクション -----------------------------
  // 検索ボタンをクリック
  await page.locator('form[name="tr1"]').getByRole('button', { name: '検索' }).click();

  // チェック -------------------------------
  // ページが遷移したか
  await page.waitForURL(URL_PKG);

  // コンテンツチェック
  await expect(page.getByRole('heading', { name: '個別番号検索結果', exact: true })).toBeVisible();
  await expect(page.getByText(/お問い合わせ番号の入力桁数に誤りがあります/)).toBeVisible();
});

});
