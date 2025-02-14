# signals.py
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.apps import apps
# マイグレーション後にSizeの初期データを作成
@receiver(post_migrate)
def create_initial_sizes(sender, **kwargs):
    # アプリケーション名が一致する場合のみ実行
    if sender.name == 'fipleapp':
        Size = apps.get_model('fipleapp', 'Size')
        
        # すでにデータが存在する場合は作成しない
        if Size.objects.exists():
            return
        sizes_data = [
            {
                'size_name': 'XS',
                'height_min_for_men': 0,
                'height_max_for_men': 155,
                'height_min_for_women': 0,
                'height_max_for_women': 145,
                'order': 1
            },
            {
                'size_name': 'S',
                'height_min_for_men': 155,
                'height_max_for_men': 165,
                'height_min_for_women': 145,
                'height_max_for_women': 155,
                'order': 2
            },
            {
                'size_name': 'M',
                'height_min_for_men': 165,
                'height_max_for_men': 175,
                'height_min_for_women': 155,
                'height_max_for_women': 165,
                'order': 3
            },
            {
                'size_name': 'L',
                'height_min_for_men': 175,
                'height_max_for_men': 185,
                'height_min_for_women': 165,
                'height_max_for_women': 175,
                'order': 4
            },
            {
                'size_name': 'XL',
                'height_min_for_men': 185,
                'height_max_for_men': 999,
                'height_min_for_women': 175,
                'height_max_for_women': 999,
                'order': 5
            },
        ]
        
        for size_data in sizes_data:
            Size.objects.create(**size_data)