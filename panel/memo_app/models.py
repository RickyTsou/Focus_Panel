from django.db import models
# from django.contrib.auth.models import User # 如果未來需要將備忘錄與特定用戶綁定，再取消註解此行

class Memo(models.Model):
    # 如果希望每個用戶有自己的備忘錄，可以添加下面這行
    # user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    content = models.TextField(blank=True, default='') # 備忘錄內容，允許為空，預設為空字串
    created_at = models.DateTimeField(auto_now_add=True) # 創建時間，自動設定
    updated_at = models.DateTimeField(auto_now=True)    # 更新時間，每次保存時自動更新

    def __str__(self):
        return f"Memo {self.pk} - {self.content[:30]}..." # 在 Django admin 中方便識別