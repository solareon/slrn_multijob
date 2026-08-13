if GetCurrentResourceName() ~= 'slrn_multijob' then
    lib.print.error('This resource needs to be named ^5slrn_multijob^7.')
    return
end

local sharedJobs = exports.qbx_core:GetJobs()
local standaloneOpen = false
local themeKvp = 'standaloneTheme'

local function getStandaloneTheme()
    local theme = GetResourceKvpString(themeKvp)
    return theme == 'dark' and 'dark' or 'light'
end

local function hasPhone()
    return GetResourceState('lb-phone') == 'started'
end

local function AddApp()
    if not hasPhone() then return end

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

local function refreshJobs()
    if hasPhone() then
        exports['lb-phone']:SendCustomAppMessage('slrn_multijob', { action = 'update-jobs' })
        return
    end

    SendNUIMessage({ action = 'update-jobs' })
end

local function setStandaloneOpen(open)
    standaloneOpen = open
    SetNuiFocus(open, open)
    SendNUIMessage({
        action = 'standalone:setVisible',
        data = {
            visible = open,
            theme = getStandaloneTheme(),
        },
    })
end

CreateThread(function()
    if hasPhone() then AddApp() end
end)

RegisterCommand('employment', function()
    if hasPhone() then
        exports.qbx_core:Notify('Employment is available through your phone.', 'inform')
        return
    end

    setStandaloneOpen(not standaloneOpen)
end, false)

RegisterKeyMapping('employment', 'Open Employment', 'keyboard', 'F6')

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
    refreshJobs()
end)

RegisterNUICallback('removeJob', function(job, cb)
    lib.callback('slrn_multijob:server:deleteJob', false, function()
        cb(true)
        refreshJobs()
    end, job)
end)

RegisterNUICallback('changeJob', function(job, cb)
    lib.callback('slrn_multijob:server:changeJob', false, function()
        cb(true)
        refreshJobs()
    end, job)
end)

RegisterNUICallback('closeStandalone', function(_, cb)
    setStandaloneOpen(false)
    cb(true)
end)

RegisterNUICallback('setStandaloneTheme', function(theme, cb)
    if theme ~= 'light' and theme ~= 'dark' then
        cb(false)
        return
    end

    SetResourceKvp(themeKvp, theme)
    cb(true)
end)

RegisterNetEvent('QBCore:Client:OnJobUpdate', function()
    refreshJobs()
end)

AddEventHandler('onResourceStart', function(resource)
    if resource == 'lb-phone' then
        if standaloneOpen then setStandaloneOpen(false) end
        AddApp()
    end
end)

AddEventHandler('onResourceStop', function(resource)
    if resource == GetCurrentResourceName() and standaloneOpen then
        SetNuiFocus(false, false)
    end
end)
