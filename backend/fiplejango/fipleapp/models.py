from django.db import models

class Admin(models.Model):
    admin_id = models.AutoField(primary_key=True)  # 自動インクリメントのプライマリーキー
    name = models.CharField(max_length=256, unique=True)  # 名前（ユニーク制約付き）
    password = models.CharField(max_length=256)  # パスワード（ハッシュ化されることを想定）
    login_date = models.DateTimeField(null=True, blank=True)  # ログイン日付（NULL許可）

    def __str__(self):
        return self.name  # 管理者名を表示するためのメソッド
