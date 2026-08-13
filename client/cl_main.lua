if GetCurrentResourceName() ~= 'slrn_multijob' then
    lib.print.error('This resource needs to be named ^5slrn_multijob^7.')
    return
end

local sharedJobs = exports.qbx_core:GetJobs()

local function AddApp()
    local added, errorMessage = exports['lb-phone']:AddCustomApp({
        identifier = 'slrn_multijob',
        name = 'Employment',
        description = 'Employment application',
        defaultApp = true,
        developer = 'solareon.',
        ui = 'slrn_multijob/web/build/index.html',
        icon = 'https://cfx-nui-slrn_multijob/web/build/icon.png',
        fixBlur = true,
    })

    if not added then
        print('Could not add app:', errorMessage)
    end
end
CreateThread(function()
    while GetResourceState('lb-phone') ~= 'started' do
        Wait(500)
    end

    AddApp()
end)


RegisterNUICallback('getJobs', function(_, cb)
    local PlayerData = QBX.PlayerData
    if not PlayerData.jobs or next(PlayerData.jobs) == nil then
        cb({})
        return
    end
    local jobMenu = {}
    for job, grade in pairs(PlayerData.jobs) do
        local isActive = PlayerData.job.name == job
        local jobData = sharedJobs[job]
        local gradeData = jobData.grades[grade]
        jobMenu[#jobMenu + 1] = {
            title = jobData.label,
            jobName = job,
            gradeName = gradeData.name,
            gradeLevel = tonumber(grade) or 0,
            salary = gradeData.payment,
            active = isActive,
            duty = isActive and PlayerData.job.onduty or false,
        }
    end
    cb(jobMenu)
end)

RegisterNUICallback('toggleDuty', function(_, cb)
    TriggerServerEvent('QBCore:ToggleDuty')
    cb(true)
    Wait(500)
    exports["lb-phone"]:SendCustomAppMessage('slrn_multijob', { action = 'update-jobs' })
end)

RegisterNUICallback('removeJob', function(job, cb)
    lib.callback('slrn_multijob:server:deleteJob', false, function()
        cb(true)
        exports["lb-phone"]:SendCustomAppMessage('slrn_multijob', { action = 'update-jobs' })
    end, job)
end)

RegisterNUICallback('changeJob', function(job, cb)
    lib.callback('slrn_multijob:server:changeJob', false, function()
        cb(true)
        exports["lb-phone"]:SendCustomAppMessage('slrn_multijob', { action = 'update-jobs' })
    end, job)
end)

RegisterNetEvent('QBCore:Client:OnJobUpdate', function()
    exports["lb-phone"]:SendCustomAppMessage('slrn_multijob', { action = 'update-jobs' })
end)

AddEventHandler('onResourceStart', function(resource)
    if resource == 'lb-phone' then
        AddApp()
    end
end)
