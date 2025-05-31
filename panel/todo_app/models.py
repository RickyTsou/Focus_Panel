from django.db import models
# from django.contrib.auth.models import User # 如果未來需要與用戶關聯

class TodoSlot(models.Model):
    # user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True) # 可選：與用戶關聯
    slot_index = models.IntegerField(unique=True) # 格子的索引，確保唯一性（假設全局只有一套固定格子）
    text = models.TextField(blank=True, default='')
    completed = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['slot_index'] # 按索引排序

    def __str__(self):
        return f"Slot {self.slot_index}: {self.text[:30]}{' (Completed)' if self.completed else ''}"