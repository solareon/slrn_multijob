fx_version 'cerulean'
game 'gta5'

lua54 'yes'

title 'SLRN Multijob'
description 'Multijob application for LB-Phone'
author 'solareon.'
version '1.0.2'

shared_scripts {
    '@ox_lib/init.lua',
    'bridge/*.lua'
}

client_scripts {
    'client/main.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/main.lua',
    'server/storage.lua'
}

files {
    'ui/**/*'
}

ui_page 'ui/dist/index.html'

dependency 'ox_lib'
dependency 'lb-phone'