from django.conf import settings

def global_settings_context_processors(request):
    return {
        "JS_VERSION" : settings.JS_VERSION,
    }
