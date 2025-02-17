# 全ての管理者ページに管理者名と管理者IDを表示するためのコンテキストプロセッサ
def admin_info(request):
    if request.user.is_authenticated:
        return {
            'username': request.user.username,  # nameの代わりにusernameを使用
            # または
            'name': request.user.get_full_name() or request.user.username,  # フルネームがない場合はusernameを使用
        }
    return {}