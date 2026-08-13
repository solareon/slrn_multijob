fx_version 'cerulean'
game 'gta5'

lua54 'yes'

title 'SLRN Multijob'
description 'qbx_core multijob application with optional LB-Phone integration'
author 'solareon.'
version '1.1.0'

shared_scripts {
    '@ox_lib/init.lua'
}

client_scripts {
    '@qbx_core/modules/playerdata.lua',
    'client/main.lua',
}

server_scripts {
    'server/main.lua',
}

ui_page 'web/build/index.html'

files {
    'web/build/**/*'
}

dependency 'qbx_core'
