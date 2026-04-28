

## 兩項修改計劃

### 問題 1：Header 頭像和箭頭在藍底上不明顯

**檔案**: `src/components/baby/BabySelector.tsx`

- **AvatarFallback**（第 46 行）：`bg-primary/10 text-primary` → `bg-white/20 text-white font-bold`，讓字母在藍底上清晰可見
- **Camera overlay**（第 48 行）：保持不變（已是 hover 顯示）
- **Avatar border**（第 44 行）：`border-primary/20` → `border-white/30`
- **ChevronDown**（第 57 行）：`text-muted-foreground` → `text-white`

### 問題 2：Toast 提示語未國際化

三個 hooks 中所有 toast 訊息都是硬編碼中文，需改用 `t()` 翻譯函數。

但這些 hooks 不在 React 組件內，無法直接用 `useLanguage()`。解決方案：讓每個 hook 內部引入 `useLanguage`（hooks 本身在組件內調用，所以可以使用其他 hooks）。

**需要新增 i18n 翻譯 key**（三個語言檔案各加一組 `toast` 區塊）：

```
toast: {
  success: '成功' / 'Success' / 'Berjaya',
  baby_added: '寶寶資料已新增' / 'Baby added' / 'Bayi ditambah',
  baby_updated: '寶寶資料已更新' / 'Baby updated' / 'Bayi dikemas kini',
  baby_deleted: '寶寶資料已刪除' / 'Baby deleted' / 'Bayi dipadam',
  add_failed: '新增失敗' / 'Failed to add' / 'Gagal menambah',
  update_failed: '更新失敗' / 'Failed to update' / 'Gagal mengemas kini',
  delete_failed: '刪除失敗' / 'Failed to delete' / 'Gagal memadam',
  not_logged_in: '未登入' / 'Not logged in' / 'Belum log masuk',
  photo_uploaded: '照片已上傳' / 'Photo uploaded' / 'Foto dimuat naik',
  photo_deleted: '照片已刪除' / 'Photo deleted' / 'Foto dipadam',
  upload_failed: '上傳失敗' / 'Upload failed' / 'Gagal memuat naik',
  updated: '已更新' / 'Updated' / 'Dikemas kini',
  operation_failed: '操作失敗' / 'Operation failed' / 'Operasi gagal',
  checkout_failed: '無法建立付款頁面，請稍後再試' / 'Unable to create checkout, please try again' / 'Tidak dapat membuat pembayaran',
  portal_failed: '無法開啟管理頁面，請稍後再試' / 'Unable to open portal, please try again' / 'Tidak dapat membuka portal',
}
```

**修改檔案清單**：
1. `src/components/baby/BabySelector.tsx` — 頭像和箭頭白色化
2. `src/i18n/locales/zh.ts` — 新增 toast 翻譯
3. `src/i18n/locales/en.ts` — 新增 toast 翻譯
4. `src/i18n/locales/ms.ts` — 新增 toast 翻譯
5. `src/hooks/useBabies.ts` — toast 改用 `t()`
6. `src/hooks/useGrowthPhotos.ts` — toast 改用 `t()`
7. `src/hooks/useSubscription.ts` — toast 改用 `t()`

