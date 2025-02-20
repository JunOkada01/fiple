# 全ての管理者ページに管理者名と管理者IDを表示するためのコンテキストプロセッサ
def admin_info(request):
    context = {}
    if request.user.is_authenticated:
        context = {
            'name': request.user.name,
            'admin_id': getattr(request.user, 'admin_id', None)
        }
    return context