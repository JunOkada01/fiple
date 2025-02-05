from django.apps import AppConfig


class FipleappConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "fipleapp"
    
    def ready(self):
        import fipleapp.signals  # シグナルを読み込む
