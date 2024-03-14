fx_version 'cerulean'
game 'gta5'

lua54 'yes'

title 'SLRN Multijob'
description 'QBX_Core multijob application for LB-Phone'
author 'solareon.'
version '1.0.0'

shared_scripts {
    '@ox_lib/init.lua'
}

client_scripts {
    '@qbx_core/modules/playerdata.lua',
    'client/cl_main.lua',
}

server_scripts {
    'server/sv_main.lua',
}

files {
    'ui/**/*'
}

ui_page 'ui/index.html'

dependency 'qbx_core'
dependency 'lb-phone'