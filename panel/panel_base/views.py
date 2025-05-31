from django.shortcuts import render

def panel_display_view(request):
    # 您可以在這裡準備要傳遞到模板的上下文數據
    return render(request, 'panel_base/panel.html')