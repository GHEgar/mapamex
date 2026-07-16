#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -f "$PROJECT_DIR/.env" ]; then
  set -a
  . "$PROJECT_DIR/.env"
  set +a
fi

CONTAINER="geoserver"

echo "Reseteando credenciales admin en GeoServer..."
docker exec "$CONTAINER" bash -c '
  source /scripts/env-data.sh
  source /scripts/functions.sh

  GEOSERVER_INSTALL_DIR="$(detect_install_dir)"
  USERS_XML=${GEOSERVER_DATA_DIR}/security/usergroup/default/users.xml
  ROLES_XML=${GEOSERVER_DATA_DIR}/security/role/default/roles.xml
  CLASSPATH=${GEOSERVER_INSTALL_DIR}/webapps/${GEOSERVER_CONTEXT_ROOT}/WEB-INF/lib/

  PWD_HASH=$(make_hash "$GEOSERVER_ADMIN_PASSWORD" "$CLASSPATH" "$HASHING_ALGORITHM")
  export PWD_HASH USERS_XML ROLES_XML ADMIN_USER="$GEOSERVER_ADMIN_USER"

  python3 <<"PYEOF"
import os
import xml.etree.ElementTree as ET

ns = "http://www.geoserver.org/security/users"
ET.register_namespace("", ns)
path = os.environ["USERS_XML"]
admin_user = os.environ["ADMIN_USER"]
tree = ET.parse(path)
users_el = tree.getroot().find("{%s}users" % ns)
seen = {}
for u in list(users_el.findall("{%s}user" % ns)):
    name = u.get("name")
    if name in seen:
        users_el.remove(seen[name])
    seen[name] = u
user = seen.get(admin_user)
if user is None:
    user = ET.SubElement(users_el, "{%s}user" % ns)
    user.set("name", admin_user)
user.set("password", os.environ["PWD_HASH"])
user.set("enabled", "true")
tree.write(path, xml_declaration=True, encoding="UTF-8", short_empty_elements=False)
print("Usuario %s actualizado en users.xml" % admin_user)
PYEOF

  if [ -f "$ROLES_XML" ]; then
    python3 <<"PYEOF"
import os
import xml.etree.ElementTree as ET

ns = "http://www.geoserver.org/security/roles"
ET.register_namespace("", ns)
path = os.environ["ROLES_XML"]
admin_user = os.environ["ADMIN_USER"]
tree = ET.parse(path)
root = tree.getroot()
role_list = root.find("{%s}roleList" % ns)
if role_list is not None and not any(r.get("id") == "ADMIN" for r in role_list.findall("{%s}role" % ns)):
    ET.SubElement(role_list, "{%s}role" % ns).set("id", "ADMIN")
user_list = root.find("{%s}userList" % ns)
if user_list is not None:
    entry = None
    for ur in user_list.findall("{%s}userRoles" % ns):
        if ur.get("username") == admin_user:
            entry = ur
            break
    if entry is None:
        entry = ET.SubElement(user_list, "{%s}userRoles" % ns)
        entry.set("username", admin_user)
    if not any(rr.get("roleID") == "ADMIN" for rr in entry.findall("{%s}roleRef" % ns)):
        ET.SubElement(entry, "{%s}roleRef" % ns).set("roleID", "ADMIN")
    tree.write(path, xml_declaration=True, encoding="UTF-8", short_empty_elements=False)
    print("Rol ADMIN asegurado para %s en roles.xml" % admin_user)
PYEOF
  fi

  echo "Admin actualizado a: $GEOSERVER_ADMIN_USER"
'

echo "Reiniciando GeoServer para aplicar cambios..."
docker restart "$CONTAINER"

echo "Esperando que GeoServer esté listo..."
attempts=0; max=24
until docker exec "$CONTAINER" curl -sf http://localhost:8080/geoserver/web/ > /dev/null 2>&1; do
  attempts=$((attempts + 1))
  if [ "$attempts" -ge "$max" ]; then
    echo ""
    echo "✗ GeoServer no respondió después de $((max * 5))s. Últimos logs:"
    docker logs "$CONTAINER" --tail 20 2>&1
    exit 1
  fi
  printf '.'
  sleep 5
done
echo ""
echo "Credenciales admin actualizadas correctamente."
