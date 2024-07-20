local identifier = 'slrn_multijob'

if GetCurrentResourceName() ~= 'slrn_multijob' then
    lib.print.error('This resource needs to be named ^5slrn_multijob^7.')
    return
end

JOBS = GetJobs()

CreateThread(function()
    while GetResourceState('lb-phone') ~= 'started' do
        Wait(500)
    end

    local function AddApp()
        local added, errorMessage = exports['lb-phone']:AddCustomApp({
            identifier = identifier,
            name = 'Employment',
            description = 'Manage your employment',
            developer = 'solareon.',
            defaultApp = true,
            ui = GetCurrentResourceName() .. '/ui/dist/index.html',
            icon = 'https://cfx-nui-' .. GetCurrentResourceName() .. '/ui/dist/icon.png',
        })

        if not added then
            print('Could not add app:', errorMessage)
        end
    end

    AddApp()

    AddEventHandler('onResourceStart', function(resource)
        if resource == 'lb-phone' or resource == GetCurrentResourceName() then
            AddApp()
        end
    end)
end)

RegisterNUICallback('getPlayerData', function(_, cb)
    cb(GetPlayerData())
end)

RegisterNUICallback('getJobs', function(_, cb)
    cb(GetJobs())
end)

RegisterNUICallback('toggleDuty', function(_, cb)
    ToggleDuty()
    cb({})
end)

RegisterNUICallback('removeJob', function(job, cb)
    TriggerServerEvent('slrn_multijob:server:deleteJob', job)
    cb({})
end)

RegisterNUICallback('changeJob', function(job, cb)
    TriggerServerEvent('slrn_multijob:server:changeJob', job)
    cb({})
end)
