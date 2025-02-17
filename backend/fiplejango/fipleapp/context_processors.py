# 全ての管理者ページに管理者名と管理者IDを表示するためのコンテキストプロセッサ
def admin_info(request):
    context = {}
    if request.user.is_authenticated:
        context = {
            # 'name': request.user.get_full_name() or request.user.username,
            'name': getattr(request.user, 'get_full_name', lambda: request.user.name)(),
            # 'admin_id': request.user.admin_id
        }
    return context

# # 全ての管理者ページに管理者名と管理者IDを表示するためのコンテキストプロセッサ
# def admin_info(request):
#     if request.user.is_authenticated:
#         return {
#             'username': request.user.username,  # nameの代わりにusernameを使用
#             # または
#             'name': request.user.get_full_name() or request.user.username,  # フルネームがない場合はusernameを使用
#         }
#     return {}