SKIPMOUNT=false
PROPFILE=true
POSTFSDATA=true
LATESTARTSERVICE=true

# Права: директории 0755, файлы 0644
set_perm_recursive "$MODPATH" 0 0 0755 0644

# Делает исполняемым только post-fs-data.sh и service.sh (если есть)
[ -f "$MODPATH/post-fs-data.sh" ] && set_perm "$MODPATH/post-fs-data.sh" 0 0 0755 0755
[ -f "$MODPATH/service.sh" ] && set_perm "$MODPATH/service.sh" 0 0 0755 0755